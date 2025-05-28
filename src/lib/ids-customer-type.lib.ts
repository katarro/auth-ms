import { PrismaClient } from '@prisma/client';

export class IdsCustomerType extends PrismaClient {
  public async IdRegularCustomer() {
    const IdCustomerTypeClient = await this.customerType.findFirst({
      where: { name: 'REGULAR' },
    });

    return IdCustomerTypeClient.id;
  }
}
