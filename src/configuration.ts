export default () => {
  if (!process.env.NODE_ENV) {
    return {
      JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
      JWT_REFRESH_EXPIRE: process.env.JWT_REFRESH_EXPIRE,
      JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
      JWT_ACCESS_EXPIRE: process.env.JWT_ACCESS_EXPIRE,
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
