export async function createTypesClient(prisma, CustomerTypeConst) {
  const regularType = await prisma.customerType.upsert({
    where: { id: CustomerTypeConst.REGULAR.id },
    update: {},
    create: {
      id: CustomerTypeConst.REGULAR.id,
      name: CustomerTypeConst.REGULAR.name,
      priorityLevel: CustomerTypeConst.REGULAR.priorityLevel,
      description: CustomerTypeConst.REGULAR.description,
    },
  });

  const seniorType = await prisma.customerType.upsert({
    where: { id: CustomerTypeConst.SENIOR.id },
    update: {},
    create: {
      id: CustomerTypeConst.SENIOR.id,
      name: CustomerTypeConst.SENIOR.name,
      priorityLevel: CustomerTypeConst.SENIOR.priorityLevel,
      description: CustomerTypeConst.SENIOR.description,
    },
  });

  const reducedCapacityType = await prisma.customerType.upsert({
    where: {
      id: CustomerTypeConst.REDUCED_CAPACITY.id,
    },
    update: {},
    create: {
      id: CustomerTypeConst.REDUCED_CAPACITY.id,
      name: CustomerTypeConst.REDUCED_CAPACITY.name,
      priorityLevel: CustomerTypeConst.REDUCED_CAPACITY.priorityLevel,
      description: CustomerTypeConst.REDUCED_CAPACITY.description,
    },
  });

  const pregnantType = await prisma.customerType.upsert({
    where: {
      id: CustomerTypeConst.PREGNANT.id,
    },
    update: {},
    create: {
      id: CustomerTypeConst.PREGNANT.id,
      name: CustomerTypeConst.PREGNANT.name,
      priorityLevel: CustomerTypeConst.PREGNANT.priorityLevel,
      description: CustomerTypeConst.PREGNANT.description,
    },
  });

  const preferentialType = await prisma.customerType.upsert({
    where: {
      id: CustomerTypeConst.PREFERENTIAL.id,
    },
    update: {},
    create: {
      id: CustomerTypeConst.PREFERENTIAL.id,
      name: CustomerTypeConst.PREFERENTIAL.name,
      priorityLevel: CustomerTypeConst.PREFERENTIAL.priorityLevel,
      description: CustomerTypeConst.PREFERENTIAL.description,
    },
  });

  console.log('Tipos de cliente creados/actualizados');

  return {
    regularType,
    seniorType,
    reducedCapacityType,
    pregnantType,
    preferentialType,
  };
}
