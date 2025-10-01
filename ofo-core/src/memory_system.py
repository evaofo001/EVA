"""
Memory System with Vector Embeddings and Context Management
Provides persistent memory, semantic search, and context-aware responses
"""

import os
import asyncio
import logging
from typing import Dict, Any, List, Optional, Tuple
from datetime import datetime
from openai import OpenAI
from supabase import create_client, Client

logger = logging.getLogger(__name__)

class MemorySystem:
    """
    EVA's persistent memory system with vector embeddings for semantic search
    Integrates with Supabase for storage and retrieval
    """

    def __init__(self):
        self.openai_client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))

        supabase_url = os.getenv('VITE_SUPABASE_URL')
        supabase_key = os.getenv('VITE_SUPABASE_ANON_KEY')

        if not supabase_url or not supabase_key:
            raise ValueError("Supabase credentials required")

        self.supabase: Client = create_client(supabase_url, supabase_key)
        self.current_conversation_id: Optional[str] = None

        logger.info("🧠 Memory System initialized with vector embeddings")

    async def create_embedding(self, text: str) -> List[float]:
        """Generate vector embedding for text using OpenAI"""
        try:
            response = await asyncio.to_thread(
                self.openai_client.embeddings.create,
                model="text-embedding-ada-002",
                input=text
            )
            return response.data[0].embedding
        except Exception as e:
            logger.error(f"❌ Embedding generation failed: {e}")
            return []

    async def create_conversation(self, title: str = "New Conversation", user_id: str = "anonymous") -> str:
        """Create a new conversation"""
        try:
            result = self.supabase.table('conversations').insert({
                'user_id': user_id,
                'title': title,
                'context_summary': ''
            }).execute()

            conversation_id = result.data[0]['id']
            self.current_conversation_id = conversation_id

            logger.info(f"📝 Created conversation: {conversation_id}")
            return conversation_id

        except Exception as e:
            logger.error(f"❌ Conversation creation failed: {e}")
            raise

    async def add_message(self, conversation_id: str, role: str, content: str, metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Add message to conversation with embedding"""
        try:
            embedding = await self.create_embedding(content)

            result = self.supabase.table('messages').insert({
                'conversation_id': conversation_id,
                'role': role,
                'content': content,
                'embedding': embedding,
                'metadata': metadata or {}
            }).execute()

            logger.debug(f"💬 Message added to conversation {conversation_id}")
            return result.data[0]

        except Exception as e:
            logger.error(f"❌ Message addition failed: {e}")
            raise

    async def get_conversation_history(self, conversation_id: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Retrieve conversation history"""
        try:
            result = self.supabase.table('messages')\
                .select('*')\
                .eq('conversation_id', conversation_id)\
                .order('created_at', desc=False)\
                .limit(limit)\
                .execute()

            return result.data

        except Exception as e:
            logger.error(f"❌ History retrieval failed: {e}")
            return []

    async def search_similar_messages(self, query: str, threshold: float = 0.7, limit: int = 5) -> List[Dict[str, Any]]:
        """Search for semantically similar messages across all conversations"""
        try:
            query_embedding = await self.create_embedding(query)

            if not query_embedding:
                return []

            result = self.supabase.rpc(
                'search_similar_messages',
                {
                    'query_embedding': query_embedding,
                    'match_threshold': threshold,
                    'match_count': limit
                }
            ).execute()

            logger.debug(f"🔍 Found {len(result.data)} similar messages")
            return result.data

        except Exception as e:
            logger.error(f"❌ Semantic search failed: {e}")
            return []

    async def add_knowledge_node(self, content: str, category: str = "general",
                                 source: str = "user", confidence: float = 0.8,
                                 metadata: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Add new knowledge to the knowledge graph"""
        try:
            embedding = await self.create_embedding(content)

            result = self.supabase.table('knowledge_nodes').insert({
                'content': content,
                'embedding': embedding,
                'confidence': confidence,
                'source': source,
                'category': category,
                'metadata': metadata or {}
            }).execute()

            logger.info(f"🧩 Knowledge node created: {category}")
            return result.data[0]

        except Exception as e:
            logger.error(f"❌ Knowledge node creation failed: {e}")
            raise

    async def search_knowledge(self, query: str, threshold: float = 0.7, limit: int = 10) -> List[Dict[str, Any]]:
        """Search knowledge graph for relevant information"""
        try:
            query_embedding = await self.create_embedding(query)

            if not query_embedding:
                return []

            result = self.supabase.rpc(
                'search_similar_knowledge',
                {
                    'query_embedding': query_embedding,
                    'match_threshold': threshold,
                    'match_count': limit
                }
            ).execute()

            for node in result.data:
                node_id = node.get('id')
                if node_id:
                    self.supabase.rpc('increment_knowledge_access', {'node_id': node_id}).execute()

            logger.debug(f"🔍 Found {len(result.data)} relevant knowledge nodes")
            return result.data

        except Exception as e:
            logger.error(f"❌ Knowledge search failed: {e}")
            return []

    async def add_training_example(self, user_input: str, expected_response: str,
                                   category: str = "general", priority: str = "medium",
                                   tags: List[str] = None) -> Dict[str, Any]:
        """Add training example with embedding"""
        try:
            combined_text = f"User: {user_input}\nExpected: {expected_response}"
            embedding = await self.create_embedding(combined_text)

            result = self.supabase.table('training_examples').insert({
                'user_input': user_input,
                'expected_response': expected_response,
                'category': category,
                'priority': priority,
                'tags': tags or [],
                'embedding': embedding
            }).execute()

            logger.info(f"📚 Training example added: {category}")
            return result.data[0]

        except Exception as e:
            logger.error(f"❌ Training example addition failed: {e}")
            raise

    async def get_personality_settings(self, user_id: str = "default") -> Dict[str, Any]:
        """Get current personality settings"""
        try:
            result = self.supabase.table('personality_settings')\
                .select('*')\
                .eq('user_id', user_id)\
                .limit(1)\
                .execute()

            if result.data:
                return result.data[0]
            else:
                return {
                    'curiosity': 70,
                    'technicality': 50,
                    'creativity': 60,
                    'formality': 40,
                    'verbosity': 50,
                    'system_references': 30
                }

        except Exception as e:
            logger.error(f"❌ Personality retrieval failed: {e}")
            return {}

    async def update_personality_settings(self, settings: Dict[str, int], user_id: str = "default") -> Dict[str, Any]:
        """Update personality settings"""
        try:
            result = self.supabase.table('personality_settings')\
                .upsert({
                    'user_id': user_id,
                    **settings,
                    'updated_at': datetime.now().isoformat()
                })\
                .execute()

            logger.info("🎭 Personality settings updated")
            return result.data[0]

        except Exception as e:
            logger.error(f"❌ Personality update failed: {e}")
            raise

    async def record_learning_metrics(self, metrics: Dict[str, Any]) -> Dict[str, Any]:
        """Record learning metrics snapshot"""
        try:
            result = self.supabase.table('learning_metrics').insert({
                'total_conversations': metrics.get('total_conversations', 0),
                'total_messages': metrics.get('total_messages', 0),
                'knowledge_nodes_count': metrics.get('knowledge_nodes_count', 0),
                'successful_interactions': metrics.get('successful_interactions', 0),
                'average_confidence': metrics.get('average_confidence', 0.0),
                'metadata': metrics.get('metadata', {})
            }).execute()

            logger.debug("📊 Learning metrics recorded")
            return result.data[0]

        except Exception as e:
            logger.error(f"❌ Metrics recording failed: {e}")
            raise

    async def get_learning_stats(self) -> Dict[str, Any]:
        """Get comprehensive learning statistics"""
        try:
            conversations_count = self.supabase.table('conversations').select('id', count='exact').execute()
            messages_count = self.supabase.table('messages').select('id', count='exact').execute()
            knowledge_count = self.supabase.table('knowledge_nodes').select('id', count='exact').execute()
            training_count = self.supabase.table('training_examples').select('id', count='exact').execute()

            avg_confidence_result = self.supabase.table('knowledge_nodes')\
                .select('confidence')\
                .execute()

            avg_confidence = 0.0
            if avg_confidence_result.data:
                confidences = [node['confidence'] for node in avg_confidence_result.data]
                avg_confidence = sum(confidences) / len(confidences) if confidences else 0.0

            return {
                'total_conversations': conversations_count.count,
                'total_messages': messages_count.count,
                'knowledge_nodes': knowledge_count.count,
                'training_examples': training_count.count,
                'average_confidence': avg_confidence
            }

        except Exception as e:
            logger.error(f"❌ Stats retrieval failed: {e}")
            return {}

    async def build_context_for_query(self, query: str, conversation_id: Optional[str] = None) -> Dict[str, Any]:
        """Build comprehensive context for a query using multiple sources"""
        try:
            context = {
                'recent_conversation': [],
                'relevant_knowledge': [],
                'similar_past_messages': [],
                'stats': {}
            }

            if conversation_id:
                context['recent_conversation'] = await self.get_conversation_history(conversation_id, limit=10)

            context['relevant_knowledge'] = await self.search_knowledge(query, threshold=0.7, limit=5)

            context['similar_past_messages'] = await self.search_similar_messages(query, threshold=0.75, limit=3)

            context['stats'] = await self.get_learning_stats()

            logger.debug("🧠 Context built successfully")
            return context

        except Exception as e:
            logger.error(f"❌ Context building failed: {e}")
            return {'recent_conversation': [], 'relevant_knowledge': [], 'similar_past_messages': [], 'stats': {}}

    async def update_conversation_summary(self, conversation_id: str) -> None:
        """Generate and update conversation summary"""
        try:
            messages = await self.get_conversation_history(conversation_id, limit=20)

            if not messages:
                return

            conversation_text = "\n".join([
                f"{msg['role']}: {msg['content']}" for msg in messages[-10:]
            ])

            summary_prompt = f"""Summarize this conversation in 2-3 sentences, focusing on key topics and insights:

{conversation_text}

Summary:"""

            response = await asyncio.to_thread(
                self.openai_client.chat.completions.create,
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": summary_prompt}],
                max_tokens=150,
                temperature=0.5
            )

            summary = response.choices[0].message.content

            self.supabase.table('conversations')\
                .update({'context_summary': summary})\
                .eq('id', conversation_id)\
                .execute()

            logger.debug(f"📝 Conversation summary updated")

        except Exception as e:
            logger.error(f"❌ Summary update failed: {e}")
