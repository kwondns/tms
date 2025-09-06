#!/bin/bash
set -e

GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m'

echo -e "${YELLOW}🏥 헬스 체크 중...${NC}"

services_healthy=true

if curl -s -f http://localhost:5440/health > /dev/null; then
    echo -e "${GREEN}✅ NestJS: 정상${NC}"
else
    echo -e "${RED}❌ NestJS: 비정상${NC}"
    services_healthy=false
fi

if $services_healthy; then
    echo -e "${GREEN}🎉 모든 핵심 서비스가 정상 작동 중입니다!${NC}"
else
    echo -e "${RED}⚠️  일부 서비스에 문제가 있습니다.${NC}"
fi
