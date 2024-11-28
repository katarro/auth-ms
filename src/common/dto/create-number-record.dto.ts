import { Type } from 'class-transformer';
import { IsDate, IsEnum, IsNumber, IsPositive } from 'class-validator';
import { RegistrationStatus } from 'src/common/dto/branch-status.dto';

export class CreateNumberRecordDto {
  @IsNumber()
  @IsPositive()
  id: number;

  @IsNumber()
  @IsPositive()
  branch_id: number;

  @IsNumber()
  @IsPositive()
  user_id: number;

  @IsEnum(RegistrationStatus)
  status: RegistrationStatus; // Aquí se valida directamente

  @IsDate()
  @Type(() => Date)
  created_at: Date;
}
