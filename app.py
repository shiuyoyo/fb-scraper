import streamlit as st
import pandas as pd
import requests
import re
import time

# 網頁設定
st.set_page_config(page_title="FB 輕量化按讚抓取工具", layout="centered")

st.title("🚀 FB 公開貼文按讚統整 (輕量版)")
st.info("此版本不使用瀏覽器模擬，執行速度快且穩定。僅能讀取『完全公開』的貼文數據。")

# 輸入區
urls_input = st.text_area("請貼入 Facebook 連結 (每行一個):", height=200, placeholder="https://www.facebook.com/share/p/...")

# 抓取函數
def get_fb_likes_lightweight(url):
    # 模擬 iPhone 瀏覽器以獲取移動版網頁內容
    headers = {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/104.1',
        'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7'
    }
    
    # 強制轉為移動版網址
    m_url = url.replace("www.facebook.com", "m.facebook.com").replace("facebook.com", "m.facebook.com")
    
    try:
        response = requests.get(m_url, headers=headers, timeout=10)
        if response.status_code != 200:
            return "連結無法存取"
        
        # 取得 HTML 文本
        html_content = response.text
        
        # 策略 1: 尋找 "X 個讚" 或 "X 位使用者" (針對中文介面)
        patterns = [
            r'(\d+)\s*個讚',
            r'(\d+)\s*人按讚',
            r'(\d+)\s*位使用者',
            r'(\d+)\s*次讚',
            r'(\d+,?\d*)\s*reactions', # 英文版
            r'aria-label="(\d+)\s*個讚"', # 隱藏在標籤中的
        ]
        
        for p in patterns:
            match = re.search(p, html_content)
            if match:
                return match.group(0)
        
        return "找不到數字 (可能是私人貼文)"
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
            time.sleep(1) # 稍微禮貌性延遲
            
        st.success("全部處理完畢！")
        df = pd.DataFrame(results)
        st.table(df) # 直接在網頁顯示表格
        
        # 下載 Excel/CSV
        csv = df.to_csv(index=False).encode('utf-8-sig')
        st.download_button("📥 下載統計結果", data=csv, file_name="fb_likes.csv", mime="text/csv")
    else:
        st.warning("請先輸入連結。")
