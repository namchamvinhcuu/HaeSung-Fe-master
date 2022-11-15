import { axios } from "@utils";
import * as ConfigConstants from '@constants/ConfigConstants';
import { GetLocalStorage } from '@utils'
import moment from "moment";

const API = "/api/mms-report";

export const get = async (params) => {
  try {
    return await axios.get(`${API}`, {
      params: { ...params },
    });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const getLotByWo = async (params) => {
  try {
    return await axios.get(`${API}/get-lot-by-woId`, {
      params: { ...params },
    });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const downloadWOReport1 = async (params) => {
  try {
    return await axios.get(`${API}/download-wo-report`, {
      params: { ...params },
    });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const downloadWOReport = async (params) => {
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

    fetch(`${ConfigConstants.API_URL}mms-report/download-wo-report?WoCode=${params.WoCode}&StartSearchingDate=${moment(params.StartSearchingDate).format("YYYY-MM-DD")}&EndSearchingDate=${moment(params.EndSearchingDate).format("YYYY-MM-DD")}&MaterialId=${params.MaterialId}`, options)
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
      });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
}

export const downloadLotReport = async (params) => {
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

    fetch(`${ConfigConstants.API_URL}mms-report/download-lot-report?WoId=${params.WoId}&Status=${params.Status ?? ""}`, options)
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
      });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
}
