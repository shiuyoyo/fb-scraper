import streamlit as st
import pandas as pd
import requests
import re
import time

st.set_page_config(page_title="FB 按讚統計工具", layout="centered")

st.title("📊 FB 公開貼文按讚統計 (終極優化版)")
st.info("若持續失敗，請嘗試更換『最新的 Cookie』或確認貼文是否設為『公開』。")

with st.sidebar:
    st.header("設定")
    fb_cookie = st.text_input("輸入 FB Cookie (選填)", value="", type="password")
    st.markdown("---")
    st.write("💡 **成功關鍵：**")
    st.write("1. 確保連結在無痕視窗可看見數字。")
    st.write("2. 更新 2026 年最新的 Cookie。")

urls_input = st.text_area("請貼入 FB 連結 (每行一個):", height=200)

def get_fb_data(url, cookie):
    # 模擬 iPhone 瀏覽器指紋
    headers = {
        'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7',
        'Cache-Control': 'max-age=0',
        'Connection': 'keep-alive',
    }
    if cookie:
        headers['Cookie'] = cookie
    
    # 強制轉換網址格式，並處理 share 轉址
    clean_url = url.strip().replace("www.facebook.com", "m.facebook.com")
    
    try:
        session = requests.Session()
        # 第一次請求處理轉址
        response = session.get(clean_url, headers=headers, timeout=15, allow_redirects=True)
        html = response.text

        # 搜尋規則清單 (優先搜尋 JSON 數據，再找 HTML 標籤)
        regex_list = [
            r'"i18n_reaction_count":"([\d,.]+)"',
            r'"reaction_count":\{"count":(\d+)',
            r'total_count":(\d+)',
            r'reaction_count=(\d+)',
            r'([\d,.]+)\s*個讚',
            r'([\d,.]+)\s*人按讚',
            r'aria-label="([\d,.]+)\s*個讚"'
        ]
        
        for pattern in regex_list:
            match = re.search(pattern, html)
            if match:
                res = match.group(1).replace(',', '')
                # 處理 K/M 單位
                if '.' in res and ('K' in html or '千' in html):
                    res = str(int(float(res) * 1000))
                return res
        
        # 檢查是否有被擋下的字樣
        if "login_form" in html or "checkpoint" in html:
            return "被 FB 要求登入"
        
        return "無法解析內容"
    except:
        return "連線超時"

if st.button("🚀 開始抓取數據"):
    if urls_input:
        url_list = [u.strip() for u in urls_input.split('\n') if u.strip()]
        results = []
        bar = st.progress(0)
        
        for i, url in enumerate(url_list):
            # 優先嘗試帶 Cookie 抓取，若失敗或未填，則不帶 Cookie 嘗試
            res_val = get_fb_data(url, fb_cookie)
            
            # 如果帶 Cookie 被要求登入，嘗試不帶 Cookie 的純匿名存取
            if res_val == "被 FB 要求登入" or res_val == "無法解析內容":
                res_val = get_fb_data(url, None)
                
            results.append({"連結": url, "按讚數": res_val})
            bar.progress((i + 1) / len(url_list))
            time.sleep(2) 
            
        st.success("統計完成！")
        df = pd.DataFrame(results)
        st.table(df)
        st.download_button("📥 下載 Excel (CSV)", data=df.to_csv(index=False).encode('utf-8-sig'), file_name="fb_stats.csv")
    else:
        st.warning("請輸入連結。")
