import streamlit as st
import pandas as pd
import time
import re
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from selenium.webdriver.common.by import By

# 設定網頁標題
st.set_page_config(page_title="FB 按讚數統整工具", layout="wide")

st.title("📊 FB 公開貼文按讚數統整器")
st.write("請輸入 FB 連結，系統將模擬瀏覽器抓取公開顯示的按讚數字。")

# 左側輸入區
with st.sidebar:
    st.header("輸入設定")
    urls_input = st.text_area("貼入 FB 連結 (每行一個)", height=300)
    start_button = st.button("🚀 開始抓取數據")

# 抓取邏輯
def scrape_fb(urls):
    results = []
    
    chrome_options = Options()
    chrome_options.add_argument("--headless")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")
    chrome_options.add_argument("--disable-gpu")
    # 偽裝成一般瀏覽器避開部分阻擋
    chrome_options.add_argument("--user-agent=Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36")
    
    try:
        # 在 Streamlit Cloud 環境中，chromedriver 通常位於 /usr/bin/chromedriver
        service = Service("/usr/bin/chromedriver")
        driver = webdriver.Chrome(service=service, options=chrome_options)
        
        progress_bar = st.progress(0)
        for i, url in enumerate(urls):
            # ... 接下來的抓取邏輯保持不變 ...
            driver.get(url.replace("www.facebook.com", "m.facebook.com"))
            time.sleep(5)
            # ... 抓取代碼 ...
            url = url.strip()
            if not url: continue
            
            # 轉換為移動版網頁增加成功率
            m_url = url.replace("www.facebook.com", "m.facebook.com")
            driver.get(m_url)
            time.sleep(5) # 等待載入
            
            try:
                # 取得網頁源碼並尋找數字
                page_text = driver.find_element(By.TAG_NAME, 'body').text
                # 尋找「數字 + 個讚」或類似結構
                match = re.search(r'(\d+)\s*(個讚|人|次讚|reactions|likes)', page_text)
                likes = match.group(0) if match else "找不到(可能需登入)"
            except:
                likes = "抓取錯誤"
            
            results.append({"連結": url, "按讚數": likes})
            
            # 更新進度條
            progress_bar.progress((i + 1) / len(urls))
            
        driver.quit()
        return results
    except Exception as e:
        st.error(f"發生錯誤: {e}")
        return None

# 按下按鈕後的執行動作
if start_button and urls_input:
    url_list = urls_input.split('\n')
    with st.spinner('爬蟲執行中，請稍候...'):
        data = scrape_fb(url_list)
        
    if data:
        df = pd.DataFrame(data)
        st.subheader("✅ 抓取結果")
        st.dataframe(df, use_container_width=True)
        
        # 製作 Excel 下載按鈕
        csv = df.to_csv(index=False).encode('utf-8-sig')
        st.download_button(
            label="📥 下載結果 (CSV)",
            data=csv,
            file_name="fb_likes_report.csv",
            mime="text/csv",
        )
elif start_button and not urls_input:
    st.warning("請先輸入至少一個連結！")
