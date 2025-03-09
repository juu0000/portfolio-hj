FROM python:3.10-slim

WORKDIR /app

COPY . .

RUN pip3 install --no-cache-dir -r requirements.txt

ENV PROMETHEUS_URL=""
ENV SLACK_WEBHOOK_URL=""
ENV SLACK_TOKEN=""
ENV SLACK_CHANNEL=""

CMD ["python3", "run_recommender.py"]
