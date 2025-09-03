"""
EVA Core Orchestrator
The central brain that coordinates all EVA subsystems
"""

import asyncio
import logging
import time
from typing import Dict, Any, Optional
from dataclasses import dataclass
from enum import Enum

logger = logging.getLogger(__name__)

class EVAState(Enum):
    INITIALIZING = "initializing"
    LEARNING = "learning"
    EXPERIMENTING = "experimenting"
    ADAPTING = "adapting"
    IDLE = "idle"
    ERROR = "error"

@dataclass
class EvolutionCycle:
    perception_data: Dict[str, Any]
    memory_updates: Dict[str, Any]
    learning_insights: Dict[str, Any]
    experiments: list
    outputs: Dict[str, Any]
    timestamp: float

class EVACore:
    """
    EVA's central intelligence orchestrator
    Manages the continuous evolution cycle: Perception → Memory → Learning → Experimentation → Output
    """
    
    def __init__(self, lease_manager, policy_engine, knowledge_fusion):
        self.lease_manager = lease_manager
        self.policy_engine = policy_engine
        self.knowledge_fusion = knowledge_fusion
        
        self.state = EVAState.INITIALIZING
        self.evolution_cycles = []
        self.current_cycle: Optional[EvolutionCycle] = None
        self.running = False
        
        # Learning metrics
        self.total_cycles = 0
        self.successful_experiments = 0
        self.knowledge_growth_rate = 0.0
        
    async def initialize(self):
        """Initialize EVA's core systems"""
        logger.info("🧠 Initializing EVA Core Intelligence...")
        
        # Verify all subsystems are ready
        if not await self.lease_manager.is_ready():
            raise RuntimeError("Lease Manager not ready")
        if not await self.policy_engine.is_ready():
            raise RuntimeError("Policy Engine not ready")
        if not await self.knowledge_fusion.is_ready():
            raise RuntimeError("Knowledge Fusion Engine not ready")
            
        self.state = EVAState.IDLE
        logger.info("✅ EVA Core initialized and ready")
        
    async def start_evolution_cycle(self):
        """Start EVA's continuous evolution loop"""
        logger.info("🔄 Starting EVA evolution cycle...")
        self.running = True
        self.state = EVAState.LEARNING
        
        while self.running:
            try:
                cycle_start = time.time()
                
                # Create new evolution cycle
                self.current_cycle = EvolutionCycle(
                    perception_data={},
                    memory_updates={},
                    learning_insights={},
                    experiments=[],
                    outputs={},
                    timestamp=cycle_start
                )
                
                # Execute evolution phases
                await self._perception_phase()
                await self._memory_phase()
                await self._learning_phase()
                await self._experimentation_phase()
                await self._output_phase()
                
                # Complete cycle
                cycle_duration = time.time() - cycle_start
                self.evolution_cycles.append(self.current_cycle)
                self.total_cycles += 1
                
                logger.info(f"🔄 Evolution cycle {self.total_cycles} completed in {cycle_duration:.2f}s")
                
                # Adaptive sleep based on learning load
                sleep_duration = max(0.1, 1.0 - cycle_duration)
                await asyncio.sleep(sleep_duration)
                
            except Exception as e:
                logger.error(f"❌ Error in evolution cycle: {e}")
                self.state = EVAState.ERROR
                await asyncio.sleep(5)  # Recovery pause
                self.state = EVAState.LEARNING
    
    async def _perception_phase(self):
        """Gather data from all available sources"""
        logger.debug("👁️ Perception phase...")
        
        # Simulate data gathering from various sources
        perception_data = {
            'timestamp': time.time(),
            'system_metrics': await self._gather_system_metrics(),
            'user_interactions': await self._gather_user_data(),
            'environmental_data': await self._gather_environmental_data()
        }
        
        self.current_cycle.perception_data = perception_data
        
    async def _memory_phase(self):
        """Process and store experiences"""
        logger.debug("🧠 Memory phase...")
        
        # Update knowledge base through fusion engine
        memory_updates = await self.knowledge_fusion.process_perception(
            self.current_cycle.perception_data
        )
        
        self.current_cycle.memory_updates = memory_updates
        
    async def _learning_phase(self):
        """Discover patterns and generate insights"""
        logger.debug("📚 Learning phase...")
        
        # Generate learning insights
        insights = await self.knowledge_fusion.generate_insights(
            self.current_cycle.perception_data,
            self.current_cycle.memory_updates
        )
        
        self.current_cycle.learning_insights = insights
        
    async def _experimentation_phase(self):
        """Try new behaviors and approaches"""
        logger.debug("🧪 Experimentation phase...")
        
        # Check policy constraints before experimenting
        allowed_experiments = await self.policy_engine.filter_experiments(
            self.current_cycle.learning_insights
        )
        
        # Execute safe experiments
        experiments = []
        for experiment in allowed_experiments:
            if await self.lease_manager.can_execute(experiment):
                result = await self._execute_experiment(experiment)
                experiments.append({
                    'experiment': experiment,
                    'result': result,
                    'success': result.get('success', False)
                })
                
                if result.get('success'):
                    self.successful_experiments += 1
        
        self.current_cycle.experiments = experiments
        
    async def _output_phase(self):
        """Generate outputs and communicate discoveries"""
        logger.debug("📤 Output phase...")
        
        outputs = {
            'insights_discovered': len(self.current_cycle.learning_insights),
            'experiments_run': len(self.current_cycle.experiments),
            'successful_experiments': sum(1 for exp in self.current_cycle.experiments if exp['success']),
            'knowledge_growth': await self.knowledge_fusion.get_growth_metrics(),
            'recommendations': await self._generate_recommendations()
        }
        
        self.current_cycle.outputs = outputs
        
        # Update growth rate
        if self.total_cycles > 0:
            self.knowledge_growth_rate = self.successful_experiments / self.total_cycles
    
    async def _gather_system_metrics(self) -> Dict[str, Any]:
        """Gather system performance metrics"""
        return {
            'cpu_usage': 45.2,  # Simulated
            'memory_usage': 67.8,
            'active_processes': 12,
            'network_activity': 'moderate'
        }
    
    async def _gather_user_data(self) -> Dict[str, Any]:
        """Gather user interaction data"""
        return {
            'active_sessions': 1,
            'recent_commands': [],
            'user_preferences': {},
            'interaction_patterns': {}
        }
    
    async def _gather_environmental_data(self) -> Dict[str, Any]:
        """Gather environmental context data"""
        return {
            'time_of_day': time.strftime('%H:%M:%S'),
            'system_load': 'normal',
            'external_apis': 'available',
            'security_status': 'secure'
        }
    
    async def _execute_experiment(self, experiment: Dict[str, Any]) -> Dict[str, Any]:
        """Execute a safe experiment"""
        # Simulate experiment execution
        await asyncio.sleep(0.1)  # Simulate processing time
        
        return {
            'success': True,
            'result_data': f"Experiment {experiment.get('id', 'unknown')} completed",
            'metrics': {'accuracy': 0.85, 'confidence': 0.92}
        }
    
    async def _generate_recommendations(self) -> list:
        """Generate recommendations based on current cycle"""
        return [
            "System performance is optimal",
            "Consider expanding knowledge base in domain X",
            "User interaction patterns suggest preference for voice interface"
        ]
    
    async def get_status(self) -> Dict[str, Any]:
        """Get current EVA status"""
        return {
            'state': self.state.value,
            'total_cycles': self.total_cycles,
            'knowledge_growth_rate': self.knowledge_growth_rate,
            'successful_experiments': self.successful_experiments,
            'uptime': time.time() - (self.evolution_cycles[0].timestamp if self.evolution_cycles else time.time())
        }
    
    async def shutdown(self):
        """Shutdown EVA core"""
        logger.info("🛑 EVA Core shutting down...")
        self.running = False
        self.state = EVAState.IDLE