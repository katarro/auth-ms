export async function createClients(
  prisma,
  defaultPassword,
  clienteRole,
  customerTypes,
) {
  const client1 = await prisma.user.upsert({
    where: { email: 'cliente@freeq.cl' },
    update: {},
    create: {
      name: 'Cliente 1',
      email: 'cliente@freeq.cl',
      password: defaultPassword,
      roleId: clienteRole.id,
      customerTypeId: customerTypes.regularType.id,
      phone: '+56956789012',
    },
  });

  const client2 = await prisma.user.upsert({
    where: { email: 'cliente2@freeq.cl' },
    update: {},
    create: {
      name: 'Cliente 2',
      email: 'cliente2@freeq.cl',
      password: defaultPassword,
      roleId: clienteRole.id,
      customerTypeId: customerTypes.seniorType.id,
      phone: '+56967890123',
    },
  });

  const client3 = await prisma.user.upsert({
    where: { email: 'cliente3@freeq.cl' },
    update: {},
    create: {
      name: 'Cliente 3',
      email: 'cliente3@freeq.cl',
      password: defaultPassword,
      roleId: clienteRole.id,
      customerTypeId: customerTypes.reducedCapacityType.id,
      phone: '+56978901234',
    },
  });

  const client4 = await prisma.user.upsert({
    where: { email: 'cliente4@freeq.cl' },
    update: {},
    create: {
      name: 'Cliente 4',
      email: 'cliente4@freeq.cl',
      password: defaultPassword,
      roleId: clienteRole.id,
      customerTypeId: customerTypes.pregnantType.id,
      phone: '+56985742698',
    },
  });

  const client5 = await prisma.user.upsert({
    where: { email: 'cliente5@freeq.cl' },
    update: {},
    create: {
      name: 'Cliente 5',
      email: 'cliente5@freeq.cl',
      password: defaultPassword,
      roleId: clienteRole.id,
      customerTypeId: customerTypes.preferentialType.id,
      phone: '+56967898693',
    },
  });

  console.log('Cliente creados/actualizados');

  return {
    client1,
    client2,
    client3,
    client4,
    client5,
  };
}
