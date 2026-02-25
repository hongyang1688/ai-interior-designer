from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from typing import List, Optional
import json
import uuid

from app.models.models import Project, ProjectStatus, Design


class ProjectService:
    def __init__(self, db: AsyncSession):
        self.db = db
    
    async def create_project(self, project_data) -> Project:
        """Create a new project"""
        project = Project(
            name=project_data.name,
            description=project_data.description,
            s3_source_path=project_data.s3_source_path,
            style_preferences=project_data.style_preferences,
            budget_min=project_data.budget_min,
            budget_max=project_data.budget_max,
            family_info=project_data.family_info or {},
            preferences=project_data.preferences or {},
            output_config=project_data.output_config or {
                "renders": True,
                "3d_tour": True,
                "cad": True
            },
            status=ProjectStatus.PENDING
        )
        
        self.db.add(project)
        await self.db.flush()
        return project
    
    async def list_projects(self, skip: int = 0, limit: int = 100) -> List[Project]:
        """List all projects"""
        result = await self.db.execute(
            select(Project).offset(skip).limit(limit)
        )
        return result.scalars().all()
    
    async def get_project(self, project_id: int) -> Optional[Project]:
        """Get project by ID"""
        result = await self.db.execute(
            select(Project).where(Project.id == project_id)
        )
        return result.scalar_one_or_none()
    
    async def upload_references(self, project_id: int, files: List) -> dict:
        """Upload reference images"""
        # TODO: Implement S3 upload
        reference_urls = []
        for file in files:
            # Generate unique filename
            ext = file.filename.split('.')[-1]
            filename = f"{uuid.uuid4()}.{ext}"
            # TODO: Upload to S3
            url = f"https://s3.example.com/references/{filename}"
            reference_urls.append(url)
        
        # Update project
        await self.db.execute(
            update(Project)
            .where(Project.id == project_id)
            .values(reference_images=reference_urls)
        )
        
        return {"uploaded": len(reference_urls), "urls": reference_urls}
    
    async def start_processing(self, project_id: int) -> dict:
        """Start project processing"""
        project = await self.get_project(project_id)
        if not project:
            return {"error": "Project not found"}
        
        # Update status
        await self.db.execute(
            update(Project)
            .where(Project.id == project_id)
            .values(status=ProjectStatus.PROCESSING)
        )
        
        # TODO: Trigger Celery tasks for processing
        # - Floorplan analysis
        # - Style transfer
        # - 3D generation
        # - CAD generation
        # - Material matching
        
        return {"status": "started", "project_id": project_id}
    
    async def get_progress(self, project_id: int) -> dict:
        """Get processing progress"""
        project = await self.get_project(project_id)
        if not project:
            return {"error": "Project not found"}
        
        # Get designs progress
        result = await self.db.execute(
            select(Design).where(Design.project_id == project_id)
        )
        designs = result.scalars().all()
        
        total_progress = sum(d.progress for d in designs) / len(designs) if designs else 0
        
        return {
            "project_id": project_id,
            "status": project.status.value,
            "overall_progress": round(total_progress, 2),
            "designs_count": len(designs),
            "designs_progress": [
                {"id": d.id, "room_type": d.room_type, "progress": d.progress}
                for d in designs
            ]
        }
    
    async def get_results(self, project_id: int) -> dict:
        """Get generated results"""
        project = await self.get_project(project_id)
        if not project:
            return {"error": "Project not found"}
        
        return {
            "project_id": project_id,
            "status": project.status.value,
            "results": project.results or {},
            "designs": project.designs
        }