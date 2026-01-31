import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';

@Catch(HttpException)
export class MyExceptionFilter< T extends HttpException> 
implements ExceptionFilter 
{
  catch(exception: T, host: ArgumentsHost) {
    const context = host.switchToHttp()
    const response = context.getResponse()
    const Request = context.getRequest()

    const statusCode = exception.getStatus()
    const excepitonResponse = exception.getResponse()

    response.status(statusCode).json({
        message: excepitonResponse['message'],
        statusCode: statusCode,
        data: new Date(),
        path: Request.url
    })
  }
}
