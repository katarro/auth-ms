export async function createBranch(prisma, company, adminBranch) {
  const test = await prisma.branch.upsert({
    where: {
      companyId_name: {
        companyId: company.test.id,
        name: 'Sucursal Central',
      },
    },
    update: { adminId: adminBranch.admin.id },
    create: {
      id: 'test-branch-id',
      name: 'Sucursal Central',
      companyId: company.test.id,
      adminId: adminBranch.admin.id,
      address: 'Av. Providencia 1234, Santiago',
      isActive: true,
    },
  });

  console.log('Sucursal Central creada/actualizada');

  return { test };
}
