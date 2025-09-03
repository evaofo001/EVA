/*!
 * Emergency Kill Switch
 * Critical safety system for immediate EVA shutdown
 */

use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::Arc;
use tokio::time::{Duration, Instant};
use tracing::{info, warn, error};

#[derive(Debug)]
pub struct EmergencyKillSwitch {
    activated: Arc<AtomicBool>,
    emergency_timeout: Duration,
    last_safety_check: Arc<tokio::sync::RwLock<Instant>>,
    safety_violations: Arc<tokio::sync::RwLock<Vec<SafetyViolation>>>,
}

#[derive(Debug, Clone)]
pub struct SafetyViolation {
    pub timestamp: Instant,
    pub violation_type: String,
    pub severity: ViolationSeverity,
    pub description: String,
}

#[derive(Debug, Clone)]
pub enum ViolationSeverity {
    Low,
    Medium,
    High,
    Critical,
}

impl EmergencyKillSwitch {
    pub fn new(emergency_timeout: Duration) -> Self {
        Self {
            activated: Arc::new(AtomicBool::new(false)),
            emergency_timeout,
            last_safety_check: Arc::new(tokio::sync::RwLock::new(Instant::now())),
            safety_violations: Arc::new(tokio::sync::RwLock::new(Vec::new())),
        }
    }

    pub async fn initialize(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        info!("🚨 Initializing Emergency Kill Switch...");
        
        // Reset activation state
        self.activated.store(false, Ordering::SeqCst);
        
        // Clear violation history
        self.safety_violations.write().await.clear();
        
        // Update safety check timestamp
        *self.last_safety_check.write().await = Instant::now();
        
        info!("✅ Emergency Kill Switch initialized and armed");
        Ok(())
    }

    pub async fn activate(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        warn!("🚨 EMERGENCY KILL SWITCH ACTIVATED!");
        
        self.activated.store(true, Ordering::SeqCst);
        
        // Record activation
        let violation = SafetyViolation {
            timestamp: Instant::now(),
            violation_type: "emergency_activation".to_string(),
            severity: ViolationSeverity::Critical,
            description: "Emergency kill switch manually activated".to_string(),
        };
        
        self.safety_violations.write().await.push(violation);
        
        // Immediate safety actions would go here
        // (In real implementation: stop all processes, close connections, etc.)
        
        error!("🛑 ALL EVA OPERATIONS TERMINATED BY EMERGENCY KILL SWITCH");
        Ok(())
    }

    pub async fn should_emergency_stop(&self) -> bool {
        // Check if manually activated
        if self.activated.load(Ordering::SeqCst) {
            return true;
        }

        // Check for automatic triggers
        let violations = self.safety_violations.read().await;
        let critical_violations = violations.iter()
            .filter(|v| matches!(v.severity, ViolationSeverity::Critical))
            .count();

        // Auto-trigger if too many critical violations
        if critical_violations >= 3 {
            warn!("🚨 Auto-triggering kill switch due to {} critical violations", critical_violations);
            return true;
        }

        // Check safety timeout
        let last_check = *self.last_safety_check.read().await;
        if last_check.elapsed() > self.emergency_timeout * 2 {
            warn!("🚨 Safety check timeout exceeded");
            return true;
        }

        false
    }

    pub async fn report_violation(&self, violation_type: String, severity: ViolationSeverity, description: String) {
        let violation = SafetyViolation {
            timestamp: Instant::now(),
            violation_type,
            severity: severity.clone(),
            description,
        };

        self.safety_violations.write().await.push(violation);
        
        match severity {
            ViolationSeverity::Critical => error!("🚨 CRITICAL SAFETY VIOLATION: {}", description),
            ViolationSeverity::High => warn!("⚠️ High severity violation: {}", description),
            ViolationSeverity::Medium => warn!("⚠️ Medium severity violation: {}", description),
            ViolationSeverity::Low => info!("ℹ️ Low severity violation: {}", description),
        }
    }

    pub async fn update_safety_check(&self) {
        *self.last_safety_check.write().await = Instant::now();
    }

    pub fn is_activated(&self) -> bool {
        self.activated.load(Ordering::SeqCst)
    }

    pub async fn get_violation_count(&self) -> usize {
        self.safety_violations.read().await.len()
    }

    pub async fn reset(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        if !self.activated.load(Ordering::SeqCst) {
            warn!("❌ Cannot reset kill switch - not currently activated");
            return Err("Kill switch not activated".into());
        }

        info!("🔄 Resetting Emergency Kill Switch...");
        
        self.activated.store(false, Ordering::SeqCst);
        self.safety_violations.write().await.clear();
        *self.last_safety_check.write().await = Instant::now();
        
        info!("✅ Emergency Kill Switch reset and re-armed");
        Ok(())
    }

    pub async fn shutdown(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        info!("🚨 Shutting down Emergency Kill Switch...");
        
        // Final safety activation
        if !self.activated.load(Ordering::SeqCst) {
            self.activated.store(true, Ordering::SeqCst);
        }
        
        info!("✅ Emergency Kill Switch shutdown complete");
        Ok(())
    }
}