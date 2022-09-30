function getPermissionList(params) {
    return axios.get('/api/permission', { params: params })
}

export {
    getPermissionList
}