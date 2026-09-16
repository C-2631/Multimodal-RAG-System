import io
import base64
from typing import Union, Tuple
from PIL import Image
from backend.utils.logger import logger

def load_image_to_pil(source: Union[str, bytes, io.BytesIO]) -> Image.Image:
    """Load an image from path, raw bytes, or BytesIO buffer into a PIL RGB Image."""
    if isinstance(source, str):
        img = Image.open(source)
    elif isinstance(source, (bytes, bytearray)):
        img = Image.open(io.BytesIO(source))
    elif isinstance(source, io.BytesIO):
        img = Image.open(source)
    else:
        raise ValueError(f"Unsupported image source type: {type(source)}")

    return img.convert("RGB")

def base64_to_pil(base64_str: str) -> Image.Image:
    """Decode a base64 string (with or without data URL prefix) into a PIL RGB Image."""
    if "," in base64_str:
        base64_str = base64_str.split(",", 1)[1]
    image_bytes = base64.b64decode(base64_str)
    return load_image_to_pil(image_bytes)

def pil_to_base64(image: Image.Image, format: str = "PNG") -> str:
    """Encode a PIL Image to a base64 data URL string."""
    buffer = io.BytesIO()
    image.save(buffer, format=format)
    b64 = base64.b64encode(buffer.getvalue()).decode("utf-8")
    return f"data:image/{format.lower()};base64,{b64}"

def get_image_info(image: Image.Image) -> Tuple[int, int]:
    """Return (width, height) for a PIL Image."""
    return image.width, image.height
