import streamlit as st
import pandas as pd
import requests
import re
import time

st.set_page_config(page_title="FB 進階抓取工具", layout="centered")

st.title("🛡️ FB 公開貼文按讚統整 (加強版)")
st.write("如果已填寫 Cookie 仍失敗，請確認 Cookie 格式是否包含 `c_user` 與 `xs`。")

# 側邊欄：Cookie 設定
with st.sidebar:
    st.header("設定")
    fb_cookie = st.text_input("輸入 FB Cookie", placeholder="c_user=...; xs=...", type="password")
    st.info("格式範例：c_user=12345678; xs=abcde12345;")

urls_input = st.text_area("請貼入 FB 連結 (每行一個):", height=200)

def get_fb_likes_ultimate(url, cookie):
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Cookie': cookie,
        'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7'
    }
    
    # 針對 share 連結做處理，確保能正確跳轉
    clean_url = url.strip()
    
    try:
        # 使用 requests.Session 維持連線狀態
        session = requests.Session()
        response = session.get(clean_url, headers=headers, timeout=15, allow_redirects=True)
        html_content = response.text
        
        # 偵測是否被引導到登入頁面
        if "login_form" in html_content and not cookie:
            return "需登入才能查看"

        # 策略 1：尋找 JSON 數據 (FB 常用於存放互動數的地方)
        # 尋找 reaction_count 或 total_count
        json_matches = re.findall(r'"reaction_count":\{"count":(\d+)', html_content)
        if json_matches:
            return json_matches[0]
            
        json_matches_alt = re.findall(r'"i18n_reaction_count":"([\d,]+)"', html_content)
        if json_matches_alt:
            return json_matches_alt[0].replace(',', '')

        # 策略 2：強大的正則表達式，掃描網頁文字
        # 包含：個讚、人按讚、reactions、likes
        patterns = [
            r'([\d,]+)\s*個讚',
            r'([\d,]+)\s*人按讚',
            r'([\d,]+)\s*位使用者',
            r'aria-label="([\d,]+)\s*個讚"',
            r'"total_count":(\d+)',
            r'reaction_count":(\d+)'
        ]
        
        for p in patterns:
            match = re.search(p, html_content)
            if match:
                res = match.group(1).replace(',', '') # 移除千分位逗號
                return res
        
        return "無法讀取 (建議檢查貼文權限)"
    except Exception as e:
        return f"連線錯誤"

if st.button("開始抓取"):
    if urls_input:
        url_list = [u.strip() for u in urls_input.split('\n') if u.strip()]
        results = []
        bar = st.progress(0)
        
        for i, url in enumerate(url_list):
            count = get_fb_likes_ultimate(url, fb_cookie)
            results.append({"連結": url, "按讚數": count})
            bar.progress((i + 1) / len(url_list))
            time.sleep(2) # 增加延遲避免被 FB 偵測
            
        df = pd.DataFrame(results)
        st.dataframe(df, use_container_width=True)
        st.download_button("📥 下載統計結果", data=df.to_csv(index=False).encode('utf-8-sig'), file_name="fb_likes.csv")
    else:
        st.warning("請先輸入連結。")
