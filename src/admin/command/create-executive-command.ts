import { Injectable } from '@nestjs/common';
import { CreateUserDto } from 'src/common/dto';

@Injectable()
export class CreateExecutiveCommand {
  async execute(createUserDto: CreateUserDto) {
    console.log('Creating Executive with data:', createUserDto);
  }
}
