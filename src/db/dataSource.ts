import { DataSource } from 'typeorm';
import dotenv from 'dotenv';
import fs from 'node:fs';

if (process.env.NODE_ENV === 'development') {
  dotenv.config({ path: '.env.development' });
} else {
  dotenv.config({ path: '.env' });
}

export const dataSourceConfig = () => {
  const config = {
    type: 'postgres' as const,
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    entities: ['dist/**/*.entity.js'],
    migrations: ['dist/**/migrations/*.js', 'dist/custom-migrations/*.js'],
    subscribers: ['dist/**/*.subscriber.js'],
    migrationsTableName: 'migration',
    synchronize: process.env.NODE_ENV === 'development',
    installExtensions: true,
    charset: 'utf8',
  };
  if (process.env.NODE_ENV === 'production')
    Object.assign(config, {
      ssl: {
        ca: fs.readFileSync(process.env.DB_SSL_PATH),
        rejectUnauthorized: true,
      },
    });
  return config;
};

export default new DataSource(dataSourceConfig());
