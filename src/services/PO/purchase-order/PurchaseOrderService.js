import { axios } from '@utils'

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
}
