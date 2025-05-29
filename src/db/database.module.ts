import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceConfig } from '@/db/dataSource';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: () => dataSourceConfig(),
    }),
  ],
})
export class DatabaseModule {}
