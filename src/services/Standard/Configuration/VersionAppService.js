import { axios } from '@utils';
import * as ConfigConstants from '@constants/ConfigConstants';
import { GetLocalStorage, SetLocalStorage, RemoveLocalStorage } from '@utils';

const getListApkApp = async (params) => {
  try {
    return await axios.get('/api/VersionApp', {
      params: {
        ...params,
      },
    });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

const modify = async (formData) => {
  try {
    return await axios.post('/api/VersionApp/update-versionApp', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  } catch (error) {}
};

const downloadApp = async (params) => {
  try {
    const token = GetLocalStorage(ConfigConstants.TOKEN_ACCESS);
    const options = {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json;charset=UTF-8',
        // 'Origin': '',
        // 'Host': 'api.producthunt.com'
        Authorization: `Bearer ${token}`,
      },
    };

    // fetch(`${ConfigConstants.API_URL}VersionApp/download-versionApp?appType=${params.app_type}`, options).then(
    //   (response) => {
    //     response.blob().then((blob) => {
    //       let url = URL.createObjectURL(blob);
    //       let downloadLink = document.createElement('a');
    //       downloadLink.href = url;
    //       downloadLink.download = `${params.name_file}`;
    //       document.body.appendChild(downloadLink);
    //       downloadLink.click();

    //       document.body.removeChild(downloadLink);
    //       URL.revokeObjectURL(url);
    //     });
    //     //window.location.href = response.url;
    //   }
    // );

    fetch(`${ConfigConstants.API_URL}VersionApp/download-versionApp?appType=${params.app_type}`, options)
      .then((res) => {
        return res.blob();
      })
      .then((blob) => {
        let url = URL.createObjectURL(blob);
        let downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = `${params.name_file}`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(url);
      })
      .catch((err) => console.error(err));
    // return;
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export { getListApkApp, modify, downloadApp };
