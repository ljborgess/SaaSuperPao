import { Migration } from '@mikro-orm/migrations'

export class Migration20260626000000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`alter table "users" add column "deleted_at" timestamptz null;`)
    this.addSql(`alter table "clients" add column "deleted_at" timestamptz null;`)
    this.addSql(`alter table "suppliers" add column "deleted_at" timestamptz null;`)
    this.addSql(`alter table "products" add column "deleted_at" timestamptz null;`)
    this.addSql(`alter table "ingredients" add column "deleted_at" timestamptz null;`)

    this.addSql(`alter table "audit_logs" drop constraint if exists "audit_logs_action_check";`)
    this.addSql(`alter table "audit_logs" add constraint "audit_logs_action_check" check ("action" in ('LOGIN', 'LOGIN_FAILED', 'LOGOUT', 'CREATE', 'UPDATE', 'DELETE', 'STOCK_MOVEMENT', 'PASSWORD_RESET', 'PASSWORD_CHANGE'));`)
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "users" drop column "deleted_at";`)
    this.addSql(`alter table "clients" drop column "deleted_at";`)
    this.addSql(`alter table "suppliers" drop column "deleted_at";`)
    this.addSql(`alter table "products" drop column "deleted_at";`)
    this.addSql(`alter table "ingredients" drop column "deleted_at";`)

    this.addSql(`alter table "audit_logs" drop constraint if exists "audit_logs_action_check";`)
    this.addSql(`alter table "audit_logs" add constraint "audit_logs_action_check" check ("action" in ('LOGIN', 'LOGIN_FAILED', 'LOGOUT', 'CREATE', 'UPDATE', 'DELETE', 'STOCK_MOVEMENT', 'PASSWORD_RESET'));`)
  }
}
