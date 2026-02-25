# AI Interior Designer

AI-powered interior design platform for batch processing floorplans, generating renders, 3D tours, CAD drawings, and material matching.

## Features

- 🏠 **Batch Floorplan Processing**: Upload multiple floorplans from S3/OSS
- 🎨 **Multi-Style Support**: Mix and match different interior styles
- 💰 **Budget-Based Matching**: Smart material recommendations within budget
- 🖼️ **AI-Powered Rendering**: Generate photorealistic renders and 3D tours
- 📐 **CAD Generation**: Auto-generate floor plans, elevations, and electrical drawings
- 🛒 **Material Matching**: Match with real suppliers (JD, Tmall, etc.)
- 💬 **Conversational Design**: Chat-based design assistant

## Tech Stack

### Backend
- FastAPI (Python)
- Celery (Task Queue)
- PostgreSQL (Database)
- Redis (Cache)
- MinIO/S3 (Storage)

### Frontend
- React + TypeScript
- Ant Design
- X6 (DAG Graph)
- Three.js (3D Viewer)

## Quick Start

### Backend
```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## Architecture

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│   Backend   │────▶│  AI Models  │
│  (React)    │     │  (FastAPI)  │     │ (SD/CAD/3D) │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                    ┌──────┴──────┐
                    ▼             ▼
            ┌──────────┐  ┌──────────┐
            │PostgreSQL│  │  Redis   │
            └──────────┘  └──────────┘
```

## License

MIT