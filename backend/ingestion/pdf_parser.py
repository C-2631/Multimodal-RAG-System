import os
from typing import List, Dict, Any, Tuple
import fitz  # PyMuPDF
from backend.storage.object_store import object_store
from backend.ingestion.caption_generator import caption_generator
from backend.utils.logger import logger

class PDFParser:
    """Extracts text and embedded images from PDF documents."""

    def __init__(self, min_image_width: int = 80, min_image_height: int = 80):
        self.min_image_width = min_image_width
        self.min_image_height = min_image_height

    def parse(self, pdf_path: str) -> Tuple[List[Dict[str, Any]], List[Dict[str, Any]]]:
        """
        Parse a PDF file.
        Returns:
            pages_text: list of dicts [{'page_number': int, 'text': str}]
            extracted_images: list of dicts [{'page_number': int, 'image_path': str, 'image_url': str, 'caption': str, 'width': int, 'height': int}]
        """
        if not os.path.exists(pdf_path):
            raise FileNotFoundError(f"PDF file not found: {pdf_path}")

        doc = fitz.open(pdf_path)
        pages_text = []
        extracted_images = []

        logger.info(f"Parsing PDF '{pdf_path}' ({len(doc)} pages)...")

        for page_index in range(len(doc)):
            page_num = page_index + 1
            page = doc[page_index]

            # 1. Extract Text
            text = page.get_text()
            pages_text.append({
                "page_number": page_num,
                "text": text
            })

            # 2. Extract Embedded Images
            image_list = page.get_images(full=True)
            for img_idx, img_info in enumerate(image_list):
                xref = img_info[0]
                try:
                    base_image = doc.extract_image(xref)
                    if not base_image:
                        continue

                    img_bytes = base_image["image"]
                    img_ext = base_image["ext"]
                    width = base_image.get("width", 0)
                    height = base_image.get("height", 0)

                    # Filter out tiny icon or decorative line artifacts
                    if width < self.min_image_width or height < self.min_image_height:
                        continue

                    # Save image to storage
                    img_path, img_url = object_store.save_image(img_bytes, img_ext)

                    # Generate descriptive caption
                    caption = caption_generator.generate_caption(
                        image_path=img_path,
                        context=text
                    )

                    extracted_images.append({
                        "page_number": page_num,
                        "image_path": img_path,
                        "image_url": img_url,
                        "caption": caption,
                        "width": width,
                        "height": height
                    })
                    logger.info(f"Extracted image from page {page_num}: {width}x{height} -> {img_url}")
                except Exception as e:
                    logger.warning(f"Failed to extract image xref {xref} on page {page_num}: {e}")

        doc.close()
        logger.info(f"Finished parsing PDF: {len(pages_text)} pages, {len(extracted_images)} images extracted.")
        return pages_text, extracted_images

pdf_parser = PDFParser()
