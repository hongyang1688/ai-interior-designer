# AI Interior Designer - 智能室内设计平台

基于AI的批量户型图处理、效果图生成、3D漫游、CAD图纸和材料匹配平台。

## 🚀 本地部署（5分钟搞定）

### 1. 克隆代码
```bash
git clone https://github.com/hongyang1688/ai-interior-designer.git
cd ai-interior-designer
```

### 2. 一键部署
```bash
./deploy.sh setup    # 安装依赖
./deploy.sh start    # 启动服务
```

### 3. 手动部署（如果脚本有问题）

**后端:**
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
# 编辑 .env 填入 Kimi API Key（可选，没有也能用）
uvicorn app.main:app --reload
```

**前端:**
```bash
cd frontend
npm install
npm run dev
```

### 4. 访问
- 前端: http://localhost:3000
- 后端API: http://localhost:8000
- API文档: http://localhost:8000/docs

---

## ✨ 核心功能

### 1. AI风格分析
- 自然语言描述需求
- AI推荐1-3种风格混搭
- 支持调节风格比例

### 2. 个性化偏好
- 家庭成员数、儿童、老人
- 宠物类型
- 收纳需求等级
- 喜恶元素标签
- 预算范围

### 3. 3D漫游 (Three.js)
- 实时3D场景查看
- 多视角切换（鸟瞰、沙发视角、电视视角等）
- 风格实时切换预览
- 点击家具查看详情

### 4. DAG流程可视化
- X6实现的设计流程图
- 实时查看处理进度
- 点击节点查看配置和日志

### 5. 材料库
- 按分类、风格、价格筛选
- 收藏功能
- 预算实时计算
- 供应商直达链接

### 6. AI对话助手
- 接入Kimi AI
- 风格问答
- 材料咨询
- 设计建议

---

## 🎨 免费AI图像生成

**无需Stable Diffusion账号！**

使用 `Pollinations.ai`（完全免费，无需API Key）：

```python
from app.services.image_generation_service import FreeImageGenerationService

# 生成室内设计图
url = FreeImageGenerationService.generate_interior_prompt(
    room_type="living room",
    style="modern minimalist",
    description="spacious, natural light"
)
```

---

## 🔧 技术栈

**后端:**
- FastAPI (Python)
- SQLAlchemy + PostgreSQL
- Kimi AI API
- Celery (任务队列)

**前端:**
- React + TypeScript
- Ant Design
- Three.js (3D漫游)
- @antv/x6 (DAG流程图)

---

## 📁 项目结构

```
ai-interior-designer/
├── backend/                 # FastAPI后端
│   ├── app/
│   │   ├── api/            # API路由
│   │   ├── core/           # 配置和数据库
│   │   ├── models/         # 数据库模型
│   │   └── services/       # 业务逻辑
│   │       ├── ai_service.py          # Kimi AI集成
│   │       ├── chat_service.py        # 对话服务
│   │       ├── image_generation_service.py  # 免费AI图像
│   │       └── ...
│   └── requirements.txt
│
├── frontend/                # React前端
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatAssistant.tsx      # AI对话组件
│   │   │   ├── Tour3D.tsx             # 3D漫游组件
│   │   │   └── ...
│   │   └── pages/
│   │       ├── ProjectCreate.tsx      # 项目创建
│   │       ├── ProjectDetail.tsx      # 项目详情
│   │       ├── DesignStudio.tsx       # DAG流程图
│   │       └── MaterialLibrary.tsx    # 材料库
│   └── package.json
│
└── deploy.sh               # 一键部署脚本
```

---

## 🔑 配置（可选）

### Kimi AI（用于智能对话）
编辑 `backend/.env`：
```bash
KIMI_API_KEY=your-kimi-api-key
```

没有Kimi Key也能用，会降级到mock响应。

---

## 📝 API文档

启动后访问：http://localhost:8000/docs

主要接口：
- `POST /api/v1/projects/` - 创建项目
- `GET /api/v1/projects/{id}` - 获取项目详情
- `POST /api/v1/chat/sessions/{id}/messages` - AI对话
- `GET /api/v1/materials/search` - 搜索材料

---

## 🐛 常见问题

**Q: 前端报错找不到模块？**
```bash
cd frontend
rm -rf node_modules
npm install
```

**Q: 后端报错数据库连接失败？**
```bash
# 使用SQLite代替PostgreSQL（开发环境）
# 修改 backend/app/core/config.py:
DATABASE_URL="sqlite:///./ai_designer.db"
```

**Q: Kimi AI没有响应？**
- 检查 `.env` 中的 `KIMI_API_KEY`
- 没有Key时会自动使用mock数据

---

## 📄 License

MIT