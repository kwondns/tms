import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  auth: {
    mailUser: process.env.MAIL_USER,
    mailPassword: process.env.MAIL_PASSWORD,
  },
  db: {
    dbName: process.env.DB_NAME,
    dbPort: process.env.DB_PORT,
    dbUserName: process.env.DB_USER_NAME,
    dbHost: process.env.DB_HOST,
    dbPassword: process.env.DB_PASSWORD,
  },
  jwt: {
    accessSecret: process.env.ACCESS_SECRET,
    accessExpire: process.env.ACCESS_EXPIRE,
    refreshSecret: process.env.REFRESH_SECRET,
    refreshExpire: process.env.REFRESH_EXPIRE,
    resetPasswordSecret: process.env.RESET_PASSWORD_SECRET,
    resetPasswordExpire: process.env.RESET_PASSWORD_EXPIRE,
  },
  s3: {
    s3Secret: process.env.S3_SECRET_KEY,
    s3Access: process.env.S3_ACCESS_KEY,
    s3Env: process.env.S3_ENV,
    s3TmpArchiveBucket: process.env.S3_TMP_ARCHIVE_BUCKET,
  },
  timeline: {
    frontURL: process.env.FRONT_URL,
    chatbotURL: process.env.CHATBOT_URL,
    fileDestroyDelay: process.env.FILE_DESTROY_DELAY,
  },
  // oauth: {
  //   googleClientId: process.env.GOOGLE_CLIENT_ID,
  //   googleSecret: process.env.GOOGLE_CLIENT_SECRET,
  //   googleRedirectURI: process.env.GOOGLE_REDIRECT_URI,
  //
  //   kakaoClientId: process.env.KAKAO_CLIENT_ID,
  //   kakaoRedirectURI: process.env.KAKAO_REDIRECT_URI,
  //
  //   naverClientId: process.env.NAVER_CLIENT_ID,
  //   naverRedirectURI: process.env.NAVER_REDIRECT_URI,
  //   naverSecret: process.env.NAVER_CLIENT_SECRET,
  // },
}));
