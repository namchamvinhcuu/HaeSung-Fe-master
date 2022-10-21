import { axios } from '@utils';
const getListApkApp = async (params) => {
    try {
        return await axios.get('/api/VersionApp/get-all-versionApp', {
            params: {
                ...params
            }
        });



    } catch (error) {
        console.log(`ERROR: ${error}`);
    }
}

const modify = async (formData) => {
    // console.log(formData);
    try {
        return await axios.post('/api/VersionApp/update-versionApp', formData, {
            headers: { "Content-Type": "multipart/form-data" },
        })

    } catch (error) {

    }
}
const downloadApp = async () => {
    try {
        return await axios.get('/api/VersionApp/download-versionApp', {
            responseType: 'blob', // important
        }).then(response => {
            console.log(response.data);
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'Hanlim.apk'); //or any other extension
            document.body.appendChild(link);
            link.click();
        });

    } catch (error) {
        console.log(`ERROR: ${error}`);
    }
}

export {
    getListApkApp,
    modify,
    downloadApp
}