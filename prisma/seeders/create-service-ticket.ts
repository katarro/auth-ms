export async function createServiceTicket(
  prisma,
  clientes,
  module,
  queue,
  TicketStatus,
  serviceTypes,
) {
  console.log('moduleCode', serviceTypes.general.code);
  await prisma.queueTicket.create({
    data: {
      queueId: queue.general.id,
      userId: clientes.client1.id,
      serviceModuleId: module.general.id,
      ticketNumber: 1,
      estimatedWaitTime: 5,
      entryTime: new Date(),
      status: TicketStatus.WAITING,
      moduleCode: serviceTypes.general.code,
    },
  });

  await prisma.queueTicket.create({
    data: {
      queueId: queue.general.id,
      userId: clientes.client2.id,
      serviceModuleId: module.general.id,
      ticketNumber: 2,
      estimatedWaitTime: 10,
      entryTime: new Date(),
      status: TicketStatus.WAITING,
      moduleCode: serviceTypes.general.code,
    },
  });

  await prisma.queueTicket.create({
    data: {
      queueId: queue.general.id,
      userId: clientes.client3.id,
      serviceModuleId: module.general.id,
      ticketNumber: 3,
      estimatedWaitTime: 15,
      entryTime: new Date(),
      status: TicketStatus.WAITING,
      moduleCode: serviceTypes.general.code,
    },
  });

  await prisma.queueTicket.create({
    data: {
      queueId: queue.general.id,
      userId: clientes.client4.id,
      serviceModuleId: module.general.id,
      ticketNumber: 4,
      estimatedWaitTime: 20,
      entryTime: new Date(),
      status: TicketStatus.WAITING,
      moduleCode: serviceTypes.general.code,
    },
  });

  await prisma.queueTicket.create({
    data: {
      queueId: queue.general.id,
      userId: clientes.client5.id,
      serviceModuleId: module.general.id,
      ticketNumber: 5,
      estimatedWaitTime: 25,
      entryTime: new Date(),
      status: TicketStatus.WAITING,
      moduleCode: serviceTypes.general.code,
    },
  });

  console.log('Tickets de prueba creados:');
}
