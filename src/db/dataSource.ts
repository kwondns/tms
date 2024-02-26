import { DataSource } from 'typeorm';

const databaseConfig = {
  synchronize: false,
  migrations: ['./src/**/migrations/*.js'],
  migrationsTableName: 'migration',
};
const envConfig = Object.create(null);

switch (process.env.NODE_ENV) {
  case 'development':
    Object.assign(envConfig, {
      type: 'sqlite' as const,
      database: 'dev.sqlite',
      entities: ['./src/**/*.entity.ts'],
    });
    break;
  case 'test':
    Object.assign(envConfig, {
      type: 'sqlite' as const,
      database: 'test.sqlite',
      entities: ['./src/**/*.entity.ts'],
      migrationsRun: true,
    });
    break;
  case 'production':
    Object.assign(envConfig, {
      type: 'postgres' as const,
      database: process.env.DB_NAME,
      port: process.env.DB_PORT,
      username: process.env.DB_USER_NAME,
      host: process.env.DB_HOST,
      password: `${process.env.DB_PASSWORD}`,
      entities: ['./**/*.entity.js'],
    });
    break;
  default:
    throw new Error('Unknown Environment');
}
export const dataSource = {
  ...Object.assign(databaseConfig, envConfig),
};

export default new DataSource(dataSource);
