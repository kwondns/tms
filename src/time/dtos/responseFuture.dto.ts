import { Expose, Type } from 'class-transformer';
import { FutureBoxDto } from '@/time/dtos/futureBox.dto';

class ResponseFutureDto {
  @Expose()
  id: string;

  @Expose()
  content: string;

  @Expose()
  percentage: number;

  @Expose()
  checked: boolean;

  @Expose()
  priority: number;
}

export class ResponseFutureBoxDto {
  @Expose()
  id: string;

  @Expose()
  title: string;

  @Expose()
  order: number;

  @Expose()
  checked: boolean;

  @Type(() => ResponseFutureDto)
  @Expose()
  future: ResponseFutureDto[];
}
