from prometheus_api_client import PrometheusConnect
import requests
from src.config import PROMETHEUS_URL

prom = PrometheusConnect(url=PROMETHEUS_URL, disable_ssl=True)

def fetch_cpu_usage(namespace, record=False):
    try:
        if not record:
            query = f"""
            quantile_over_time(
                0.95, 
                max by(namespace, container) (
                    rate(container_cpu_usage_seconds_total{{
                        namespace!="kube-system",
                        namespace="{namespace}"
                    }}[1m]))
            [1w:1m])
            """
        else:
            query = f"""
                record:container_cpu_usage_seconds_total:q95_rate_1m{{
                    namespace={namespace}
                }}
            """

        print(f"[INFO] PromQL 실행 중... (Namespace: {namespace}, Record: {record})")
        # 수집된 값
        # @metric label값
        # @value 날짜, cpu사용률
        data = prom.custom_query(query=query)

        recommendation = []
        for item in data:
            container_name = item["metric"].get("container","unknown_container")
            cpu_value = float(item["value"][1])

            recommendation.append({
                "namespace": namespace,
                "container": container_name,
                "cpu_value": cpu_value
            })
        
        print(f"[INFO] {len(recommendation)}개의 CPU 사용량 값을 가져왔습니다.")

        return recommendation
    except requests.exceptions.HTTPError as e:
        print(f"[HTTP 오류] {namespace}: {e.response.status_code} - {e.response.text}")
    except requests.exceptions.RequestException as e:
        print(f"[요청 실패] {namespace}: {e}")
    except Exception as e:
        print(f"[알 수 없는 오류] {namespace}: {e}")

def fetch_memory_usage(namespace, record=False):
    try:
        if not record:
            query = f"""
            quantile_over_time(
                0.95, 
                max by(namespace, container) (
                    rate(container_memory_working_set_bytes{{
                        namespace!="kube-system",
                        namespace="{namespace}"
                    }}[5m]))
            [1w:5m])
            """
        else:
            query = f"""
                record:container_memory_working_set_bytes:q95_rate_1m{{
                    namespace={namespace}
            """
        print(f"[INFO] PromQL 실행 중... (Namespace: {namespace}, Record: {record})")
        # 수집된 값
        # @metric label값
        # @value 날짜, cpu사용률
        data = prom.custom_query(query=query)

        recommendation = []
        for item in data:
            container_name = item["metric"].get("container","unknown_container")
            memory_value = float(item["value"][1]) / (1024 * 1024) # Byte -> MB 변환

            recommendation.append({
                "namespace": namespace,
                "container": container_name,
                "memory_value": memory_value
            })

        return recommendation
    except requests.exceptions.HTTPError as e:
        print(f"[HTTP 오류] {namespace}: {e.response.status_code} - {e.response.text}")
    except requests.exceptions.RequestException as e:
        print(f"[요청 실패] {namespace}: {e}")
    except Exception as e:
        print(f"[알 수 없는 오류] {namespace}: {e}")
