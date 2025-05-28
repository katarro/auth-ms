export async function createAdminBusiness(
  prisma,
  defaultPassword,
  adminRole,
  adminBusinessRole,
) {
  // Usuario Admin
  await prisma.user.upsert({
    where: { email: 'superadmin@freeq.cl' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'superadmin@freeq.cl',
      password: defaultPassword,
      roleId: adminRole.id,
      phone: '+56912345678',
    },
  });
  console.log('Usuario Admin creado/actualizado');

  // Usuario Admin Business
  const business = await prisma.user.upsert({
    where: { email: 'empresa@freeq.cl' },
    update: {},
    create: {
      name: 'Admin Empresa',
      email: 'admin@empresa.cl',
      password: defaultPassword,
      roleId: adminBusinessRole.id,
      phone: '+56923456789',
    },
  });
  console.log('Usuario Admin Cliente creado/actualizado');

  return {
    business,
  };
}
