from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from pydantic import BaseModel

from app.core.database import get_db
from app.services.chat_service import ChatService

router = APIRouter()


class ChatMessageCreate(BaseModel):
    content: str
    message_type: str = "text"  # text, image


class ChatMessageResponse(BaseModel):
    id: int
    role: str
    content: str
    message_type: str
    metadata: Optional[dict] = None


@router.post("/projects/{project_id}/sessions")
async def create_chat_session(
    project_id: int,
    session_type: str = "design_assistant",
    db: AsyncSession = Depends(get_db)
):
    """Create a new chat session for the project"""
    service = ChatService(db)
    session = await service.create_session(project_id, session_type)
    return session


@router.post("/sessions/{session_id}/messages")
async def send_message(
    session_id: int,
    message: ChatMessageCreate,
    db: AsyncSession = Depends(get_db)
):
    """Send a message and get AI response"""
    service = ChatService(db)
    
    # Save user message
    await service.save_message(session_id, "user", message.content, message.message_type)
    
    # Get AI response
    response = await service.get_ai_response(session_id, message.content)
    
    # Save AI response
    ai_message = await service.save_message(
        session_id, 
        "assistant", 
        response["content"],
        response.get("message_type", "text"),
        response.get("metadata")
    )
    
    return ai_message


@router.get("/sessions/{session_id}/messages")
async def get_messages(
    session_id: int,
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    """Get chat history"""
    service = ChatService(db)
    messages = await service.get_messages(session_id, skip, limit)
    return messages


@router.post("/projects/{project_id}/style-quiz")
async def start_style_quiz(
    project_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Start a style discovery quiz"""
    service = ChatService(db)
    quiz_session = await service.create_session(project_id, "style_quiz")
    
    # Initial quiz question
    first_question = {
        "content": "让我们通过几个简单的问题，找到最适合你的装修风格！\n\n首先，你喜欢家里整体氛围是：",
        "suggestions": [
            {"id": "bright", "text": "☀️ 明亮通透，阳光充足", "icon": "☀️"},
            {"id": "warm", "text": "🕯️ 温馨舒适，暖色调", "icon": "🕯️"},
            {"id": "minimal", "text": "⚪ 简约干净，少即是多", "icon": "⚪"},
            {"id": "luxury", "text": "✨ 精致奢华，品质感", "icon": "✨"}
        ]
    }
    
    await service.save_message(
        quiz_session.id,
        "assistant",
        first_question["content"],
        "quiz",
        {"suggestions": first_question["suggestions"], "step": 1}
    )
    
    return {"session_id": quiz_session.id, "first_question": first_question}


@router.post("/sessions/{session_id}/quiz-answer")
async def answer_quiz_question(
    session_id: int,
    answer: dict,
    db: AsyncSession = Depends(get_db)
):
    """Process quiz answer and return next question or result"""
    service = ChatService(db)
    result = await service.process_quiz_answer(session_id, answer)
    return result