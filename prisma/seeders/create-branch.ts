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
  console.log('✅ Sucursal Central creada/actualizada: ', test);

  const test2 = await prisma.branch.upsert({
    where: {
      companyId_name: {
        companyId: company.test.id,
        name: 'Sucursal Norte',
      },
    },
    update: { adminId: adminBranch.admin.id },
    create: {
      id: 'test-branch-id-2',
      name: 'Sucursal Norte',
      companyId: company.test.id,
      adminId: adminBranch.admin.id,
      address: 'Av. Recoleta 456, Santiago',
      isActive: true,
    },
  });
  console.log('✅ Sucursal Norte creada/actualizada: ', test2);

  const test3 = await prisma.branch.upsert({
    where: {
      companyId_name: {
        companyId: company.test.id,
        name: 'Sucursal Sur',
      },
    },
    update: { adminId: adminBranch.admin.id },
    create: {
      id: 'test-branch-id-3',
      name: 'Sucursal Sur',
      companyId: company.test.id,
      adminId: adminBranch.admin.id,
      address: 'Av. La Florida 789, Santiago',
      isActive: true,
    },
  });
  console.log('✅ Sucursal Sur creada/actualizada: ', test3);

  const test4 = await prisma.branch.upsert({
    where: {
      companyId_name: {
        companyId: company.test.id,
        name: 'Sucursal Oriente',
      },
    },
    update: { adminId: adminBranch.admin.id },
    create: {
      id: 'test-branch-id-4',
      name: 'Sucursal Oriente',
      companyId: company.test.id,
      adminId: adminBranch.admin.id,
      address: 'Av. Las Condes 1011, Santiago',
      isActive: true,
    },
  });
  console.log('✅ Sucursal Oriente creada/actualizada: ', test4);

  const test5 = await prisma.branch.upsert({
    where: {
      companyId_name: {
        companyId: company.test.id,
        name: 'Sucursal Poniente',
      },
    },
    update: { adminId: adminBranch.admin.id },
    create: {
      id: 'test-branch-id-5',
      name: 'Sucursal Poniente',
      companyId: company.test.id,
      adminId: adminBranch.admin.id,
      address: 'Av. Pajaritos 1213, Santiago',
      isActive: true,
    },
  });
  console.log('✅ Sucursal Poniente creada/actualizada: ', test5);

  console.log('✅ 5 sucursales creadas/actualizadas');

  return { test }; // Retornamos la sucursal principal
}
