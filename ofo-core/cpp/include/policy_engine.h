#pragma once

#include <string>
#include <unordered_map>
#include <vector>
#include <memory>
#include <chrono>
#include <mutex>

namespace eva {
namespace core {

enum class PolicyLevel {
    CRITICAL = 0,
    HIGH = 1,
    MEDIUM = 2,
    LOW = 3
};

struct Policy {
    std::string id;
    std::string name;
    std::string description;
    PolicyLevel level;
    std::unordered_map<std::string, std::string> rules;
    bool active;
    
    Policy(const std::string& id, const std::string& name, 
           const std::string& desc, PolicyLevel lvl)
        : id(id), name(name), description(desc), level(lvl), active(true) {}
};

struct PolicyViolation {
    std::chrono::system_clock::time_point timestamp;
    std::string policy_id;
    std::string violation_type;
    PolicyLevel severity;
    std::string description;
};

class CPPPolicyEngine {
private:
    std::unordered_map<std::string, std::unique_ptr<Policy>> policies_;
    std::vector<PolicyViolation> violations_;
    bool enforcement_active_;
    mutable std::mutex mutex_;
    
    void loadCorePolicies();
    bool checkPolicyCompliance(const Policy& policy, const std::string& operation_type) const;
    
public:
    CPPPolicyEngine();
    ~CPPPolicyEngine() = default;
    
    // Core functionality
    bool initialize();
    bool canExecuteOperation(const std::string& operation_type) const;
    void reportViolation(const std::string& policy_id, const std::string& violation_type,
                        PolicyLevel severity, const std::string& description);
    
    // Policy management
    bool addPolicy(std::unique_ptr<Policy> policy);
    bool removePolicy(const std::string& policy_id);
    bool activatePolicy(const std::string& policy_id);
    bool deactivatePolicy(const std::string& policy_id);
    
    // Safety controls
    void emergencyLockdown();
    void enableEnforcement();
    void disableEnforcement();
    
    // Status and monitoring
    size_t getActivePolicyCount() const;
    size_t getViolationCount() const;
    std::vector<std::string> getActivePolicyIds() const;
    bool isEnforcementActive() const;
    
    // Lifecycle
    void shutdown();
};

} // namespace core
} // namespace eva