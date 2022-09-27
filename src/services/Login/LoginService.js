import { axios } from '@utils'

const handleLogin = async (userName, userPassword) => {
    return axios.post('/api/login', { userName, userPassword });
}

export {
    handleLogin,
}
