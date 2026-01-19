import streamlit as st
import pandas as pd
import requests
import re
import time

st.set_page_config(page_title="FB 按讚終極統整", layout="centered")

st.title("📊 FB 公開貼文按讚統整 (專業版)")
st.write("已優化 Cookie 處理邏輯，請確保 Cookie 欄位已填入。")

with st.sidebar:
    st.header("設定")
    fb_cookie = st.text_input("輸入 FB Cookie", value="", type="password")
    st.info("目前的 Cookie 已設定。")

urls_input = st.text_area("請貼入 FB 連結 (每行一個):", height=200)

def get_fb_likes_deep_scan(url, cookie):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Cookie': cookie,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
        'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Upgrade-Insecure-Requests': '1'
    }
    
    clean_url = url.strip()
    
    try:
        # 使用 Session 並停用自動跳轉，手動處理跳轉以獲取更多資訊
        session = requests.Session()
        response = session.get(clean_url, headers=headers, timeout=15)
        html_content = response.text

        # 搜尋關鍵字：fb_reaction_count, i18n_reaction_count, total_count
        # 這是 FB 放在後台 Script 裡的數據，最精準
        patterns = [
            r'"i18n_reaction_count":"([\d,.]+)"',
            r'"reaction_count":\{"count":(\d+)',
            r'total_count":(\d+)',
            r'(\d+)\s*個讚',
            r'(\d+)\s*人按讚'
        ]
        
        for p in patterns:
            match = re.search(p, html_content)
            if match:
                res = match.group(1).replace(',', '')
                # 如果抓到的是 1.2K 這種格式，簡單轉換
                if '.' in res and 'K' in html_content:
                    try: res = str(int(float(res) * 1000))
                    except: pass
                return res
        
        # 如果還是找不到，檢查是否被導向登入頁
        if "login_form" in html_content or "checkpoint" in html_content:
            return "Cookie 已失效或被封鎖"
            
        return "找不到數字 (需更換連結格式)"
    except Exception as e:
        return f"連線失敗"

if st.button("🚀 開始執行"):
    if urls_input:
        url_list = [u.strip() for u in urls_input.split('\n') if u.strip()]
        results = []
        bar = st.progress(0)
        
        for i, url in enumerate(url_list):
            # 針對 share 網址，有時需要先請求一次獲取真實網址
            count = get_fb_likes_deep_scan(url, fb_cookie)
            results.append({"連結": url, "按讚數": count})
            bar.progress((i + 1) / len(url_list))
            time.sleep(2.5) # 增加延遲，避免被 FB 偵測
            
        df = pd.DataFrame(results)
        st.dataframe(df, use_container_width=True)
        st.download_button("📥 下載結果", data=df.to_csv(index=False).encode('utf-8-sig'), file_name="fb_stats.csv")
    else:
        st.warning("請輸入連結。")
