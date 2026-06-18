import { Migration } from '@mikro-orm/migrations'

export class Migration20260618120000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`alter table "users" add column "login_attempts" integer not null default 0;`)
    this.addSql(`alter table "users" add column "locked_until" timestamptz null;`)

    this.addSql(`alter table "audit_logs" drop constraint if exists "audit_logs_action_check";`)
    this.addSql(`alter table "audit_logs" add constraint "audit_logs_action_check" check ("action" in ('LOGIN', 'LOGIN_FAILED', 'LOGOUT', 'CREATE', 'UPDATE', 'DELETE', 'STOCK_MOVEMENT', 'PASSWORD_RESET'));`)
  }

  override async down(): Promise<void> {
    this.addSql(`alter table "users" drop column "login_attempts";`)
    this.addSql(`alter table "users" drop column "locked_until";`)

    this.addSql(`alter table "audit_logs" drop constraint if exists "audit_logs_action_check";`)
    this.addSql(`alter table "audit_logs" add constraint "audit_logs_action_check" check ("action" in ('LOGIN', 'LOGOUT', 'CREATE', 'UPDATE', 'DELETE', 'STOCK_MOVEMENT', 'PASSWORD_RESET'));`)
  }
}
