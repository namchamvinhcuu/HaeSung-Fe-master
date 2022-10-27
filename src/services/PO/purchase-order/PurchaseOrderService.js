import { axios } from '@utils'
import * as ConfigConstants from '@constants/ConfigConstants';
import { GetLocalStorage, SetLocalStorage, RemoveLocalStorage } from '@utils'
import moment from "moment";

const apiName = '/api/fixed-po'

const get = async (params) => {
	try {
		return await axios.get(`${apiName}`, { params: { ...params } });
	} catch (error) {
		console.log(`ERROR: ${error}`);
	}
}

const createPO = async (params) => {
	try {
		return await axios.post(`${apiName}/create`, params);
	}
	catch (error) {
		console.log(`ERROR: ${error}`);
	}
}

const modifyPO = async (params) => {
	try {
		return await axios.put(`${apiName}/update`, params);
	}
	catch (error) {
		console.log(`ERROR: ${error}`);
	}
}

const deletePO = async (params) => {
	try {
		return await axios.delete(`${apiName}/delete`, { data: params });
	}
	catch (error) {
		console.log(`ERROR: ${error}`);
	}
}

const getPODetail = async (PoId, params) => {
	try {
		return await axios.get(`${apiName}/get-detail/${PoId}`, { params: { ...params } });
	} catch (error) {
		console.log(`ERROR: ${error}`);
	}
}

const createPODetail = async (params) => {
	try {
		return await axios.post(`${apiName}/create-detail`, params);
	}
	catch (error) {
		console.log(`ERROR: ${error}`);
	}
}

const modifyPODetail = async (params) => {
	try {
		return await axios.put(`${apiName}/update-detail`, params);
	}
	catch (error) {
		console.log(`ERROR: ${error}`);
	}
}

const deletePODetail = async (params) => {
	try {
		return await axios.delete(`${apiName}/delete-detail`, { data: params });
	}
	catch (error) {
		console.log(`ERROR: ${error}`);
	}
}

const getMaterial = async (PoId) => {
	try {
		return await axios.get(`${apiName}/get-material/${PoId}`);
	}
	catch (error) {
		console.log(`ERROR: ${error}`);
	}
}

const downloadReport = async (params) => {
	try {

		const token = GetLocalStorage(ConfigConstants.TOKEN_ACCESS);
		const options = {
			method: 'GET',
			headers: {
				'Accept': 'application/json',
				'Content-Type': 'application/json;charset=UTF-8',
				'Authorization': `Bearer ${token}`
			},
		}

		fetch(`${ConfigConstants.API_URL}fixed-po/download-excel?PoCode=${params.PoCode}&DeliveryDate=${moment(params.DeliveryDate).format("YYYY-MM-DD")}&DueDate=${moment(params.DueDate).format("YYYY-MM-DD")}&isActived=${params.showDelete}`, options)
			.then(response => {
				response.blob().then(blob => {
					let url = URL.createObjectURL(blob);
					let downloadLink = document.createElement('a');
					downloadLink.href = url;
					downloadLink.download = 'report.xlsx';
					document.body.appendChild(downloadLink);
					downloadLink.click();

					document.body.removeChild(downloadLink);
					URL.revokeObjectURL(url);
				});
				//window.location.href = response.url;
			});


	} catch (error) {
		console.log(`ERROR: ${error}`);
	}
}

export {
	get,
	createPO,
	modifyPO,
	deletePO,

	getPODetail,
	createPODetail,
	modifyPODetail,
	deletePODetail,
	getMaterial,

	downloadReport,
}
