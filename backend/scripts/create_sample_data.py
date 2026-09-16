import os
import io
import fitz  # PyMuPDF
from PIL import Image, ImageDraw, ImageFont

def create_sample_files():
    sample_dir = os.path.abspath("./data/sample_docs")
    sample_images_dir = os.path.abspath("./data/sample_images")
    os.makedirs(sample_dir, exist_ok=True)
    os.makedirs(sample_images_dir, exist_ok=True)

    # 1. Create a sample architecture diagram image
    img = Image.new("RGB", (600, 350), color=(240, 244, 248))
    draw = ImageDraw.Draw(img)

    # Draw diagram boxes
    draw.rectangle([50, 80, 220, 160], fill=(79, 70, 229), outline=(49, 46, 129), width=2)
    draw.text((70, 110), "CLIP Text Encoder\n(Transformer)", fill=(255, 255, 255))

    draw.rectangle([50, 190, 220, 270], fill=(16, 185, 129), outline=(6, 95, 70), width=2)
    draw.text((70, 220), "CLIP Vision Encoder\n(Vision Transformer)", fill=(255, 255, 255))

    # Shared vector space box
    draw.rectangle([350, 120, 530, 230], fill=(245, 158, 11), outline=(180, 83, 9), width=2)
    draw.text((370, 160), "Shared 512-dim\nVector Space", fill=(255, 255, 255))

    # Connectors
    draw.line([220, 120, 350, 160], fill=(100, 116, 139), width=3)
    draw.line([220, 230, 350, 190], fill=(100, 116, 139), width=3)

    img_path = os.path.join(sample_images_dir, "clip_multimodal_architecture.png")
    img.save(img_path)
    print(f"Created sample image: {img_path}")

    # 2. Create sample PDF document embedding text and the diagram
    doc = fitz.open()

    # Page 1: Overview
    page1 = doc.new_page()
    page1.insert_text(
        (50, 70),
        "Multimodal Retrieval-Augmented Generation (RAG)\n"
        "Technical Whitepaper — System Design and Embeddings\n\n"
        "Abstract:\n"
        "Retrieval-Augmented Generation has revolutionized knowledge-grounded AI.\n"
        "While standard RAG processes only textual documents, modern enterprise documents\n"
        "are rich in visual information including diagrams, charts, architectural schematics,\n"
        "and photographs. This whitepaper details our multimodal RAG pipeline.\n\n"
        "Section 1: The Core Mechanism of CLIP\n"
        "Contrastive Language-Image Pretraining (CLIP) maps both text sequences and pixel arrays\n"
        "into a common 512-dimensional vector space. By optimizing contrastive loss across hundreds\n"
        "of millions of image-text pairs, text descriptions and corresponding visual concepts\n"
        "converge to high cosine similarity in embedding space.",
        fontsize=12
    )

    # Page 2: Architecture with embedded diagram
    page2 = doc.new_page()
    page2.insert_text(
        (50, 70),
        "Section 2: System Architecture & Vector Indexing\n\n"
        "The diagram below illustrates how text chunks and visual features are encoded\n"
        "into the unified vector store powered by Qdrant:\n\n"
        "Figure 1: Dual-Encoder Alignment in Multimodal RAG\n",
        fontsize=12
    )

    # Insert the diagram image into Page 2
    img_rect = fitz.Rect(50, 160, 500, 420)
    page2.insert_image(img_rect, filename=img_path)

    page2.insert_text(
        (50, 460),
        "Notice that regardless of whether a query originates as a prompt string\n"
        "or an uploaded screenshot, the vector retriever navigates the exact same index.\n"
        "The top-K nearest neighbors are retrieved and supplied directly to the LLM generator.",
        fontsize=11
    )

    pdf_path = os.path.join(sample_dir, "multimodal_rag_whitepaper.pdf")
    doc.save(pdf_path)
    doc.close()
    print(f"Created sample PDF: {pdf_path}")

if __name__ == "__main__":
    create_sample_files()
