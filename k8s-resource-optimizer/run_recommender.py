from src.prometheus_client import fetch_cpu_usage, fetch_memory_usage
from src.recommender import cpu_recommendation, memory_recommendation
from src.notifier import send_slack_notification
import argparse
from pprint import pprint
import re

def str_to_bool(value):
  if isinstance(value, bool):
    return value
  if value.lower() in ("true", "yes", "1"):
    return True
  elif value.lower() in ("false", "no", "0"):
    return False
  else:
    raise argparse.ArgumentTypeError("--record는 Boolean 값으로 입력해야 합니다 (true/false).")

def validate_namespace(value):
    # ^[^,\s]+$는 쉼표(,)나 공백(\s)이 하나도 없는 문자열을 의미합니다.
  if not re.match(r'^[^,\s]+$', value):
    raise argparse.ArgumentTypeError("네임스페이스는 단일값 또는 공백으로 구분된 값으로 입력해야 합니다. (단일: --namespace kube-system 복수: --namespace app backend frontend)")
  return value

def main():
  # args 값 처리
  namespaces = args.namespace
  record = args.record
  print(f"[INFO] 수집할 namespace 목록: {namespaces}")
  print("[INFO] Prometheus에서 CPU 및 메모리 사용량 데이터를 가져오는 중...")

  for namespace in namespaces:
    # Prometheus에서 CPU, Memory 사용량 가져오기
    print(f"[INFO] '{namespace}' 네임스페이스에서 CPU 및 메모리 사용량 데이터를 가져오는 중...")
    cpu_usage = fetch_cpu_usage(namespace, record)
    memory_usage = fetch_memory_usage(namespace, record)
    
    print("[INFO] 추천값을 계산 중...")
    # CPU 추천값 계산
    cpu_recommend = cpu_recommendation(cpu_usage)
    # Memory 추천값 계산
    memory_recommend = memory_recommendation(memory_usage)

    cpu_dict = {rec["container"]: rec for rec in cpu_recommend}
    mem_dict = {rec["container"]: rec for rec in memory_recommend}

    print("[완료] 모든 추천값을 처리했습니다.")
    print("[INFO] 슬랙 전송 준비")
    send_slack_notification(namespace,cpu_dict, mem_dict)

if __name__ == "__main__":
  parser = argparse.ArgumentParser(description="CPU/Memory 추천값을 처리하는 스크립트")
  parser.add_argument("--n","--namespace",dest="namespace", required=True, nargs="+", type=validate_namespace, help="측정할 네임스페이스")
  parser.add_argument("--r","--record",dest="record", type=str_to_bool, nargs="?", const=True, default=False, help="Recording Rule 사용 여부 (기본 False)")
  args= parser.parse_args()
  main()
