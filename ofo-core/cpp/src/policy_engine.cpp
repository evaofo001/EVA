#include "../include/policy_engine.h"
#include <iostream>
#include <chrono>
#include <algorithm>

namespace eva {
namespace core {

CPPPolicyEngine::CPPPolicyEngine() 
    : enforcement_active_(true) {
}

bool CPPPolicyEngine::initialize() {
    std::lock_guard<std::mutex> lock(mutex_);
    
    std::cout << "⚖️ Initializing C++ Policy Engine..." << std::endl;
    
    try {
        loadCorePolicies();
        enforcement_active_ = true;
        
        std::cout << "✅ C++ Policy Engine initialized with " 
                  << policies_.size() << " policies" << std::endl;
        return true;
    } catch (const std::exception& e) {
        std::cerr << "❌ Failed to initialize C++ Policy Engine: " << e.what() << std::endl;
        return false;
    }
}

void CPPPolicyEngine::loadCorePolicies() {
    // Critical safety policy
    auto safety_policy = std::make_unique<Policy>(
        "cpp_safety_001",
        "C++ Safety Protocol",
        "High-performance safety constraints for real-time operations",
        PolicyLevel::CRITICAL
    );
    safety_policy->rules["real_time_monitoring"] = "true";
    safety_policy->rules["immediate_shutdown"] = "true";
    safety_policy->rules["memory_bounds_check"] = "true";
    
    // Performance policy
    auto performance_policy = std::make_unique<Policy>(
        "cpp_performance_001", 
        "Performance Optimization",
        "Ensure optimal performance for learning operations",
        PolicyLevel::HIGH
    );
    performance_policy->rules["max_cpu_usage"] = "90";
    performance_policy->rules["max_memory_usage"] = "85";
    performance_policy->rules["thread_pool_limit"] = "8";
    
    // Learning ethics policy
    auto ethics_policy = std::make_unique<Policy>(
        "cpp_ethics_001",
        "Learning Ethics Protocol", 
        "Ethical constraints for reinforcement learning",
        PolicyLevel::HIGH
    );
    ethics_policy->rules["no_harmful_learning"] = "true";
    ethics_policy->rules["bias_prevention"] = "true";
    ethics_policy->rules["human_oversight"] = "required";
    
    policies_[safety_policy->id] = std::move(safety_policy);
    policies_[performance_policy->id] = std::move(performance_policy);
    policies_[ethics_policy->id] = std::move(ethics_policy);
}

bool CPPPolicyEngine::canExecuteOperation(const std::string& operation_type) const {
    std::lock_guard<std::mutex> lock(mutex_);
    
    if (!enforcement_active_) {
        return true;
    }
    
    for (const auto& [policy_id, policy] : policies_) {
        if (!policy->active) {
            continue;
        }
        
        if (!checkPolicyCompliance(*policy, operation_type)) {
            std::cout << "❌ Operation '" << operation_type 
                      << "' denied by policy: " << policy->name << std::endl;
            return false;
        }
    }
    
    return true;
}

bool CPPPolicyEngine::checkPolicyCompliance(const Policy& policy, const std::string& operation_type) const {
    if (policy.id == "cpp_safety_001") {
        if (operation_type == "memory_allocation" || operation_type == "thread_creation") {
            // Check memory bounds and thread limits
            return true; // Simplified for demo
        }
    } else if (policy.id == "cpp_performance_001") {
        if (operation_type == "learning_iteration" || operation_type == "neural_network_training") {
            // Check performance constraints
            return true; // Simplified for demo
        }
    } else if (policy.id == "cpp_ethics_001") {
        if (operation_type == "reinforcement_learning" || operation_type == "behavior_modification") {
            // Check ethical constraints
            return true; // Simplified for demo
        }
    }
    
    return true;
}

void CPPPolicyEngine::reportViolation(const std::string& policy_id, const std::string& violation_type,
                                     PolicyLevel severity, const std::string& description) {
    std::lock_guard<std::mutex> lock(mutex_);
    
    PolicyViolation violation;
    violation.timestamp = std::chrono::system_clock::now();
    violation.policy_id = policy_id;
    violation.violation_type = violation_type;
    violation.severity = severity;
    violation.description = description;
    
    violations_.push_back(violation);
    
    switch (severity) {
        case PolicyLevel::CRITICAL:
            std::cerr << "🚨 CRITICAL POLICY VIOLATION: " << description << std::endl;
            break;
        case PolicyLevel::HIGH:
            std::cout << "⚠️ High severity policy violation: " << description << std::endl;
            break;
        case PolicyLevel::MEDIUM:
            std::cout << "⚠️ Medium severity policy violation: " << description << std::endl;
            break;
        case PolicyLevel::LOW:
            std::cout << "ℹ️ Low severity policy violation: " << description << std::endl;
            break;
    }
}

bool CPPPolicyEngine::addPolicy(std::unique_ptr<Policy> policy) {
    std::lock_guard<std::mutex> lock(mutex_);
    
    if (policies_.find(policy->id) != policies_.end()) {
        std::cout << "❌ Policy with ID '" << policy->id << "' already exists" << std::endl;
        return false;
    }
    
    std::string policy_id = policy->id;
    policies_[policy_id] = std::move(policy);
    
    std::cout << "✅ Added policy: " << policy_id << std::endl;
    return true;
}

void CPPPolicyEngine::emergencyLockdown() {
    std::lock_guard<std::mutex> lock(mutex_);
    
    std::cerr << "🚨 C++ POLICY ENGINE EMERGENCY LOCKDOWN" << std::endl;
    
    // Disable all non-critical policies
    for (auto& [policy_id, policy] : policies_) {
        if (policy->level != PolicyLevel::CRITICAL) {
            policy->active = false;
        }
    }
    
    enforcement_active_ = true;
    
    std::cout << "🔒 Emergency lockdown complete - only critical policies active" << std::endl;
}

size_t CPPPolicyEngine::getActivePolicyCount() const {
    std::lock_guard<std::mutex> lock(mutex_);
    
    return std::count_if(policies_.begin(), policies_.end(),
                        [](const auto& pair) { return pair.second->active; });
}

size_t CPPPolicyEngine::getViolationCount() const {
    std::lock_guard<std::mutex> lock(mutex_);
    return violations_.size();
}

std::vector<std::string> CPPPolicyEngine::getActivePolicyIds() const {
    std::lock_guard<std::mutex> lock(mutex_);
    
    std::vector<std::string> active_ids;
    for (const auto& [policy_id, policy] : policies_) {
        if (policy->active) {
            active_ids.push_back(policy_id);
        }
    }
    
    return active_ids;
}

bool CPPPolicyEngine::isEnforcementActive() const {
    std::lock_guard<std::mutex> lock(mutex_);
    return enforcement_active_;
}

void CPPPolicyEngine::enableEnforcement() {
    std::lock_guard<std::mutex> lock(mutex_);
    enforcement_active_ = true;
    std::cout << "✅ Policy enforcement enabled" << std::endl;
}

void CPPPolicyEngine::disableEnforcement() {
    std::lock_guard<std::mutex> lock(mutex_);
    enforcement_active_ = false;
    std::cout << "⚠️ Policy enforcement disabled" << std::endl;
}

void CPPPolicyEngine::shutdown() {
    std::lock_guard<std::mutex> lock(mutex_);
    
    std::cout << "⚖️ Shutting down C++ Policy Engine..." << std::endl;
    
    enforcement_active_ = false;
    policies_.clear();
    violations_.clear();
    
    std::cout << "✅ C++ Policy Engine shutdown complete" << std::endl;
}

} // namespace core
} // namespace eva