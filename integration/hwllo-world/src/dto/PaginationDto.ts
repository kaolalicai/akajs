import {IsOptional,Min,Max} from 'class-validator'
import {BaseDto} from './BaseDto'
export class PaginationDto extends BaseDto {
  @IsOptional()
    @Min(1)
    page: number

  @IsOptional()
    @Min(1)
    @Max(100)
    limit: number
}
