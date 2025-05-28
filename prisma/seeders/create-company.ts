export async function createCompany(prisma, admin) {
  const test = await prisma.company.upsert({
    where: { rut: '12345678-9' },
    update: { adminId: admin.business.id },
    create: {
      id: 'test-company-id',
      name: 'Empresa Demo',
      rut: '12345678-9',
      address: 'Av. Libertador 1234, Santiago',
      phone: '+56987654321',
      email: 'empresa@freeq.com',
      adminId: admin.business.id,
      isActive: true,
    },
  });
  console.log('Empresa Demo creada/actualizada');

  return { test };
}
