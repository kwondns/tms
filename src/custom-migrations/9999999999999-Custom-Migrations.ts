import { MigrationInterface, QueryRunner } from 'typeorm';

export class Migrations9999999999999 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE SCHEMA IF NOT EXISTS portfolio;');
    await queryRunner.query('CREATE SCHEMA IF NOT EXISTS blog;');
    await queryRunner.query('CREATE SCHEMA IF NOT EXISTS timeline;');
    await queryRunner.query('CREATE SCHEMA IF NOT EXISTS houseconnect;');
    await queryRunner.query('CREATE SCHEMA IF NOT EXISTS drive;');

    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS ltree;`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pg_trgm;`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pg_stat_statements`);
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pg_bigm`);

    // 계층 구조 최적화 인덱스
    await queryRunner.query(`
          CREATE INDEX "IDX_LTREE_PATH_GIST"
            ON file_system USING GIST (ltree_path gist_ltree_ops(siglen=256))
            WHERE octet_length (ltree_path::text) > 100;
        `);
    // 소유자-이름 복합 인덱스
    await queryRunner.query(`
          CREATE INDEX "IDX_OWNER_NAME"
            ON file_system ("ownerUserId", name) WHERE deleted_at IS NULL;
        `);

    await queryRunner.query(`
          CREATE INDEX "IDX_CHOSEONG_BTREE"
          ON file_system (choseong) WHERE deleted_at IS NULL;
        `);

    await queryRunner.query(`
          CREATE INDEX "IDX_CHOSEONG_BIGM"
          ON file_system USING GIN (choseong gin_bigm_ops)
          WITH (fastupdate = off)
          WHERE deleted_at IS NULL;
        `);

    await queryRunner.query(`
          CREATE INDEX "IDX_NAME_BIGM"
            ON file_system USING GIN (name gin_bigm_ops)
            WITH (fastupdate = off, gin_pending_list_limit = 4096)
            WHERE deleted_at IS NULL;
        `);

    // 소유자 단일 컬럼 인덱스
    await queryRunner.query(`
          CREATE INDEX "IDX_OWNER_ID"
            ON file_system ("ownerUserId") WHERE deleted_at IS NULL;
        `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('DROP SCHEMA IF EXISTS portfolio CASCADE;');
    await queryRunner.query('DROP SCHEMA IF EXISTS blog CASCADE;');
    await queryRunner.query('DROP SCHEMA IF EXISTS timeline CASCADE;');
    await queryRunner.query('DROP SCHEMA IF EXISTS houseconnect CASCADE;');
    await queryRunner.query('DROP SCHEMA IF EXISTS drive CASCADE;');

    // 인덱스 제거
    await queryRunner.query(`DROP INDEX "IDX_LTREE_PATH_GIST"`);
    await queryRunner.query(`DROP INDEX "IDX_OWNER_NAME"`);
    await queryRunner.query(`DROP INDEX "IDX_NAME_BIGM"`);
    await queryRunner.query(`DROP INDEX "IDX_CHOSEONG_BTREE"`);
    await queryRunner.query(`DROP INDEX "IDX_CHOSEONG_BIGM"`);
    await queryRunner.query(`DROP INDEX "IDX_OWNER_ID"`);

    // 확장 기능 제거
    await queryRunner.query(`DROP EXTENSION IF EXISTS pg_trgm`);
    await queryRunner.query(`DROP EXTENSION IF EXISTS ltree`);
    await queryRunner.query(`DROP EXTENSION IF EXISTS pg_stat_statements`);
    await queryRunner.query(`DROP EXTENSION IF EXISTS pg_bigm`);
  }
}
