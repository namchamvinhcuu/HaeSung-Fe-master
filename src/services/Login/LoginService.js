import { axios } from '@utils'

const handleLogin = async (userName, userPassword) => {
    return axios.post('/api/login', { userName, userPassword });
}

const getUserInfo = async () => {
    return axios.get('/api/login/getUserInfo');
}

export {
    handleLogin,
    getUserInfo
}
