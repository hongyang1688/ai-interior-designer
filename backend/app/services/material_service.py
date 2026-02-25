from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_
from typing import List, Optional

from app.models.models import Material


class MaterialService:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def search_materials(
        self,
        query: Optional[str] = None,
        category: Optional[str] = None,
        style: Optional[str] = None,
        min_price: Optional[float] = None,
        max_price: Optional[float] = None,
        supplier: Optional[str] = None,
        skip: int = 0,
        limit: int = 50
    ) -> List[Material]:
        """Search materials with filters"""
        stmt = select(Material)
        
        if query:
            stmt = stmt.where(
                or_(
                    Material.name.ilike(f"%{query}%"),
                    Material.brand.ilike(f"%{query}%")
                )
            )
        
        if category:
            stmt = stmt.where(Material.category == category)
        
        if style:
            stmt = stmt.where(Material.styles.contains([style]))
        
        if min_price is not None:
            stmt = stmt.where(Material.price >= min_price)
        
        if max_price is not None:
            stmt = stmt.where(Material.price <= max_price)
        
        if supplier:
            stmt = stmt.where(Material.supplier == supplier)
        
        stmt = stmt.offset(skip).limit(limit)
        result = await self.db.execute(stmt)
        return result.scalars().all()
    
    async def get_categories(self) -> List[dict]:
        """Get all material categories"""
        return [
            {"id": "floor", "name": "地板", "icon": "🪵"},
            {"id": "wall", "name": "墙面材料", "icon": "🧱"},
            {"id": "tile", "name": "瓷砖", "icon": "⬜"},
            {"id": "ceiling", "name": "吊顶", "icon": "⬆️"},
            {"id": "door", "name": "门窗", "icon": "🚪"},
            {"id": "cabinet", "name": "橱柜", "icon": "🗄️"},
            {"id": "bathroom", "name": "卫浴", "icon": "🚿"},
            {"id": "lighting", "name": "灯具", "icon": "💡"},
            {"id": "furniture", "name": "家具", "icon": "🛋️"},
            {"id": "curtain", "name": "窗帘", "icon": "🪟"},
            {"id": "hardware", "name": "五金", "icon": "🔧"},
            {"id": "paint", "name": "涂料", "icon": "🎨"}
        ]
    
    async def get_budget_options(self, total_budget: float, area_sqm: float) -> dict:
        """Get material combinations for different budget levels"""
        # Budget allocation percentages
        allocations = {
            "economy": {
                "floor": 0.15,      # 地板/瓷砖
                "wall": 0.10,       # 墙面
                "ceiling": 0.05,    # 吊顶
                "door": 0.08,       # 门窗
                "bathroom": 0.12,   # 卫浴
                "kitchen": 0.15,    # 橱柜
                "lighting": 0.05,   # 灯具
                "furniture": 0.20,  # 家具
                "soft": 0.10        # 软装
            },
            "standard": {
                "floor": 0.18,
                "wall": 0.12,
                "ceiling": 0.06,
                "door": 0.10,
                "bathroom": 0.14,
                "kitchen": 0.16,
                "lighting": 0.06,
                "furniture": 0.18,
                "soft": 0.10
            },
            "premium": {
                "floor": 0.20,
                "wall": 0.14,
                "ceiling": 0.08,
                "door": 0.12,
                "bathroom": 0.16,
                "kitchen": 0.18,
                "lighting": 0.08,
                "furniture": 0.15,
                "soft": 0.09
            }
        }
        
        results = {}
        for tier, alloc in allocations.items():
            tier_budget = total_budget * (0.7 if tier == "economy" else 1.0 if tier == "standard" else 1.3)
            results[tier] = {
                "total_budget": round(tier_budget, 2),
                "per_sqm": round(tier_budget / area_sqm, 2),
                "allocations": {
                    category: round(tier_budget * pct, 2)
                    for category, pct in alloc.items()
                }
            }
        
        return results
    
    async def match_materials(self, project_id: int, budget_tier: str = "standard") -> List[dict]:
        """Match materials for a project based on style and budget"""
        # TODO: Get project style and budget, then match materials
        
        # Mock result
        return [
            {
                "category": "地板",
                "selected": {
                    "name": "圣象实木复合地板",
                    "brand": "圣象",
                    "price": 189,
                    "unit": "元/㎡",
                    "purchase_url": "https://jd.com/product/xxx"
                },
                "alternatives": [
                    {"name": "大自然地板", "price": 159},
                    {"name": "德尔地板", "price": 219}
                ]
            },
            {
                "category": "瓷砖",
                "selected": {
                    "name": "马可波罗通体砖",
                    "brand": "马可波罗",
                    "price": 128,
                    "unit": "元/㎡",
                    "purchase_url": "https://tmall.com/product/xxx"
                },
                "alternatives": []
            }
        ]
    
    async def get_alternatives(self, material_id: int, same_price_range: bool = True) -> List[Material]:
        """Get alternative materials"""
        # Get original material
        result = await self.db.execute(
            select(Material).where(Material.id == material_id)
        )
        original = result.scalar_one_or_none()
        
        if not original:
            return []
        
        # Find alternatives
        stmt = select(Material).where(
            and_(
                Material.category == original.category,
                Material.id != material_id
            )
        )
        
        if same_price_range:
            price_range = original.price * 0.2  # 20% range
            stmt = stmt.where(
                and_(
                    Material.price >= original.price - price_range,
                    Material.price <= original.price + price_range
                )
            )
        
        stmt = stmt.limit(5)
        result = await self.db.execute(stmt)
        return result.scalars().all()