import { axios } from '@utils'

const handleLogin = async (userName, userPassword) => {
    try {
        return await axios.post('/api/login/checklogin', { userName, userPassword });

    } catch (error) {
        console.log(`ERROR: ${error}`);
    }
}

const getUserInfo = async () => {
    try {
        return await axios.get('/api/login/getUserInfo');
    } catch (error) {
        console.log(`ERROR: ${error}`);
    }

}

export {
    handleLogin,
    getUserInfo
}
