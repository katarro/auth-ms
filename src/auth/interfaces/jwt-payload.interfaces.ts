import { $Enums } from "@prisma/client";

export interface JwtPayload {
  id: number;
  name: string;
  email: string;
  role: $Enums.Role
}
