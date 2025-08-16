import { Expose } from 'class-transformer';

export class RefreshResponseDto {
  @Expose({ name: 'user_id' })
  userId: string;

  @Expose()
  accessToken: string;

  @Expose()
  accessTokenExpiresAt: Date;

  @Expose()
  refreshToken: string;
}
