import requests
import time
from src.config import SLACK_TOKEN, SLACK_CHANNEL
from slack_sdk import WebClient
from pprint import pprint

def send_slack_notification(namespace, cpu_dict, mem_dict):
  """
  여러 컨테이너의 추천값을 네임스페이스별로 묶어 한 번의 메세지로 Slack에 전송
  """

  client = WebClient(token=SLACK_TOKEN)

  all_keys = set(cpu_dict.keys()) | set(mem_dict.keys())

  recommendations = []
  for container in all_keys:
    cpu_value = cpu_dict.get(container,{}).get("cpu_value", None)
    cpu_recommendation_value = cpu_dict.get(container, {}).get("cpu_recommendation_value", None)
    memory_value = mem_dict.get(container,{}).get("memory_value", None)
    memory_recommendation_value = mem_dict.get(container, {}).get("memory_recommendation_value", None)

    recommendations.append({
      "namespace": namespace,
      "container": container,
      "cpu_value": cpu_value,
      "cpu_recommendation_value": cpu_recommendation_value,
      "memory_value": memory_value,
      "memory_recommendation_value": memory_recommendation_value
    })


  blocks = [{
    "type":"section",
    "text":{
      "type": "mrkdwn", "text":f"리소스 추천값 시스템 입니다."
    }
  }]
  response = client.chat_postMessage(channel=SLACK_CHANNEL, blocks=blocks)

  chunk_size = 20
  for i in range(0, len(recommendations), chunk_size):
    container_list = recommendations[i:i+chunk_size]
    
    # Slack 메세지 생성
    blocks =[
      {
        "type":"section",
        "text":{"type":"mrkdwn", "text":f"*📢 [{namespace}] 리소스 최적화 추천값 업데이트*"}
      },
      {"type":"divider"}
    ]

    for rec in container_list:
      blocks.append({
        "type":"section",
        "text":{
          "type": "mrkdwn",
          "text": f"🖥️ *{rec['container']}*\n"
                  f"🟢 현재 CPU/MEM 사용량: `{rec['cpu_value']}`Core / `{rec['memory_value']}`MiB\n"
                  f"🟩 추천 CPU/MEM 설정값: `{rec['cpu_recommendation_value']}`Core / `{rec['memory_recommendation_value']}`MiB\n"
        }
      })
      
    response = client.chat_postMessage(channel=SLACK_CHANNEL, blocks=blocks)
    time.sleep(1)
    
  print(f"[Slack 전송 완료] {namespace} ({len(recommendations)}개 Pod)")