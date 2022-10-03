import { axios } from '@utils'

const handleLogin = async (userName, userPassword) => {
    return await axios.post('/api/login', { userName, userPassword });
}

const getUserInfo = async () => {
    return await axios.get('/api/login/getUserInfo');
}

export {
    handleLogin,
    getUserInfo
}
