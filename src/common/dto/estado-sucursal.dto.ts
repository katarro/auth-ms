import { IsEnum } from 'class-validator';

export enum EstadoSucursal {
  Activo = 1,
  Inactivo = 0,
}

export enum EstadoRegistro {
  Pendiente = 'pendiente',
  Atendido = 'atendido',
  Cancelado = 'cancelado',
}

export class EstadoDto {
  @IsEnum(EstadoSucursal)
  estadoSucursal?: EstadoSucursal;

  @IsEnum(EstadoRegistro)
  estadoRegistro?: EstadoRegistro;
}
