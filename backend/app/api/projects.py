from fastapi import APIRouter, Depends, HTTPException, File, UploadFile, Form
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List, Optional
from pydantic import BaseModel
import json

from app.core.database import get_db
from app.models.models import Project, ProjectStatus
from app.services.project_service import ProjectService

router = APIRouter()


class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    s3_source_path: Optional[str] = None
    style_preferences: dict
    budget_min: float
    budget_max: float
    family_info: Optional[dict] = None
    preferences: Optional[dict] = None
    output_config: Optional[dict] = None


class ProjectResponse(BaseModel):
    id: int
    name: str
    status: str
    progress: float
    
    class Config:
        from_attributes = True


@router.post("/", response_model=ProjectResponse)
async def create_project(
    project_data: ProjectCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new interior design project"""
    service = ProjectService(db)
    project = await service.create_project(project_data)
    return project


@router.get("/", response_model=List[ProjectResponse])
async def list_projects(
    skip: int = 0,
    limit: int = 100,
    db: AsyncSession = Depends(get_db)
):
    """List all projects"""
    service = ProjectService(db)
    projects = await service.list_projects(skip=skip, limit=limit)
    return projects


@router.get("/{project_id}")
async def get_project(
    project_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get project details"""
    service = ProjectService(db)
    project = await service.get_project(project_id)
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    return project


@router.post("/{project_id}/upload-references")
async def upload_reference_images(
    project_id: int,
    files: List[UploadFile] = File(...),
    db: AsyncSession = Depends(get_db)
):
    """Upload style reference images"""
    service = ProjectService(db)
    result = await service.upload_references(project_id, files)
    return result


@router.post("/{project_id}/start")
async def start_processing(
    project_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Start processing the project"""
    service = ProjectService(db)
    result = await service.start_processing(project_id)
    return result


@router.get("/{project_id}/progress")
async def get_progress(
    project_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get processing progress"""
    service = ProjectService(db)
    progress = await service.get_progress(project_id)
    return progress


@router.get("/{project_id}/results")
async def get_results(
    project_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get generated results"""
    service = ProjectService(db)
    results = await service.get_results(project_id)
    return results