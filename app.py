import streamlit as st
import pandas as pd
import requests
import re
import time

st.set_page_config(page_title="FB 進階抓取工具", layout="centered")

st.title("🛡️ FB 公開貼文按讚統整 (進階版)")
st.write("若遇到『需登入』，請在下方貼入你的 Cookie 以提高成功率。")

# 側邊欄：Cookie 教學與輸入
with st.sidebar:
    st.header("設定")
    fb_cookie = st.text_input("輸入 FB Cookie (選填)", placeholder="c_user=...; xs=...", type="password")
    st.markdown("""
    **如何取得 Cookie?**
    1. 在電腦登入 FB。
    2. 按 F12 打開開發者工具。
    3. 點擊 **Application (應用程式)** -> **Cookies**。
    4. 找 `c_user` 和 `xs` 這兩項的值，格式如：`c_user=123; xs=456;`
    """)

urls_input = st.text_area("請貼入 FB 連結 (每行一個):", height=200)

def get_fb_likes_pro(url, cookie):
    headers = {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0.3 Mobile/15E148 Safari/104.1',
        'Cookie': cookie # 關鍵：帶上你的身分標記
    }
    
    clean_url = url.strip().replace("www.facebook.com", "m.facebook.com")
    
    try:
        response = requests.get(clean_url, headers=headers, timeout=10)
        html_content = response.text
        
        # 增加更多正則表達式，對應 FB 不同的顯示方式
        patterns = [
            r'(\d+)\s*個讚',
            r'(\d+)\s*人按讚',
            r'(\d+)\s*位使用者',
            r'(\d+)\s*次讚',
            r'reactions":\{"count":(\d+)',
            r'total_count":(\d+)'
        ]
        
        for p in patterns:
            match = re.search(p, html_content)
            if match:
                res = match.group(0)
                return re.sub(r'[^\d]', '', res) # 只留下數字
        
        return "無法讀取"
    except Exception as e:
        return f"錯誤: {str(e)}"

if st.button("開始抓取"):
    if urls_input:
        url_list = [u.strip() for u in urls_input.split('\n') if u.strip()]
        results = []
        bar = st.progress(0)
        
        for i, url in enumerate(url_list):
            count = get_fb_likes_pro(url, fb_cookie)
            results.append({"連結": url, "按讚數": count})
            bar.progress((i + 1) / len(url_list))
            time.sleep(1.5)
            
        df = pd.DataFrame(results)
        st.dataframe(df, use_container_width=True)
        st.download_button("📥 下載統計結果", data=df.to_csv(index=False).encode('utf-8-sig'), file_name="fb_likes.csv")
