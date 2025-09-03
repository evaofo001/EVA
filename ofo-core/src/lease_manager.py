"""
Lease Manager
Governs what EVA units can do and for how long
"""

import asyncio
import logging
import time
from typing import Dict, Any, Optional, List
from dataclasses import dataclass
from enum import Enum

logger = logging.getLogger(__name__)

class LeaseType(Enum):
    COMPUTATION = "computation"
    NETWORK_ACCESS = "network_access"
    FILE_SYSTEM = "file_system"
    DEVICE_CONTROL = "device_control"
    LEARNING = "learning"
    EXPERIMENTATION = "experimentation"

@dataclass
class Lease:
    id: str
    lease_type: LeaseType
    duration: float
    granted_at: float
    expires_at: float
    permissions: Dict[str, Any]
    active: bool = True

class LeaseManager:
    """
    Manages resource leases for EVA operations
    Ensures safe, controlled access to system resources
    """
    
    def __init__(self, policy_engine):
        self.policy_engine = policy_engine
        self.active_leases: Dict[str, Lease] = {}
        self.lease_history: List[Lease] = []
        self.max_concurrent_leases = 10
        self.default_lease_duration = 300.0  # 5 minutes
        
    async def initialize(self):
        """Initialize lease manager"""
        logger.info("🔐 Initializing Lease Manager...")
        
        # Start lease monitoring task
        asyncio.create_task(self._monitor_leases())
        
        logger.info("✅ Lease Manager initialized")
    
    async def request_lease(self, lease_type: LeaseType, duration: Optional[float] = None, 
                          permissions: Optional[Dict[str, Any]] = None) -> Optional[str]:
        """Request a new lease for resource access"""
        
        # Check policy constraints
        if not await self.policy_engine.can_grant_lease(lease_type, permissions):
            logger.warning(f"❌ Lease request denied by policy: {lease_type}")
            return None
        
        # Check concurrent lease limits
        if len(self.active_leases) >= self.max_concurrent_leases:
            logger.warning("❌ Maximum concurrent leases reached")
            return None
        
        # Create lease
        lease_id = f"lease_{int(time.time() * 1000)}"
        lease_duration = duration or self.default_lease_duration
        current_time = time.time()
        
        lease = Lease(
            id=lease_id,
            lease_type=lease_type,
            duration=lease_duration,
            granted_at=current_time,
            expires_at=current_time + lease_duration,
            permissions=permissions or {}
        )
        
        self.active_leases[lease_id] = lease
        logger.info(f"✅ Granted lease {lease_id} for {lease_type.value} ({lease_duration}s)")
        
        return lease_id
    
    async def can_execute(self, operation: Dict[str, Any]) -> bool:
        """Check if an operation can be executed based on active leases"""
        required_lease_type = operation.get('required_lease_type')
        
        if not required_lease_type:
            return True  # No lease required
        
        # Check if we have an active lease for this operation type
        for lease in self.active_leases.values():
            if (lease.lease_type.value == required_lease_type and 
                lease.active and 
                time.time() < lease.expires_at):
                return True
        
        # Try to request a new lease
        lease_id = await self.request_lease(LeaseType(required_lease_type))
        return lease_id is not None
    
    async def revoke_lease(self, lease_id: str) -> bool:
        """Revoke an active lease"""
        if lease_id in self.active_leases:
            self.active_leases[lease_id].active = False
            self.lease_history.append(self.active_leases[lease_id])
            del self.active_leases[lease_id]
            logger.info(f"🔒 Revoked lease {lease_id}")
            return True
        return False
    
    async def _monitor_leases(self):
        """Monitor and expire old leases"""
        while True:
            current_time = time.time()
            expired_leases = []
            
            for lease_id, lease in self.active_leases.items():
                if current_time >= lease.expires_at:
                    expired_leases.append(lease_id)
            
            for lease_id in expired_leases:
                await self.revoke_lease(lease_id)
                logger.info(f"⏰ Lease {lease_id} expired")
            
            await asyncio.sleep(10)  # Check every 10 seconds
    
    async def get_lease_status(self) -> Dict[str, Any]:
        """Get current lease status"""
        return {
            'active_leases': len(self.active_leases),
            'total_granted': len(self.lease_history) + len(self.active_leases),
            'lease_types': [lease.lease_type.value for lease in self.active_leases.values()]
        }
    
    async def is_ready(self) -> bool:
        """Check if lease manager is ready"""
        return True
    
    async def shutdown(self):
        """Shutdown lease manager"""
        logger.info("🔐 Shutting down Lease Manager...")
        
        # Revoke all active leases
        for lease_id in list(self.active_leases.keys()):
            await self.revoke_lease(lease_id)