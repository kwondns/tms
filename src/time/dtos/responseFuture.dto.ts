import { Expose, Type } from 'class-transformer';

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

class ResponseFutureBoxProgressViewFuture extends ResponseFutureDto {
  @Expose({ name: 'updated_at' })
  updatedAt: Date;
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
  @Expose({ name: 'future' })
  futures: ResponseFutureDto[];

  @Expose()
  type: string;

  @Type(() => ResponseFutureBoxProgressViewFuture)
  @Expose()
  lastCompletedFuture: ResponseFutureBoxProgressViewFuture[];

  @Expose({ name: 'progress_ratio' })
  progressRatio: number;

  @Expose({ name: 'total_futures' })
  totalFutures: number;

  @Expose({ name: 'completed_futures' })
  completedFutures: number;
}
