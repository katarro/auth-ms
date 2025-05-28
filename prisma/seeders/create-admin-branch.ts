export async function createAdminBranch(
  prisma,
  defaultPassword,
  adminSucursalRole,
  company,
) {
  const admin = await prisma.user.upsert({
    where: { email: 'admin@sucursal.cl' },
    update: {},
    create: {
      name: 'Admin Sucursal',
      email: 'admin@sucursal.cl',
      password: defaultPassword,
      roleId: adminSucursalRole.id,
      phone: '+56934567890',
      companyId: company.test.id,
    },
  });
  console.log('Usuario Admin Sucursal creado/actualizado');

  return { admin };
}
