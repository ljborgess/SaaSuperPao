import { Migration } from '@mikro-orm/migrations'

export class Migration20260625000000 extends Migration {
  override async up(): Promise<void> {
    this.addSql(`
      create table "notas_fiscais" (
        "id" uuid not null,
        "client_id" uuid null,
        "client_name" varchar(255) not null,
        "client_cpf_cnpj" varchar(255) null,
        "client_email" varchar(255) null,
        "service_description" text not null,
        "service_code" varchar(255) null,
        "value" numeric(10,2) not null,
        "status" text check ("status" in ('PENDING', 'ISSUED', 'CANCELLED', 'ERROR')) not null default 'PENDING',
        "external_id" varchar(255) null,
        "nfse_number" varchar(255) null,
        "error_message" text null,
        "created_by_id" uuid not null,
        "issued_at" timestamptz null,
        "cancelled_at" timestamptz null,
        "created_at" timestamptz not null,
        "updated_at" timestamptz not null,
        constraint "notas_fiscais_pkey" primary key ("id")
      );
    `)

    this.addSql(`
      alter table "notas_fiscais"
        add constraint "notas_fiscais_client_id_foreign"
        foreign key ("client_id") references "clients" ("id")
        on update cascade on delete set null;
    `)

    this.addSql(`
      alter table "notas_fiscais"
        add constraint "notas_fiscais_created_by_id_foreign"
        foreign key ("created_by_id") references "users" ("id")
        on update cascade;
    `)
  }

  override async down(): Promise<void> {
    this.addSql(`drop table if exists "notas_fiscais";`)
  }
}
