export async function createServiceType(prisma, branch) {
  const general = await prisma.serviceType.create({
    data: {
      branchId: branch.test.id,
      name: 'Atención General',
      description: 'Servicios generales y consultas',
      isActive: true,
      code: 'G',
    },
  });

  const financial = await prisma.serviceType.create({
    data: {
      branchId: branch.test.id,
      name: 'Servicios Financieros',
      description: 'Pagos, transferencias y operaciones financieras',
      isActive: true,
      code: 'F',
    },
  });

  const claims = await prisma.serviceType.create({
    data: {
      branchId: branch.test.id,
      name: 'Reclamos y Sugerencias',
      description: 'Atención a reclamos, quejas y sugerencias',
      isActive: true,
      code: 'R',
    },
  });
  console.log('Tipos de servicio creados');

  return {
    general,
    financial,
    claims,
  };
}
