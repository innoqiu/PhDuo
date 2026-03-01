import os
from urllib.parse import urlparse
from sqlalchemy.orm import Session
from firecrawl import FirecrawlApp
from dotenv import load_dotenv
from fastapi import HTTPException

from app.models import Professor
from app.services.llm_service import extract_professor_profile

# Load environment variables
load_dotenv()

# Initialize Firecrawl client
FIRECRAWL_API_KEY = os.getenv("FIRECRAWL_API_KEY")
firecrawl_app = FirecrawlApp(api_url="http://localhost:3002",
    api_key="fc-YOUR_API_KEY")

def clean_url(url: str) -> str:
    """
    将 https://imyueli.github.io/projects.html 整理为 https://imyueli.github.io
    """
    parsed = urlparse(url)
    return f"{parsed.scheme}://{parsed.netloc}"

async def crawl_website(root_url: str) -> str:
    """
    Crawl website and return markdown content
    """
    try:
        crawl_result = firecrawl_app.crawl_url(
            url=root_url, 
            params={"limit": 10, "scrapeOptions": {"formats": ["markdown"]}}
        )
        # 假设 crawl_result 返回的是对象或字典，提取 Markdown 内容
        # 注意：Firecrawl API 返回结构需根据实际 SDK 调整，这里假设抓取所有 markdown 拼接
        web_content = "\n".join([item.get('markdown', '') for item in crawl_result.get('data', [])])
        return web_content
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Crawling failed: {str(e)}")

async def get_professor_profile(url: str, db: Session):
    """
    检查数据库，如果不存在则爬取并生成 Profile
    """
    root_url = clean_url(url)
    
    # Check if professor already exists in database
    prof = db.query(Professor).filter(Professor.root_url == root_url).first()
    
    if prof:
        print(f"Database hit for {root_url}")
        return prof.profile_data

    print(f"Crawling new data for {root_url}")
    
    # Crawl website content
    web_content = await crawl_website(root_url)
    
    # Extract profile using LLM
    profile_data = await extract_professor_profile(web_content)
    
    # Store in database
    new_prof = Professor(
        root_url=root_url,
        name=profile_data.get("name", "Unknown"),
        university=profile_data.get("university", "Unknown"),
        profile_data=profile_data
    )
    db.add(new_prof)
    db.commit()
    db.refresh(new_prof)
    
    return profile_data