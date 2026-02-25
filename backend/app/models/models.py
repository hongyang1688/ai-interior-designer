from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime, JSON, ForeignKey, Text, Enum
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, relationship
from datetime import datetime
import enum

Base = declarative_base()


class ProjectStatus(str, enum.Enum):
    PENDING = "pending"
    PROCESSING = "processing"
    COMPLETED = "completed"
    FAILED = "failed"


class Project(Base):
    __tablename__ = "projects"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    description = Column(Text)
    status = Column(Enum(ProjectStatus), default=ProjectStatus.PENDING)
    
    # Input configuration
    s3_source_path = Column(String(500))
    image_count = Column(Integer, default=0)
    
    # Style configuration
    style_preferences = Column(JSON)  # {"primary": "modern", "secondary": ["nordic"], "mix_ratio": 0.7}
    reference_images = Column(JSON)  # List of image URLs
    
    # Family preferences
    family_info = Column(JSON)  # {"members": 4, "adults": 2, "children": 2, "pets": ["dog"]}
    preferences = Column(JSON)  # {"likes": ["bright", "wood"], "dislikes": ["dark", "carpet"]}
    
    # Budget
    budget_min = Column(Float)
    budget_max = Column(Float)
    budget_currency = Column(String(10), default="CNY")
    
    # Output configuration
    output_config = Column(JSON)  # {"renders": true, "3d_tour": true, "cad": true}
    
    # Results
    results = Column(JSON)  # Generated file URLs and metadata
    
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    designs = relationship("Design", back_populates="project")
    chat_sessions = relationship("ChatSession", back_populates="project")


class Design(Base):
    __tablename__ = "designs"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    
    # Design metadata
    room_type = Column(String(50))  # living_room, bedroom, kitchen, etc.
    style = Column(String(50))
    
    # Generated files
    render_images = Column(JSON)  # List of image URLs
    tour_url = Column(String(500))  # 3D tour link
    cad_files = Column(JSON)  # CAD file URLs
    
    # Materials
    material_list = Column(JSON)  # List of matched materials
    
    # Status
    status = Column(Enum(ProjectStatus), default=ProjectStatus.PENDING)
    progress = Column(Float, default=0.0)  # 0-100
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    project = relationship("Project", back_populates="designs")


class Material(Base):
    __tablename__ = "materials"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    category = Column(String(50))  # floor, wall, furniture, etc.
    brand = Column(String(100))
    price = Column(Float)
    price_unit = Column(String(20))  # per_sqm, per_piece, etc.
    currency = Column(String(10), default="CNY")
    
    # Style matching
    styles = Column(JSON)  # ["modern", "nordic"]
    colors = Column(JSON)  # ["white", "beige"]
    
    # External links
    supplier = Column(String(50))  # jd, tmall, etc.
    purchase_url = Column(String(500))
    image_url = Column(String(500))
    
    # AI features
    embedding = Column(JSON)  # Vector for similarity search


class ChatSession(Base):
    __tablename__ = "chat_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(Integer, ForeignKey("projects.id"))
    session_type = Column(String(50), default="design_assistant")  # design_assistant, style_quiz
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    project = relationship("Project", back_populates="chat_sessions")
    messages = relationship("ChatMessage", back_populates="session")


class ChatMessage(Base):
    __tablename__ = "chat_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("chat_sessions.id"))
    role = Column(String(20))  # user, assistant, system
    content = Column(Text)
    message_type = Column(String(50), default="text")  # text, image, suggestion
    metadata = Column(JSON)  # Additional data like suggested styles, etc.
    
    created_at = Column(DateTime, default=datetime.utcnow)
    
    session = relationship("ChatSession", back_populates="messages")