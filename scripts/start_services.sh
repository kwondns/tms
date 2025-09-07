#!/bin/bash
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m'

cd /opt/app

echo -e "${YELLOW}🚀 서비스 배포 중...${NC}"

# 이전 컨테이너 정리
echo "이전 컨테이너 정리 중..."
docker-compose -f docker-compose-app.yml down --remove-orphans 2>/dev/null || true

# 서비스 시작
echo "서비스 시작 중..."
export AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
export AWS_REGION=ap-northeast-2
docker-compose -f docker-compose-app.yml up -d

# 컨테이너 시작 대기
echo "컨테이너 초기화 대기 중..."
sleep 30

echo -e "${GREEN}✅ 배포 완료${NC}"

echo -e "${YELLOW}🧹 Docker 정리 중...${NC}"

# 중지된 컨테이너 제거
docker container prune -f

# 사용하지 않는 이미지 제거
docker image prune -f

# 사용하지 않는 볼륨 제거
docker volume prune -f

# 사용하지 않는 네트워크 제거
docker network prune -f

echo -e "${GREEN}✅ Docker 정리 완료${NC}"

