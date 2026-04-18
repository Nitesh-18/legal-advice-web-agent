import io
import logging
import pdfplumber
import docx

logger = logging.getLogger(__name__)

class DocumentService:
    def extract_text_from_file(self, file_obj, filename: str) -> str:
        """Extracts text from a given PDF or DOCX file object."""
        try:
            if filename.lower().endswith('.pdf'):
                return self._extract_from_pdf(file_obj)
            elif filename.lower().endswith('.docx'):
                return self._extract_from_docx(file_obj)
            else:
                raise ValueError("Unsupported file format. Only PDF and DOCX are supported.")
        except Exception as e:
            logger.error(f"Error extracting text from {filename}: {e}")
            raise ValueError(f"Failed to extract text from {filename}: {str(e)}")

    def _extract_from_pdf(self, file_obj) -> str:
        text = ""
        with pdfplumber.open(file_obj) as pdf:
            for page in pdf.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
        return text

    def _extract_from_docx(self, file_obj) -> str:
        doc = docx.Document(file_obj)
        text = "\n".join([paragraph.text for paragraph in doc.paragraphs])
        return text

document_service = DocumentService()
