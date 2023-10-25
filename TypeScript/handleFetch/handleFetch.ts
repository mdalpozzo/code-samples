import axios, { AxiosRequestConfig, Method, AxiosResponse } from 'axios'
import Logger from 'services/Logger'
import { snakeCaseToCamelCase } from 'utilities/data/caseFormatters'
import { generateRequestHeaders } from 'utilities/fetch/generateRequestHeaders'
import { HTTPS_METHODS } from './constants'

// TODO create a prop for "logTag" (a human understandable label)
// TODO make the args an options object (named params, rather than positional)
// TODO just throw an error at the end instead of returning a response.error
// TODO make sure our standard <organization> http errors are considered

export interface CustomResponseError {
  message: string
  httpStatusCode: string
  customErrorCode?: string
  customStatusCode?: string
  response?: any
  data?: any
}

export interface HandleFetchResponse<T, E = CustomResponseError> {
  data?: T
  error?: E
}

/**
 * @description reusable pattern for api calls
 * @param {*} url
 * @param {*} method
 * @param {*} payload
 * @param {*} useAuth Defaults to true. Set to false if we don't want to authenticate with custom headers
 * @returns
 */
const handleFetch = async <DataT>(
  url: string,
  method: (typeof HTTPS_METHODS)[keyof typeof HTTPS_METHODS],
  payload: Record<string, any> = {},
  useAuth: boolean = true
): Promise<HandleFetchResponse<DataT>> => {
  // TODO define our Cabana response type
  const response: Record<string, any> = {}
  let axiosResponse: AxiosResponse

  try {
    let headers = {}
    if (useAuth) {
      headers = await generateRequestHeaders()
    }

    let requestConfig: AxiosRequestConfig = {
      headers,
      url,
      method: method as Method,
    }

    if (method === HTTPS_METHODS.GET) {
      requestConfig = { ...requestConfig, params: payload }
    } else {
      requestConfig = { ...requestConfig, data: payload }
    }

    axiosResponse = await axios.request({ ...requestConfig })

    // TODO check our error handling here... we used to try to grab "error" prop from the axios response, but i think it will actually come back nested in the data prop
    const { data, status, statusText } = axiosResponse

    const error = data?.error

    if (error) {
      if (error.response) {
        const errorObject = {
          message:
            error.response?.data?.message ||
            'There was an error with the request',
          customErrorCode: error.response?.data?.details?.errorCode,
          customStatusCode: error.response?.data?.customStatusCode,
          httpStatusCode: error.response?.status,
        }
        // todo add custom error response handling data to error object or don't throw an error
        // throw Object.assign(
        //   new Error(
        //     error.response?.data?.message ||
        //       `Error: There was an error with request of type ${method} for url ${url}`
        //   ),
        //   { ...errorObject }
        // );
        return {
          error: errorObject,
        }
      }
      throw error
    } else if (status < 200 || status >= 300) {
      throw Error(
        statusText ||
          `Error status ${status}. There was an error with request of type ${method} for url ${url}`
      )
    } else if (!data) {
      throw Error(
        `No data was returned for request of type ${method} for url ${url}`
      )
    }

    return { data: snakeCaseToCamelCase(axiosResponse.data) as DataT }
  } catch (err) {
    Logger.error(
      `There was an error with request of type ${method} for url ${url}`,
      err
    )
    response.error = err
  }

  return { error: response.error }
}

export default handleFetch
