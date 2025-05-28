export const CustomerTypeConst = {
  REGULAR: {
    id: 'regular-id',
    name: 'REGULAR',
    description: 'Cliente regular sin prioridad especial',
    priorityLevel: 0,
  },
  SENIOR: {
    id: 'senior-id',
    name: 'SENIOR',
    description: 'Cliente mayor de 60 años',
    priorityLevel: 3,
  },
  REDUCED_CAPACITY: {
    id: 'reduced-capacity-id',
    name: 'REDUCED_CAPACITY',
    description: 'Cliente con capacidad reducida',
    priorityLevel: 4,
  },
  PREGNANT: {
    id: 'pregnant-id',
    name: 'PREGNANT',
    description: 'Cliente embarazada',
    priorityLevel: 3,
  },
  PREFERENTIAL: {
    id: 'preferential-id',
    name: 'PREFERENTIAL',
    description: 'Cliente preferencial',
    priorityLevel: 2,
  },
};
