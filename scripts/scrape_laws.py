#!/usr/bin/env python3
import os
import time
from selenium import webdriver
from selenium.webdriver.chrome.options import Options
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

# URLs to scrape
URLS = {
    "CMK": "https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=5271&MevzuatTur=1&MevzuatTertip=5",
    "TCK": "https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=5237&MevzuatTur=1&MevzuatTertip=5",
    "PVSK": "https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=2559&MevzuatTur=1&MevzuatTertip=3",
    "2863SK": "https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=2863&MevzuatTur=1&MevzuatTertip=5",
    "6136SK": "https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=6136&MevzuatTur=1&MevzuatTertip=3",
    "6713SK": "https://www.mevzuat.gov.tr/mevzuat?MevzuatNo=6713&MevzuatTur=1&MevzuatTertip=5",
}

# Create output directory
OUTPUT_DIR = "../src/data/laws_content"
os.makedirs(OUTPUT_DIR, exist_ok=True)


def scrape_law_content(url, file_name):
    print(f"Scraping {file_name} from {url}")

    # Setup Chrome options
    chrome_options = Options()
    chrome_options.add_argument("--headless")  # Run in headless mode
    chrome_options.add_argument("--disable-gpu")
    chrome_options.add_argument("--no-sandbox")
    chrome_options.add_argument("--disable-dev-shm-usage")

    # Initialize the driver
    driver = webdriver.Chrome(options=chrome_options)

    try:
        # Load the page
        driver.get(url)

        # Wait for the iframe to load
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "iframe"))
        )

        # Switch to iframe
        iframe = driver.find_element(By.TAG_NAME, "iframe")
        driver.switch_to.frame(iframe)

        # Wait for content to load inside iframe
        WebDriverWait(driver, 10).until(
            EC.presence_of_element_located((By.TAG_NAME, "body"))
        )

        # Extract content
        content = driver.find_element(
            By.TAG_NAME, "body").get_attribute("innerHTML")

        # Save content to file
        output_path = os.path.join(OUTPUT_DIR, f"{file_name}.html")
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(content)

        print(f"Successfully saved {file_name} to {output_path}")

    except Exception as e:
        print(f"Error scraping {file_name}: {str(e)}")

    finally:
        # Close the browser
        driver.quit()


def main():
    for law_code, url in URLS.items():
        scrape_law_content(url, law_code)
        # Add a small delay between requests to avoid overloading the server
        time.sleep(2)

    print("Scraping completed!")


if __name__ == "__main__":
    main()
