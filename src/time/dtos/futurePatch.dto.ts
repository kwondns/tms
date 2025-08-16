import { FutureDto } from '@/time/dtos/future.dto';
import { IsObject } from 'class-validator';
import { User } from '@/time/user/entities/user.entity';

export class FuturePatchDto extends FutureDto {
  @IsObject()
  user: User;
}
