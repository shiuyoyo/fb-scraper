import streamlit as st
import pandas as pd
import requests
import re
import time

# 網頁設定
st.set_page_config(page_title="FB 輕量化按讚抓取工具", layout="centered")

st.title("🚀 FB 公開貼文按讚統整 (輕量版)")
st.info("此版本修復了網址解析錯誤，請確保輸入的連結是公開貼文。")

# 輸入區
urls_input = st.text_area("請貼入 Facebook 連結 (每行一個):", height=200, placeholder="https://www.facebook.com/share/p/...")

# 抓取函數
def get_fb_likes_lightweight(url):
    headers = {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/104.1',
        'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7'
    }
    
    # 修正處：精準轉換網址，避免出現 m.m.facebook.com
    clean_url = url.strip()
    if "www.facebook.com" in clean_url:
        m_url = clean_url.replace("www.facebook.com", "m.facebook.com")
    elif "facebook.com" in clean_url and "m.facebook.com" not in clean_url:
        m_url = clean_url.replace("facebook.com", "m.facebook.com")
    else:
        m_url = clean_url
    
    try:
        # 增加 allow_redirects=True 處理 FB 的轉址
        response = requests.get(m_url, headers=headers, timeout=10, allow_redirects=True)
        if response.status_code != 200:
            return f"存取失敗 (Code: {response.status_code})"
        
        html_content = response.text
        
        # 策略 1: 尋找包含數字的讚數樣式
        # 加入更多可能的比對樣式
        patterns = [
            r'(\d+)\s*個讚',
            r'(\d+)\s*人按讚',
            r'(\d+)\s*位使用者',
            r'(\d+)\s*次讚',
            r'>(\d+)\s*<', # 找尋被標籤包夾的純數字
            r'reactions":\{"count":(\d+)', # 找尋 JSON 結構中的數字
        ]
        
        for p in patterns:
            match = re.search(p, html_content)
            if match:
                # 只回傳匹配到的數字部分，讓表格更乾淨
                found = match.group(0)
                # 過濾掉 HTML 標籤
                return re.sub('<[^<]+?>', '', found)
        
        return "找不到數字 (需登入或私人貼文)"
    except Exception as e:
        return f"錯誤: {str(e)}"

# 按鈕動作
if st.button("開始統整"):
    if urls_input:
        url_list = [u.strip() for u in urls_input.split('\n') if u.strip()]
        results = []
        
        progress_text = st.empty()
        bar = st.progress(0)
        
        for i, url in enumerate(url_list):
            progress_text.text(f"正在處理第 {i+1}/{len(url_list)} 個連結...")
            count = get_fb_likes_lightweight(url)
            results.append({"連結": url, "抓取結果": count})
            bar.progress((i + 1) / len(url_list))
            time.sleep(1.5) # 稍微增加延遲避免被封鎖
            
        st.success("全部處理完畢！")
        df = pd.DataFrame(results)
        st.dataframe(df, use_container_width=True) 
        
        # 下載 Excel/CSV
        csv = df.to_csv(index=False).encode('utf-8-sig')
        st.download_button("📥 下載統計結果 (CSV)", data=csv, file_name="fb_likes.csv", mime="text/csv")
    else:
        st.warning("請先輸入連結。")
