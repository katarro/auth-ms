import { $Enums } from "@prisma/client";

export interface JwtPayload {
  id: number;
  nombre: string;
  correo: string;
  rol: $Enums.Rol
}
