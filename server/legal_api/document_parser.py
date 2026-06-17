import base64
import os

import fitz
from docx import Document
import google.generativeai as genai


def parse_pdf(file_path: str) -> str:
    text_parts = []
    with fitz.open(file_path) as pdf_document:
        for page in pdf_document:
            text_parts.append(page.get_text())
    return "\n".join(text_parts)


def parse_docx(file_path: str) -> str:
    document = Document(file_path)
    return "\n".join(paragraph.text for paragraph in document.paragraphs)


def parse_txt(file_path: str) -> str:
    with open(file_path, "r", encoding="utf-8") as handle:
        return handle.read()


def parse_image_file(file_path: str) -> str:
    api_key = os.environ.get("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError("GOOGLE_API_KEY is not configured")

    genai.configure(api_key=api_key)
    with open(file_path, "rb") as handle:
        image_bytes = handle.read()

    encoded_image = base64.b64encode(image_bytes)
    mime_type = "image/png"
    lower_path = file_path.lower()
    if lower_path.endswith(".jpg") or lower_path.endswith(".jpeg"):
        mime_type = "image/jpeg"

    model = genai.GenerativeModel("gemini-2.5-flash")
    response = model.generate_content(
        [
            "Extract all visible text and legal content from this document image. Return only the extracted text.",
            {
                "mime_type": mime_type,
                "data": base64.b64decode(encoded_image),
            },
        ]
    )
    return getattr(response, "text", "") or ""


def parse_document(file_path: str, original_filename: str) -> str:
    extension = os.path.splitext(original_filename.lower())[1]

    if extension == ".pdf":
        extracted_text = parse_pdf(file_path)
    elif extension == ".docx":
        extracted_text = parse_docx(file_path)
    elif extension == ".txt":
        extracted_text = parse_txt(file_path)
    elif extension in {".png", ".jpg", ".jpeg"}:
        extracted_text = parse_image_file(file_path)
    else:
        raise ValueError(f"Unsupported file type: {extension}")

    if not extracted_text or not extracted_text.strip():
        raise ValueError("Could not extract text from document")

    return extracted_text
