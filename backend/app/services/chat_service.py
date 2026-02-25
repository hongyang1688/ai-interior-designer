from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List, Optional, Dict
import json

from app.models.models import ChatSession, ChatMessage


class ChatService:
    def __init__(self, db: AsyncSession):
        self.db = db
    
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
        """Get AI response based on user message"""
        # TODO: Integrate with LLM (OpenAI/Claude/etc.)
        # For now, return mock responses based on keywords
        
        user_lower = user_message.lower()
        
        # Style-related queries
        if any(word in user_lower for word in ["风格", "style", "装修"]):
            return {
                "content": "根据您的户型和家庭情况，我推荐以下几种风格供您参考：",
                "message_type": "suggestion",
                "metadata": {
                    "suggestions": [
                        {
                            "id": "modern",
                            "name": "现代简约",
                            "description": "简洁线条，功能至上，适合年轻家庭",
                            "images": ["url1", "url2"]
                        },
                        {
                            "id": "nordic",
                            "name": "北欧风",
                            "description": "自然材质，明亮温馨，适合有孩子的家庭",
                            "images": ["url3", "url4"]
                        },
                        {
                            "id": "chinese",
                            "name": "新中式",
                            "description": "传统与现代结合，文化底蕴深厚",
                            "images": ["url5", "url6"]
                        }
                    ]
                }
            }
        
        # Budget-related queries
        if any(word in user_lower for word in ["预算", "budget", "价格", "多少钱"]):
            return {
                "content": "装修预算通常分为以下几个档次，您可以根据实际情况选择：",
                "message_type": "suggestion",
                "metadata": {
                    "budget_options": [
                        {
                            "tier": "economy",
                            "name": "经济型",
                            "price_per_sqm": "1000-1500元/㎡",
                            "description": "国产主流品牌，实用为主"
                        },
                        {
                            "tier": "standard",
                            "name": "舒适型",
                            "price_per_sqm": "1500-2500元/㎡",
                            "description": "中高端混搭，品质与性价比平衡"
                        },
                        {
                            "tier": "premium",
                            "name": "豪华型",
                            "price_per_sqm": "2500-4000元/㎡",
                            "description": "进口高端品牌，极致品质"
                        }
                    ]
                }
            }
        
        # Material-related queries
        if any(word in user_lower for word in ["材料", "material", "地板", "瓷砖"]):
            return {
                "content": "地板和瓷砖的选择需要考虑耐磨性、防滑性和美观度。您更偏好哪种材质？",
                "message_type": "question",
                "metadata": {
                    "options": [
                        {"id": "wood", "name": "实木地板", "pros": ["脚感好", "环保"], "cons": ["价格较高", "需保养"]},
                        {"id": "composite", "name": "实木复合", "pros": ["性价比高", "稳定"], "cons": ["脚感略差"]},
                        {"id": "tile", "name": "瓷砖", "pros": ["耐用", "易清洁"], "cons": ["脚感硬", "冰冷"]}
                    ]
                }
            }
        
        # Default response
        return {
            "content": "我理解您的需求。为了更好地为您设计，能否告诉我更多信息？比如您家有几口人、有没有宠物、喜欢明亮还是温馨的氛围？",
            "message_type": "question",
            "metadata": {
                "follow_up_questions": [
                    "家庭成员构成（几口人、是否有老人小孩）",
                    "是否有宠物",
                    "日常起居习惯",
                    "收纳需求"
                ]
            }
        }
    
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
            # Next question about family
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
            # Next question about pets
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
            # Next question about preferences
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
            # Generate result
            # TODO: Use collected answers to recommend style
            style_recommendation = {
                "primary_style": "modern",
                "secondary_styles": ["nordic"],
                "reasoning": "根据您的明亮通透偏好、三口之家、可能有宠物、普通收纳需求，推荐现代简约+北欧混搭风格。",
                "key_features": [
                    "开放式收纳设计",
                    "耐磨易清洁的地面材料",
                    "充足的储物空间",
                    "明亮的色彩搭配"
                ]
            }
            
            await self.save_message(
                session_id,
                "assistant",
                style_recommendation["reasoning"],
                "quiz_result",
                style_recommendation
            )
            
            return {
                "content": f"🎉 为您推荐：**现代简约 + 北欧风混搭**\n\n{style_recommendation['reasoning']}\n\n这个风格的特点是：",
                "message_type": "quiz_result",
                "metadata": {
                    "result": style_recommendation,
                    "next_action": "开始设计"
                }
            }
        
        return {"error": "Invalid quiz step"}