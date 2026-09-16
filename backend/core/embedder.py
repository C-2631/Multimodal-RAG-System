from typing import List, Union, Optional
import torch
import torch.nn.functional as F
from transformers import CLIPProcessor, CLIPModel
from PIL import Image

from backend.config import settings
from backend.utils.logger import logger
from backend.utils.image_utils import load_image_to_pil

class ClipEmbedder:
    """Embeds text and images into a shared 512-dimensional vector space using CLIP."""

    def __init__(self, model_name: str = settings.CLIP_MODEL_NAME, device: Optional[str] = None):
        self.model_name = model_name
        self.device = device or ("cuda" if torch.cuda.is_available() else "cpu")
        self._model = None
        self._processor = None

    def load_model(self):
        """Lazy loader for CLIP model and processor."""
        if self._model is None or self._processor is None:
            logger.info(f"Loading CLIP model '{self.model_name}' on device '{self.device}'...")
            self._processor = CLIPProcessor.from_pretrained(self.model_name)
            self._model = CLIPModel.from_pretrained(self.model_name).to(self.device)
            self._model.eval()
            logger.info("CLIP model loaded successfully.")

    @property
    def model(self) -> CLIPModel:
        if self._model is None:
            self.load_model()
        return self._model

    @property
    def processor(self) -> CLIPProcessor:
        if self._processor is None:
            self.load_model()
        return self._processor

    @torch.no_grad()
    def embed_text(self, text: str) -> List[float]:
        """Generate a normalized 512-dim embedding for a single text query."""
        return self.batch_embed_text([text])[0]

    @torch.no_grad()
    def batch_embed_text(self, texts: List[str], batch_size: int = 32) -> List[List[float]]:
        """Generate normalized 512-dim embeddings for a list of text chunks."""
        if not texts:
            return []

        all_embeddings = []
        for i in range(0, len(texts), batch_size):
            batch = texts[i : i + batch_size]
            inputs = self.processor(
                text=batch,
                return_tensors="pt",
                padding=True,
                truncation=True,
                max_length=77  # CLIP standard context length
            ).to(self.device)

            text_output = self.model.get_text_features(**inputs)
            if hasattr(text_output, "pooler_output") and text_output.pooler_output is not None:
                text_features = text_output.pooler_output
            elif hasattr(text_output, "text_embeds") and text_output.text_embeds is not None:
                text_features = text_output.text_embeds
            else:
                text_features = text_output

            # Normalize embeddings to unit length for cosine similarity
            normalized_features = F.normalize(text_features, p=2, dim=-1)
            all_embeddings.extend(normalized_features.cpu().numpy().tolist())

        return all_embeddings

    @torch.no_grad()
    def embed_image(self, image: Union[Image.Image, str, bytes]) -> List[float]:
        """Generate a normalized 512-dim embedding for a single image."""
        return self.batch_embed_images([image])[0]

    @torch.no_grad()
    def batch_embed_images(self, images: List[Union[Image.Image, str, bytes]], batch_size: int = 32) -> List[List[float]]:
        """Generate normalized 512-dim embeddings for a batch of images."""
        if not images:
            return []

        pil_images = [
            img if isinstance(img, Image.Image) else load_image_to_pil(img)
            for img in images
        ]

        all_embeddings = []
        for i in range(0, len(pil_images), batch_size):
            batch = pil_images[i : i + batch_size]
            inputs = self.processor(
                images=batch,
                return_tensors="pt"
            ).to(self.device)

            img_output = self.model.get_image_features(**inputs)
            if hasattr(img_output, "pooler_output") and img_output.pooler_output is not None:
                image_features = img_output.pooler_output
            elif hasattr(img_output, "image_embeds") and img_output.image_embeds is not None:
                image_features = img_output.image_embeds
            else:
                image_features = img_output

            normalized_features = F.normalize(image_features, p=2, dim=-1)
            all_embeddings.extend(normalized_features.cpu().numpy().tolist())

        return all_embeddings

embedder = ClipEmbedder()
