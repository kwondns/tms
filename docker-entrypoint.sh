#!/bin/sh
set -e

# 1. 환경 변수 생성
echo "[DEBUG] .env 생성 시작" >&2
SECRET_JSON=$(aws secretsmanager get-secret-value --secret-id tms-secret --query SecretString --output text)
{
  echo "DB_NAME=$(echo $SECRET_JSON | jq -r .db_name)"
  echo "DB_PORT=$(echo $SECRET_JSON | jq -r .db_port)"
  echo "DB_USERNAME=$(echo $SECRET_JSON | jq -r .db_username)"
  echo "DB_HOST=$(echo $SECRET_JSON | jq -r .db_host)"
  echo "DB_PASSWORD=$(echo $SECRET_JSON | jq -r .db_password)"
  echo "DB_SSL_PATH=$(echo $SECRET_JSON | jq -r .db_ssl_path)"
  echo "ACCESS_SECRET=$(echo $SECRET_JSON | jq -r .access_secret_key)"
  echo "ACCESS_EXPIRE=$(echo $SECRET_JSON | jq -r .access_expire)"
  echo "REFRESH_SECRET=$(echo $SECRET_JSON | jq -r .refresh_secret_key)"
  echo "REFRESH_EXPIRE=$(echo $SECRET_JSON | jq -r .refresh_expire)"
  echo "S3_ACCESS_KEY=$(echo $SECRET_JSON | jq -r .s3_access_key)"
  echo "S3_SECRET_KEY=$(echo $SECRET_JSON | jq -r .s3_secret_key)"
  echo "S3_ENV=$(echo $SECRET_JSON | jq -r .s3_env)"
  echo "FILE_DESTROY_DELAY=$(echo $SECRET_JSON | jq -r .file_destroy_delay)"
  echo "MAIL_USER=$(echo $SECRET_JSON | jq -r .mail_user)"
  echo "MAIL_PASSWORD=\"$(echo $SECRET_JSON | jq -r .mail_password)\""
  echo "ELASTICACHE_HOST=$(echo $SECRET_JSON | jq -r .elasticache_host)"
  echo "ELASTICACHE_PORT=$(echo $SECRET_JSON | jq -r .elasticache_port)"
  echo "RESET_PASSWORD_SECRET=$(echo $SECRET_JSON | jq -r .reset_password_secret_key)"
  echo "RESET_PASSWORD_EXPIRE=$(echo $SECRET_JSON | jq -r .reset_password_expire)"
  echo "FRONT_URL=$(echo $SECRET_JSON | jq -r .front_url)"
  echo "S3_TMP_ARCHIVE_BUCKET=$(echo $SECRET_JSON | jq -r .s3_tmp_archive_bucket)"
  echo "CHATBOT_URL=$(echo $SECRET_JSON | jq -r .chatbot_url)"
  echo "USER_ID=$(echo $SECRET_JSON | jq -r .timeline_user_id)"
  echo "DEMO_USER_ID=$(echo $SECRET_JSON | jq -r .timeline_demo_user_id)"
  echo "MYLEISURE_LINK=$(echo $SECRET_JSON | jq -r .myleisure_link)"
  echo "LOKI_HOST=$(echo $SECRET_JSON | jq -r .loki_host)"
  echo "LOKI_PORT=$(echo $SECRET_JSON | jq -r .loki_port)"
} > .env
echo "[DEBUG] .env 생성 완료" >&2

# 2. 마이그레이션 적용
yarn run mi:prod:g || true
yarn run mi:prod:r || true


exec pm2-runtime start ecosystem.config.js --env production
