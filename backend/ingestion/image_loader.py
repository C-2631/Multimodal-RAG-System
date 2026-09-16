import os
from typing import Dict, Any
from backend.storage.object_store import object_store
from backend.ingestion.caption_generator import caption_generator
from backend.utils.image_utils import load_image_to_pil, get_image_info
from backend.utils.logger import logger

class ImageLoader:
    """Loads and processes standalone image uploads."""

    def process_standalone_image(self, file_path: str, original_filename: str) -> Dict[str, Any]:
        """Process an uploaded standalone image file."""
        if not os.path.exists(file_path):
            raise FileNotFoundError(f"Image not found at {file_path}")

        pil_img = load_image_to_pil(file_path)
        width, height = get_image_info(pil_img)

        # Generate relative URL for static hosting
        relative_url = f"/static/uploads/{os.path.basename(file_path)}"

        # Generate natural language caption
        caption = caption_generator.generate_caption(
            image_path=file_path,
            context=f"Standalone uploaded image: {original_filename}"
        )

        return {
            "page_number": 1,
            "image_path": file_path,
            "image_url": relative_url,
            "caption": caption,
            "width": width,
            "height": height
        }

image_loader = ImageLoader()
