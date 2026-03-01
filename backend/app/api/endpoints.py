from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from app.database import get_db
from app.services.crawler import get_professor_profile
from app.services.pdf_parser import extract_text_from_pdf
from app.services.llm_service import analyze_match_streaming

router = APIRouter()

@router.post("/analyze")
async def analyze_match(
    cv: UploadFile = File(...),
    url: str = Form(...),
    db: Session = Depends(get_db)
):
    """
    Analyze match between student CV and professor profile
    """
    # 1. 处理输入
    cv_content = await cv.read()
    cv_text = extract_text_from_pdf(cv_content)
    
    # 2. 获取导师 Profile (自动处理 DB 检索或爬取)
    professor_profile = await get_professor_profile(url, db)
    
    # 3. 第二轮 LLM: 分析匹配度 (流式输出)
    async def stream_generator():
        async for chunk in analyze_match_streaming(cv_text, professor_profile):
            yield chunk

    return StreamingResponse(stream_generator(), media_type="text/plain")