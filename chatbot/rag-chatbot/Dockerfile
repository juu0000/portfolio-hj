FROM python:3.10-slim

WORKDIR /app

COPY . .

RUN pip3 install --no-cache-dir -r requirements.txt

ENV OPENAI_API_KEY=""

CMD ["streamlit", "run", "main.py", "--server.port=5000"]