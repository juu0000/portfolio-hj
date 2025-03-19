# Stage 1: Build
FROM node:20 AS builder
WORKDIR /app
# package.json과 yarn.lock을 먼저 복사하여 의존성 설치 속도를 개선합니다.
COPY package.json yarn.lock ./
RUN yarn install
# 소스 코드를 복사한 후 빌드합니다.
COPY . .
RUN yarn build

# Stage 2: Production Image
FROM node:20-alpine
WORKDIR /app
# 프로덕션 의존성만 설치합니다.
COPY package.json yarn.lock ./
RUN yarn install --production
# 빌드 결과물을 복사합니다.
COPY --from=builder /app/dist ./dist
# 필요한 포트를 노출합니다.
EXPOSE 3030
# NestJS 메인 애플리케이션 실행
CMD ["node", "dist/main.js"]
