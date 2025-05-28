import { Injectable } from '@nestjs/common';
import * as bcryptjs from 'bcryptjs';

@Injectable()
export class HashPasswordService {
  async hashearPassword(contrasena: string) {
    const salt = bcryptjs.genSaltSync(10);
    return bcryptjs.hashSync(contrasena, salt);
  }

  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcryptjs.compareSync(password, hash);
  }
}
