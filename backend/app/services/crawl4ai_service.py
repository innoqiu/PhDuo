"""
Crawl4AI service for crawling professor websites.
Replaces Firecrawl with Crawl4AI for better maintainability and control.
"""

import re
from typing import List, Any
from urllib.parse import urlparse

# Updated imports for v0.8.0
from crawl4ai import AsyncWebCrawler, BrowserConfig, CrawlerRunConfig
from crawl4ai.deep_crawling import BFSDeepCrawlStrategy
from crawl4ai.deep_crawling.filters import FilterChain, URLPatternFilter


async def crawl_professor_website(root_url: str) -> str:
    """
    Crawl a professor's website using Crawl4AI with multi-page support.
    
    Args:
        root_url: The root URL of the professor's website (e.g., https://example.com)
        
    Returns:
        Combined markdown content from all crawled pages
        
    Raises:
        Exception: If crawling fails
    """
    try:
        # Parse the root URL to ensure we have the base domain
        parsed = urlparse(root_url)
        base_url = f"{parsed.scheme}://{parsed.netloc}"
        
        # 1. Setup URL filtering to stay within the domain
        url_filter = URLPatternFilter(patterns=[f"{base_url}/*"])
        
        # 2. Configure the deep crawl strategy
        deep_crawl = BFSDeepCrawlStrategy(
            max_depth=2,
            max_pages=10,
            filter_chain=FilterChain([url_filter])
        )
        
        # 3. Use BrowserConfig (Best practice in 0.8.0)
        browser_config = BrowserConfig(headless=True, verbose=True)
        
        # 4. Configure crawling run 
        run_config = CrawlerRunConfig(
            deep_crawl_strategy=deep_crawl,
            wait_until="networkidle",  # Fixed: wait_until instead of wait_for
            word_count_threshold=10,
        )
        
        print(f"Starting Crawl4AI crawl for {root_url}...")
        
        # Create crawler instance
        async with AsyncWebCrawler(config=browser_config) as crawler:
            # 5. Execute crawl (Returns a List of CrawlResult objects)
            results = await crawler.arun(
                url=root_url,
                config=run_config
            )
            
            # Ensure we are dealing with a list
            if not isinstance(results, list):
                results = [results]
                
            # Filter out failed page crawls
            successful_results = [r for r in results if r.success]
            
            if not successful_results:
                raise Exception("Crawling failed: All pages returned an error or no content was found.")
            
            # Extract markdown content from all successfully crawled pages
            web_content = clean_crawl4ai_data(successful_results)
            
            print(f"Crawl4AI crawl completed. Extracted {len(web_content)} characters from {len(successful_results)} pages.")
            
            return web_content
            
    except Exception as e:
        raise Exception(f"Crawling failed: {str(e)}")


def clean_crawl4ai_data(results: List[Any]) -> str:
    """
    Clean and combine markdown content from Crawl4AI crawl results.
    
    Args:
        results: List of CrawlResult objects from Crawl4AI
        
    Returns:
        Combined and cleaned markdown text from all pages
    """
    cleaned_parts = []
    
    # Process each page result
    for node in results:
        source_url = getattr(node, 'url', 'Unknown Page')
        markdown_text = ""
        
        # 6. Safely extract markdown (In 0.8.0, node.markdown is often an object)
        if hasattr(node, 'markdown') and node.markdown:
            if hasattr(node.markdown, 'raw_markdown') and node.markdown.raw_markdown:
                markdown_text = node.markdown.raw_markdown
            elif hasattr(node.markdown, 'fit_markdown') and node.markdown.fit_markdown:
                markdown_text = node.markdown.fit_markdown
            elif isinstance(node.markdown, str):
                markdown_text = node.markdown
                
        # Fallbacks just in case
        if not markdown_text and hasattr(node, 'extracted_content') and node.extracted_content:
            markdown_text = node.extracted_content
            
        if not markdown_text:
            continue
        
        # Clean the markdown text
        cleaned_text = clean_markdown_text(markdown_text)
        
        if cleaned_text:
            # Build section with source URL
            section = f"--- Source: {source_url} ---\n{cleaned_text.strip()}"
            cleaned_parts.append(section)
    
    # Combine all pages
    full_content = "\n\n".join(cleaned_parts)
    
    # Final cleanup: remove leading/trailing whitespace
    return full_content.strip()


def clean_markdown_text(markdown_text: str) -> str:
    """
    Clean markdown text by removing unnecessary elements.
    
    Args:
        markdown_text: Raw markdown text
        
    Returns:
        Cleaned markdown text
    """
    if not markdown_text:
        return ""
    
    # 1. Remove image links (![alt text](url)) but keep regular links
    markdown_text = re.sub(r'!\[.*?\]\(.*?\)', '', markdown_text)
    
    # 2. Remove excessive blank lines (more than 3 newlines become 2)
    markdown_text = re.sub(r'\n{3,}', '\n\n', markdown_text)
    
    # 3. Remove copyright notices
    markdown_text = re.sub(r'(?i)copyright ©.*', '', markdown_text)
    
    # 4. Remove common navigation/footer text patterns
    markdown_text = re.sub(r'(?i)(home|about|contact|privacy policy|terms of service).*', '', markdown_text)
    
    return markdown_text.strip()


async def main():
    """
    Test main function to test the crawl_professor_website function.
    Modify the URL variable below to test with different websites.
    """
    # Input URL - modify this to test with different professor websites
    test_url = "https://imyueli.github.io/"  # Replace with actual professor website URL
    
    print("=" * 80)
    print("Crawl4AI Service Test")
    print("=" * 80)
    print(f"Testing URL: {test_url}")
    print("=" * 80)
    print()
    
    try:
        # Run the crawl
        result = await crawl_professor_website(test_url)
        
        print()
        print("=" * 80)
        print("CRAWL RESULT (Final content that will be given to AI):")
        print("=" * 80)
        print(result)
        print("=" * 80)
        print()
        print(f"Total characters: {len(result)}")
        print(f"Total lines: {len(result.splitlines())}")
        
    except Exception as e:
        print()
        print("=" * 80)
        print("ERROR:")
        print("=" * 80)
        print(f"Failed to crawl: {str(e)}")
        print("=" * 80)
        import traceback
        traceback.print_exc()


if __name__ == "__main__":
    import asyncio
    # Run the async main function
    asyncio.run(main())