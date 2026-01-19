import streamlit as st
import pandas as pd
import requests
import re
import time

st.set_page_config(page_title="FB 按讚終極統整", layout="centered")

st.title("📊 FB 公開貼文按讚統整 (自動修復版)")
st.write("程式會自動嘗試多種方式抓取數據。若失敗，建議更換最新的 Cookie。")

with st.sidebar:
    st.header("設定")
    fb_cookie = st.text_input("輸入 FB Cookie", value="", type="password")
    st.info("若部分連結失效，請重新取得瀏覽器最新的 c_user 與 xs。")

urls_input = st.text_area("請貼入 FB 連結 (每行一個):", height=200)

def fetch_content(url, cookie=None):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7',
    }
    if cookie:
        headers['Cookie'] = cookie
    
    try:
        # 使用 allow_redirects=True 確保處理 share/p 轉址
        response = requests.get(url.strip(), headers=headers, timeout=15, allow_redirects=True)
        return response.text
    except:
        return ""

def parse_likes(html):
    # 萬能匹配規則
    patterns = [
        r'"i18n_reaction_count":"([\d,.]+)"',
        r'"reaction_count":\{"count":(\d+)',
        r'total_count":(\d+)',
        r'(\d+)\s*個讚',
        r'(\d+)\s*人按讚',
        r'aria-label="([\d,.]+)\s*個讚"'
    ]
    for p in patterns:
        match = re.search(p, html)
        if match:
            res = match.group(1).replace(',', '')
            if '.' in res and 'K' in html: # 處理 1.2K 格式
                res = str(int(float(res) * 1000))
            return res
    return None

def get_fb_likes_smart(url, cookie):
    # 第一步：嘗試用 Cookie 抓取
    html = fetch_content(url, cookie)
    result = parse_likes(html)
    
    if result:
        return result
    
    # 第二步：如果帶 Cookie 失敗，檢查是否被擋，或是單純沒抓到
    if "login_form" in html or "checkpoint" in html or not result:
        # 嘗試「無痕模式」（不帶 Cookie）
        html_no_cookie = fetch_content(url, None)
        result_no_cookie = parse_likes(html_no_cookie)
        if result_no_cookie:
            return result_no_cookie
            
    return "無法讀取 (需檢查權限)"

if st.button("🚀 開始執行"):
    if urls_input:
        url_list = [u.strip() for u in urls_input.split('\n') if u.strip()]
        results = []
        bar = st.progress(0)
        
        for i, url in enumerate(url_list):
            count = get_fb_likes_smart(url, fb_cookie)
            results.append({"連結": url, "按讚數": count})
            bar.progress((i + 1) / len(url_list))
            time.sleep(2) 
            
        df = pd.DataFrame(results)
        st.table(df)
        st.download_button("📥 下載結果", data=df.to_csv(index=False).encode('utf-8-sig'), file_name="fb_stats.csv")
    else:
        st.warning("請輸入連結。")
