import { RestResponse } from '@src/core/providers/rest/responses/RestResponse'
import { RestError } from '@src/core/providers/rest/RestError'

export interface RestResponseError extends RestResponse {
  success: false
  result: RestError
}
