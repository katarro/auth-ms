-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('CLIENTE', 'EJECUTIVO', 'ADMIN');

-- CreateEnum
CREATE TYPE "Estado" AS ENUM ('PENDIENTE', 'ATENDIDO', 'CANCELADO');

-- CreateTable
CREATE TABLE "usuario" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "correo" TEXT NOT NULL,
    "contrasena" TEXT NOT NULL,
    "rol" "Rol" NOT NULL,

    CONSTRAINT "usuario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sucursal" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "horario" TIMESTAMP(3) NOT NULL,
    "estado" BOOLEAN NOT NULL,

    CONSTRAINT "sucursal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fila" (
    "id" SERIAL NOT NULL,
    "numero_anterior" INTEGER NOT NULL,
    "numero_actual" INTEGER NOT NULL,
    "numero_siguiente" INTEGER NOT NULL,
    "ultima_actualizacion" TIMESTAMP(3) NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "sucursal_id" INTEGER NOT NULL,

    CONSTRAINT "fila_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registro_numero" (
    "id" SERIAL NOT NULL,
    "sucursal_id" INTEGER NOT NULL,
    "usuario_id" INTEGER NOT NULL,
    "numero" INTEGER NOT NULL,
    "estado" "Estado" NOT NULL,
    "creado_en" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "registro_numero_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "usuario_nombre_key" ON "usuario"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "usuario_correo_key" ON "usuario"("correo");

-- CreateIndex
CREATE UNIQUE INDEX "sucursal_direccion_key" ON "sucursal"("direccion");

-- AddForeignKey
ALTER TABLE "fila" ADD CONSTRAINT "fila_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fila" ADD CONSTRAINT "fila_sucursal_id_fkey" FOREIGN KEY ("sucursal_id") REFERENCES "sucursal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro_numero" ADD CONSTRAINT "registro_numero_sucursal_id_fkey" FOREIGN KEY ("sucursal_id") REFERENCES "sucursal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registro_numero" ADD CONSTRAINT "registro_numero_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
