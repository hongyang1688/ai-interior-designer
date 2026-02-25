from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional, Dict
import json

from app.models.models import ChatSession, ChatMessage
from app.services.ai_service import kimi_ai


class ChatService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.ai = kimi_ai
    
    async def create_session(self, project_id: int, session_type: str = "design_assistant") -> ChatSession:
        """Create a new chat session"""
        session = ChatSession(
            project_id=project_id,
            session_type=session_type
        )
        self.db.add(session)
        await self.db.flush()
        return session
    
    async def save_message(
        self, 
        session_id: int, 
        role: str, 
        content: str, 
        message_type: str = "text",
        metadata: Dict = None
    ) -> ChatMessage:
        """Save a message"""
        message = ChatMessage(
            session_id=session_id,
            role=role,
            content=content,
            message_type=message_type,
            metadata=metadata or {}
        )
        self.db.add(message)
        await self.db.flush()
        return message
    
    async def get_messages(
        self, 
        session_id: int, 
        skip: int = 0, 
        limit: int = 100
    ) -> List[ChatMessage]:
        """Get chat history"""
        result = await self.db.execute(
            select(ChatMessage)
            .where(ChatMessage.session_id == session_id)
            .order_by(ChatMessage.created_at)
            .offset(skip)
            .limit(limit)
        )
        return result.scalars().all()
    
    async def get_ai_response(self, session_id: int, user_message: str) -> Dict:
        """Get AI response using Kimi"""
        try:
            # Build context from chat history
            chat_history = await self.get_messages(session_id, limit=10)
            messages = []
            
            # System prompt
            messages.append({
                "role": "system",
                "content": """你是一位专业的室内设计师助手，擅长：
1. 根据用户需求推荐装修风格
2. 提供材料选择建议
3. 解答装修相关问题
4. 分析户型设计

请用专业但易懂的语言回答，必要时给出具体建议和数据支持。
如果是风格推荐，请以结构化方式输出便于前端展示。"""
            })
            
            # Add chat history
            for msg in chat_history:
                messages.append({
                    "role": msg.role,
                    "content": msg.content
                })
            
            # Add current message
            messages.append({"role": "user", "content": user_message})
            
            # Call Kimi
            response = await self.ai.chat_completion(messages, temperature=0.8)
            content = response["choices"][0]["message"]["content"]
            
            # Determine message type based on content
            message_type = "text"
            metadata = {}
            
            # Check if response contains structured data
            if any(keyword in user_message for keyword in ["风格", "推荐", "适合"]):
                message_type = "suggestion"
                # Try to parse structured recommendations
                try:
                    if "```json" in content:
                        json_str = content.split("```json")[1].split("```")[0].strip()
                        metadata = json.loads(json_str)
                except:
                    pass
            elif any(keyword in user_message for keyword in ["材料", "地板", "瓷砖", "价格"]):
                message_type = "material_suggestion"
            elif "?" in user_message or "？" in user_message:
                message_type = "answer"
            
            return {
                "content": content,
                "message_type": message_type,
                "metadata": metadata
            }
            
        except Exception as e:
            # Fallback to mock response if AI fails
            return await self._get_mock_response(user_message)
    
    async def _get_mock_response(self, user_message: str) -> Dict:
        """Fallback mock response"""
        user_lower = user_message.lower()
        
        if any(word in user_lower for word in ["风格", "style", "装修"]):
            return {
                "content": "根据您的户型和家庭情况，我推荐以下几种风格供您参考：\n\n1. **现代简约** - 简洁线条，功能至上\n2. **北欧风** - 自然材质，明亮温馨\n3. **新中式** - 传统与现代结合",
                "message_type": "suggestion",
                "metadata": {
                    "suggestions": [
                        {"id": "modern", "name": "现代简约", "description": "简洁线条，功能至上"},
                        {"id": "nordic", "name": "北欧风", "description": "自然材质，明亮温馨"},
                        {"id": "chinese", "name": "新中式", "description": "传统与现代结合"}
                    ]
                }
            }
        
        elif any(word in user_lower for word in ["预算", "budget", "价格", "多少钱"]):
            return {
                "content": "装修预算通常分为以下几个档次：\n\n- **经济型**：1000-1500元/㎡\n- **舒适型**：1500-2500元/㎡\n- **豪华型**：2500-4000元/㎡",
                "message_type": "suggestion"
            }
        
        return {
            "content": "我理解您的需求。为了更好地为您设计，能否告诉我更多信息？比如您家有几口人、有没有宠物、喜欢明亮还是温馨的氛围？",
            "message_type": "question"
        }
    
    async def analyze_user_preferences(self, preferences: Dict) -> Dict:
        """Analyze user preferences using Kimi AI"""
        return await self.ai.analyze_style_preferences(preferences)
    
    async def process_quiz_answer(self, session_id: int, answer: Dict) -> Dict:
        """Process quiz answer and return next question or result"""
        current_step = answer.get("step", 1)
        selected_option = answer.get("option")
        
        # Save answer
        await self.save_message(
            session_id,
            "user",
            f"选择了: {selected_option}",
            "quiz_answer",
            {"step": current_step, "answer": selected_option}
        )
        
        # Quiz flow
        if current_step == 1:
            return {
                "content": "好的！接下来，您的家庭成员构成是？",
                "message_type": "quiz",
                "metadata": {
                    "step": 2,
                    "suggestions": [
                        {"id": "couple", "text": "💑 新婚夫妻/情侣", "icon": "💑"},
                        {"id": "family3", "text": "👨‍👩‍👦 三口之家", "icon": "👨‍👩‍👦"},
                        {"id": "family4", "text": "👨‍👩‍👧‍👦 四口之家及以上", "icon": "👨‍👩‍👧‍👦"},
                        {"id": "multigen", "text": "👨‍👩‍👧‍👦👴👵 三代同堂", "icon": "👨‍👩‍👧‍👦👴👵"}
                    ]
                }
            }
        
        elif current_step == 2:
            return {
                "content": "家里有养宠物吗？",
                "message_type": "quiz",
                "metadata": {
                    "step": 3,
                    "suggestions": [
                        {"id": "dog", "text": "🐕 有狗狗", "icon": "🐕"},
                        {"id": "cat", "text": "🐈 有猫咪", "icon": "🐈"},
                        {"id": "other", "text": "🐠 其他宠物", "icon": "🐠"},
                        {"id": "none", "text": "🚫 没有宠物", "icon": "🚫"}
                    ]
                }
            }
        
        elif current_step == 3:
            return {
                "content": "您对收纳空间的需求程度？",
                "message_type": "quiz",
                "metadata": {
                    "step": 4,
                    "suggestions": [
                        {"id": "minimal", "text": "📦 断舍离，东西少", "icon": "📦"},
                        {"id": "normal", "text": "🗄️ 普通需求", "icon": "🗄️"},
                        {"id": "lots", "text": "📚 物品较多，需要大量收纳", "icon": "📚"},
                        {"id": "hoarder", "text": "🏚️ 囤货爱好者", "icon": "🏚️"}
                    ]
                }
            }
        
        elif current_step == 4:
            # Use Kimi to generate personalized recommendation
            quiz_context = {
                "family_members": answer.get("family_members", 3),
                "has_pets": answer.get("has_pets", False),
                "storage_needs": answer.get("storage_needs", "normal"),
                "brightness_preference": answer.get("brightness", "bright")
            }
            
            # Get AI analysis
            ai_recommendation = await self.analyze_user_preferences(quiz_context)
            
            await self.save_message(
                session_id,
                "assistant",
                ai_recommendation.get("style_reasoning", ""),
                "quiz_result",
                ai_recommendation
            )
            
            styles = ai_recommendation.get("recommended_styles", ["现代简约"])
            reasoning = ai_recommendation.get("style_reasoning", "根据您的需求推荐")
            
            return {
                "content": f"🎉 为您推荐：**{' + '.join(styles)}**\n\n{reasoning}",
                "message_type": "quiz_result",
                "metadata": {
                    "result": ai_recommendation,
                    "next_action": "开始设计"
                }
            }
        
        return {"error": "Invalid quiz step"}