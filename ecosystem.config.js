/* eslint-disable */
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '.env') });
module.exports = {
  apps: [
    {
      name: 'nestjs',
      script: './dist/main.js',
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: 'production',
        PORT: 5440,
        DB_NAME: process.env.DB_NAME,
        DB_PORT: process.env.DB_PORT,
        DB_USERNAME: process.env.DB_USERNAME,
        DB_HOST: process.env.DB_HOST,
        DB_PASSWORD: process.env.DB_PASSWORD,
        ACCESS_SECRET_KEY: process.env.ACCESS_SECRET_KEY,
        ACCESS_EXPIRE: process.env.ACCESS_EXPIRE,
        REFRESH_SECRET_KEY: process.env.REFRESH_SECRET_KEY,
        REFRESH_EXPIRE: process.env.REFRESH_EXPIRE,
        S3_ACCESS_KEY: process.env.S3_ACCESS_KEY,
        S3_SECRET_KEY: process.env.S3_SECRET_KEY,
        S3_ENV: process.env.S3_ENV,
        ELASTICACHE_HOST: process.env.ELASTICACHE_HOST,
        ELASTICACHE_PORT: process.env.ELASTICACHE_PORT,
        DB_SSL_PATH: process.env.DB_SSL_PATH,
        MAIL_USER: process.env.MAIL_USER,
        MAIL_PASSWORD: process.env.MAIL_PASSWORD,
        RESET_PASSWORD_SECRET_KEY: process.env.RESET_PASSWORD_SECRET_KEY,
        RESET_PASSWORD_EXPIRE: process.env.RESET_PASSWORD_EXPIRE,
        FILE_DESTROY_DELAY: process.env.FILE_DESTROY_DELAY,
        // GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
        // GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
        // GOOGLE_REDIRECT_URI: process.env.GOOGLE_REDIRECT_URI,
        // KAKAO_CLIENT_ID: process.env.KAKAO_CLIENT_ID,
        // KAKAO_REDIRECT_URI: process.env.KAKAO_REDIRECT_URI,
        // NAVER_CLIENT_ID: process.env.NAVER_CLIENT_ID,
        // NAVER_REDIRECT_URI: process.env.NAVER_REDIRECT_URI,
        // NAVER_CLIENT_SECRET: process.env.NAVER_CLIENT_SECRET,
        FRONT_URL: process.env.FRONT_URL,
      },
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      error_file: '/home/ec2-user/be/log/pm2/error.log',
      out_file: '/home/ec2-user/be/log/pm2/out.log',
    },
  ],
};
