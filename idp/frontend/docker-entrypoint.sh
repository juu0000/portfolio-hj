#!/bin/sh
# config.js 템플릿 파일을 치환하여 임시 파일에 저장한 후 원본 파일로 대체
envsubst < /usr/share/nginx/html/config.js > /usr/share/nginx/html/config.tmp && mv /usr/share/nginx/html/config.tmp /usr/share/nginx/html/config.js

# Nginx 실행
exec nginx -g 'daemon off;'
