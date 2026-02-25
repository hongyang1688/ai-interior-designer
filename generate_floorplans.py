import os

def create_floorplan_svg(filename, title, rooms, size=(800, 600)):
    """Create a floorplan SVG using plain Python"""
    
    svg_content = f'''<?xml version="1.0" encoding="UTF-8"?>
<svg width="{size[0]}" height="{size[1]}" xmlns="http://www.w3.org/2000/svg">
  <!-- Background -->
  <rect width="{size[0]}" height="{size[1]}" fill="#f8f8f8"/>
  
  <!-- Title -->
  <text x="{size[0]/2}" y="30" text-anchor="middle" font-size="20" font-weight="bold" fill="#333">{title}</text>
  
  <!-- Rooms -->'''
    
    for room in rooms:
        x, y, w, h, name = room['x'], room['y'], room['w'], room['h'], room['name']
        svg_content += f'''
  <rect x="{x}" y="{y}" width="{w}" height="{h}" fill="white" stroke="#333" stroke-width="2"/>
  <text x="{x + w/2}" y="{y + h/2}" text-anchor="middle" font-size="12" fill="#333">{name}</text>
  <text x="{x + w/2}" y="{y + h/2 + 15}" text-anchor="middle" font-size="9" fill="#666">{w//10}×{h//10}m</text>'''
    
    # North arrow
    svg_content += f'''
  
  <!-- North Arrow -->
  <text x="{size[0] - 40}" y="60" font-size="16" font-weight="bold" fill="#333">N ↑</text>
  
  <!-- Scale -->
  <text x="{size[0] - 60}" y="{size[1] - 20}" font-size="12" fill="#666">1:100</text>
</svg>'''
    
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(svg_content)
    
    print(f"Created: {filename}")

# Create output directory
output_dir = '/Users/bigpigleg/.openclaw/workspace/ai-interior-designer/demo_floorplans'
os.makedirs(output_dir, exist_ok=True)

# 1. Small apartment - 2 bedrooms (78㎡)
rooms_small = [
    {'x': 50, 'y': 100, 'w': 200, 'h': 150, 'name': '主卧'},
    {'x': 270, 'y': 100, 'w': 180, 'h': 150, 'name': '次卧'},
    {'x': 50, 'y': 270, 'w': 400, 'h': 120, 'name': '客厅'},
    {'x': 470, 'y': 100, 'w': 150, 'h': 150, 'name': '厨房'},
    {'x': 470, 'y': 270, 'w': 150, 'h': 120, 'name': '卫生间'},
]

create_floorplan_svg(f'{output_dir}/floorplan_2br.svg', '两室一厅 (78㎡)', rooms_small)

# 2. Medium apartment - 3 bedrooms (105㎡)
rooms_medium = [
    {'x': 50, 'y': 80, 'w': 180, 'h': 160, 'name': '主卧'},
    {'x': 250, 'y': 80, 'w': 160, 'h': 160, 'name': '次卧1'},
    {'x': 430, 'y': 80, 'w': 160, 'h': 160, 'name': '次卧2'},
    {'x': 50, 'y': 260, 'w': 350, 'h': 180, 'name': '客厅/餐厅'},
    {'x': 420, 'y': 260, 'w': 170, 'h': 180, 'name': '厨房'},
    {'x': 610, 'y': 80, 'w': 120, 'h': 140, 'name': '卫生间1'},
    {'x': 610, 'y': 240, 'w': 120, 'h': 140, 'name': '卫生间2'},
]

create_floorplan_svg(f'{output_dir}/floorplan_3br.svg', '三室两厅 (105㎡)', rooms_medium, size=(800, 500))

# 3. Large apartment - 4 bedrooms (145㎡)
rooms_large = [
    {'x': 50, 'y': 80, 'w': 200, 'h': 180, 'name': '主卧+卫'},
    {'x': 270, 'y': 80, 'w': 170, 'h': 180, 'name': '次卧1'},
    {'x': 460, 'y': 80, 'w': 170, 'h': 180, 'name': '次卧2'},
    {'x': 650, 'y': 80, 'w': 150, 'h': 180, 'name': '书房'},
    {'x': 50, 'y': 280, 'w': 400, 'h': 200, 'name': '客厅'},
    {'x': 470, 'y': 280, 'w': 200, 'h': 200, 'name': '餐厅/厨房'},
    {'x': 690, 'y': 280, 'w': 110, 'h': 200, 'name': '阳台'},
]

create_floorplan_svg(f'{output_dir}/floorplan_4br.svg', '四室两厅 (145㎡)', rooms_large, size=(850, 550))

# 4. Villa style - complex layout (180㎡)
rooms_villa = [
    {'x': 30, 'y': 60, 'w': 250, 'h': 200, 'name': '主卧套房'},
    {'x': 300, 'y': 60, 'w': 200, 'h': 200, 'name': '次卧1'},
    {'x': 520, 'y': 60, 'w': 200, 'h': 200, 'name': '次卧2'},
    {'x': 30, 'y': 280, 'w': 350, 'h': 250, 'name': '客厅'},
    {'x': 400, 'y': 280, 'w': 200, 'h': 250, 'name': '厨房/餐厅'},
    {'x': 620, 'y': 280, 'w': 130, 'h': 250, 'name': '多功能区'},
    {'x': 750, 'y': 60, 'w': 100, 'h': 150, 'name': '储藏室'},
]

create_floorplan_svg(f'{output_dir}/floorplan_villa.svg', '复式/别墅 (180㎡)', rooms_villa, size=(900, 600))

print("\n✅ All floorplan SVGs created!")
print(f"\nLocation: {output_dir}/")

# List created files
files = sorted([f for f in os.listdir(output_dir) if f.endswith('.svg')])
print(f"\nCreated {len(files)} floorplans:")
for f in files:
    size = os.path.getsize(f'{output_dir}/{f}')
    print(f"  ✓ {f} ({size/1024:.1f} KB)")