import { Expose } from 'class-transformer';

export class RefreshDto {
  @Expose({ name: 'user_id' })
  userId: string;

  @Expose()
  accessToken: string;

  @Expose()
  accessTokenExpiresAt: Date;
}
