import os
import shutil
import uuid
from typing import Tuple
from backend.config import settings
from backend.utils.logger import logger

class ObjectStore:
    """Local object storage service for documents and extracted images."""

    def __init__(self, base_dir: str = settings.UPLOAD_DIR):
        self.base_dir = os.path.abspath(base_dir)
        os.makedirs(self.base_dir, exist_ok=True)
        self.images_dir = os.path.join(self.base_dir, "images")
        os.makedirs(self.images_dir, exist_ok=True)

    def save_upload_file(self, file_content: bytes, original_filename: str) -> Tuple[str, str]:
        """
        Save an uploaded file to the storage directory.
        Returns: (file_path, unique_filename)
        """
        ext = os.path.splitext(original_filename)[1].lower()
        unique_name = f"{uuid.uuid4()}{ext}"
        destination = os.path.join(self.base_dir, unique_name)
        with open(destination, "wb") as f:
            f.write(file_content)
        logger.info(f"Saved uploaded file to {destination}")
        return destination, unique_name

    def save_image(self, image_bytes: bytes, ext: str = ".png") -> Tuple[str, str]:
        """
        Save an extracted or processed image.
        Returns: (image_path, relative_url)
        """
        if not ext.startswith("."):
            ext = f".{ext}"
        image_filename = f"img_{uuid.uuid4()}{ext}"
        image_path = os.path.join(self.images_dir, image_filename)
        with open(image_path, "wb") as f:
            f.write(image_bytes)
        relative_url = f"/static/uploads/images/{image_filename}"
        return image_path, relative_url

    def delete_file(self, file_path: str):
        """Remove a file from disk if it exists."""
        if file_path and os.path.exists(file_path):
            try:
                os.remove(file_path)
                logger.info(f"Removed file: {file_path}")
            except Exception as e:
                logger.warning(f"Could not remove file {file_path}: {e}")

object_store = ObjectStore()
