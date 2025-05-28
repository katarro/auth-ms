export async function createHistorialAssigmentExecutive(
  prisma,
  ejecutivos,
  module,
) {
  await prisma.moduleAssignment.create({
    data: {
      moduleId: module.general.id,
      executiveId: ejecutivos.ejecutivo1User.id,
      startTime: new Date(),
    },
  });

  await prisma.moduleAssignment.create({
    data: {
      moduleId: module.financial.id,
      executiveId: ejecutivos.ejecutivo2User.id,
      startTime: new Date(),
    },
  });

  await prisma.moduleAssignment.create({
    data: {
      moduleId: module.claims.id,
      executiveId: ejecutivos.ejecutivo3User.id,
      startTime: new Date(),
    },
  });
  console.log('Historial de asignaciones creado');
}
