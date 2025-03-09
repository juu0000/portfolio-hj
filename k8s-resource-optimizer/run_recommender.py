from src.prometheus_client import fetch_cpu_usage, fetch_memory_usage
from src.recommender import cpu_recommendation, memory_recommendation
from src.notifier import send_slack_notification
import argparse
from pprint import pprint

def str_to_bool(value):
  if isinstance(value, bool):
    return value
  if value.lower() in ("true", "yes", "1"):
    return True
  elif value.lower() in ("false", "no", "0"):
    return False
  else:
    raise argparse.ArgumentTypeError("--record는 Boolean 값으로 입력해야 합니다 (true/false).")

def main():
  # args 값 처리
  namespace = args.namespace
  record = args.record
  print("[INFO] Prometheus에서 CPU 및 메모리 사용량 데이터를 가져오는 중...")
  # Prometheus에서 CPU, Memory 사용량 가져오기
  cpu_usage = fetch_cpu_usage(namespace)
  memory_usage = fetch_memory_usage(namespace)
  
  print("[INFO] 추천값을 계산 중...")
  # CPU 추천값 계산
  cpu_recommend = cpu_recommendation(cpu_usage)
  # Memory 추천값 계산
  memory_recommend = memory_recommendation(memory_usage)

  # print("[INFO] CPU 추천값")
  # pprint(cpu_recommend)
  # print("[INFO] 메모리 추천값")
  # pprint(memory_recommend)

  cpu_dict = {rec["container"]: rec for rec in cpu_recommend}
  mem_dict = {rec["container"]: rec for rec in memory_recommend}

  # # db 저장
  # store_recommendations(all_keys)
  print("[완료] 모든 추천값을 처리했습니다.")
  print("[INFO] 슬랙 전송 준비")
  send_slack_notification(namespace,cpu_dict, mem_dict)

if __name__ == "__main__":
  parser = argparse.ArgumentParser(description="CPU/Memory 추천값을 처리하는 스크립트")
  parser.add_argument("--n","--namespace",dest="namespace", required=True, help="측정할 네임스페이스")
  parser.add_argument("--r","--record",dest="record", type=str_to_bool, nargs="?", const=True, default=False, help="Recording Rule 사용 여부 (기본 False)")
  args= parser.parse_args()
  main()
