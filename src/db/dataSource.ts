import { DataSource } from 'typeorm';

const databaseConfig = {
  synchronize: false,
  migrationsTableName: 'migration',
  entities: ['dist/**/*.entity.js'],
  subscribers: ['dist/**/*.sub.js'],
};
const envConfig = Object.create(null);

switch (process.env.NODE_ENV) {
  case 'development':
    Object.assign(envConfig, {
      type: 'sqlite' as const,
      database: 'dev.sqlite',
      migrations: ['./dist/**/migrations/*dev*.js'],
    });
    break;
  case 'test':
    Object.assign(envConfig, {
      type: 'sqlite' as const,
      database: 'test.sqlite',
      migrations: ['./dist/**/migrations/*test*.js'],
      migrationsRun: true,
    });
    break;
  case 'production':
    Object.assign(envConfig, {
      type: 'postgres' as const,
      database: 'postgres',
      port: 5432,
      username: 'postgres',
      host: 'tms-osaka.cvgus8k086w5.ap-northeast-3.rds.amazonaws.com',
      password: 'oG28E5SbX38WHtTgwHFn',
      migrations: ['./dist/**/migrations/*prod*.js'],
    });
    break;
  default:
    throw new Error('Unknown Environment');
}
export const dataSource = {
  ...Object.assign(databaseConfig, envConfig),
};

export default new DataSource(dataSource);
