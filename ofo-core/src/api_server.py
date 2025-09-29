@@ .. @@
 from fastapi import FastAPI, HTTPException
 from fastapi.middleware.cors import CORSMiddleware
 from pydantic import BaseModel
 from typing import List, Dict, Any, Optional
 import logging
 
 from openai_integration import OpenAIService
 
 logger = logging.getLogger(__name__)
 
 app = FastAPI(title="EVA-OFO-001 API", version="1.0.0")
 
 # Configure CORS
 app.add_middleware(
     CORSMiddleware,
     allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
     allow_credentials=True,
     allow_methods=["*"],
     allow_headers=["*"],
 )
 
 # Global OpenAI service instance
 openai_service = None
 
 class ChatMessage(BaseModel):
     role: str
     content: str
 
 class ChatRequest(BaseModel):
     messages: List[ChatMessage]
 
 class ChatResponse(BaseModel):
     response: str
 
 class FileUpload(BaseModel):
     filename: str
     content: str
     file_type: str
 
 class SystemStatus(BaseModel):
     status: str
     components: Dict[str, Any]
     timestamp: str
+
+class TrainingExample(BaseModel):
+    userInput: str
+    expectedResponse: str
+    category: str
+    priority: str
+    tags: List[str]
+
+class TrainingExamplesRequest(BaseModel):
+    examples: List[TrainingExample]
+
+class PersonalitySettings(BaseModel):
+    curiosity: int
+    technicality: int
+    creativity: int
+    formality: int
+    verbosity: int
+    systemReferences: int
 
 @app.on_event("startup")
 async def startup_event():
     global openai_service
     try:
         openai_service = OpenAIService()
         logger.info("🚀 EVA API Server started successfully")
     except Exception as e:
         logger.error(f"❌ Failed to initialize OpenAI service: {e}")
         raise
 
 @app.get("/")
 async def root():
     return {"message": "EVA-OFO-001 API is online", "status": "operational"}
 
 @app.post("/chat", response_model=ChatResponse)
 async def chat_endpoint(request: ChatRequest):
     try:
         if not openai_service:
             raise HTTPException(status_code=500, detail="OpenAI service not initialized")
         
         # Convert messages to the format expected by OpenAI
         messages = [{"role": msg.role, "content": msg.content} for msg in request.messages]
         
         response = await openai_service.get_chat_response(messages)
         return ChatResponse(response=response)
         
     except Exception as e:
         logger.error(f"❌ Chat endpoint error: {e}")
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
             "api_server": "online",
             "training_system": "ready"
         }
         
         return SystemStatus(
             status="operational",
             components=components,
             timestamp=datetime.now().isoformat()
         )
         
     except Exception as e:
         logger.error(f"❌ Status endpoint error: {e}")
         raise HTTPException(status_code=500, detail=str(e))
+
+@app.post("/train/examples")
+async def train_with_examples(request: TrainingExamplesRequest):
+    try:
+        if not openai_service:
+            raise HTTPException(status_code=500, detail="OpenAI service not initialized")
+        
+        # Process training examples
+        await openai_service.update_training_examples(request.examples)
+        
+        logger.info(f"📚 Updated training with {len(request.examples)} examples")
+        return {"message": f"Training updated with {len(request.examples)} examples", "status": "success"}
+        
+    except Exception as e:
+        logger.error(f"❌ Training examples error: {e}")
+        raise HTTPException(status_code=500, detail=str(e))
+
+@app.post("/train/personality")
+async def update_personality(settings: PersonalitySettings):
+    try:
+        if not openai_service:
+            raise HTTPException(status_code=500, detail="OpenAI service not initialized")
+        
+        # Update personality settings
+        await openai_service.update_personality_settings(settings.dict())
+        
+        logger.info("🧠 Personality settings updated")
+        return {"message": "Personality settings updated successfully", "status": "success"}
+        
+    except Exception as e:
+        logger.error(f"❌ Personality update error: {e}")
+        raise HTTPException(status_code=500, detail=str(e))
 
 if __name__ == "__main__":
     import uvicorn
     uvicorn.run(app, host="0.0.0.0", port=8000)