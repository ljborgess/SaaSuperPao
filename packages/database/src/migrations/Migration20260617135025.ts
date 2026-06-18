import { Migration } from '@mikro-orm/migrations';

export class Migration20260617135025 extends Migration {

  override async up(): Promise<void> {
    this.addSql(`create table "categories" ("id" uuid not null, "name" varchar(255) not null, "description" varchar(255) null, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "categories_pkey" primary key ("id"));`);
    this.addSql(`alter table "categories" add constraint "categories_name_unique" unique ("name");`);

    this.addSql(`create table "clients" ("id" uuid not null, "name" varchar(255) not null, "cpf_cnpj" varchar(255) null, "phone" varchar(255) null, "whatsapp" varchar(255) null, "email" varchar(255) null, "address" varchar(255) null, "active" boolean not null default true, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "clients_pkey" primary key ("id"));`);
    this.addSql(`alter table "clients" add constraint "clients_cpf_cnpj_unique" unique ("cpf_cnpj");`);

    this.addSql(`create table "email_logs" ("id" uuid not null, "to" varchar(255) not null, "subject" varchar(255) not null, "template" varchar(255) not null, "status" text check ("status" in ('SENT', 'FAILED', 'PENDING')) not null default 'PENDING', "error" text null, "sent_at" timestamptz null, "created_at" timestamptz not null, constraint "email_logs_pkey" primary key ("id"));`);

    this.addSql(`create table "products" ("id" uuid not null, "name" varchar(255) not null, "code" varchar(255) not null, "category_id" uuid null, "unit" text check ("unit" in ('UN', 'KG', 'G', 'L', 'ML', 'CX', 'PCT')) not null default 'UN', "cost_price" numeric(10,2) not null default 0, "sale_price" numeric(10,2) not null default 0, "margin" numeric(5,2) not null default 0, "current_stock" numeric(10,3) not null default 0, "min_stock" numeric(10,3) not null default 0, "status" text check ("status" in ('ACTIVE', 'INACTIVE')) not null default 'ACTIVE', "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "products_pkey" primary key ("id"));`);
    this.addSql(`alter table "products" add constraint "products_code_unique" unique ("code");`);

    this.addSql(`create table "recipes" ("id" uuid not null, "product_id" uuid not null, "yield_qty" numeric(10,3) not null, "yield_unit" varchar(255) not null, "instructions" text null, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "recipes_pkey" primary key ("id"));`);
    this.addSql(`alter table "recipes" add constraint "recipes_product_id_unique" unique ("product_id");`);

    this.addSql(`create table "suppliers" ("id" uuid not null, "razao_social" varchar(255) not null, "nome_fantasia" varchar(255) null, "cnpj" varchar(255) null, "contact" varchar(255) null, "phone" varchar(255) null, "email" varchar(255) null, "address" varchar(255) null, "active" boolean not null default true, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "suppliers_pkey" primary key ("id"));`);
    this.addSql(`alter table "suppliers" add constraint "suppliers_cnpj_unique" unique ("cnpj");`);

    this.addSql(`create table "ingredients" ("id" uuid not null, "name" varchar(255) not null, "unit" text check ("unit" in ('KG', 'G', 'L', 'ML', 'UN', 'PCT', 'CX')) not null default 'KG', "cost_price" numeric(10,2) not null default 0, "current_stock" numeric(10,3) not null default 0, "min_stock" numeric(10,3) not null default 0, "supplier_id" uuid null, "active" boolean not null default true, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "ingredients_pkey" primary key ("id"));`);

    this.addSql(`create table "recipe_items" ("id" uuid not null, "recipe_id" uuid not null, "ingredient_id" uuid not null, "quantity" numeric(10,4) not null, "unit" varchar(255) not null, "created_at" timestamptz not null, constraint "recipe_items_pkey" primary key ("id"));`);

    this.addSql(`create table "users" ("id" uuid not null, "name" varchar(255) not null, "email" varchar(255) not null, "password" varchar(255) not null, "role" text check ("role" in ('ADMIN', 'MANAGER', 'OPERATOR')) not null default 'OPERATOR', "status" text check ("status" in ('ACTIVE', 'INACTIVE')) not null default 'ACTIVE', "refresh_token" varchar(255) null, "password_reset_token" varchar(255) null, "password_reset_expires" timestamptz null, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "users_pkey" primary key ("id"));`);
    this.addSql(`alter table "users" add constraint "users_email_unique" unique ("email");`);

    this.addSql(`create table "stock_movements" ("id" uuid not null, "type" text check ("type" in ('IN', 'OUT', 'ADJUSTMENT')) not null, "reason" text check ("reason" in ('PURCHASE', 'PRODUCTION', 'SALE', 'LOSS', 'INTERNAL_USE', 'MANUAL_ADJUSTMENT', 'INITIAL_STOCK')) not null, "ingredient_id" uuid null, "product_id" uuid null, "quantity" numeric(10,4) not null, "previous_stock" numeric(10,4) not null, "new_stock" numeric(10,4) not null, "created_by_id" uuid not null, "reference_id" varchar(255) null, "reference_type" varchar(255) null, "notes" text null, "created_at" timestamptz not null, constraint "stock_movements_pkey" primary key ("id"));`);

    this.addSql(`create table "purchases" ("id" uuid not null, "supplier_id" uuid not null, "created_by_id" uuid not null, "total_value" numeric(10,2) not null default 0, "purchase_date" timestamptz not null, "status" text check ("status" in ('PENDING', 'RECEIVED', 'CANCELLED')) not null default 'PENDING', "invoice_number" varchar(255) null, "notes" text null, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "purchases_pkey" primary key ("id"));`);

    this.addSql(`create table "purchase_items" ("id" uuid not null, "purchase_id" uuid not null, "ingredient_id" uuid not null, "quantity" numeric(10,3) not null, "unit_price" numeric(10,2) not null, "total_price" numeric(10,2) not null, "created_at" timestamptz not null, constraint "purchase_items_pkey" primary key ("id"));`);

    this.addSql(`create table "production_orders" ("id" uuid not null, "product_id" uuid not null, "recipe_id" uuid not null, "quantity" numeric(10,3) not null, "scheduled_date" timestamptz not null, "completed_at" timestamptz null, "responsible_id" uuid not null, "status" text check ("status" in ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED')) not null default 'PENDING', "notes" text null, "created_at" timestamptz not null, "updated_at" timestamptz not null, constraint "production_orders_pkey" primary key ("id"));`);

    this.addSql(`create table "production_order_items" ("id" uuid not null, "order_id" uuid not null, "ingredient_id" uuid not null, "required_qty" numeric(10,4) not null, "consumed_qty" numeric(10,4) null, "created_at" timestamptz not null, constraint "production_order_items_pkey" primary key ("id"));`);

    this.addSql(`create table "audit_logs" ("id" uuid not null, "user_id" uuid null, "action" text check ("action" in ('LOGIN', 'LOGOUT', 'CREATE', 'UPDATE', 'DELETE', 'STOCK_MOVEMENT', 'PASSWORD_RESET')) not null, "entity" varchar(255) not null, "entity_id" varchar(255) null, "payload" jsonb null, "ip" varchar(255) null, "created_at" timestamptz not null, constraint "audit_logs_pkey" primary key ("id"));`);

    this.addSql(`alter table "products" add constraint "products_category_id_foreign" foreign key ("category_id") references "categories" ("id") on update cascade on delete set null;`);

    this.addSql(`alter table "recipes" add constraint "recipes_product_id_foreign" foreign key ("product_id") references "products" ("id") on update cascade;`);

    this.addSql(`alter table "ingredients" add constraint "ingredients_supplier_id_foreign" foreign key ("supplier_id") references "suppliers" ("id") on update cascade on delete set null;`);

    this.addSql(`alter table "recipe_items" add constraint "recipe_items_recipe_id_foreign" foreign key ("recipe_id") references "recipes" ("id") on update cascade;`);
    this.addSql(`alter table "recipe_items" add constraint "recipe_items_ingredient_id_foreign" foreign key ("ingredient_id") references "ingredients" ("id") on update cascade;`);

    this.addSql(`alter table "stock_movements" add constraint "stock_movements_ingredient_id_foreign" foreign key ("ingredient_id") references "ingredients" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "stock_movements" add constraint "stock_movements_product_id_foreign" foreign key ("product_id") references "products" ("id") on update cascade on delete set null;`);
    this.addSql(`alter table "stock_movements" add constraint "stock_movements_created_by_id_foreign" foreign key ("created_by_id") references "users" ("id") on update cascade;`);

    this.addSql(`alter table "purchases" add constraint "purchases_supplier_id_foreign" foreign key ("supplier_id") references "suppliers" ("id") on update cascade;`);
    this.addSql(`alter table "purchases" add constraint "purchases_created_by_id_foreign" foreign key ("created_by_id") references "users" ("id") on update cascade;`);

    this.addSql(`alter table "purchase_items" add constraint "purchase_items_purchase_id_foreign" foreign key ("purchase_id") references "purchases" ("id") on update cascade;`);
    this.addSql(`alter table "purchase_items" add constraint "purchase_items_ingredient_id_foreign" foreign key ("ingredient_id") references "ingredients" ("id") on update cascade;`);

    this.addSql(`alter table "production_orders" add constraint "production_orders_product_id_foreign" foreign key ("product_id") references "products" ("id") on update cascade;`);
    this.addSql(`alter table "production_orders" add constraint "production_orders_recipe_id_foreign" foreign key ("recipe_id") references "recipes" ("id") on update cascade;`);
    this.addSql(`alter table "production_orders" add constraint "production_orders_responsible_id_foreign" foreign key ("responsible_id") references "users" ("id") on update cascade;`);

    this.addSql(`alter table "production_order_items" add constraint "production_order_items_order_id_foreign" foreign key ("order_id") references "production_orders" ("id") on update cascade;`);
    this.addSql(`alter table "production_order_items" add constraint "production_order_items_ingredient_id_foreign" foreign key ("ingredient_id") references "ingredients" ("id") on update cascade;`);

    this.addSql(`alter table "audit_logs" add constraint "audit_logs_user_id_foreign" foreign key ("user_id") references "users" ("id") on update cascade on delete set null;`);
  }

}
