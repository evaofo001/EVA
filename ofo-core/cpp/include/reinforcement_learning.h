#pragma once

#include <vector>
#include <memory>
#include <unordered_map>
#include <functional>
#include <random>
#include <mutex>

namespace eva {
namespace core {

struct State {
    std::vector<double> features;
    std::string state_id;
    double reward;
    bool terminal;
    
    State(const std::vector<double>& feat, const std::string& id) 
        : features(feat), state_id(id), reward(0.0), terminal(false) {}
};

struct Action {
    std::string action_id;
    std::vector<double> parameters;
    double expected_reward;
    
    Action(const std::string& id, const std::vector<double>& params)
        : action_id(id), parameters(params), expected_reward(0.0) {}
};

struct Experience {
    State state;
    Action action;
    double reward;
    State next_state;
    bool done;
    std::chrono::system_clock::time_point timestamp;
};

class QNetwork {
private:
    std::vector<std::vector<double>> weights_;
    std::vector<double> biases_;
    size_t input_size_;
    size_t hidden_size_;
    size_t output_size_;
    double learning_rate_;
    
    std::vector<double> forward(const std::vector<double>& input) const;
    void backward(const std::vector<double>& input, const std::vector<double>& target);
    double sigmoid(double x) const;
    double relu(double x) const;
    
public:
    QNetwork(size_t input_size, size_t hidden_size, size_t output_size, double learning_rate = 0.001);
    
    std::vector<double> predict(const std::vector<double>& state) const;
    void train(const std::vector<double>& state, const std::vector<double>& target);
    void updateWeights(const std::vector<std::vector<double>>& weight_updates);
    
    // Network persistence
    bool saveNetwork(const std::string& filepath) const;
    bool loadNetwork(const std::string& filepath);
};

class ReinforcementLearningEngine {
private:
    std::unique_ptr<QNetwork> q_network_;
    std::unique_ptr<QNetwork> target_network_;
    
    std::vector<Experience> replay_buffer_;
    size_t buffer_capacity_;
    size_t batch_size_;
    
    double epsilon_;           // Exploration rate
    double epsilon_decay_;
    double epsilon_min_;
    double gamma_;            // Discount factor
    double learning_rate_;
    
    size_t update_frequency_;
    size_t steps_since_update_;
    size_t total_steps_;
    size_t total_episodes_;
    
    mutable std::mutex mutex_;
    std::mt19937 rng_;
    
    // Internal methods
    Action selectAction(const State& state);
    Action selectRandomAction() const;
    Action selectBestAction(const State& state) const;
    void updateTargetNetwork();
    void trainOnBatch();
    std::vector<size_t> sampleBatch() const;
    
public:
    ReinforcementLearningEngine(size_t state_size, size_t action_size, 
                               size_t hidden_size = 128, double learning_rate = 0.001);
    ~ReinforcementLearningEngine() = default;
    
    // Core RL functionality
    bool initialize();
    Action getAction(const State& state);
    void storeExperience(const State& state, const Action& action, 
                        double reward, const State& next_state, bool done);
    void learn();
    
    // Training control
    void startEpisode();
    void endEpisode(double total_reward);
    void setExplorationRate(double epsilon);
    
    // Performance monitoring
    double getAverageReward() const;
    size_t getTotalSteps() const;
    size_t getTotalEpisodes() const;
    double getCurrentExplorationRate() const;
    
    // Model persistence
    bool saveModel(const std::string& filepath) const;
    bool loadModel(const std::string& filepath);
    
    // Safety and control
    void pauseLearning();
    void resumeLearning();
    void resetLearning();
    void emergencyStop();
    
    // Lifecycle
    void shutdown();
};

// Utility functions for state and action processing
std::vector<double> normalizeFeatures(const std::vector<double>& features);
State createStateFromSensorData(const std::unordered_map<std::string, double>& sensor_data);
std::vector<Action> generatePossibleActions(const State& current_state);

} // namespace core
} // namespace eva