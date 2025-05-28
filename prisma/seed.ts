// auth-ms/prisma/seed.ts
import {
  PrismaClient,
  RoleType,
  AbsencePolicy,
  TicketStatus,
} from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { createQueue } from './seeders/create-queue';
import { createRoles } from './seeders/create-roles';
import { createBranch } from './seeders/create-branch';
import { createClients } from './seeders/create-clients';
import { createCompany } from './seeders/create-company';
import { createExecutives } from './seeders/create-executives';
import { createTypesClient } from './seeders/create-types-client';
import { createServiceType } from './seeders/create-service-type';
import { createAdminBranch } from './seeders/create-admin-branch';
import { asignQueueToModule } from './seeders/asign-queue-to-module';
import { createModuleService } from './seeders/create-module-service';
import { createServiceTicket } from './seeders/create-service-ticket';
import { createAdminBusiness } from './seeders/create-admin-business';
import { configureSettingsQueue } from './seeders/configure-settings-queue';
import { createHistorialAssigmentExecutive } from './seeders/create-historial-assigment.executive';

const prisma = new PrismaClient();

const CustomerTypeConst = {
  REGULAR: {
    id: 'regular-id',
    name: 'REGULAR',
    description: 'Cliente regular sin prioridad especial',
    priorityLevel: 0,
  },
  SENIOR: {
    id: 'senior-id',
    name: 'SENIOR',
    description: 'Cliente mayor de 60 años',
    priorityLevel: 3,
  },
  REDUCED_CAPACITY: {
    id: 'reduced-capacity-id',
    name: 'REDUCED_CAPACITY',
    description: 'Cliente con capacidad reducida',
    priorityLevel: 4,
  },
  PREGNANT: {
    id: 'pregnant-id',
    name: 'PREGNANT',
    description: 'Cliente embarazada',
    priorityLevel: 3,
  },
  PREFERENTIAL: {
    id: 'preferential-id',
    name: 'PREFERENTIAL',
    description: 'Cliente preferencial',
    priorityLevel: 2,
  },
};

async function main() {
  console.log('Iniciando seeders para auth-ms...');

  // 1. Crear roles
  await createRoles(prisma);

  // 2. Obtener IDs de roles para referencias
  const adminRole = await prisma.role.findUnique({
    where: { name: RoleType.ADMIN },
  });
  const adminBusinessRole = await prisma.role.findUnique({
    where: { name: RoleType.ADMIN_BUSINESS },
  });
  const adminSucursalRole = await prisma.role.findUnique({
    where: { name: RoleType.ADMIN_BRANCH },
  });
  const ejecutivoRole = await prisma.role.findUnique({
    where: { name: RoleType.EXECUTIVE },
  });
  const clienteRole = await prisma.role.findUnique({
    where: { name: RoleType.CLIENT },
  });

  if (
    !adminRole ||
    !adminBusinessRole ||
    !adminSucursalRole ||
    !ejecutivoRole ||
    !clienteRole
  ) {
    throw new Error('No se pudieron crear todos los roles necesarios');
  }

  // 3. Crear tipos de cliente
  const customerTypes = await createTypesClient(prisma, CustomerTypeConst);

  // 4. Crear usuarios
  const saltRounds = 10;
  const defaultPassword = await bcrypt.hash('Password123*', saltRounds);

  const admin = await createAdminBusiness(
    prisma,
    defaultPassword,
    adminRole,
    adminBusinessRole,
  );

  // Crear empresa
  const company = await createCompany(prisma, admin);

  // Usuario Admin Sucursal
  const adminBranch = await createAdminBranch(
    prisma,
    defaultPassword,
    adminSucursalRole,
    company,
  );
  // Crear sucursal
  const branch = await createBranch(prisma, company, adminBranch);

  await prisma.user.update({
    where: { id: adminBranch.admin.id },
    data: { branchId: branch.test.id },
  });

  // Usuarios Ejecutivos
  const ejecutivos = await createExecutives(
    prisma,
    defaultPassword,
    ejecutivoRole,
    company,
    branch,
  );

  // 5. Crear usuarios clientes
  const clientes = await createClients(
    prisma,
    defaultPassword,
    clienteRole,
    customerTypes,
  );

  // Asignar empresa al AdminBusiness
  await prisma.user.update({
    where: { email: admin.business.email },
    data: {
      companyId: company.test.id,
    },
  });

  // 6. Crear tipos de servicio
  const serviceTypes = await createServiceType(prisma, branch);

  // 9. Crear módulos de servicio
  const module = await createModuleService(
    prisma,
    branch.test,
    serviceTypes,
    ejecutivos,
  );

  // 7. Crear colas por tipo de servicio
  const queue = await createQueue(prisma, branch.test, serviceTypes, module);

  // 8. Configurar ajustes de colas
  await configureSettingsQueue(prisma, queue, AbsencePolicy);

  // 10. Crear historial de asignaciones de ejecutivos
  await createHistorialAssigmentExecutive(prisma, ejecutivos, module);

  // Asignar colas a módulos de servicio
  await asignQueueToModule(prisma, queue, module);

  // 11. Crear tickets de servicio
  await createServiceTicket(
    prisma,
    clientes,
    module,
    queue,
    TicketStatus,
    serviceTypes,
  );

  console.log('Seeders completados con éxito');
}

main()
  .catch((e) => {
    console.error('Error durante el seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
