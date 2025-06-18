import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddRefreshToken1721420000000 implements MigrationInterface {
  name = 'AddRefreshToken1721420000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "refreshToken" varchar`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "refreshToken"`);
  }
}
