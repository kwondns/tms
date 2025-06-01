import { IsOptional, IsString } from 'class-validator';

export class DeleteUserDto {
  @IsString()
  userId: string;

  @IsString()
  @IsOptional()
  deleteSurvey?: string;
}
