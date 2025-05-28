import { $Enums } from '@prisma/client';

export interface JwtPayload {
  id: string;
  name: string;
  email: string;
  role: $Enums.RoleType;
}
