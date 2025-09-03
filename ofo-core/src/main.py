#!/usr/bin/env python3
"""
EVA-OFO-001 Main Entry Point
Evolutionary Virtual Android - Origin of Future Organisms, Prototype 001
"""

import asyncio
import logging
import signal
import sys
from typing import Optional

from eva_core import EVACore
from lease_manager import LeaseManager
from policy_engine import PolicyEngine
from knowledge_fusion_engine import KnowledgeFusionEngine

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class EVASystem:
    """Main EVA system orchestrator"""
    
    def __init__(self):
        self.core: Optional[EVACore] = None
        self.lease_manager: Optional[LeaseManager] = None
        self.policy_engine: Optional[PolicyEngine] = None
        self.knowledge_fusion: Optional[KnowledgeFusionEngine] = None
        self.running = False
        
    async def initialize(self):
        """Initialize all EVA subsystems"""
        logger.info("🌌 Initializing EVA-OFO-001 Core System...")
        
        try:
            # Initialize core components
            self.policy_engine = PolicyEngine()
            self.lease_manager = LeaseManager(self.policy_engine)
            self.knowledge_fusion = KnowledgeFusionEngine()
            
            # Initialize main EVA core
            self.core = EVACore(
                lease_manager=self.lease_manager,
                policy_engine=self.policy_engine,
                knowledge_fusion=self.knowledge_fusion
            )
            
            # Start all subsystems
            await self.policy_engine.initialize()
            await self.lease_manager.initialize()
            await self.knowledge_fusion.initialize()
            await self.core.initialize()
            
            logger.info("✅ EVA-OFO-001 Core System initialized successfully")
            
        except Exception as e:
            logger.error(f"❌ Failed to initialize EVA system: {e}")
            raise
    
    async def start(self):
        """Start the EVA system"""
        if not self.core:
            await self.initialize()
            
        logger.info("🚀 Starting EVA-OFO-001...")
        self.running = True
        
        # Start the main evolution loop
        await self.core.start_evolution_cycle()
        
    async def shutdown(self):
        """Graceful shutdown of EVA system"""
        logger.info("🛑 Shutting down EVA-OFO-001...")
        self.running = False
        
        if self.core:
            await self.core.shutdown()
        if self.knowledge_fusion:
            await self.knowledge_fusion.shutdown()
        if self.lease_manager:
            await self.lease_manager.shutdown()
        if self.policy_engine:
            await self.policy_engine.shutdown()
            
        logger.info("✅ EVA-OFO-001 shutdown complete")

async def main():
    """Main entry point"""
    eva_system = EVASystem()
    
    # Setup signal handlers for graceful shutdown
    def signal_handler(signum, frame):
        logger.info(f"Received signal {signum}, initiating shutdown...")
        asyncio.create_task(eva_system.shutdown())
    
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    try:
        await eva_system.start()
        
        # Keep running until shutdown
        while eva_system.running:
            await asyncio.sleep(1)
            
    except KeyboardInterrupt:
        logger.info("Keyboard interrupt received")
    except Exception as e:
        logger.error(f"Fatal error: {e}")
        return 1
    finally:
        await eva_system.shutdown()
    
    return 0

if __name__ == "__main__":
    sys.exit(asyncio.run(main()))