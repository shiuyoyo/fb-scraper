import streamlit as st
import pandas as pd
import requests
import re
import time

st.set_page_config(page_title="FB 按讚統計工具", layout="centered")

st.title("📊 FB 公開貼文按讚統計 (搜尋引擎偽裝版)")
st.info("此版本模擬 Google 爬蟲行為，嘗試繞過 FB 的登入擋牆。")

urls_input = st.text_area("請貼入 FB 連結 (每行一個):", height=200)

def get_fb_likes_bot_mode(url):
    # 偽裝成 Googlebot 的 Header
    headers = {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7',
    }
    
    # 強制使用 www 版，因為 m 版對爬蟲較不友善
    clean_url = url.strip().replace("m.facebook.com", "www.facebook.com")
    
    try:
        response = requests.get(clean_url, headers=headers, timeout=15, allow_redirects=True)
        html = response.text

        # 搜尋所有可能的數字格式
        # 1. 搜尋 JSON 資料中的 i18n_reaction_count
        json_match = re.search(r'"i18n_reaction_count":"([\d,.]+)"', html)
        if json_match:
            return json_match.group(1).replace(',', '')

        # 2. 搜尋網頁文字中的「X 個讚」
        text_match = re.search(r'([\d,.]+)\s*個讚', html)
        if text_match:
            return text_match.group(1).replace(',', '')

        # 3. 搜尋行動版備用標籤
        m_response = requests.get(clean_url.replace("www.", "m."), headers=headers, timeout=15)
        m_match = re.search(r'(\d+)\s*(人按讚|個讚|reactions)', m_response.text)
        if m_match:
            return m_match.group(1)

        return "無法解析 (FB 已封鎖此請求)"
    except Exception as e:
        return f"連線錯誤"

if st.button("🚀 開始統計"):
    if urls_input:
        url_list = [u.strip() for u in urls_input.split('\n') if u.strip()]
        results = []
        bar = st.progress(0)
        
        for i, url in enumerate(url_list):
            count = get_fb_likes_bot_mode(url)
            results.append({"連結": url, "按讚數": count})
            bar.progress((i + 1) / len(url_list))
            time.sleep(3) # 增加延遲，減少被封鎖機率
            
        df = pd.DataFrame(results)
        st.table(df)
        st.download_button("📥 下載結果", data=df.to_csv(index=False).encode('utf-8-sig'), file_name="fb_stats.csv")
    else:
        st.warning("請輸入連結。")
