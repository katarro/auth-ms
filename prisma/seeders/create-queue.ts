export async function createQueue(prisma, testBranch, serviceTypes, module) {
  const general = await prisma.queue.create({
    data: {
      name: 'Cola Modulo 1',
      serviceTypeId: serviceTypes.general.id,
      serviceModuleId: module.general.id,
      isActive: true,
      branchId: testBranch.id,
    },
  });

  const financial = await prisma.queue.create({
    data: {
      name: 'Cola Modulo 2',
      serviceTypeId: serviceTypes.financial.id,
      isActive: true,
      serviceModuleId: module.financial.id,
      branchId: testBranch.id,
    },
  });

  const claims = await prisma.queue.create({
    data: {
      name: 'Cola Modulo 3',
      serviceTypeId: serviceTypes.claims.id,
      isActive: true,
      serviceModuleId: module.claims.id,
      branchId: testBranch.id,
    },
  });
  console.log('Colas creadas');

  return {
    general,
    financial,
    claims,
  };
}
