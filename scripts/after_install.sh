#!/bin/bash
cd /home/ec2-user/be
rm -f .env
yarn install --omit=dev
echo "[DEBUG] ssl key" >&2
wget https://www.amazontrust.com/repository/AmazonRootCA1.pem -O /home/ec2-user/be/dist/database/AmazonRootCA.pem

echo "[DEBUG] .env 생성 시작" >&2
SECRET_JSON=$(aws secretsmanager get-secret-value --secret-id wiive-secret --query SecretString --output text)
{
  echo "DB_NAME=$(echo $SECRET_JSON | jq -r .db_name)"
  echo "DB_PORT=$(echo $SECRET_JSON | jq -r .db_port)"
  echo "DB_USERNAME=$(echo $SECRET_JSON | jq -r .db_username)"
  echo "DB_HOST=$(echo $SECRET_JSON | jq -r .db_host)"
  echo "DB_PASSWORD=$(echo $SECRET_JSON | jq -r .db_password)"
  echo "ACCESS_SECRET_KEY=$(echo $SECRET_JSON | jq -r .access_secret_key)"
  echo "ACCESS_EXPIRE=$(echo $SECRET_JSON | jq -r .access_expire)"
  echo "REFRESH_SECRET_KEY=$(echo $SECRET_JSON | jq -r .refresh_secret_key)"
  echo "REFRESH_EXPIRE=$(echo $SECRET_JSON | jq -r .refresh_expire)"
  echo "S3_ACCESS_KEY=$(echo $SECRET_JSON | jq -r .s3_access_key)"
  echo "S3_SECRET_KEY$(echo $SECRET_JSON | jq -r .s3_secret_key)"
  echo "S3_ENV=$(echo $SECRET_JSON | jq -r .s3_env)"
} > .env
echo "[DEBUG] .env 생성 완료" >&2
yarn run mi:prod:g
yarn run mi:prod:r
#  echo "RESET_PASSWORD_SECRET_KEY=$(echo $SECRET_JSON | jq -r .reset_password_secret_key)"
#  echo "RESET_PASSWORD_EXPIRE=$(echo $SECRET_JSON | jq -r .reset_password_expire)"
#  echo "ELASTICACHE_HOST=$(echo $SECRET_JSON | jq -r .elasticache_host)"
#  echo "ELASTICACHE_PORT=$(echo $SECRET_JSON | jq -r .elasticache_port)"
#  echo "FILE_DESTROY_DELAY=$(echo $SECRET_JSON | jq -r .file_destroy_delay)"
#  echo "GOOGLE_CLIENT_ID=$(echo $SECRET_JSON | jq -r .google_client_id)"
#  echo "GOOGLE_CLIENT_SECRET=$(echo $SECRET_JSON | jq -r .google_client_secret)"
#  echo "GOOGLE_REDIRECT_URI=$(echo $SECRET_JSON | jq -r .google_redirect_uri)"
#  echo "KAKAO_CLIENT_ID=$(echo $SECRET_JSON | jq -r .kakao_client_id)"
#  echo "KAKAO_REDIRECT_URI=$(echo $SECRET_JSON | jq -r .kakao_redirect_uri)"
#  echo "S3_TMP_ARCHIVE_BUCKET=$(echo $SECRET_JSON | jq -r .s3_tmp_archive_bucket)"
#  echo "NAVER_CLIENT_ID=$(echo $SECRET_JSON | jq -r .naver_client_id)"
#  echo "NAVER_REDIRECT_URI=$(echo $SECRET_JSON | jq -r .naver_redirect_uri)"
#  echo "NAVER_CLIENT_SECRET=$(echo $SECRET_JSON | jq -r .naver_client_secret)"
#  echo "FRONT_URL=$(echo $SECRET_JSON | jq -r .front_url)"
#  echo "DB_SSL_PATH=$(echo $SECRET_JSON | jq -r .db_ssl_path)"
#  echo "MAIL_USER=$(echo $SECRET_JSON | jq -r .mail_user)"
#  echo "MAIL_PASSWORD=\"$(echo $SECRET_JSON | jq -r .mail_password)\""
