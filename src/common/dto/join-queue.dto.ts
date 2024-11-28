import { IsNumber, IsPositive, IsDate } from 'class-validator';

export class JoinQueueDto {
  @IsNumber()
  @IsPositive()
  id: number;

  @IsNumber()
  @IsPositive()
  branch_id: number;

  @IsNumber()
  @IsPositive()
  previous_number: number;

  @IsNumber()
  @IsPositive()
  current_number: number;

  @IsNumber()
  @IsPositive()
  next_number: number;

  @IsDate()
  last_updated: Date;

  @IsNumber()
  @IsPositive()
  user_id: number;
}
