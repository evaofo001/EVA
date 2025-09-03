#include <iostream>
#include <memory>
#include <thread>
#include <chrono>
#include <csignal>
#include <atomic>

#include "../include/policy_engine.h"
#include "../include/reinforcement_learning.h"

using namespace eva::core;

// Global shutdown flag for signal handling
std::atomic<bool> shutdown_requested{false};

void signalHandler(int signal) {
    std::cout << "\n🛑 Received shutdown signal (" << signal << ")" << std::endl;
    shutdown_requested.store(true);
}

class EVACPPCore {
private:
    std::unique_ptr<CPPPolicyEngine> policy_engine_;
    std::unique_ptr<ReinforcementLearningEngine> rl_engine_;
    std::atomic<bool> running_{false};
    
public:
    EVACPPCore() {
        policy_engine_ = std::make_unique<CPPPolicyEngine>();
        rl_engine_ = std::make_unique<ReinforcementLearningEngine>(10, 4, 128, 0.001);
    }
    
    bool initialize() {
        std::cout << "🌌 Initializing EVA-OFO-001 C++ Core..." << std::endl;
        
        if (!policy_engine_->initialize()) {
            std::cerr << "❌ Failed to initialize Policy Engine" << std::endl;
            return false;
        }
        
        if (!rl_engine_->initialize()) {
            std::cerr << "❌ Failed to initialize RL Engine" << std::endl;
            return false;
        }
        
        std::cout << "✅ EVA C++ Core initialized successfully" << std::endl;
        return true;
    }
    
    void start() {
        std::cout << "🚀 Starting EVA C++ Core evolution cycle..." << std::endl;
        running_.store(true);
        
        // Main evolution loop
        size_t cycle_count = 0;
        while (running_.load() && !shutdown_requested.load()) {
            cycle_count++;
            
            try {
                // Perception phase - gather simulated sensor data
                std::unordered_map<std::string, double> sensor_data = {
                    {"cpu_usage", 45.2 + (cycle_count % 10)},
                    {"memory_usage", 67.8 + (cycle_count % 5)},
                    {"network_activity", 23.1 + (cycle_count % 15)},
                    {"user_interaction_rate", 12.5 + (cycle_count % 8)}
                };
                
                // Create state from sensor data
                State current_state = createStateFromSensorData(sensor_data);
                
                // Policy check before action
                if (!policy_engine_->canExecuteOperation("reinforcement_learning")) {
                    std::cout << "⚠️ RL operation blocked by policy" << std::endl;
                    std::this_thread::sleep_for(std::chrono::seconds(1));
                    continue;
                }
                
                // Get action from RL engine
                Action action = rl_engine_->getAction(current_state);
                
                // Simulate action execution and reward
                double reward = simulateActionExecution(action, sensor_data);
                
                // Create next state (simplified)
                State next_state = current_state; // In real implementation, this would be different
                next_state.reward = reward;
                
                // Store experience
                rl_engine_->storeExperience(current_state, action, reward, next_state, false);
                
                // Learn from experience
                rl_engine_->learn();
                
                // Log progress
                if (cycle_count % 100 == 0) {
                    std::cout << "🔄 Evolution cycle " << cycle_count 
                              << " - Avg reward: " << rl_engine_->getAverageReward()
                              << " - Exploration: " << rl_engine_->getCurrentExplorationRate()
                              << std::endl;
                }
                
                // Sleep to prevent excessive CPU usage
                std::this_thread::sleep_for(std::chrono::milliseconds(100));
                
            } catch (const std::exception& e) {
                std::cerr << "❌ Error in evolution cycle " << cycle_count << ": " << e.what() << std::endl;
                
                // Report policy violation
                policy_engine_->reportViolation("cpp_safety_001", "evolution_cycle_error", 
                                               PolicyLevel::HIGH, e.what());
                
                std::this_thread::sleep_for(std::chrono::seconds(1));
            }
        }
        
        std::cout << "🏁 EVA C++ Core evolution cycle completed after " << cycle_count << " cycles" << std::endl;
    }
    
    double simulateActionExecution(const Action& action, const std::unordered_map<std::string, double>& sensor_data) {
        // Simulate reward based on action and current state
        double base_reward = 0.1;
        
        // Reward based on action type
        if (action.action_id == "action_0") { // Explore
            base_reward += 0.2;
        } else if (action.action_id == "action_1") { // Exploit
            base_reward += 0.3;
        } else if (action.action_id == "action_2") { // Learn
            base_reward += 0.4;
        } else if (action.action_id == "action_3") { // Adapt
            base_reward += 0.5;
        }
        
        // Penalty for high resource usage
        auto cpu_it = sensor_data.find("cpu_usage");
        if (cpu_it != sensor_data.end() && cpu_it->second > 80.0) {
            base_reward -= 0.2;
        }
        
        return base_reward;
    }
    
    void emergencyStop() {
        std::cout << "🚨 C++ CORE EMERGENCY STOP INITIATED" << std::endl;
        
        running_.store(false);
        
        if (rl_engine_) {
            rl_engine_->emergencyStop();
        }
        
        if (policy_engine_) {
            policy_engine_->emergencyLockdown();
        }
        
        std::cout << "🛑 C++ Core emergency stop complete" << std::endl;
    }
    
    void shutdown() {
        std::cout << "🛑 Shutting down EVA C++ Core..." << std::endl;
        
        running_.store(false);
        
        if (rl_engine_) {
            rl_engine_->shutdown();
        }
        
        if (policy_engine_) {
            policy_engine_->shutdown();
        }
        
        std::cout << "✅ EVA C++ Core shutdown complete" << std::endl;
    }
};

int main() {
    // Setup signal handlers
    std::signal(SIGINT, signalHandler);
    std::signal(SIGTERM, signalHandler);
    
    std::cout << "🌌 EVA-OFO-001 C++ Core Starting..." << std::endl;
    std::cout << "🧠 Evolutionary Virtual Android - Origin of Future Organisms" << std::endl;
    std::cout << "🔬 Prototype 001 - The Core Intelligence System" << std::endl;
    
    try {
        auto eva_core = std::make_unique<EVACPPCore>();
        
        if (!eva_core->initialize()) {
            std::cerr << "❌ Failed to initialize EVA C++ Core" << std::endl;
            return 1;
        }
        
        // Start the evolution cycle
        eva_core->start();
        
        // Graceful shutdown
        eva_core->shutdown();
        
    } catch (const std::exception& e) {
        std::cerr << "💥 Fatal error in EVA C++ Core: " << e.what() << std::endl;
        return 1;
    }
    
    std::cout << "👋 EVA-OFO-001 C++ Core terminated" << std::endl;
    return 0;
}