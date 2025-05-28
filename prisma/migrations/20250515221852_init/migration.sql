-- CreateEnum
CREATE TYPE "RoleType" AS ENUM ('ADMIN', 'ADMIN_BUSINESS', 'ADMIN_BRANCH', 'EXECUTIVE', 'CLIENT');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('WAITING', 'CALLED', 'ATTENDING', 'COMPLETED', 'ABSENT', 'POSTPONED');

-- CreateEnum
CREATE TYPE "EntryType" AS ENUM ('VIRTUAL', 'PHYSICAL', 'MIXED');

-- CreateEnum
CREATE TYPE "SyncStatus" AS ENUM ('SYNCED', 'PENDING', 'FAILED');

-- CreateEnum
CREATE TYPE "AbsencePolicy" AS ENUM ('END_QUEUE', 'POSTPONE', 'DISCARD');

-- CreateEnum
CREATE TYPE "ModelType" AS ENUM ('M_M_1', 'M_M_C', 'ML_REGRESSION', 'ML_DECISION_TREE');

-- CreateEnum
CREATE TYPE "ReorderingEventType" AS ENUM ('ABSENCE', 'OPERATOR_OFFLINE', 'PRIORITY_CHANGE');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('PROXIMITY', 'CALLED', 'CANCELLED', 'DELAYED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "phone" TEXT,
    "picture" TEXT,
    "role_id" TEXT NOT NULL,
    "customer_type_id" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" TEXT NOT NULL,
    "name" "RoleType" NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "companies" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "admin_id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "branches" (
    "id" TEXT NOT NULL,
    "company_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "admin_id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "offline_mode" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "branches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "queues" (
    "id" TEXT NOT NULL,
    "branch_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "queues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_points" (
    "id" TEXT NOT NULL,
    "branch_id" TEXT NOT NULL,
    "queue_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "executive_id" TEXT NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_points_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "queue_tickets" (
    "id" TEXT NOT NULL,
    "queue_id" TEXT NOT NULL,
    "user_id" TEXT,
    "anonymous_email" TEXT,
    "anonymous_phone" TEXT,
    "registration_token" TEXT,
    "ticket_number" TEXT NOT NULL,
    "qr_code" TEXT NOT NULL,
    "estimated_wait_time" INTEGER NOT NULL,
    "priority_level" INTEGER NOT NULL DEFAULT 0,
    "status" "TicketStatus" NOT NULL DEFAULT 'WAITING',
    "entry_time" TIMESTAMP(3) NOT NULL,
    "call_time" TIMESTAMP(3),
    "service_time" TIMESTAMP(3),
    "end_time" TIMESTAMP(3),
    "service_point_id" TEXT,
    "entryType" "EntryType" NOT NULL DEFAULT 'VIRTUAL',
    "created_offline" BOOLEAN NOT NULL DEFAULT false,
    "sync_status" "SyncStatus" NOT NULL DEFAULT 'SYNCED',
    "absence_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "queue_tickets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "queue_settings" (
    "id" TEXT NOT NULL,
    "queue_id" TEXT NOT NULL,
    "max_absence_time" INTEGER NOT NULL,
    "absence_policy" "AbsencePolicy" NOT NULL DEFAULT 'END_QUEUE',
    "postpone_positions" INTEGER NOT NULL DEFAULT 3,
    "notification_time" INTEGER NOT NULL,
    "max_daily_entries" INTEGER NOT NULL DEFAULT 3,
    "allow_anonymous_tickets" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "queue_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "queue_metrics" (
    "id" TEXT NOT NULL,
    "queue_id" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "hour" INTEGER NOT NULL,
    "arrival_rate" DOUBLE PRECISION NOT NULL,
    "service_rate" DOUBLE PRECISION NOT NULL,
    "servers_count" INTEGER NOT NULL,
    "average_wait_time" DOUBLE PRECISION NOT NULL,
    "average_queue_length" DOUBLE PRECISION NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "queue_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "offline_sync_queue" (
    "id" TEXT NOT NULL,
    "branch_id" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_data" JSONB NOT NULL,
    "sync_status" "SyncStatus" NOT NULL DEFAULT 'PENDING',
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "offline_sync_queue_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customer_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "priority_level" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "customer_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prediction_models" (
    "id" TEXT NOT NULL,
    "queue_id" TEXT NOT NULL,
    "model_type" "ModelType" NOT NULL,
    "parameters" JSONB NOT NULL,
    "accuracy" DOUBLE PRECISION NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "prediction_models_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reordering_events" (
    "id" TEXT NOT NULL,
    "queue_id" TEXT NOT NULL,
    "event_type" "ReorderingEventType" NOT NULL,
    "affected_tickets_count" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reordering_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "satisfaction_surveys" (
    "id" TEXT NOT NULL,
    "ticket_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comments" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "satisfaction_surveys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "ticket_id" TEXT NOT NULL,
    "anonymous_email" TEXT,
    "anonymous_phone" TEXT,
    "type" "NotificationType" NOT NULL,
    "message" TEXT NOT NULL,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fraud_detection" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "queue_id" TEXT NOT NULL,
    "ip_address" TEXT,
    "daily_entry_count" INTEGER NOT NULL DEFAULT 0,
    "last_entry_time" TIMESTAMP(3),
    "is_restricted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "fraud_detection_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" JSONB NOT NULL,
    "ip_address" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "system_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "anonymous_token_validations" (
    "id" TEXT NOT NULL,
    "registration_token" TEXT NOT NULL,
    "ticket_id" TEXT NOT NULL,
    "validation_attempts" INTEGER NOT NULL DEFAULT 0,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "is_used" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "anonymous_token_validations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_id_idx" ON "users"("role_id");

-- CreateIndex
CREATE UNIQUE INDEX "roles_name_key" ON "roles"("name");

-- CreateIndex
CREATE INDEX "companies_admin_id_idx" ON "companies"("admin_id");

-- CreateIndex
CREATE INDEX "branches_company_id_idx" ON "branches"("company_id");

-- CreateIndex
CREATE INDEX "branches_admin_id_idx" ON "branches"("admin_id");

-- CreateIndex
CREATE UNIQUE INDEX "branches_company_id_name_key" ON "branches"("company_id", "name");

-- CreateIndex
CREATE INDEX "queues_branch_id_idx" ON "queues"("branch_id");

-- CreateIndex
CREATE UNIQUE INDEX "queues_branch_id_name_key" ON "queues"("branch_id", "name");

-- CreateIndex
CREATE INDEX "service_points_branch_id_idx" ON "service_points"("branch_id");

-- CreateIndex
CREATE INDEX "service_points_queue_id_idx" ON "service_points"("queue_id");

-- CreateIndex
CREATE INDEX "service_points_executive_id_idx" ON "service_points"("executive_id");

-- CreateIndex
CREATE UNIQUE INDEX "service_points_branch_id_name_key" ON "service_points"("branch_id", "name");

-- CreateIndex
CREATE INDEX "queue_tickets_queue_id_idx" ON "queue_tickets"("queue_id");

-- CreateIndex
CREATE INDEX "queue_tickets_user_id_idx" ON "queue_tickets"("user_id");

-- CreateIndex
CREATE INDEX "queue_tickets_registration_token_idx" ON "queue_tickets"("registration_token");

-- CreateIndex
CREATE INDEX "queue_tickets_status_idx" ON "queue_tickets"("status");

-- CreateIndex
CREATE INDEX "queue_tickets_entry_time_idx" ON "queue_tickets"("entry_time");

-- CreateIndex
CREATE UNIQUE INDEX "queue_settings_queue_id_key" ON "queue_settings"("queue_id");

-- CreateIndex
CREATE INDEX "queue_metrics_queue_id_idx" ON "queue_metrics"("queue_id");

-- CreateIndex
CREATE INDEX "queue_metrics_date_hour_idx" ON "queue_metrics"("date", "hour");

-- CreateIndex
CREATE INDEX "offline_sync_queue_branch_id_idx" ON "offline_sync_queue"("branch_id");

-- CreateIndex
CREATE INDEX "offline_sync_queue_sync_status_idx" ON "offline_sync_queue"("sync_status");

-- CreateIndex
CREATE INDEX "prediction_models_queue_id_idx" ON "prediction_models"("queue_id");

-- CreateIndex
CREATE INDEX "reordering_events_queue_id_idx" ON "reordering_events"("queue_id");

-- CreateIndex
CREATE INDEX "reordering_events_created_at_idx" ON "reordering_events"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "satisfaction_surveys_ticket_id_key" ON "satisfaction_surveys"("ticket_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_idx" ON "notifications"("user_id");

-- CreateIndex
CREATE INDEX "notifications_ticket_id_idx" ON "notifications"("ticket_id");

-- CreateIndex
CREATE INDEX "notifications_is_read_idx" ON "notifications"("is_read");

-- CreateIndex
CREATE INDEX "fraud_detection_user_id_idx" ON "fraud_detection"("user_id");

-- CreateIndex
CREATE INDEX "fraud_detection_queue_id_idx" ON "fraud_detection"("queue_id");

-- CreateIndex
CREATE INDEX "fraud_detection_ip_address_idx" ON "fraud_detection"("ip_address");

-- CreateIndex
CREATE INDEX "system_logs_user_id_idx" ON "system_logs"("user_id");

-- CreateIndex
CREATE INDEX "system_logs_entity_type_entity_id_idx" ON "system_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "system_logs_created_at_idx" ON "system_logs"("created_at");

-- CreateIndex
CREATE UNIQUE INDEX "anonymous_token_validations_registration_token_key" ON "anonymous_token_validations"("registration_token");

-- CreateIndex
CREATE UNIQUE INDEX "anonymous_token_validations_ticket_id_key" ON "anonymous_token_validations"("ticket_id");

-- CreateIndex
CREATE INDEX "anonymous_token_validations_registration_token_idx" ON "anonymous_token_validations"("registration_token");

-- CreateIndex
CREATE INDEX "anonymous_token_validations_ticket_id_idx" ON "anonymous_token_validations"("ticket_id");

-- CreateIndex
CREATE INDEX "anonymous_token_validations_expires_at_idx" ON "anonymous_token_validations"("expires_at");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_customer_type_id_fkey" FOREIGN KEY ("customer_type_id") REFERENCES "customer_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "companies" ADD CONSTRAINT "companies_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branches" ADD CONSTRAINT "branches_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branches" ADD CONSTRAINT "branches_admin_id_fkey" FOREIGN KEY ("admin_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "queues" ADD CONSTRAINT "queues_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_points" ADD CONSTRAINT "service_points_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_points" ADD CONSTRAINT "service_points_queue_id_fkey" FOREIGN KEY ("queue_id") REFERENCES "queues"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_points" ADD CONSTRAINT "service_points_executive_id_fkey" FOREIGN KEY ("executive_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "queue_tickets" ADD CONSTRAINT "queue_tickets_queue_id_fkey" FOREIGN KEY ("queue_id") REFERENCES "queues"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "queue_tickets" ADD CONSTRAINT "queue_tickets_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "queue_tickets" ADD CONSTRAINT "queue_tickets_service_point_id_fkey" FOREIGN KEY ("service_point_id") REFERENCES "service_points"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "queue_settings" ADD CONSTRAINT "queue_settings_queue_id_fkey" FOREIGN KEY ("queue_id") REFERENCES "queues"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "queue_metrics" ADD CONSTRAINT "queue_metrics_queue_id_fkey" FOREIGN KEY ("queue_id") REFERENCES "queues"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "offline_sync_queue" ADD CONSTRAINT "offline_sync_queue_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prediction_models" ADD CONSTRAINT "prediction_models_queue_id_fkey" FOREIGN KEY ("queue_id") REFERENCES "queues"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reordering_events" ADD CONSTRAINT "reordering_events_queue_id_fkey" FOREIGN KEY ("queue_id") REFERENCES "queues"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "satisfaction_surveys" ADD CONSTRAINT "satisfaction_surveys_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "queue_tickets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "queue_tickets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fraud_detection" ADD CONSTRAINT "fraud_detection_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fraud_detection" ADD CONSTRAINT "fraud_detection_queue_id_fkey" FOREIGN KEY ("queue_id") REFERENCES "queues"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "system_logs" ADD CONSTRAINT "system_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "anonymous_token_validations" ADD CONSTRAINT "anonymous_token_validations_ticket_id_fkey" FOREIGN KEY ("ticket_id") REFERENCES "queue_tickets"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
