/*!
 * Rust Lease Manager
 * Safety-critical lease management with strict controls
 */

use std::collections::HashMap;
use tokio::time::{Duration, Instant};
use serde::{Deserialize, Serialize};
use uuid::Uuid;
use tracing::{info, warn, debug};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum LeaseType {
    Computation,
    NetworkAccess,
    FileSystem,
    DeviceControl,
    Learning,
    Experimentation,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Lease {
    pub id: String,
    pub lease_type: LeaseType,
    pub granted_at: Instant,
    pub expires_at: Instant,
    pub permissions: HashMap<String, serde_json::Value>,
    pub active: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct LeaseStatus {
    pub active_leases: usize,
    pub total_granted: usize,
    pub lease_types: Vec<String>,
    pub utilization_rate: f64,
}

pub struct RustLeaseManager {
    active_leases: HashMap<String, Lease>,
    lease_history: Vec<Lease>,
    max_concurrent: usize,
    default_duration: Duration,
    total_granted: usize,
}

impl RustLeaseManager {
    pub fn new(max_concurrent: usize, default_duration: Duration) -> Self {
        Self {
            active_leases: HashMap::new(),
            lease_history: Vec::new(),
            max_concurrent,
            default_duration,
            total_granted: 0,
        }
    }

    pub async fn initialize(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        info!("🔐 Initializing Rust Lease Manager...");
        
        // Clear any existing leases (safety measure)
        self.active_leases.clear();
        
        info!("✅ Rust Lease Manager initialized");
        Ok(())
    }

    pub async fn request_lease(
        &mut self,
        lease_type: &str,
        duration: Option<Duration>,
    ) -> Option<String> {
        // Check concurrent lease limit
        if self.active_leases.len() >= self.max_concurrent {
            warn!("❌ Maximum concurrent leases reached: {}", self.max_concurrent);
            return None;
        }

        let lease_type_enum = match lease_type {
            "computation" => LeaseType::Computation,
            "network_access" => LeaseType::NetworkAccess,
            "file_system" => LeaseType::FileSystem,
            "device_control" => LeaseType::DeviceControl,
            "learning" => LeaseType::Learning,
            "experimentation" => LeaseType::Experimentation,
            _ => {
                warn!("❌ Unknown lease type: {}", lease_type);
                return None;
            }
        };

        let lease_id = Uuid::new_v4().to_string();
        let now = Instant::now();
        let lease_duration = duration.unwrap_or(self.default_duration);

        let lease = Lease {
            id: lease_id.clone(),
            lease_type: lease_type_enum,
            granted_at: now,
            expires_at: now + lease_duration,
            permissions: HashMap::new(),
            active: true,
        };

        self.active_leases.insert(lease_id.clone(), lease);
        self.total_granted += 1;

        info!("✅ Granted lease {} for {} ({:?})", 
              lease_id, lease_type, lease_duration);

        Some(lease_id)
    }

    pub async fn revoke_lease(&mut self, lease_id: &str) -> bool {
        if let Some(mut lease) = self.active_leases.remove(lease_id) {
            lease.active = false;
            self.lease_history.push(lease);
            info!("🔒 Revoked lease {}", lease_id);
            true
        } else {
            false
        }
    }

    pub async fn revoke_all_leases(&mut self) {
        let lease_ids: Vec<String> = self.active_leases.keys().cloned().collect();
        
        for lease_id in lease_ids {
            self.revoke_lease(&lease_id).await;
        }
        
        warn!("🚨 All leases revoked (emergency procedure)");
    }

    pub async fn cleanup_expired_leases(&mut self) {
        let now = Instant::now();
        let mut expired_leases = Vec::new();

        for (lease_id, lease) in &self.active_leases {
            if now >= lease.expires_at {
                expired_leases.push(lease_id.clone());
            }
        }

        for lease_id in expired_leases {
            self.revoke_lease(&lease_id).await;
            debug!("⏰ Lease {} expired and removed", lease_id);
        }
    }

    pub async fn is_lease_valid(&self, lease_id: &str) -> bool {
        if let Some(lease) = self.active_leases.get(lease_id) {
            lease.active && Instant::now() < lease.expires_at
        } else {
            false
        }
    }

    pub async fn get_status(&self) -> LeaseStatus {
        let lease_types: Vec<String> = self.active_leases
            .values()
            .map(|lease| format!("{:?}", lease.lease_type))
            .collect();

        let utilization_rate = if self.max_concurrent > 0 {
            self.active_leases.len() as f64 / self.max_concurrent as f64
        } else {
            0.0
        };

        LeaseStatus {
            active_leases: self.active_leases.len(),
            total_granted: self.total_granted,
            lease_types,
            utilization_rate,
        }
    }

    pub async fn shutdown(&mut self) -> Result<(), Box<dyn std::error::Error>> {
        info!("🔐 Shutting down Rust Lease Manager...");
        
        // Revoke all active leases
        self.revoke_all_leases().await;
        
        info!("✅ Rust Lease Manager shutdown complete");
        Ok(())
    }
}