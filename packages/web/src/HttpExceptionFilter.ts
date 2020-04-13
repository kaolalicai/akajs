import {ExceptionFilter, ArgumentsHost, Catch, HttpException, HttpStatus, Logger} from '@nestjs/common'

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch (exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse()

    const message = exception.message
    Logger.log('系统内部错误', message)
    const errorResponse = {
      message: message,
      code: exception.getStatus() || 1 // 自定义code
      // url: request.originalUrl // 错误的url地址
    }
    const status =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR
    // 设置返回的状态码、请求头、发送错误信息
    response.status(status)
    response.header('Content-Type', 'application/json; charset=utf-8')
    response.send(errorResponse)
  }
}
