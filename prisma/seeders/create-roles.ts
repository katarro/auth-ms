import { RoleType } from '@prisma/client';

export async function createRoles(prisma) {
  const roles = [
    {
      name: RoleType.ADMIN,
      description: 'Administrador general del sistema',
    },
    {
      name: RoleType.ADMIN_BUSINESS,
      description: 'Administrador de empresas cliente',
    },
    { name: RoleType.ADMIN_BRANCH, description: 'Administrador de sucursal' },
    { name: RoleType.EXECUTIVE, description: 'Ejecutivo de atención' },
    { name: RoleType.CLIENT, description: 'Cliente final' },
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { name: role.name },
      update: {},
      create: {
        name: role.name,
        description: role.description,
      },
    });
    console.log(`Role ${role.name} creado/actualizado`);
  }

  return roles;
}
