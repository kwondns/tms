import { Expose } from 'class-transformer';

export class ResponseAdminDto {
  @Expose()
  username: string;

  @Expose()
  accessToken: string;
}
