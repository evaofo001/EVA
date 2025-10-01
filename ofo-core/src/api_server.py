"""
EVA API Server with Advanced Memory and Context Capabilities
"""

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
import logging

from openai_integration import OpenAIService
from memory_system import MemorySystem
from context_engine import ContextEngine

logger = logging.getLogger(__name__)

app = FastAPI(title="EVA-OFO-001 Advanced API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

openai_service = None
memory_system = None
context_engine = None

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]

class EnhancedChatRequest(BaseModel):
    messages: List[ChatMessage]
    conversation_id: Optional[str] = None
    use_memory: bool = True

class ChatResponse(BaseModel):
    response: str

class EnhancedChatResponse(BaseModel):
    response: str
    conversation_id: str
    context_analysis: Optional[Dict[str, Any]] = None
    relevant_knowledge: Optional[List[Dict[str, Any]]] = None

class FileUpload(BaseModel):
    filename: str
    content: str
    file_type: str

class SystemStatus(BaseModel):
    status: str
    components: Dict[str, Any]
    timestamp: str

class TrainingExample(BaseModel):
    userInput: str
    expectedResponse: str
    category: str
    priority: str
    tags: List[str]

class TrainingExamplesRequest(BaseModel):
    examples: List[TrainingExample]

class PersonalitySettings(BaseModel):
    curiosity: int
    technicality: int
    creativity: int
    formality: int
    verbosity: int
    systemReferences: int

@app.on_event("startup")
async def startup_event():
    global openai_service, memory_system, context_engine
    try:
        openai_service = OpenAIService()
        memory_system = MemorySystem()
        context_engine = ContextEngine()
        logger.info("🚀 EVA API Server started with advanced capabilities")
    except Exception as e:
        logger.error(f"❌ Failed to initialize services: {e}")
        raise

@app.get("/")
async def root():
    return {
        "message": "EVA-OFO-001 Advanced API is online",
        "version": "2.0.0",
        "status": "operational",
        "features": [
            "Persistent memory with vector embeddings",
            "Context-aware responses",
            "Emotion and sentiment analysis",
            "Real-time learning",
            "Semantic knowledge search"
        ]
    }

@app.post("/chat", response_model=EnhancedChatResponse)
async def chat_endpoint(request: EnhancedChatRequest):
    try:
        if not openai_service or not memory_system or not context_engine:
            raise HTTPException(status_code=500, detail="Services not initialized")

        conversation_id = request.conversation_id
        if not conversation_id and request.use_memory:
            conversation_id = await memory_system.create_conversation()

        user_message = request.messages[-1].content if request.messages else ""

        conversation_history = []
        if conversation_id and request.use_memory:
            conversation_history = await memory_system.get_conversation_history(conversation_id)

        context_analysis = await context_engine.analyze_message_context(
            user_message,
            conversation_history
        )

        full_context = {}
        relevant_knowledge = []
        if request.use_memory:
            full_context = await memory_system.build_context_for_query(
                user_message,
                conversation_id
            )
            relevant_knowledge = full_context.get('relevant_knowledge', [])

        personality = await memory_system.get_personality_settings()

        context_instructions = await context_engine.generate_context_aware_system_message(
            context_analysis,
            personality
        )

        messages = [{"role": msg.role, "content": msg.content} for msg in request.messages]

        if relevant_knowledge:
            knowledge_summary = "\n".join([
                f"- {k['content'][:200]}..." for k in relevant_knowledge[:3]
            ])
            context_message = f"""Relevant knowledge from my memory:
{knowledge_summary}

{context_instructions}"""
            messages.insert(0, {"role": "system", "content": context_message})

        response = await openai_service.get_chat_response(messages)

        if conversation_id and request.use_memory:
            await memory_system.add_message(
                conversation_id,
                'user',
                user_message,
                {'context': context_analysis}
            )
            await memory_system.add_message(
                conversation_id,
                'assistant',
                response,
                {'context': context_analysis}
            )

            await context_engine.learn_from_interaction(user_message, response)

            if context_analysis['intent']['intent'] in ['provide_info', 'statement']:
                await memory_system.add_knowledge_node(
                    f"User mentioned: {user_message[:200]}",
                    category=context_analysis['topics'][0] if context_analysis['topics'] else 'general',
                    source='conversation',
                    confidence=0.7
                )

        return EnhancedChatResponse(
            response=response,
            conversation_id=conversation_id or "temp",
            context_analysis=context_analysis,
            relevant_knowledge=relevant_knowledge[:3] if relevant_knowledge else None
        )

    except Exception as e:
        logger.error(f"❌ Enhanced chat endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/upload")
async def upload_file(file_data: FileUpload):
    try:
        if not openai_service:
            raise HTTPException(status_code=500, detail="OpenAI service not initialized")

        analysis = await openai_service.analyze_file(
            file_data.content,
            file_data.file_type,
            file_data.filename
        )

        return {"analysis": analysis}

    except Exception as e:
        logger.error(f"❌ File upload error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/status", response_model=SystemStatus)
async def get_status():
    try:
        from datetime import datetime

        components = {
            "openai_service": "online" if openai_service else "offline",
            "memory_system": "online" if memory_system else "offline",
            "context_engine": "online" if context_engine else "offline",
            "api_server": "online",
            "training_system": "ready"
        }

        if memory_system:
            stats = await memory_system.get_learning_stats()
            components['learning_stats'] = stats

        return SystemStatus(
            status="operational",
            components=components,
            timestamp=datetime.now().isoformat()
        )

    except Exception as e:
        logger.error(f"❌ Status endpoint error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/train/examples")
async def train_with_examples(request: TrainingExamplesRequest):
    try:
        if not openai_service or not memory_system:
            raise HTTPException(status_code=500, detail="Services not initialized")

        await openai_service.update_training_examples(request.examples)

        for example in request.examples:
            await memory_system.add_training_example(
                user_input=example.userInput,
                expected_response=example.expectedResponse,
                category=example.category,
                priority=example.priority,
                tags=example.tags
            )

        logger.info(f"📚 Updated training with {len(request.examples)} examples")
        return {"message": f"Training updated with {len(request.examples)} examples", "status": "success"}

    except Exception as e:
        logger.error(f"❌ Training examples error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/train/personality")
async def update_personality(settings: PersonalitySettings):
    try:
        if not openai_service or not memory_system:
            raise HTTPException(status_code=500, detail="Services not initialized")

        await openai_service.update_personality_settings(settings.dict())
        await memory_system.update_personality_settings(settings.dict())

        logger.info("🧠 Personality settings updated in all systems")
        return {"message": "Personality settings updated successfully", "status": "success"}

    except Exception as e:
        logger.error(f"❌ Personality update error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/conversations")
async def list_conversations(limit: int = 20):
    try:
        if not memory_system:
            raise HTTPException(status_code=500, detail="Memory system not initialized")

        result = memory_system.supabase.table('conversations')\
            .select('*')\
            .order('updated_at', desc=True)\
            .limit(limit)\
            .execute()

        return {"conversations": result.data}

    except Exception as e:
        logger.error(f"❌ Conversations list error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/conversations/{conversation_id}/history")
async def get_conversation_history_endpoint(conversation_id: str, limit: int = 50):
    try:
        if not memory_system:
            raise HTTPException(status_code=500, detail="Memory system not initialized")

        history = await memory_system.get_conversation_history(conversation_id, limit)

        return {"conversation_id": conversation_id, "messages": history}

    except Exception as e:
        logger.error(f"❌ History retrieval error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/knowledge/search")
async def search_knowledge(query: str, threshold: float = 0.7, limit: int = 10):
    try:
        if not memory_system:
            raise HTTPException(status_code=500, detail="Memory system not initialized")

        results = await memory_system.search_knowledge(query, threshold, limit)

        return {"query": query, "results": results}

    except Exception as e:
        logger.error(f"❌ Knowledge search error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/learning/insights")
async def get_learning_insights():
    try:
        if not context_engine or not memory_system:
            raise HTTPException(status_code=500, detail="Services not initialized")

        insights = context_engine.get_learning_insights()
        stats = await memory_system.get_learning_stats()

        return {
            "insights": insights,
            "stats": stats
        }

    except Exception as e:
        logger.error(f"❌ Learning insights error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/knowledge/add")
async def add_knowledge(content: str, category: str = "general", source: str = "user", confidence: float = 0.8):
    try:
        if not memory_system:
            raise HTTPException(status_code=500, detail="Memory system not initialized")

        node = await memory_system.add_knowledge_node(content, category, source, confidence)

        logger.info(f"🧩 Knowledge added: {category}")
        return {"message": "Knowledge added successfully", "node": node}

    except Exception as e:
        logger.error(f"❌ Knowledge addition error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
