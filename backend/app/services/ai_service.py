import httpx
import json
from typing import List, Dict, Optional, AsyncGenerator
from app.core.config import settings


class KimiAI:
    """Kimi AI Service for Interior Design"""
    
    def __init__(self):
        self.api_key = settings.KIMI_API_KEY
        self.base_url = settings.KIMI_API_BASE
        self.model = settings.KIMI_MODEL
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
    
    async def chat_completion(
        self,
        messages: List[Dict[str, str]],
        temperature: float = 0.7,
        max_tokens: int = 2000,
        stream: bool = False
    ) -> Dict:
        """Send chat completion request to Kimi"""
        payload = {
            "model": self.model,
            "messages": messages,
            "temperature": temperature,
            "max_tokens": max_tokens,
            "stream": stream
        }
        
        async with httpx.AsyncClient() as client:
            response = await client.post(
                f"{self.base_url}/chat/completions",
                headers=self.headers,
                json=payload,
                timeout=60.0
            )
            response.raise_for_status()
            return response.json()
    
    async def analyze_style_preferences(
        self,
        user_preferences: Dict
    ) -> Dict:
        """Analyze user preferences and recommend styles"""
        system_prompt = """你是一位专业的室内设计师，擅长根据用户的家庭情况、生活习惯和偏好推荐最适合的装修风格。

请分析以下信息，并提供：
1. 最适合的1-2种主风格
2. 风格推荐理由
3. 关键设计元素建议
4. 预算分配建议
5. 材料选择建议

请以JSON格式输出，便于程序解析。"""

        user_prompt = f"""请根据以下信息推荐装修风格：

家庭情况：
- 成员数：{user_preferences.get('family_members', '未知')}
- 儿童数：{user_preferences.get('children', 0)}
- 宠物：{user_preferences.get('has_pets', '无')}
- 收纳需求：{user_preferences.get('storage_needs', '普通')}

偏好：
- 喜欢的元素：{', '.join(user_preferences.get('likes', []))}
- 不喜欢的元素：{', '.join(user_preferences.get('dislikes', []))}
- 预算范围：{user_preferences.get('budget', '未指定')} 万元
- 特殊需求：{user_preferences.get('special_requirements', '无')}

请输出JSON格式：
{{
    "recommended_styles": ["风格1", "风格2"],
    "style_reasoning": "推荐理由",
    "key_elements": ["元素1", "元素2", "元素3"],
    "budget_allocation": {{"硬装": "60%", "软装": "30%", "其他": "10%"}},
    "material_suggestions": ["材料1", "材料2"],
    "design_tips": ["建议1", "建议2"]
}}"""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
        
        try:
            response = await self.chat_completion(messages, temperature=0.7)
            content = response["choices"][0]["message"]["content"]
            
            # Extract JSON from response
            try:
                # Try to parse directly
                result = json.loads(content)
                return result
            except json.JSONDecodeError:
                # Try to extract JSON from markdown code block
                if "```json" in content:
                    json_str = content.split("```json")[1].split("```")[0].strip()
                    return json.loads(json_str)
                elif "```" in content:
                    json_str = content.split("```")[1].split("```")[0].strip()
                    return json.loads(json_str)
                else:
                    # Return as text analysis if JSON parsing fails
                    return {
                        "analysis_text": content,
                        "recommended_styles": ["现代简约"],
                        "style_reasoning": "基于您的偏好推荐"
                    }
        except Exception as e:
            return {
                "error": str(e),
                "recommended_styles": ["现代简约"],
                "style_reasoning": "默认推荐"
            }
    
    async def generate_design_description(
        self,
        room_type: str,
        style: str,
        requirements: Dict
    ) -> str:
        """Generate design description for a room"""
        system_prompt = """你是一位专业的室内设计师。请根据房间类型、风格和需求，生成详细的设计描述。
描述应包括：色彩搭配、材质选择、家具布局、灯光设计、装饰元素等。"""

        user_prompt = f"""请为以下房间生成设计方案：

房间类型：{room_type}
设计风格：{style}
面积：{requirements.get('area', '未知')} ㎡
预算：{requirements.get('budget', '未知')} 万元
特殊需求：{requirements.get('special_needs', '无')}

请生成详细的设计描述（300-500字）："""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
        
        try:
            response = await self.chat_completion(messages, temperature=0.8)
            return response["choices"][0]["message"]["content"]
        except Exception as e:
            return f"生成设计方案时出错：{str(e)}"
    
    async def suggest_materials(
        self,
        category: str,
        style: str,
        budget_level: str
    ) -> List[Dict]:
        """Suggest materials based on category, style and budget"""
        system_prompt = """你是一位材料专家。请根据材料类别、装修风格和预算档次，推荐3-5种合适的材料。
对于每种材料，提供：名称、品牌建议、价格区间、优缺点。"""

        user_prompt = f"""请推荐{class_category}材料：

类别：{category}
风格：{style}
预算档次：{budget_level}

请以JSON数组格式输出：
[
    {{
        "name": "材料名称",
        "brand": "推荐品牌",
        "price_range": "价格区间",
        "pros": ["优点1", "优点2"],
        "cons": ["缺点1"],
        "suitable_for": "适用场景"
    }}
]"""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
        
        try:
            response = await self.chat_completion(messages, temperature=0.7)
            content = response["choices"][0]["message"]["content"]
            
            # Try to extract JSON
            try:
                if "```json" in content:
                    json_str = content.split("```json")[1].split("```")[0].strip()
                    return json.loads(json_str)
                elif "```" in content:
                    json_str = content.split("```")[1].split("```")[0].strip()
                    return json.loads(json_str)
                else:
                    return json.loads(content)
            except:
                return [{"name": "解析失败", "description": content}]
        except Exception as e:
            return [{"name": "出错", "description": str(e)}]
    
    async def answer_design_question(
        self,
        question: str,
        context: Optional[Dict] = None
    ) -> str:
        """Answer design-related questions"""
        system_prompt = """你是一位专业的室内设计师助手，擅长回答装修、设计、材料选择等相关问题。
请用专业但易懂的语言回答，必要时给出具体建议。"""

        context_str = ""
        if context:
            context_str = f"\n\n上下文信息：\n{json.dumps(context, ensure_ascii=False, indent=2)}"

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": question + context_str}
        ]
        
        try:
            response = await self.chat_completion(messages, temperature=0.8)
            return response["choices"][0]["message"]["content"]
        except Exception as e:
            return f"抱歉，回答问题时出错：{str(e)}"


# Global instance
kimi_ai = KimiAI()