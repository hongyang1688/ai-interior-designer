from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from pydantic import BaseModel

from app.core.database import get_db
from app.services.material_service import MaterialService

router = APIRouter()


@router.get("/search")
async def search_materials(
    query: Optional[str] = None,
    category: Optional[str] = None,
    style: Optional[str] = None,
    min_price: Optional[float] = None,
    max_price: Optional[float] = None,
    supplier: Optional[str] = None,
    skip: int = 0,
    limit: int = 50,
    db: AsyncSession = Depends(get_db)
):
    """Search materials with filters"""
    service = MaterialService(db)
    materials = await service.search_materials(
        query=query,
        category=category,
        style=style,
        min_price=min_price,
        max_price=max_price,
        supplier=supplier,
        skip=skip,
        limit=limit
    )
    return materials


@router.get("/categories")
async def get_categories(
    db: AsyncSession = Depends(get_db)
):
    """Get all material categories"""
    service = MaterialService(db)
    categories = await service.get_categories()
    return categories


@router.get("/budget-options")
async def get_budget_options(
    total_budget: float,
    area_sqm: float,
    db: AsyncSession = Depends(get_db)
):
    """Get material combinations for different budget levels"""
    service = MaterialService(db)
    options = await service.get_budget_options(total_budget, area_sqm)
    return {
        "economy": options["economy"],      # 70% of budget
        "standard": options["standard"],    # 100% of budget
        "premium": options["premium"]       # 130% of budget
    }


@router.post("/projects/{project_id}/match")
async def match_materials_for_project(
    project_id: int,
    budget_tier: str = "standard",  # economy, standard, premium
    db: AsyncSession = Depends(get_db)
):
    """Match materials for a project based on style and budget"""
    service = MaterialService(db)
    matched_materials = await service.match_materials(project_id, budget_tier)
    return matched_materials


@router.get("/{material_id}/alternatives")
async def get_alternatives(
    material_id: int,
    same_price_range: bool = True,
    db: AsyncSession = Depends(get_db)
):
    """Get alternative materials"""
    service = MaterialService(db)
    alternatives = await service.get_alternatives(material_id, same_price_range)
    return alternatives