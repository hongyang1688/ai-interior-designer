import httpx
from typing import Optional, List
import base64
from io import BytesIO


class FreeImageGenerationService:
    """
    Free image generation service using Pollinations.ai
    No API key required, completely free
    """
    
    BASE_URL = "https://image.pollinations.ai/prompt"
    
    @staticmethod
    def generate_interior_prompt(
        room_type: str,
        style: str,
        description: str = "",
        width: int = 1024,
        height: int = 768,
        seed: Optional[int] = None
    ) -> str:
        """
        Generate interior design image URL
        
        Args:
            room_type: living_room, bedroom, kitchen, bathroom
            style: modern, nordic, chinese, luxury, etc.
            description: additional details
            width: image width
            height: image height
            seed: random seed for reproducibility
            
        Returns:
            URL of generated image
        """
        # Build prompt
        prompt_parts = [
            f"interior design photography",
            f"{room_type}",
            f"{style} style",
        ]
        
        if description:
            prompt_parts.append(description)
            
        # Add quality enhancers
        prompt_parts.extend([
            "professional photography",
            "natural lighting",
            "high detail",
            "4k resolution",
            "realistic",
            "beautiful"
        ])
        
        prompt = ", ".join(prompt_parts)
        
        # Build URL
        params = {
            "width": width,
            "height": height,
            "nologo": "true",
            "enhance": "true"
        }
        
        if seed:
            params["seed"] = seed
            
        # URL encode prompt
        import urllib.parse
        encoded_prompt = urllib.parse.quote(prompt)
        
        # Build query string
        query_string = "&".join([f"{k}={v}" for k, v in params.items()])
        
        return f"{FreeImageGenerationService.BASE_URL}/{encoded_prompt}?{query_string}"
    
    @staticmethod
    def generate_room_designs(
        room_type: str,
        style: str,
        views: List[str],
        seed_base: int = 42
    ) -> List[dict]:
        """
        Generate multiple views of a room
        
        Returns list of dicts with view name and image URL
        """
        results = []
        
        view_descriptions = {
            "overview": "wide angle overview",
            "detail": "detail shot",
            "corner": "corner view",
            "closeup": "close up",
            "panoramic": "panoramic view"
        }
        
        for i, view in enumerate(views):
            desc = view_descriptions.get(view, view)
            url = FreeImageGenerationService.generate_interior_prompt(
                room_type=room_type,
                style=style,
                description=desc,
                seed=seed_base + i
            )
            results.append({
                "view": view,
                "url": url,
                "description": desc
            })
            
        return results
    
    @staticmethod
    def generate_material_texture(
        material_type: str,
        color: str,
        width: int = 512,
        height: int = 512
    ) -> str:
        """
        Generate seamless material texture
        
        Args:
            material_type: wood, marble, tile, fabric, carpet
            color: color description
            width: texture width
            height: texture height
            
        Returns:
            URL of generated texture
        """
        prompt = f"seamless {material_type} texture, {color}, high quality, tileable, 4k"
        
        import urllib.parse
        encoded_prompt = urllib.parse.quote(prompt)
        
        return (
            f"{FreeImageGenerationService.BASE_URL}/{encoded_prompt}?"
            f"width={width}&height={height}&nologo=true"
        )
    
    @staticmethod
    async def download_image(url: str) -> bytes:
        """Download image from URL"""
        async with httpx.AsyncClient() as client:
            response = await client.get(url, timeout=60.0)
            response.raise_for_status()
            return response.content
    
    @staticmethod
    def get_image_base64(image_bytes: bytes) -> str:
        """Convert image bytes to base64"""
        return base64.b64encode(image_bytes).decode('utf-8')


# Example prompts for different styles
STYLE_PROMPTS = {
    "modern": "modern minimalist interior, clean lines, neutral colors, contemporary furniture",
    "nordic": "scandinavian interior, light wood, white walls, cozy, hygge, natural light",
    "chinese": "chinese modern interior, traditional elements, red accents, wooden screens, elegant",
    "luxury": "luxury interior, marble, gold accents, velvet furniture, chandelier, high-end",
    "industrial": "industrial interior, exposed brick, metal pipes, concrete, loft style",
    "japanese": "japanese interior, tatami, sliding doors, zen, minimalist, natural materials",
}

# Example usage
if __name__ == "__main__":
    # Generate a modern living room
    url = FreeImageGenerationService.generate_interior_prompt(
        room_type="living room",
        style="modern minimalist",
        description="spacious, large windows"
    )
    print(f"Generated image URL: {url}")
    
    # Generate multiple views
    views = FreeImageGenerationService.generate_room_designs(
        room_type="bedroom",
        style="nordic",
        views=["overview", "detail", "corner"],
        seed_base=123
    )
    for v in views:
        print(f"{v['view']}: {v['url']}")