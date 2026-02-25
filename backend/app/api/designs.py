from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List
from pydantic import BaseModel

from app.core.database import get_db
from app.services.design_service import DesignService

router = APIRouter()


class StyleAdjustment(BaseModel):
    room_type: str
    adjustments: dict  # {"brightness": 0.8, "color_warmth": 0.6, "minimalism": 0.9}


@router.get("/projects/{project_id}")
async def get_project_designs(
    project_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get all designs for a project"""
    service = DesignService(db)
    designs = await service.get_project_designs(project_id)
    return designs


@router.post("/{design_id}/adjust-style")
async def adjust_style(
    design_id: int,
    adjustment: StyleAdjustment,
    db: AsyncSession = Depends(get_db)
):
    """Adjust design style parameters"""
    service = DesignService(db)
    result = await service.adjust_style(design_id, adjustment)
    return result


@router.post("/{design_id}/regenerate")
async def regenerate_design(
    design_id: int,
    style_params: dict,
    db: AsyncSession = Depends(get_db)
):
    """Regenerate design with new parameters"""
    service = DesignService(db)
    result = await service.regenerate(design_id, style_params)
    return result


@router.get("/{design_id}/render-views")
async def get_render_views(
    design_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get all available render views for a design"""
    service = DesignService(db)
    views = await service.get_render_views(design_id)
    return views


@router.post("/{design_id}/generate-view")
async def generate_custom_view(
    design_id: int,
    view_config: dict,  # {"position": "kitchen", "angle": "cooking", "lighting": "natural"}
    db: AsyncSession = Depends(get_db)
):
    """Generate a custom perspective view"""
    service = DesignService(db)
    result = await service.generate_custom_view(design_id, view_config)
    return result