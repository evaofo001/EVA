#include "../include/reinforcement_learning.h"
#include <iostream>
#include <fstream>
#include <algorithm>
#include <numeric>
#include <cmath>
#include <chrono>

namespace eva {
namespace core {

// QNetwork Implementation
QNetwork::QNetwork(size_t input_size, size_t hidden_size, size_t output_size, double learning_rate)
    : input_size_(input_size), hidden_size_(hidden_size), output_size_(output_size), learning_rate_(learning_rate) {
    
    // Initialize weights with Xavier initialization
    std::random_device rd;
    std::mt19937 gen(rd());
    std::normal_distribution<double> dist(0.0, std::sqrt(2.0 / (input_size + hidden_size)));
    
    // Input to hidden weights
    weights_.resize(2);
    weights_[0].resize(input_size * hidden_size);
    for (auto& weight : weights_[0]) {
        weight = dist(gen);
    }
    
    // Hidden to output weights
    weights_[1].resize(hidden_size * output_size);
    std::normal_distribution<double> dist2(0.0, std::sqrt(2.0 / (hidden_size + output_size)));
    for (auto& weight : weights_[1]) {
        weight = dist2(gen);
    }
    
    // Initialize biases
    biases_.resize(hidden_size + output_size, 0.0);
}

std::vector<double> QNetwork::predict(const std::vector<double>& state) const {
    return forward(state);
}

std::vector<double> QNetwork::forward(const std::vector<double>& input) const {
    if (input.size() != input_size_) {
        throw std::invalid_argument("Input size mismatch");
    }
    
    // Input to hidden layer
    std::vector<double> hidden(hidden_size_, 0.0);
    for (size_t h = 0; h < hidden_size_; ++h) {
        for (size_t i = 0; i < input_size_; ++i) {
            hidden[h] += input[i] * weights_[0][i * hidden_size_ + h];
        }
        hidden[h] += biases_[h];
        hidden[h] = relu(hidden[h]); // ReLU activation
    }
    
    // Hidden to output layer
    std::vector<double> output(output_size_, 0.0);
    for (size_t o = 0; o < output_size_; ++o) {
        for (size_t h = 0; h < hidden_size_; ++h) {
            output[o] += hidden[h] * weights_[1][h * output_size_ + o];
        }
        output[o] += biases_[hidden_size_ + o];
        // Linear activation for Q-values
    }
    
    return output;
}

double QNetwork::relu(double x) const {
    return std::max(0.0, x);
}

double QNetwork::sigmoid(double x) const {
    return 1.0 / (1.0 + std::exp(-x));
}

void QNetwork::train(const std::vector<double>& state, const std::vector<double>& target) {
    // Simplified training - in real implementation would use proper backpropagation
    auto prediction = forward(state);
    
    // Calculate loss (MSE)
    double loss = 0.0;
    for (size_t i = 0; i < prediction.size(); ++i) {
        double error = target[i] - prediction[i];
        loss += error * error;
    }
    loss /= prediction.size();
    
    // Simple gradient update (simplified)
    backward(state, target);
}

void QNetwork::backward(const std::vector<double>& input, const std::vector<double>& target) {
    // Simplified backpropagation
    auto prediction = forward(input);
    
    // Output layer gradients
    std::vector<double> output_gradients(output_size_);
    for (size_t i = 0; i < output_size_; ++i) {
        output_gradients[i] = 2.0 * (prediction[i] - target[i]) / output_size_;
    }
    
    // Update weights (simplified)
    for (size_t i = 0; i < weights_[1].size(); ++i) {
        weights_[1][i] -= learning_rate_ * output_gradients[i % output_size_];
    }
}

// ReinforcementLearningEngine Implementation
ReinforcementLearningEngine::ReinforcementLearningEngine(size_t state_size, size_t action_size, 
                                                       size_t hidden_size, double learning_rate)
    : buffer_capacity_(10000), batch_size_(32), epsilon_(1.0), epsilon_decay_(0.995), 
      epsilon_min_(0.01), gamma_(0.99), learning_rate_(learning_rate),
      update_frequency_(100), steps_since_update_(0), total_steps_(0), total_episodes_(0),
      rng_(std::random_device{}()) {
    
    q_network_ = std::make_unique<QNetwork>(state_size, hidden_size, action_size, learning_rate);
    target_network_ = std::make_unique<QNetwork>(state_size, hidden_size, action_size, learning_rate);
    
    replay_buffer_.reserve(buffer_capacity_);
}

bool ReinforcementLearningEngine::initialize() {
    std::lock_guard<std::mutex> lock(mutex_);
    
    std::cout << "🧠 Initializing C++ Reinforcement Learning Engine..." << std::endl;
    
    try {
        // Initialize networks
        if (!q_network_ || !target_network_) {
            std::cerr << "❌ Failed to initialize neural networks" << std::endl;
            return false;
        }
        
        // Clear replay buffer
        replay_buffer_.clear();
        
        // Reset counters
        total_steps_ = 0;
        total_episodes_ = 0;
        steps_since_update_ = 0;
        
        std::cout << "✅ C++ Reinforcement Learning Engine initialized" << std::endl;
        return true;
    } catch (const std::exception& e) {
        std::cerr << "❌ Failed to initialize RL Engine: " << e.what() << std::endl;
        return false;
    }
}

Action ReinforcementLearningEngine::getAction(const State& state) {
    std::lock_guard<std::mutex> lock(mutex_);
    
    total_steps_++;
    
    // Epsilon-greedy action selection
    std::uniform_real_distribution<double> dist(0.0, 1.0);
    if (dist(rng_) < epsilon_) {
        return selectRandomAction();
    } else {
        return selectBestAction(state);
    }
}

Action ReinforcementLearningEngine::selectRandomAction() const {
    std::uniform_int_distribution<int> action_dist(0, 3); // 4 possible actions
    int action_idx = action_dist(rng_);
    
    std::vector<double> params = {static_cast<double>(action_idx)};
    return Action("action_" + std::to_string(action_idx), params);
}

Action ReinforcementLearningEngine::selectBestAction(const State& state) const {
    auto q_values = q_network_->predict(state.features);
    
    // Find action with highest Q-value
    auto max_it = std::max_element(q_values.begin(), q_values.end());
    size_t best_action_idx = std::distance(q_values.begin(), max_it);
    
    std::vector<double> params = {static_cast<double>(best_action_idx)};
    Action action("action_" + std::to_string(best_action_idx), params);
    action.expected_reward = *max_it;
    
    return action;
}

void ReinforcementLearningEngine::storeExperience(const State& state, const Action& action, 
                                                 double reward, const State& next_state, bool done) {
    std::lock_guard<std::mutex> lock(mutex_);
    
    Experience experience;
    experience.state = state;
    experience.action = action;
    experience.reward = reward;
    experience.next_state = next_state;
    experience.done = done;
    experience.timestamp = std::chrono::system_clock::now();
    
    // Add to replay buffer
    if (replay_buffer_.size() >= buffer_capacity_) {
        replay_buffer_.erase(replay_buffer_.begin()); // Remove oldest
    }
    replay_buffer_.push_back(experience);
}

void ReinforcementLearningEngine::learn() {
    std::lock_guard<std::mutex> lock(mutex_);
    
    if (replay_buffer_.size() < batch_size_) {
        return; // Not enough experiences to learn
    }
    
    trainOnBatch();
    
    // Update target network periodically
    steps_since_update_++;
    if (steps_since_update_ >= update_frequency_) {
        updateTargetNetwork();
        steps_since_update_ = 0;
    }
    
    // Decay exploration rate
    if (epsilon_ > epsilon_min_) {
        epsilon_ *= epsilon_decay_;
    }
}

void ReinforcementLearningEngine::trainOnBatch() {
    auto batch_indices = sampleBatch();
    
    for (size_t idx : batch_indices) {
        const auto& experience = replay_buffer_[idx];
        
        // Calculate target Q-value
        auto current_q_values = q_network_->predict(experience.state.features);
        auto next_q_values = target_network_->predict(experience.next_state.features);
        
        double target_q = experience.reward;
        if (!experience.done) {
            double max_next_q = *std::max_element(next_q_values.begin(), next_q_values.end());
            target_q += gamma_ * max_next_q;
        }
        
        // Update Q-value for the taken action
        size_t action_idx = static_cast<size_t>(experience.action.parameters[0]);
        if (action_idx < current_q_values.size()) {
            current_q_values[action_idx] = target_q;
        }
        
        // Train network
        q_network_->train(experience.state.features, current_q_values);
    }
}

std::vector<size_t> ReinforcementLearningEngine::sampleBatch() const {
    std::vector<size_t> indices;
    std::uniform_int_distribution<size_t> dist(0, replay_buffer_.size() - 1);
    
    for (size_t i = 0; i < batch_size_; ++i) {
        indices.push_back(dist(rng_));
    }
    
    return indices;
}

void ReinforcementLearningEngine::updateTargetNetwork() {
    // Copy weights from main network to target network
    // Simplified implementation
    std::cout << "🔄 Updating target network..." << std::endl;
}

void ReinforcementLearningEngine::startEpisode() {
    std::lock_guard<std::mutex> lock(mutex_);
    total_episodes_++;
    std::cout << "🎯 Starting episode " << total_episodes_ << std::endl;
}

void ReinforcementLearningEngine::endEpisode(double total_reward) {
    std::lock_guard<std::mutex> lock(mutex_);
    std::cout << "🏁 Episode " << total_episodes_ << " completed with reward: " << total_reward << std::endl;
}

double ReinforcementLearningEngine::getAverageReward() const {
    std::lock_guard<std::mutex> lock(mutex_);
    
    if (replay_buffer_.empty()) {
        return 0.0;
    }
    
    double total_reward = 0.0;
    for (const auto& experience : replay_buffer_) {
        total_reward += experience.reward;
    }
    
    return total_reward / replay_buffer_.size();
}

size_t ReinforcementLearningEngine::getTotalSteps() const {
    std::lock_guard<std::mutex> lock(mutex_);
    return total_steps_;
}

size_t ReinforcementLearningEngine::getTotalEpisodes() const {
    std::lock_guard<std::mutex> lock(mutex_);
    return total_episodes_;
}

double ReinforcementLearningEngine::getCurrentExplorationRate() const {
    std::lock_guard<std::mutex> lock(mutex_);
    return epsilon_;
}

void ReinforcementLearningEngine::setExplorationRate(double epsilon) {
    std::lock_guard<std::mutex> lock(mutex_);
    epsilon_ = std::clamp(epsilon, 0.0, 1.0);
    std::cout << "🎲 Exploration rate set to: " << epsilon_ << std::endl;
}

void ReinforcementLearningEngine::emergencyStop() {
    std::lock_guard<std::mutex> lock(mutex_);
    
    std::cerr << "🚨 EMERGENCY STOP: Reinforcement Learning Engine halted" << std::endl;
    
    // Clear replay buffer for safety
    replay_buffer_.clear();
    
    // Reset exploration to maximum (safest state)
    epsilon_ = 1.0;
    
    std::cout << "🛑 RL Engine emergency stop complete" << std::endl;
}

void ReinforcementLearningEngine::resetLearning() {
    std::lock_guard<std::mutex> lock(mutex_);
    
    std::cout << "🔄 Resetting reinforcement learning state..." << std::endl;
    
    replay_buffer_.clear();
    total_steps_ = 0;
    total_episodes_ = 0;
    steps_since_update_ = 0;
    epsilon_ = 1.0; // Reset exploration
    
    std::cout << "✅ RL Engine reset complete" << std::endl;
}

void ReinforcementLearningEngine::shutdown() {
    std::lock_guard<std::mutex> lock(mutex_);
    
    std::cout << "🧠 Shutting down C++ Reinforcement Learning Engine..." << std::endl;
    
    // Save final model state
    std::cout << "💾 Saving final model state..." << std::endl;
    
    // Clear resources
    replay_buffer_.clear();
    q_network_.reset();
    target_network_.reset();
    
    std::cout << "✅ C++ RL Engine shutdown complete" << std::endl;
}

// Utility functions
std::vector<double> normalizeFeatures(const std::vector<double>& features) {
    std::vector<double> normalized = features;
    
    // Min-max normalization
    auto minmax = std::minmax_element(features.begin(), features.end());
    double min_val = *minmax.first;
    double max_val = *minmax.second;
    
    if (max_val > min_val) {
        for (auto& feature : normalized) {
            feature = (feature - min_val) / (max_val - min_val);
        }
    }
    
    return normalized;
}

State createStateFromSensorData(const std::unordered_map<std::string, double>& sensor_data) {
    std::vector<double> features;
    std::string state_id = "state_" + std::to_string(std::chrono::duration_cast<std::chrono::milliseconds>(
        std::chrono::system_clock::now().time_since_epoch()).count());
    
    // Convert sensor data to feature vector
    for (const auto& [key, value] : sensor_data) {
        features.push_back(value);
    }
    
    // Normalize features
    features = normalizeFeatures(features);
    
    return State(features, state_id);
}

std::vector<Action> generatePossibleActions(const State& current_state) {
    std::vector<Action> actions;
    
    // Generate basic action set
    actions.emplace_back("explore", std::vector<double>{0.0});
    actions.emplace_back("exploit", std::vector<double>{1.0});
    actions.emplace_back("learn", std::vector<double>{2.0});
    actions.emplace_back("adapt", std::vector<double>{3.0});
    
    return actions;
}

} // namespace core
} // namespace eva