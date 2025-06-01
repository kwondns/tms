import { MigrationInterface, QueryRunner } from 'typeorm';
export class Migrations0000000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
    CREATE OR REPLACE FUNCTION get_choseong(input_text TEXT)
    RETURNS TEXT AS $$
    DECLARE
        CHO text[] = ARRAY[
            'ㄱ','ㄲ','ㄴ','ㄷ','ㄸ','ㄹ','ㅁ','ㅂ','ㅃ',
            'ㅅ','ㅆ','ㅇ','ㅈ','ㅉ','ㅊ','ㅋ','ㅌ','ㅍ','ㅎ'
        ];
        normalized_text TEXT := normalize(input_text, NFC);
        result TEXT := '';
        code INT;
        idx INT;
    BEGIN
        FOR i IN 1..length(normalized_text) LOOP
            code := ascii(substring(normalized_text from i for 1));

            IF code BETWEEN 44032 AND 55203 THEN
                idx := FLOOR((code - 44032) / 588) + 1;
                result := result || CHO[idx];
            ELSE
                result := result || substring(normalized_text from i for 1);
            END IF;
        END LOOP;
        RETURN result;
    END;
    $$ LANGUAGE plpgsql IMMUTABLE;
          `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP FUNCTION IF EXISTS get_choseong`);
  }
}
