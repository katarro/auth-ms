export async function asignQueueToModule(prisma, queue, module) {
  await prisma.serviceModule.update({
    where: { id: module.general.id },
    data: {
      queueId: queue.general.id,
    },
  });

  await prisma.serviceModule.update({
    where: { id: module.financial.id },
    data: {
      queueId: queue.financial.id,
    },
  });
  await prisma.serviceModule.update({
    where: { id: module.claims.id },
    data: {
      queueId: queue.claims.id,
    },
  });
  console.log('Colas asignadas a módulos de servicio');
}
