# Mock Backend with Demo Floorplans - 零依赖
import http.server
import socketserver
import json
import base64
from urllib.parse import urlparse, parse_qs

PORT = 8000

# Demo floorplans data
DEMO_FLOORPLANS = [
    {
        "id": "floorplan_2br",
        "name": "阳光花园 78㎡",
        "type": "两室一厅",
        "area": 78,
        "description": "紧凑型两居，适合新婚夫妻或三口之家",
        "thumbnail": "/api/v1/floorplans/floorplan_2br.svg",
        "rooms": [
            {"name": "主卧", "size": "20×15m"},
            {"name": "次卧", "size": "18×15m"},
            {"name": "客厅", "size": "40×12m"},
            {"name": "厨房", "size": "15×15m"},
            {"name": "卫生间", "size": "15×12m"},
        ]
    },
    {
        "id": "floorplan_3br",
        "name": "万科城 105㎡",
        "type": "三室两厅",
        "area": 105,
        "description": "经典三居，南北通透，功能齐全",
        "thumbnail": "/api/v1/floorplans/floorplan_3br.svg",
        "rooms": [
            {"name": "主卧", "size": "18×16m"},
            {"name": "次卧1", "size": "16×16m"},
            {"name": "次卧2", "size": "16×16m"},
            {"name": "客厅/餐厅", "size": "35×18m"},
            {"name": "厨房", "size": "17×18m"},
            {"name": "卫生间1", "size": "12×14m"},
            {"name": "卫生间2", "size": "12×14m"},
        ]
    },
    {
        "id": "floorplan_4br",
        "name": "保利花园 145㎡",
        "type": "四室两厅",
        "area": 145,
        "description": "改善型四居，主卧套房设计，有独立书房",
        "thumbnail": "/api/v1/floorplans/floorplan_4br.svg",
        "rooms": [
            {"name": "主卧+卫", "size": "20×18m"},
            {"name": "次卧1", "size": "17×18m"},
            {"name": "次卧2", "size": "17×18m"},
            {"name": "书房", "size": "15×18m"},
            {"name": "客厅", "size": "40×20m"},
            {"name": "餐厅/厨房", "size": "20×20m"},
            {"name": "阳台", "size": "11×20m"},
        ]
    },
    {
        "id": "floorplan_villa",
        "name": "翡翠湾 180㎡",
        "type": "复式/别墅",
        "area": 180,
        "description": "大平层/复式，主卧套房，多功能空间",
        "thumbnail": "/api/v1/floorplans/floorplan_villa.svg",
        "rooms": [
            {"name": "主卧套房", "size": "25×20m"},
            {"name": "次卧1", "size": "20×20m"},
            {"name": "次卧2", "size": "20×20m"},
            {"name": "客厅", "size": "35×25m"},
            {"name": "厨房/餐厅", "size": "20×25m"},
            {"name": "多功能区", "size": "13×25m"},
            {"name": "储藏室", "size": "10×15m"},
        ]
    }
]

# SVG floorplans (embedded data)
FLOORPLAN_SVGS = {
    "floorplan_2br": '''<svg width="800" height="600" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="600" fill="#f8f8f8"/>
  <text x="400" y="30" text-anchor="middle" font-size="20" font-weight="bold" fill="#333">两室一厅 (78㎡)</text>
  <rect x="50" y="100" width="200" height="150" fill="white" stroke="#333" stroke-width="2"/>
  <text x="150" y="175" text-anchor="middle" font-size="12" fill="#333">主卧</text>
  <text x="150" y="190" text-anchor="middle" font-size="9" fill="#666">20×15m</text>
  <rect x="270" y="100" width="180" height="150" fill="white" stroke="#333" stroke-width="2"/>
  <text x="360" y="175" text-anchor="middle" font-size="12" fill="#333">次卧</text>
  <text x="360" y="190" text-anchor="middle" font-size="9" fill="#666">18×15m</text>
  <rect x="50" y="270" width="400" height="120" fill="white" stroke="#333" stroke-width="2"/>
  <text x="250" y="330" text-anchor="middle" font-size="12" fill="#333">客厅</text>
  <text x="250" y="345" text-anchor="middle" font-size="9" fill="#666">40×12m</text>
  <rect x="470" y="100" width="150" height="150" fill="white" stroke="#333" stroke-width="2"/>
  <text x="545" y="175" text-anchor="middle" font-size="12" fill="#333">厨房</text>
  <text x="545" y="190" text-anchor="middle" font-size="9" fill="#666">15×15m</text>
  <rect x="470" y="270" width="150" height="120" fill="white" stroke="#333" stroke-width="2"/>
  <text x="545" y="330" text-anchor="middle" font-size="12" fill="#333">卫生间</text>
  <text x="545" y="345" text-anchor="middle" font-size="9" fill="#666">15×12m</text>
  <text x="760" y="60" font-size="16" font-weight="bold" fill="#333">N ↑</text>
  <text x="740" y="580" font-size="12" fill="#666">1:100</text>
</svg>''',
    "floorplan_3br": '''<svg width="800" height="500" xmlns="http://www.w3.org/2000/svg">
  <rect width="800" height="500" fill="#f8f8f8"/>
  <text x="400" y="30" text-anchor="middle" font-size="20" font-weight="bold" fill="#333">三室两厅 (105㎡)</text>
  <rect x="50" y="80" width="180" height="160" fill="white" stroke="#333" stroke-width="2"/>
  <text x="140" y="160" text-anchor="middle" font-size="12" fill="#333">主卧</text>
  <rect x="250" y="80" width="160" height="160" fill="white" stroke="#333" stroke-width="2"/>
  <text x="330" y="160" text-anchor="middle" font-size="12" fill="#333">次卧1</text>
  <rect x="430" y="80" width="160" height="160" fill="white" stroke="#333" stroke-width="2"/>
  <text x="510" y="160" text-anchor="middle" font-size="12" fill="#333">次卧2</text>
  <rect x="50" y="260" width="350" height="180" fill="white" stroke="#333" stroke-width="2"/>
  <text x="225" y="350" text-anchor="middle" font-size="12" fill="#333">客厅/餐厅</text>
  <rect x="420" y="260" width="170" height="180" fill="white" stroke="#333" stroke-width="2"/>
  <text x="505" y="350" text-anchor="middle" font-size="12" fill="#333">厨房</text>
  <rect x="610" y="80" width="120" height="140" fill="white" stroke="#333" stroke-width="2"/>
  <text x="670" y="150" text-anchor="middle" font-size="10" fill="#333">卫生间1</text>
  <rect x="610" y="240" width="120" height="140" fill="white" stroke="#333" stroke-width="2"/>
  <text x="670" y="310" text-anchor="middle" font-size="10" fill="#333">卫生间2</text>
  <text x="760" y="60" font-size="16" font-weight="bold" fill="#333">N ↑</text>
  <text x="740" y="480" font-size="12" fill="#666">1:100</text>
</svg>''',
    "floorplan_4br": '''<svg width="850" height="550" xmlns="http://www.w3.org/2000/svg">
  <rect width="850" height="550" fill="#f8f8f8"/>
  <text x="425" y="30" text-anchor="middle" font-size="20" font-weight="bold" fill="#333">四室两厅 (145㎡)</text>
  <rect x="50" y="80" width="200" height="180" fill="white" stroke="#333" stroke-width="2"/>
  <text x="150" y="170" text-anchor="middle" font-size="12" fill="#333">主卧+卫</text>
  <rect x="270" y="80" width="170" height="180" fill="white" stroke="#333" stroke-width="2"/>
  <text x="355" y="170" text-anchor="middle" font-size="12" fill="#333">次卧1</text>
  <rect x="460" y="80" width="170" height="180" fill="white" stroke="#333" stroke-width="2"/>
  <text x="545" y="170" text-anchor="middle" font-size="12" fill="#333">次卧2</text>
  <rect x="650" y="80" width="150" height="180" fill="white" stroke="#333" stroke-width="2"/>
  <text x="725" y="170" text-anchor="middle" font-size="12" fill="#333">书房</text>
  <rect x="50" y="280" width="400" height="200" fill="white" stroke="#333" stroke-width="2"/>
  <text x="250" y="380" text-anchor="middle" font-size="12" fill="#333">客厅</text>
  <rect x="470" y="280" width="200" height="200" fill="white" stroke="#333" stroke-width="2"/>
  <text x="570" y="380" text-anchor="middle" font-size="12" fill="#333">餐厅/厨房</text>
  <rect x="690" y="280" width="110" height="200" fill="white" stroke="#333" stroke-width="2"/>
  <text x="745" y="380" text-anchor="middle" font-size="12" fill="#333">阳台</text>
  <text x="810" y="60" font-size="16" font-weight="bold" fill="#333">N ↑</text>
  <text x="790" y="530" font-size="12" fill="#666">1:100</text>
</svg>''',
    "floorplan_villa": '''<svg width="900" height="600" xmlns="http://www.w3.org/2000/svg">
  <rect width="900" height="600" fill="#f8f8f8"/>
  <text x="450" y="30" text-anchor="middle" font-size="20" font-weight="bold" fill="#333">复式/别墅 (180㎡)</text>
  <rect x="30" y="60" width="250" height="200" fill="white" stroke="#333" stroke-width="2"/>
  <text x="155" y="160" text-anchor="middle" font-size="12" fill="#333">主卧套房</text>
  <rect x="300" y="60" width="200" height="200" fill="white" stroke="#333" stroke-width="2"/>
  <text x="400" y="160" text-anchor="middle" font-size="12" fill="#333">次卧1</text>
  <rect x="520" y="60" width="200" height="200" fill="white" stroke="#333" stroke-width="2"/>
  <text x="620" y="160" text-anchor="middle" font-size="12" fill="#333">次卧2</text>
  <rect x="30" y="280" width="350" height="250" fill="white" stroke="#333" stroke-width="2"/>
  <text x="205" y="405" text-anchor="middle" font-size="12" fill="#333">客厅</text>
  <rect x="400" y="280" width="200" height="250" fill="white" stroke="#333" stroke-width="2"/>
  <text x="500" y="405" text-anchor="middle" font-size="12" fill="#333">厨房/餐厅</text>
  <rect x="620" y="280" width="130" height="250" fill="white" stroke="#333" stroke-width="2"/>
  <text x="685" y="405" text-anchor="middle" font-size="12" fill="#333">多功能区</text>
  <rect x="750" y="60" width="100" height="150" fill="white" stroke="#333" stroke-width="2"/>
  <text x="800" y="135" text-anchor="middle" font-size="10" fill="#333">储藏室</text>
  <text x="860" y="60" font-size="16" font-weight="bold" fill="#333">N ↑</text>
  <text x="840" y="580" font-size="12" fill="#666">1:100</text>
</svg>'''
}

# Mock projects with floorplans
projects = [
    {
        "id": 1,
        "name": "阳光花园 78㎡",
        "description": "两室一厅，紧凑型设计",
        "status": "completed",
        "progress": 100,
        "style": ["现代简约", "北欧风"],
        "budget": "30-50万",
        "floorplan_id": "floorplan_2br",
        "image_count": 5,
        "created_at": "2026-02-20"
    },
    {
        "id": 2,
        "name": "万科城 105㎡",
        "description": "三室两厅，南北通透",
        "status": "processing",
        "progress": 65,
        "style": ["轻奢"],
        "budget": "50-80万",
        "floorplan_id": "floorplan_3br",
        "image_count": 8,
        "created_at": "2026-02-22"
    },
    {
        "id": 3,
        "name": "保利花园 145㎡",
        "description": "四室两厅，改善型住宅",
        "status": "pending",
        "progress": 0,
        "style": ["现代简约"],
        "budget": "80-120万",
        "floorplan_id": "floorplan_4br",
        "image_count": 10,
        "created_at": "2026-02-24"
    },
    {
        "id": 4,
        "name": "翡翠湾 180㎡",
        "description": "复式/别墅，豪华配置",
        "status": "pending",
        "progress": 0,
        "style": ["轻奢", "新中式"],
        "budget": "150-200万",
        "floorplan_id": "floorplan_villa",
        "image_count": 12,
        "created_at": "2026-02-25"
    }
]

class APIHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        parsed = urlparse(self.path)
        path = parsed.path
        
        # CORS headers
        self.send_response(200)
        
        # Handle SVG floorplans
        if path.startswith('/api/v1/floorplans/') and path.endswith('.svg'):
            floorplan_id = path.split('/')[-1].replace('.svg', '')
            svg_content = FLOORPLAN_SVGS.get(floorplan_id)
            
            if svg_content:
                self.send_header('Content-type', 'image/svg+xml')
                self.send_header('Access-Control-Allow-Origin', '*')
                self.end_headers()
                self.wfile.write(svg_content.encode('utf-8'))
                return
            else:
                self.send_response(404)
                self.send_header('Content-type', 'application/json')
                self.end_headers()
                self.wfile.write(json.dumps({"error": "Floorplan not found"}).encode())
                return
        
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        # API routes
        if path == '/':
            response = {
                "message": "AI Interior Designer API (Mock with Demo Floorplans)",
                "version": "1.0.0",
                "endpoints": [
                    "/api/v1/projects",
                    "/api/v1/floorplans",
                    "/api/v1/floorplans/{id}.svg"
                ]
            }
        elif path == '/health':
            response = {"status": "healthy"}
        elif path == '/api/v1/projects':
            response = projects
        elif path.startswith('/api/v1/projects/'):
            project_id = int(path.split('/')[-1])
            project = next((p for p in projects if p["id"] == project_id), None)
            if project:
                # Add floorplan details
                floorplan_id = project.get("floorplan_id")
                floorplan = next((f for f in DEMO_FLOORPLANS if f["id"] == floorplan_id), None)
                response = {**project, "floorplan": floorplan}
            else:
                response = {"error": "Not found"}
                self.send_response(404)
        elif path == '/api/v1/floorplans':
            response = DEMO_FLOORPLANS
        else:
            response = {"error": "Not found"}
            self.send_response(404)
        
        self.wfile.write(json.dumps(response, ensure_ascii=False).encode())
    
    def do_POST(self):
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length) if content_length > 0 else b'{}'
        
        try:
            data = json.loads(post_data)
        except:
            data = {}
        
        parsed = urlparse(self.path)
        path = parsed.path
        
        self.send_response(200)
        self.send_header('Content-type', 'application/json')
        self.send_header('Access-Control-Allow-Origin', '*')
        self.end_headers()
        
        if '/chat' in path:
            response = {
                "content": f"收到: {data.get('content', '')}",
                "message_type": "text",
                "metadata": {}
            }
        elif '/projects' in path:
            new_project = {
                "id": len(projects) + 1,
                "name": data.get('name', '新项目'),
                "description": data.get('description', ''),
                "status": "pending",
                "progress": 0,
                "style": data.get('style_preferences', {}).get('styles', []),
                "budget": f"{data.get('budget_min', 30)}-{data.get('budget_max', 50)}万",
                "floorplan_id": data.get('floorplan_id', 'floorplan_3br'),
                "created_at": "2026-02-25"
            }
            projects.append(new_project)
            response = new_project
        else:
            response = {"success": True}
        
        self.wfile.write(json.dumps(response, ensure_ascii=False).encode())
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        self.end_headers()

print(f"🚀 Mock backend with demo floorplans")
print(f"📐 Available floorplans: {len(DEMO_FLOORPLANS)}")
print(f"   - /api/v1/floorplans/floorplan_2br.svg (两室一厅 78㎡)")
print(f"   - /api/v1/floorplans/floorplan_3br.svg (三室两厅 105㎡)")
print(f"   - /api/v1/floorplans/floorplan_4br.svg (四室两厅 145㎡)")
print(f"   - /api/v1/floorplans/floorplan_villa.svg (复式/别墅 180㎡)")
print(f"")
print(f"🌐 API: http://localhost:{PORT}")
print(f"📚 API docs: http://localhost:{PORT}")
print(f"Press Ctrl+C to stop")

with socketserver.TCPServer(("", PORT), APIHandler) as httpd:
    httpd.serve_forever()