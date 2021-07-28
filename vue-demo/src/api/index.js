import fetch from './request.js'

export const getUserList = (data) => {
  return fetch({ url: '/api/users', method: 'get', params: data })
}