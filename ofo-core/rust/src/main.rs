/*!
 * EVA-OFO-001 Rust Safety-Critical Systems
 * Handles lease management and emergency controls
 */

use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;
use tokio::time::{Duration, Instant};
use tracing::{info, warn, error};

mod lease_manager;
mod policy_engine;
mod knowledge_fusion_engine;
mod kill_switch;

use lease_manager::RustLeaseManager;
use policy_engine::RustPolicyEngine;
use knowledge_fusion_engine::RustKnowledgeFusion;
use kill_switch::EmergencyKillSwitch;

#[derive(Debug, Clone)]
pub struct EVAConfig {
    pub max_concurrent_leases: usize,
    pub default_lease_duration: Duration,
    pub emergency_timeout: Duration,
    pub safety_check_interval: Duration,
}

impl Default for EVAConfig {
    fn default() -> Self {
        Self {
            max_concurrent_leases: 10,
            default_lease_duration: Duration::from_secs(300), // 5 minutes
            emergency_timeout: Duration::from_secs(5),
            safety_check_interval: Duration::from_secs(1),
        }
    }
}

pub struct EVARustCore {
    config: EVAConfig,
    lease_manager: Arc<RwLock<RustLeaseManager>>,
    policy_engine: Arc<RwLock<RustPolicyEngine>>,
    knowledge_fusion: Arc<RwLock<RustKnowledgeFusion>>,
    kill_switch: Arc<RwLock<EmergencyKillSwitch>>,
    running: Arc<RwLock<bool>>,
}

impl EVARustCore {
    pub fn new(config: EVAConfig) -> Self {
        let policy_engine = Arc::new(RwLock::new(RustPolicyEngine::new()));
        let lease_manager = Arc::new(RwLock::new(RustLeaseManager::new(
            config.max_concurrent_leases,
            config.default_lease_duration,
        )));
        let knowledge_fusion = Arc::new(RwLock::new(RustKnowledgeFusion::new()));
        let kill_switch = Arc::new(RwLock::new(EmergencyKillSwitch::new(
            config.emergency_timeout
        )));

        Self {
            config,
            lease_manager,
            policy_engine,
            knowledge_fusion,
            kill_switch,
            running: Arc::new(RwLock::new(false)),
        }
    }

    pub async fn initialize(&self) -> Result<(), Box<dyn std::error::Error>> {
        info!("🦀 Initializing EVA Rust Core Systems...");

        // Initialize all subsystems
        self.policy_engine.write().await.initialize().await?;
        self.lease_manager.write().await.initialize().await?;
        self.knowledge_fusion.write().await.initialize().await?;
        self.kill_switch.write().await.initialize().await?;

        info!("✅ EVA Rust Core Systems initialized successfully");
        Ok(())
    }

    pub async fn start(&self) -> Result<(), Box<dyn std::error::Error>> {
        info!("🚀 Starting EVA Rust Core...");
        
        *self.running.write().await = true;

        // Start safety monitoring
        let kill_switch = Arc::clone(&self.kill_switch);
        let running = Arc::clone(&self.running);
        let safety_interval = self.config.safety_check_interval;
        
        tokio::spawn(async move {
            while *running.read().await {
                if kill_switch.read().await.should_emergency_stop().await {
                    warn!("🚨 Emergency kill switch activated!");
                    *running.write().await = false;
                    break;
                }
                tokio::time::sleep(safety_interval).await;
            }
        });

        // Start lease monitoring
        let lease_manager = Arc::clone(&self.lease_manager);
        let running_clone = Arc::clone(&self.running);
        
        tokio::spawn(async move {
            while *running_clone.read().await {
                lease_manager.write().await.cleanup_expired_leases().await;
                tokio::time::sleep(Duration::from_secs(10)).await;
            }
        });

        info!("✅ EVA Rust Core started successfully");
        Ok(())
    }

    pub async fn request_lease(&self, lease_type: &str, duration: Option<Duration>) -> Option<String> {
        let policy_check = self.policy_engine.read().await
            .can_grant_lease(lease_type).await;
            
        if !policy_check {
            warn!("❌ Lease request denied by policy: {}", lease_type);
            return None;
        }

        self.lease_manager.write().await
            .request_lease(lease_type, duration).await
    }

    pub async fn emergency_stop(&self) -> Result<(), Box<dyn std::error::Error>> {
        warn!("🚨 Emergency stop initiated!");
        
        self.kill_switch.write().await.activate().await?;
        *self.running.write().await = false;
        
        // Revoke all active leases
        self.lease_manager.write().await.revoke_all_leases().await;
        
        info!("🛑 Emergency stop completed");
        Ok(())
    }

    pub async fn get_system_status(&self) -> HashMap<String, serde_json::Value> {
        let mut status = HashMap::new();
        
        status.insert("running".to_string(), 
            serde_json::Value::Bool(*self.running.read().await));
        
        let lease_status = self.lease_manager.read().await.get_status().await;
        status.insert("leases".to_string(), 
            serde_json::to_value(lease_status).unwrap_or_default());
        
        let policy_status = self.policy_engine.read().await.get_status().await;
        status.insert("policies".to_string(),
            serde_json::to_value(policy_status).unwrap_or_default());
        
        let knowledge_status = self.knowledge_fusion.read().await.get_status().await;
        status.insert("knowledge".to_string(),
            serde_json::to_value(knowledge_status).unwrap_or_default());

        status
    }

    pub async fn shutdown(&self) -> Result<(), Box<dyn std::error::Error>> {
        info!("🛑 Shutting down EVA Rust Core...");
        
        *self.running.write().await = false;
        
        // Shutdown all subsystems
        self.lease_manager.write().await.shutdown().await?;
        self.policy_engine.write().await.shutdown().await?;
        self.knowledge_fusion.write().await.shutdown().await?;
        self.kill_switch.write().await.shutdown().await?;
        
        info!("✅ EVA Rust Core shutdown complete");
        Ok(())
    }
}

#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // Initialize tracing
    tracing_subscriber::fmt::init();
    
    info!("🌌 Starting EVA-OFO-001 Rust Core...");
    
    let config = EVAConfig::default();
    let eva_core = EVARustCore::new(config);
    
    // Initialize and start
    eva_core.initialize().await?;
    eva_core.start().await?;
    
    // Setup graceful shutdown
    tokio::signal::ctrl_c().await?;
    info!("Received shutdown signal");
    
    eva_core.shutdown().await?;
    
    Ok(())
}