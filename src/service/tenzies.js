/* eslint-disable import/no-anonymous-default-export */
import axios from 'axios'
const baseUrl = 'https://backend-3vr8.onrender.com/api/tenzies'

const getAll = () => {
    const request = axios.get(baseUrl)
    return request.then(response => response.data)
}
  
const create = newObject => {
    const request = axios.post(baseUrl, newObject)
    return request.then(response => response.data)
}

export default {getAll, create}