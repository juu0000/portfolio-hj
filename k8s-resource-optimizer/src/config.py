import os
from dotenv import load_dotenv

load_dotenv()

PROMETHEUS_URL = os.getenv("PROMETHEUS_URL")
SLACK_TOKEN = os.getenv("SLACK_TOKEN")
SLACK_CHANNEL= os.getenv("SLACK_CHANNEL")

# 환경 변수 출력
print("\n[환경 변수 로드 확인]")
print(f"PROMETHEUS_URL: {PROMETHEUS_URL}")
print(f"SLACK_CHANNEL: {SLACK_CHANNEL}")
print(f"SLACK_TOKEN: {'Set' if SLACK_TOKEN else 'Not Set'}")

print("\n")
