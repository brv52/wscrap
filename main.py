from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from webdriver_manager.chrome import ChromeDriverManager
import time
import threading
from selenium.webdriver.chrome.options import Options

urls = [
    "https://www.sreality.cz/hledani/pronajem/komercni/obchodni-prostory?cena-do=250&plocha-od=700&za-m2=1",
    "https://www.maxirealitypraha.cz/pronajem/komercni-prostory/nejnovejsi/",
    "https://reality.idnes.cz/s/pronajem/komercni-nemovitosti/?s-qc%5BsubtypeCommercial%5D%5B0%5D=commercial-area&s-qc%5BsubtypeCommercial%5D%5B1%5D=restaurant&s-qc%5BusableAreaMin%5D=690&s-qc%5BusableAreaMax%5D=1500",
    "https://realitymix.cz/vypis-nabidek/?form%5Badresa_obec_id%5D=&form%5Badresa_stat%5D=CZ&form%5Bcena_mena%5D=&form%5Bcena_normalizovana__from%5D=&form%5Bcena_normalizovana__to%5D=&form%5Bexclusive%5D=&form%5Bfk_rk%5D=&form%5Binzerat_typ%5D=2&form%5Bkomercni_nemovitosti%5D[]=3&form%5Bkomercni_nemovitosti%5D[]=4&form%5Bnemovitost_typ%5D[]=m_9_1&form%5Bplocha__from%5D=690&form%5Bplocha__to%5D=&form%5Bpodlazi_cislo__from%5D=&form%5Bpodlazi_cislo__to%5D=&form%5Bprojekt_id%5D=&form%5Bsearch_in_city%5D=&form%5Bsearch_in_text%5D=&form%5Bstari_inzeratu%5D=&form%5Bstav_objektu%5D=&form%5Btop_nabidky%5D="
]

XPATH_MAP = {
    "sreality.cz": "//a[contains(@class, 'MuiTypography-root') and contains(@class, 'MuiLink-root')]",
    "maxirealitypraha.cz": "//div[contains(@class, 'estate')]//a[@href]",  
    "reality.idnes.cz": "//a[contains(@class, 'c-products__link')]",
    "realitymix.cz": "//a[contains(@class, 'flex') and contains(@class, 'text-secondary')]"
}

def get_latest_post(driver, url):
    driver.get(url)

    xpath = next((v for k, v in XPATH_MAP.items() if k in url), None)
    if not xpath:
        print(f"❌ No matching XPath for {url}")
        return None

    try:
        latest_post = WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.XPATH, xpath))
        )
        post_data = {"text": latest_post.text, "href": latest_post.get_attribute("href")}
        print(f"✅ Latest post found on {url}: {post_data}")
        return post_data
    except Exception as e:
        print(f"❌ Error fetching latest post from {url}: {e}")
        return None

def monitor_page(url):
    print(f"🔍 Monitoring {url}...")

    driver = webdriver.Chrome(service=Service(ChromeDriverManager().install()))
    
    try:
        previous_post = get_latest_post(driver, url)

        while True:
            time.sleep(10)

            current_post = get_latest_post(driver, url)

            if current_post and previous_post and current_post["href"] != previous_post["href"]:
                print(f"🚨 New post detected on {url}!")
                print(f"📌 New Post: {current_post}")
                previous_post = current_post
            else:
                print(f"⏳ No new post on {url}. Checking again...")

    finally:
        driver.quit()

def append_listener():
    threads = []
    
    for url in urls:
        thread = threading.Thread(target=monitor_page, args=(url,))
        thread.daemon = True
        thread.start()
        threads.append(thread)
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\n❌ Stopping all monitors...")

append_listener()