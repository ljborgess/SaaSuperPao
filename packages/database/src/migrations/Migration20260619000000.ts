import { Migration } from '@mikro-orm/migrations'

export class Migration20260619000000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`alter table "production_orders" add column "mode" varchar(255) not null default 'AUTOMATIC';`)
    this.addSql(`alter table "production_orders" add constraint "production_orders_mode_check" check ("mode" in ('AUTOMATIC', 'MANUAL'));`)
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "production_orders" drop constraint if exists "production_orders_mode_check";`)
    this.addSql(`alter table "production_orders" drop column "mode";`)
  }
}
