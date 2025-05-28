export async function createExecutives(
  prisma,
  defaultPassword,
  ejecutivoRole,
  company,
  branch,
) {
  const ejecutivo1User = await prisma.user.upsert({
    where: { email: 'ejecutivo1@freeq.com' },
    update: {},
    create: {
      email: 'ejecutivo1@freeq.com',
      name: 'Ejecutivo Uno',
      password: defaultPassword,
      roleId: ejecutivoRole.id,
      phone: '+56945678901',
      companyId: company.test.id,
      branchId: branch.test.id,
    },
  });

  const ejecutivo2User = await prisma.user.upsert({
    where: { email: 'ejecutivo2@freeq.com' },
    update: {},
    create: {
      email: 'ejecutivo2@freeq.com',
      name: 'Ejecutivo Dos',
      password: defaultPassword,
      roleId: ejecutivoRole.id,
      phone: '+56945678902',
      companyId: company.test.id,
      branchId: branch.test.id,
    },
  });

  const ejecutivo3User = await prisma.user.upsert({
    where: { email: 'ejecutivo3@freeq.com' },
    update: {},
    create: {
      email: 'ejecutivo3@freeq.com',
      name: 'Ejecutivo Tres',
      password: defaultPassword,
      roleId: ejecutivoRole.id,
      phone: '+56945678903',
      companyId: company.test.id,
      branchId: branch.test.id,
    },
  });

  console.log('Ejecutivos creados/actualizados');

  return {
    ejecutivo1User,
    ejecutivo2User,
    ejecutivo3User,
  };
}
