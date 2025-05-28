export async function configureSettingsQueue(prisma, queue, AbsencePolicy) {
  await prisma.queueSettings.create({
    data: {
      queueId: queue.general.id,
      maxAbsenceTime: 3, // minutos
      absencePolicy: AbsencePolicy.END_QUEUE,
      postponePositions: 3,
      notificationTime: 5, // minutos
      maxDailyEntries: 5,
      allowAnonymousTickets: true,
    },
  });

  await prisma.queueSettings.create({
    data: {
      queueId: queue.financial.id,
      maxAbsenceTime: 2, // minutos
      absencePolicy: AbsencePolicy.POSTPONE,
      postponePositions: 2,
      notificationTime: 3, // minutos
      maxDailyEntries: 3,
      allowAnonymousTickets: true,
    },
  });

  await prisma.queueSettings.create({
    data: {
      queueId: queue.claims.id,
      maxAbsenceTime: 4, // minutos
      absencePolicy: AbsencePolicy.DISCARD,
      postponePositions: 0,
      notificationTime: 4, // minutos
      maxDailyEntries: 2,
      allowAnonymousTickets: false,
    },
  });
  console.log('Configuraciones de colas creadas');
}
