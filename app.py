import streamlit as st
import pandas as pd
import requests
import re
import time
import random

# 網頁設定
st.set_page_config(page_title="FB 按讚統計工具 - 終極輕量版", layout="centered")

st.title("📊 FB 公開貼文按讚統計 (隨機慢速版)")
st.markdown("""
此版本採用 **Google 爬蟲偽裝** 與 **隨機延遲技術**，能有效提高抓取成功率。
- **注意：** 抓取速度較慢是為了模擬真人行為，請耐心等候。
- **建議：** 若連結較多，請分批處理（每次建議不超過 10 個）。
""")

# 輸入區
urls_input = st.text_area("請貼入 Facebook 連結 (每行一個):", height=200, placeholder="https://www.facebook.com/share/p/...")

def get_fb_likes_bot_mode(url):
    """模擬搜尋引擎爬蟲抓取資料"""
    headers = {
        'User-Agent': 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        'Accept-Language': 'zh-TW,zh;q=0.9,en-US;q=0.8,en;q=0.7',
    }
    
    # 統一使用 www 格式進行請求
    clean_url = url.strip().replace("m.facebook.com", "www.facebook.com")
    
    try:
        # 增加隨機的微小延遲，避免過於機械化
        time.sleep(random.uniform(1, 3))
        response = requests.get(clean_url, headers=headers, timeout=15, allow_redirects=True)
        html = response.text

        # 優先搜尋 script 中的 JSON 數據 (最準確)
        json_match = re.search(r'"i18n_reaction_count":"([\d,.]+)"', html)
        if json_match:
            return json_match.group(1).replace(',', '')

        # 搜尋網頁前端顯示文字
        text_match = re.search(r'([\d,.]+)\s*個讚', html)
        if text_match:
            return text_match.group(1).replace(',', '')

        # 備用方案：檢查行動版頁面
        m_headers = {'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X)'}
        m_response = requests.get(clean_url.replace("www.", "m."), headers=m_headers, timeout=15)
        m_match = re.search(r'(\d+)\s*(人按讚|個讚|reactions|likes)', m_response.text)
        if m_match:
            return m_match.group(1)

        return "無法解析"
    except Exception:
        return "連線錯誤"

# 執行按鈕
if st.button("🚀 開始同步數據"):
    if urls_input:
        url_list = [u.strip() for u in urls_input.split('\n') if u.strip()]
        results = []
        
        progress_text = st.empty()
        bar = st.progress(0)
        
        for i, url in enumerate(url_list):
            progress_text.text(f"正在處理第 {i+1}/{len(url_list)}: {url[:50]}...")
            
            # --- 自動重試機制 ---
            final_count = "無法解析"
            max_retries = 2 # 失敗後最多重試 2 次
            
            for attempt in range(max_retries + 1):
                count = get_fb_likes_bot_mode(url)
                if count.isdigit(): # 成功抓到純數字
                    final_count = count
                    break
                
                # 如果是最後一次重試且還是失敗，回傳錯誤訊息
                if "無法解析" in str(count) and attempt < max_retries:
                    # 失敗時等待較長的時間 (8~15秒) 再重試
                    time.sleep(random.uniform(8, 15))
                else:
                    final_count = count
            
            results.append({"連結": url, "按讚數": final_count})
            bar.progress((i + 1) / len(url_list))
            
            # --- 隨機冷卻時間 ---
            # 每抓完一個連結，隨機休息 5~12 秒，模擬真人翻頁速度
            if i < len(url_list) - 1:
                wait_time = random.uniform(5, 12)
                time.sleep(wait_time)
            
        st.success("🎉 所有數據統計完成！")
        
        # 顯示表格
        df = pd.DataFrame(results)
        st.table(df)
        
        # 製作 CSV 下載按鈕
        csv_data = df.to_csv(index=False).encode('utf-8-sig')
        st.download_button(
            label="📥 下載統計報表 (CSV)",
            data=csv_data,
            file_name="fb_likes_report.csv",
            mime="text/csv"
        )
    else:
        st.warning("請輸入 FB 連結。")
