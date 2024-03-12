export default () => {
  if (!process.env.NODE_ENV) {
    return {
      TOKEN_REFRESH_SECRET: process.env.TOKEN_REFRESH_SECRET,
      TOKEN_REFRESH_EXPIRE: process.env.TOKEN_REFRESH_EXPIRE,
      TOKEN_ACCESS_SECRET: process.env.TOKEN_ACCESS_SECRET,
      TOKEN_ACCESS_EXPIRE: process.env.TOKEN_ACCESS_EXPIRE,
      DB_NAME: process.env.DB_NAME,
      DB_PORT: process.env.DB_PORT,
      DB_USER_NAME: process.env.DB_USER_NAME,
      DB_HOST: process.env.DB_HOST,
      DB_PASSWORD: process.env.DB_PASSWORD,
      S3_ENV: process.env.S3_ENV,
    };
  }
  return {};
};
