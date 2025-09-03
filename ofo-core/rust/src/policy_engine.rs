/*!
 * Rust Policy Engine
 * Safety-critical policy enforcement for EVA operations
 */

use std::collections::HashMap;
use serde::{Deserialize, Serialize};
use tokio::time::Instant;
use tracing::{info, warn, error};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum PolicyLevel {
    Critical,
    High,
    Medium,
    Low,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Policy {
    pub id: String,
    pub name: String,
    pub description: String,
    pub level: PolicyLevel,
    pub rules: HashMap<String, serde_json::Value>,
    pub active: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct PolicyStatus {
    pub active_policies: usize,
    pub violations_count: usize,
    pub enforcement_active: bool,
    pub last_check: String,
}

pub struct RustPolicyEngine {
    policies: HashMap<String, Policy>,
    violations: Vec<PolicyViolation>,
    enforcement_active: bool,
    last_safety_check: Instant,
}

#[derive(Debug, Clone)]
pub struct PolicyViolation {
    pub timestamp: Instant,
    pub policy_id: String,
    pub violation_type: String,
    pub severity: PolicyLevel,
    pub description: String,
}

impl RustPolicyEngine {
    pub fn new() -> Self {
        Self {
            policies: HashMap::new(),
            violations: Vec::new(),
            enforcement_active: true,
            last_safety_check: Instant::now(),
        }
    }

    pub async fn initialize(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        info!("⚖️ Initializing Rust Policy Engine...");
        
        self.load_core_policies().await?;
        self.enforcement_active = true;
        self.last_safety_check = Instant::now();
        
        info!("✅ Rust Policy Engine initialized with {} policies", self.policies.len());
        Ok(())
    }

    async fn load_core_policies(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        // Critical safety policy
        let mut safety_rules = HashMap::new();
        safety_rules.insert("harm_prevention".to_string(), serde_json::Value::Bool(true));
        safety_rules.insert("emergency_override".to_string(), serde_json::Value::Bool(true));
        safety_rules.insert("human_consent_required".to_string(), 
            serde_json::Value::Array(vec![
                serde_json::Value::String("device_control".to_string()),
                serde_json::Value::String("data_access".to_string())
            ]));

        let safety_policy = Policy {
            id: "rust_safety_001".to_string(),
            name: "Critical Safety Protocol".to_string(),
            description: "Rust-enforced safety constraints for EVA operations".to_string(),
            level: PolicyLevel::Critical,
            rules: safety_rules,
            active: true,
        };

        // Resource limits policy
        let mut resource_rules = HashMap::new();
        resource_rules.insert("max_cpu_usage".to_string(), serde_json::Value::Number(serde_json::Number::from(80)));
        resource_rules.insert("max_memory_usage".to_string(), serde_json::Value::Number(serde_json::Number::from(75)));
        resource_rules.insert("max_concurrent_operations".to_string(), serde_json::Value::Number(serde_json::Number::from(5)));

        let resource_policy = Policy {
            id: "rust_resource_001".to_string(),
            name: "Resource Usage Limits".to_string(),
            description: "Prevent excessive resource consumption".to_string(),
            level: PolicyLevel::High,
            rules: resource_rules,
            active: true,
        };

        // Learning constraints policy
        let mut learning_rules = HashMap::new();
        learning_rules.insert("no_harmful_content".to_string(), serde_json::Value::Bool(true));
        learning_rules.insert("bias_detection".to_string(), serde_json::Value::Bool(true));
        learning_rules.insert("experiment_safety_check".to_string(), serde_json::Value::Bool(true));

        let learning_policy = Policy {
            id: "rust_learning_001".to_string(),
            name: "Learning Safety Constraints".to_string(),
            description: "Ethical boundaries for EVA's learning processes".to_string(),
            level: PolicyLevel::High,
            rules: learning_rules,
            active: true,
        };

        self.policies.insert(safety_policy.id.clone(), safety_policy);
        self.policies.insert(resource_policy.id.clone(), resource_policy);
        self.policies.insert(learning_policy.id.clone(), learning_policy);

        Ok(())
    }

    pub async fn can_grant_lease(&self, lease_type: &str) -> bool {
        if !self.enforcement_active {
            return true;
        }

        for policy in self.policies.values() {
            if !policy.active {
                continue;
            }

            if !self.check_policy_compliance(policy, lease_type) {
                warn!("❌ Lease denied by Rust policy: {}", policy.name);
                return false;
            }
        }

        true
    }

    fn check_policy_compliance(&self, policy: &Policy, lease_type: &str) -> bool {
        match policy.id.as_str() {
            "rust_safety_001" => {
                if lease_type == "device_control" {
                    // In real implementation, check for user consent
                    return true; // Simplified for demo
                }
            },
            "rust_resource_001" => {
                if lease_type == "computation" {
                    // Check resource constraints
                    return true; // Simplified for demo
                }
            },
            "rust_learning_001" => {
                if lease_type == "learning" || lease_type == "experimentation" {
                    // Verify learning safety constraints
                    return true; // Simplified for demo
                }
            },
            _ => {}
        }
        
        true
    }

    pub async fn report_violation(&mut self, policy_id: String, violation_type: String, 
                                 severity: PolicyLevel, description: String) {
        let violation = PolicyViolation {
            timestamp: Instant::now(),
            policy_id: policy_id.clone(),
            violation_type,
            severity: severity.clone(),
            description: description.clone(),
        };

        self.violations.push(violation);

        match severity {
            PolicyLevel::Critical => error!("🚨 CRITICAL POLICY VIOLATION: {}", description),
            PolicyLevel::High => warn!("⚠️ High severity policy violation: {}", description),
            PolicyLevel::Medium => warn!("⚠️ Medium severity policy violation: {}", description),
            PolicyLevel::Low => info!("ℹ️ Low severity policy violation: {}", description),
        }
    }

    pub async fn get_status(&self) -> PolicyStatus {
        PolicyStatus {
            active_policies: self.policies.values().filter(|p| p.active).count(),
            violations_count: self.violations.len(),
            enforcement_active: self.enforcement_active,
            last_check: format!("{:?}", self.last_safety_check.elapsed()),
        }
    }

    pub async fn emergency_lockdown(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        error!("🚨 EMERGENCY POLICY LOCKDOWN ACTIVATED");
        
        // Disable all non-critical policies temporarily
        for policy in self.policies.values_mut() {
            if !matches!(policy.level, PolicyLevel::Critical) {
                policy.active = false;
            }
        }

        self.enforcement_active = true;
        
        info!("🔒 Emergency lockdown complete - only critical policies active");
        Ok(())
    }

    pub async fn shutdown(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        info!("⚖️ Shutting down Rust Policy Engine...");
        
        self.enforcement_active = false;
        
        info!("✅ Rust Policy Engine shutdown complete");
        Ok(())
    }
}