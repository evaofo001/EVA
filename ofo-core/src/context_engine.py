"""
Context Engine - Advanced Context Awareness and Learning System
Provides real-time learning, emotion analysis, and contextual understanding
"""

import asyncio
import logging
import re
from typing import Dict, Any, List, Optional
from datetime import datetime
from openai import OpenAI
import os

logger = logging.getLogger(__name__)

class ContextEngine:
    """
    Advanced context processing engine that analyzes sentiment, emotions,
    intent, and provides real-time learning capabilities
    """

    def __init__(self):
        self.openai_client = OpenAI(api_key=os.getenv('OPENAI_API_KEY'))
        self.conversation_patterns: Dict[str, Any] = {}
        self.user_preferences: Dict[str, Any] = {}
        self.topic_tracker: Dict[str, int] = {}

        logger.info("🎯 Context Engine initialized")

    async def analyze_message_context(self, message: str, conversation_history: List[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Comprehensive message analysis including sentiment, intent, and topics"""
        try:
            analysis = {
                'sentiment': await self._analyze_sentiment(message),
                'emotions': await self._detect_emotions(message),
                'intent': await self._determine_intent(message),
                'topics': await self._extract_topics(message),
                'complexity': self._calculate_complexity(message),
                'urgency': self._assess_urgency(message),
                'context_continuity': await self._assess_context_continuity(message, conversation_history or [])
            }

            logger.debug(f"🎯 Context analysis completed: {analysis['intent']}")
            return analysis

        except Exception as e:
            logger.error(f"❌ Context analysis failed: {e}")
            return self._default_context()

    async def _analyze_sentiment(self, text: str) -> Dict[str, Any]:
        """Analyze sentiment with fine-grained scoring"""
        try:
            prompt = f"""Analyze the sentiment of this message. Return ONLY a JSON object with this exact structure:
{{"polarity": <float between -1.0 and 1.0>, "confidence": <float between 0.0 and 1.0>, "label": "<positive/negative/neutral>"}}

Message: {text}"""

            response = await asyncio.to_thread(
                self.openai_client.chat.completions.create,
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=50,
                temperature=0.3
            )

            import json
            result = json.loads(response.choices[0].message.content)
            return result

        except Exception as e:
            logger.error(f"❌ Sentiment analysis failed: {e}")
            return {'polarity': 0.0, 'confidence': 0.5, 'label': 'neutral'}

    async def _detect_emotions(self, text: str) -> List[Dict[str, float]]:
        """Detect multiple emotions with intensity scores"""
        try:
            prompt = f"""Detect emotions in this message. Return ONLY a JSON array of emotion objects:
[{{"emotion": "emotion_name", "intensity": <float 0.0-1.0>}}]

Possible emotions: joy, sadness, anger, fear, surprise, curiosity, frustration, excitement, confusion, satisfaction

Message: {text}"""

            response = await asyncio.to_thread(
                self.openai_client.chat.completions.create,
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=100,
                temperature=0.3
            )

            import json
            result = json.loads(response.choices[0].message.content)
            return result[:3]

        except Exception as e:
            logger.error(f"❌ Emotion detection failed: {e}")
            return [{'emotion': 'neutral', 'intensity': 0.5}]

    async def _determine_intent(self, text: str) -> Dict[str, Any]:
        """Determine user intent and confidence"""
        try:
            prompt = f"""Determine the primary intent of this message. Return ONLY a JSON object:
{{"intent": "<intent_category>", "confidence": <float 0.0-1.0>, "sub_intent": "<specific_intent>"}}

Intent categories: question, command, statement, feedback, greeting, request_help, provide_info, express_emotion, make_suggestion

Message: {text}"""

            response = await asyncio.to_thread(
                self.openai_client.chat.completions.create,
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=60,
                temperature=0.3
            )

            import json
            result = json.loads(response.choices[0].message.content)
            return result

        except Exception as e:
            logger.error(f"❌ Intent determination failed: {e}")
            return {'intent': 'statement', 'confidence': 0.5, 'sub_intent': 'general'}

    async def _extract_topics(self, text: str) -> List[str]:
        """Extract key topics and entities from message"""
        try:
            prompt = f"""Extract 3-5 key topics or entities from this message. Return ONLY a JSON array of strings:
["topic1", "topic2", "topic3"]

Message: {text}"""

            response = await asyncio.to_thread(
                self.openai_client.chat.completions.create,
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                max_tokens=50,
                temperature=0.3
            )

            import json
            topics = json.loads(response.choices[0].message.content)

            for topic in topics:
                self.topic_tracker[topic] = self.topic_tracker.get(topic, 0) + 1

            return topics[:5]

        except Exception as e:
            logger.error(f"❌ Topic extraction failed: {e}")
            return ['general']

    def _calculate_complexity(self, text: str) -> float:
        """Calculate message complexity score"""
        words = text.split()
        avg_word_length = sum(len(word) for word in words) / max(len(words), 1)
        sentence_count = len(re.split(r'[.!?]+', text))
        words_per_sentence = len(words) / max(sentence_count, 1)

        complexity = (avg_word_length / 10 + words_per_sentence / 20) / 2
        return min(complexity, 1.0)

    def _assess_urgency(self, text: str) -> float:
        """Assess message urgency"""
        urgent_indicators = [
            'urgent', 'asap', 'immediately', 'quickly', 'emergency',
            'critical', 'important', 'priority', '!!!', 'help'
        ]

        text_lower = text.lower()
        urgency_score = sum(1 for indicator in urgent_indicators if indicator in text_lower)

        if '!' in text:
            urgency_score += text.count('!') * 0.1

        return min(urgency_score / 3, 1.0)

    async def _assess_context_continuity(self, message: str, conversation_history: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Assess how well the message continues the conversation context"""
        if not conversation_history:
            return {'continuity_score': 0.0, 'is_topic_shift': True, 'reference_count': 0}

        recent_messages = conversation_history[-5:]
        recent_text = ' '.join([msg.get('content', '') for msg in recent_messages])

        pronouns = len(re.findall(r'\b(it|this|that|these|those|they|them)\b', message.lower()))

        topic_overlap = 0
        message_words = set(message.lower().split())
        for msg in recent_messages:
            msg_words = set(msg.get('content', '').lower().split())
            overlap = len(message_words.intersection(msg_words))
            topic_overlap += overlap

        continuity_score = min((pronouns * 0.2 + topic_overlap * 0.05), 1.0)
        is_topic_shift = continuity_score < 0.3

        return {
            'continuity_score': continuity_score,
            'is_topic_shift': is_topic_shift,
            'reference_count': pronouns
        }

    def _default_context(self) -> Dict[str, Any]:
        """Return default context structure"""
        return {
            'sentiment': {'polarity': 0.0, 'confidence': 0.5, 'label': 'neutral'},
            'emotions': [{'emotion': 'neutral', 'intensity': 0.5}],
            'intent': {'intent': 'statement', 'confidence': 0.5, 'sub_intent': 'general'},
            'topics': ['general'],
            'complexity': 0.5,
            'urgency': 0.0,
            'context_continuity': {'continuity_score': 0.0, 'is_topic_shift': True, 'reference_count': 0}
        }

    async def generate_context_aware_system_message(self, context: Dict[str, Any],
                                                     personality: Dict[str, int]) -> str:
        """Generate context-aware system instructions"""
        sentiment = context.get('sentiment', {})
        emotions = context.get('emotions', [])
        intent = context.get('intent', {})
        urgency = context.get('urgency', 0.0)

        system_additions = []

        if sentiment.get('polarity', 0) < -0.3:
            system_additions.append("The user seems frustrated or negative. Be extra empathetic and solution-focused.")
        elif sentiment.get('polarity', 0) > 0.5:
            system_additions.append("The user is positive and engaged. Match their enthusiasm appropriately.")

        primary_emotion = emotions[0] if emotions else {'emotion': 'neutral', 'intensity': 0.5}
        if primary_emotion['intensity'] > 0.7:
            if primary_emotion['emotion'] in ['confusion', 'frustration']:
                system_additions.append("The user is confused. Provide clear, step-by-step explanations.")
            elif primary_emotion['emotion'] in ['excitement', 'curiosity']:
                system_additions.append("The user is excited and curious. Expand on ideas and provide deeper insights.")

        if intent.get('intent') == 'question':
            system_additions.append("Provide a thorough, well-structured answer. Ask clarifying questions if needed.")
        elif intent.get('intent') == 'request_help':
            system_additions.append("The user needs help. Be patient, thorough, and offer multiple solutions.")

        if urgency > 0.6:
            system_additions.append("This seems urgent. Prioritize actionable solutions and be concise.")

        if system_additions:
            return "CONTEXTUAL ADJUSTMENTS:\n" + "\n".join(f"- {adj}" for adj in system_additions)
        else:
            return ""

    async def learn_from_interaction(self, user_message: str, eva_response: str,
                                     feedback_score: Optional[float] = None) -> Dict[str, Any]:
        """Learn from interaction patterns and update internal models"""
        try:
            context = await self.analyze_message_context(user_message)

            learning_data = {
                'user_message': user_message,
                'eva_response': eva_response,
                'context': context,
                'feedback_score': feedback_score,
                'timestamp': datetime.now().isoformat(),
                'patterns_identified': []
            }

            if context['intent']['intent'] in self.conversation_patterns:
                self.conversation_patterns[context['intent']['intent']].append({
                    'message_length': len(user_message),
                    'response_length': len(eva_response),
                    'sentiment': context['sentiment']['polarity'],
                    'success': feedback_score if feedback_score else 0.7
                })
            else:
                self.conversation_patterns[context['intent']['intent']] = [{
                    'message_length': len(user_message),
                    'response_length': len(eva_response),
                    'sentiment': context['sentiment']['polarity'],
                    'success': feedback_score if feedback_score else 0.7
                }]

            if len(self.conversation_patterns.get(context['intent']['intent'], [])) > 5:
                learning_data['patterns_identified'].append({
                    'pattern_type': 'intent_success',
                    'intent': context['intent']['intent'],
                    'avg_success': self._calculate_avg_success(context['intent']['intent'])
                })

            logger.info(f"📚 Learned from interaction: {context['intent']['intent']}")
            return learning_data

        except Exception as e:
            logger.error(f"❌ Learning from interaction failed: {e}")
            return {}

    def _calculate_avg_success(self, intent: str) -> float:
        """Calculate average success rate for an intent type"""
        patterns = self.conversation_patterns.get(intent, [])
        if not patterns:
            return 0.5

        successes = [p.get('success', 0.5) for p in patterns]
        return sum(successes) / len(successes)

    async def suggest_response_adjustments(self, context: Dict[str, Any],
                                          draft_response: str) -> Dict[str, Any]:
        """Suggest improvements to response based on context"""
        try:
            suggestions = {
                'tone_adjustments': [],
                'content_adjustments': [],
                'style_adjustments': []
            }

            sentiment = context.get('sentiment', {}).get('polarity', 0)
            if sentiment < -0.3 and '!' not in draft_response:
                suggestions['tone_adjustments'].append("Consider adding more empathetic language")

            complexity = context.get('complexity', 0.5)
            response_complexity = len(draft_response.split()) / 20
            if complexity < 0.3 and response_complexity > 0.7:
                suggestions['content_adjustments'].append("Simplify response - user's message was simple")
            elif complexity > 0.7 and response_complexity < 0.5:
                suggestions['content_adjustments'].append("Add more depth - user's message was complex")

            urgency = context.get('urgency', 0.0)
            if urgency > 0.6 and len(draft_response) > 500:
                suggestions['style_adjustments'].append("Be more concise - user indicated urgency")

            return suggestions

        except Exception as e:
            logger.error(f"❌ Response adjustment failed: {e}")
            return {'tone_adjustments': [], 'content_adjustments': [], 'style_adjustments': []}

    def get_topic_trends(self, limit: int = 10) -> List[Dict[str, Any]]:
        """Get most discussed topics"""
        sorted_topics = sorted(self.topic_tracker.items(), key=lambda x: x[1], reverse=True)
        return [{'topic': topic, 'count': count} for topic, count in sorted_topics[:limit]]

    def get_learning_insights(self) -> Dict[str, Any]:
        """Get insights from learned patterns"""
        return {
            'total_patterns': sum(len(patterns) for patterns in self.conversation_patterns.values()),
            'intent_distribution': {
                intent: len(patterns)
                for intent, patterns in self.conversation_patterns.items()
            },
            'top_topics': self.get_topic_trends(5),
            'avg_success_by_intent': {
                intent: self._calculate_avg_success(intent)
                for intent in self.conversation_patterns.keys()
            }
        }
