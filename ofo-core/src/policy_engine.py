"""
Policy Engine
Sets EVA's ethical boundaries and operational rules
"""

import asyncio
import logging
from typing import Dict, Any, List, Optional
from dataclasses import dataclass
from enum import Enum

logger = logging.getLogger(__name__)

class PolicyLevel(Enum):
    CRITICAL = "critical"
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"

@dataclass
class Policy:
    id: str
    name: str
    description: str
    level: PolicyLevel
    rules: Dict[str, Any]
    active: bool = True

class PolicyEngine:
    """
    EVA's ethical and operational policy enforcement system
    Ensures all actions align with safety and ethical guidelines
    """
    
    def __init__(self):
        self.policies: Dict[str, Policy] = {}
        self.policy_violations: List[Dict[str, Any]] = []
        self.enforcement_active = True
        
    async def initialize(self):
        """Initialize policy engine with core policies"""
        logger.info("⚖️ Initializing Policy Engine...")
        
        # Load core ethical policies
        await self._load_core_policies()
        
        logger.info(f"✅ Policy Engine initialized with {len(self.policies)} policies")
    
    async def _load_core_policies(self):
        """Load fundamental ethical and safety policies"""
        
        # Core safety policies
        safety_policy = Policy(
            id="safety_001",
            name="Human Safety Priority",
            description="EVA must never take actions that could harm humans",
            level=PolicyLevel.CRITICAL,
            rules={
                "harm_prevention": True,
                "emergency_override": True,
                "human_consent_required": ["device_control", "data_access"]
            }
        )
        
        privacy_policy = Policy(
            id="privacy_001", 
            name="Data Privacy Protection",
            description="Protect user privacy and data confidentiality",
            level=PolicyLevel.CRITICAL,
            rules={
                "data_encryption": True,
                "consent_required": True,
                "data_retention_limit": 86400,  # 24 hours
                "anonymization": True
            }
        )
        
        learning_policy = Policy(
            id="learning_001",
            name="Ethical Learning Boundaries", 
            description="Guidelines for EVA's learning and experimentation",
            level=PolicyLevel.HIGH,
            rules={
                "no_harmful_content": True,
                "bias_detection": True,
                "experiment_safety_check": True,
                "knowledge_verification": True
            }
        )
        
        resource_policy = Policy(
            id="resource_001",
            name="Resource Usage Limits",
            description="Prevent excessive resource consumption",
            level=PolicyLevel.MEDIUM,
            rules={
                "max_cpu_usage": 80,
                "max_memory_usage": 75,
                "max_network_bandwidth": 50,
                "max_concurrent_operations": 5
            }
        )
        
        # Store policies
        for policy in [safety_policy, privacy_policy, learning_policy, resource_policy]:
            self.policies[policy.id] = policy
    
    async def can_grant_lease(self, lease_type, permissions: Optional[Dict[str, Any]] = None) -> bool:
        """Check if a lease can be granted based on policies"""
        
        if not self.enforcement_active:
            return True
        
        # Check against all active policies
        for policy in self.policies.values():
            if not policy.active:
                continue
                
            if not await self._check_policy_compliance(policy, lease_type, permissions):
                logger.warning(f"❌ Lease denied by policy {policy.name}")
                await self._record_violation(policy, lease_type, permissions)
                return False
        
        return True
    
    async def filter_experiments(self, learning_insights: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Filter experiments based on policy constraints"""
        
        # Generate potential experiments from insights
        potential_experiments = await self._generate_experiments(learning_insights)
        
        # Filter based on policies
        allowed_experiments = []
        for experiment in potential_experiments:
            if await self._is_experiment_safe(experiment):
                allowed_experiments.append(experiment)
            else:
                logger.info(f"🚫 Experiment filtered by policy: {experiment.get('type', 'unknown')}")
        
        return allowed_experiments
    
    async def _check_policy_compliance(self, policy: Policy, lease_type, permissions) -> bool:
        """Check if a request complies with a specific policy"""
        
        rules = policy.rules
        
        # Safety checks
        if policy.id == "safety_001":
            if lease_type.value == "device_control" and not permissions.get('user_consent'):
                return False
        
        # Privacy checks  
        elif policy.id == "privacy_001":
            if lease_type.value == "network_access" and not permissions.get('encrypted'):
                return False
        
        # Resource checks
        elif policy.id == "resource_001":
            if lease_type.value == "computation":
                max_cpu = rules.get('max_cpu_usage', 100)
                requested_cpu = permissions.get('cpu_usage', 0) if permissions else 0
                if requested_cpu > max_cpu:
                    return False
        
        return True
    
    async def _is_experiment_safe(self, experiment: Dict[str, Any]) -> bool:
        """Check if an experiment is safe to execute"""
        
        experiment_type = experiment.get('type', '')
        risk_level = experiment.get('risk_level', 'medium')
        
        # Block high-risk experiments
        if risk_level == 'high':
            return False
        
        # Check specific experiment types
        if experiment_type in ['system_modification', 'external_communication']:
            return False
        
        return True
    
    async def _generate_experiments(self, insights: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generate potential experiments from learning insights"""
        
        experiments = [
            {
                'id': 'exp_001',
                'type': 'pattern_recognition',
                'description': 'Test new pattern recognition algorithm',
                'risk_level': 'low',
                'required_lease_type': 'computation'
            },
            {
                'id': 'exp_002', 
                'type': 'optimization',
                'description': 'Optimize response generation',
                'risk_level': 'low',
                'required_lease_type': 'computation'
            }
        ]
        
        return experiments
    
    async def _record_violation(self, policy: Policy, lease_type, permissions):
        """Record a policy violation"""
        import time
        violation = {
            'timestamp': time.time(),
            'policy_id': policy.id,
            'policy_name': policy.name,
            'lease_type': lease_type.value if hasattr(lease_type, 'value') else str(lease_type),
            'permissions': permissions,
            'severity': policy.level.value
        }

        self.policy_violations.append(violation)
        logger.warning(f"📋 Policy violation recorded: {policy.name}")
    
    async def is_ready(self) -> bool:
        """Check if policy engine is ready"""
        return len(self.policies) > 0
    
    async def shutdown(self):
        """Shutdown policy engine"""
        logger.info("⚖️ Shutting down Policy Engine...")
        self.enforcement_active = False