import io
import pypdf

def extract_text_from_pdf(file_content: bytes) -> str:
    """
    Extract text content from PDF file
    """
    try:
        pdf_reader = pypdf.PdfReader(io.BytesIO(file_content))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text() or ""
        return text
    except Exception as e:
        raise Exception(f"Error extracting text from PDF: {str(e)}")