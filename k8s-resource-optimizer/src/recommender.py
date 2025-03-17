
def cpu_recommendation(cpu_usage, safety_margin=1.15, min_request=0.1, precision=2):
  """
  측정된 CPU 값을 기반으로 Kubernetes의 request.cpu 값을 계산하는 함수
  - safety_margin: 안정성을 위해 추가하는 퍼센트 (기본 15%)
  - min_request: 최소 요청 값 (기본 0.1 코어)
  - precision: 반올림할 소수점 자리수(기본 3자리)
  """
  
  cpu_recommendations = []
  
  for item in cpu_usage:
    namespace = item["namespace"]
    container_name = item["container"]
    cpu_value = item["cpu_value"]
  
    # request.cpu 값 계산
    cpu_recommendation_value = max(cpu_value * safety_margin, min_request)
    cpu_recommendation_value = round(cpu_recommendation_value, precision)

    cpu_recommendations.append({
      "namespace": namespace,
      "container": container_name,
      "cpu_value": cpu_value,
      "cpu_recommendation_value": cpu_recommendation_value
    })
  
  print(f"[INFO] {len(cpu_recommendations)}개의 CPU 추천값을 계산했습니다.")
  return cpu_recommendations

def memory_recommendation(memory_usage, safety_margin=1.15, min_request=50, precision=1):
  """
  메모리 사용량을 기반으로 Kubernetes의 request.memory 값을 계산하는 함수
  - safety_margin: 안정성을 위해 추가하는 퍼센트 (기본 15%)
  - min_reqeust_memory: 최소 요청 메모리 (기본 50MB)
  - precision: 반올림할 소수점 자리수 (기본 1자리)
  """
  
  memory_recommendations = []
  
  for item in memory_usage:
    namespace = item["namespace"]
    container_name = item["container"]
    memory_value = item["memory_value"]
    
    # request.memory 값 계산
    memory_recommendation_value = max(memory_value * safety_margin, min_request)
    memory_recommendation_value = round(memory_recommendation_value, precision)
    
    memory_recommendations.append({
      "namespace": namespace,
      "container": container_name,
      "memory_value": memory_value,
      "memory_recommendation_value": memory_recommendation_value
    })
    
  print(f"[INFO] {len(memory_recommendations)}개의 Memory 추천값을 계산했습니다.")
  return memory_recommendations