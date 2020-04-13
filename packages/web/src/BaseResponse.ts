import {ApiProperty} from '@nestjs/swagger'

export class BaseResponse {
  @ApiProperty()
  readonly code!: number
  @ApiProperty()
  readonly message!: string
}
