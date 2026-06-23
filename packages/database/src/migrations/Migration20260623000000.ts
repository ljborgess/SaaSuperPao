import { Migration } from '@mikro-orm/migrations'

export class Migration20260623000000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`alter table "users" add column "avatar_url" text null;`)
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "users" drop column "avatar_url";`)
  }
}
