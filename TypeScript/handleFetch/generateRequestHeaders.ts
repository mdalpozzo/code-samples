import { getUserToken } from 'services/auth'

export const generateRequestHeaders = async (): Promise<{
  Authorization: string
}> => {
  const userToken: string = await getUserToken()
  return {
    Authorization: `Bearer ${userToken}`,
  }
}
