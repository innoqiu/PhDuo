import os
import json
from openai import AsyncOpenAI
from dotenv import load_dotenv
from typing import Dict, Any, AsyncGenerator

# Load environment variables
load_dotenv()

# Initialize OpenAI client
ZEABUR_API_KEY = os.getenv("ZEABUR_API_KEY")
ZEABUR_BASE_URL = os.getenv("ZEABUR_BASE_URL", "https://hnd1.aihub.zeabur.ai/v1")
aclient = AsyncOpenAI(api_key=ZEABUR_API_KEY, base_url=ZEABUR_BASE_URL)

async def extract_professor_profile(web_content: str) -> Dict[str, Any]:
    """
    Extract professor profile from website content using LLM
    """
    prompt = f"""
    你是一个数据提取助手。请根据以下网站内容提取教授的个人信息。
    输出必须是纯 JSON 格式，包含字段: name, university, research_interests, recent_publications.
    
    网站内容:
    {web_content[:15000]}
    """ 
    # 截取防止 token 溢出，或者使用支持长上下文的模型
    
    response = await aclient.chat.completions.create(
        model="gpt-4o",  # zeabur 
        messages=[{"role": "user", "content": prompt}],
        response_format={"type": "json_object"}
    )
    
    profile_json_str = response.choices[0].message.content
    profile_data = json.loads(profile_json_str)
    
    return profile_data

async def analyze_match_streaming(cv_text: str, professor_profile: Dict[str, Any]) -> AsyncGenerator[str, None]:
    """
    Analyze match between CV and professor profile with streaming response
    """
    prompt = f"""
    你是一个学术申请顾问。
    
    学生 CV 内容:
    {cv_text[:10000]}
    
    导师 Profile:
    {json.dumps(professor_profile, ensure_ascii=False)}
    
    请分析匹配度并给出套磁信建议。请按以下 Markdown 格式分块输出：
    ## 匹配度分析
    ...
    ## 优势与劣势
    ...
    ## 套磁信建议草稿
    ...
    """

    stream = await aclient.chat.completions.create(
        model="gpt-4o",
        messages=[{"role": "user", "content": prompt}],
        stream=True
    )
    
    async for chunk in stream:
        if chunk.choices[0].delta.content:
            yield chunk.choices[0].delta.content