export async function createModuleService(
  prisma,
  testBranch,
  serviceTypes,
  ejecutivos,
) {
  // Módulos para Atención General
  const general = await prisma.serviceModule.create({
    data: {
      branchId: testBranch.id,
      serviceTypeId: serviceTypes.general.id,
      name: 'Módulo 1',
      currentExecutiveId: ejecutivos.ejecutivo1User.id,
      isActive: true,
    },
  });

  // Módulos para Servicios Financieros
  const financial = await prisma.serviceModule.create({
    data: {
      branchId: testBranch.id,
      serviceTypeId: serviceTypes.financial.id,
      name: 'Modulo 2',
      currentExecutiveId: ejecutivos.ejecutivo2User.id,
      isActive: true,
    },
  });

  // Módulos para Reclamos
  const claims = await prisma.serviceModule.create({
    data: {
      branchId: testBranch.id,
      serviceTypeId: serviceTypes.claims.id,
      name: 'Módulo 3',
      currentExecutiveId: ejecutivos.ejecutivo3User.id,
      isActive: true,
    },
  });

  console.log('Módulos de servicio creados');

  return {
    general,
    financial,
    claims,
  };
}
