import { axios } from "@utils";
const apiName = "api/material-report";
import * as ConfigConstants from '@constants/ConfigConstants';
import { GetLocalStorage } from '@utils'
import moment from "moment";

export const getReport = async (params) => {
  try {
    return await axios.get(apiName, { params: { ...params } });
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const getReportDetail = async (params) => {
    try {
      return await axios.get(`${apiName}/get-report-detail`, { params: { ...params } });
    } catch (error) {
      console.log(`ERROR: ${error}`);
    }
  };

  export const downloadReport = async (params) => {
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
  
      fetch(`${ConfigConstants.API_URL}material-report/download-report?keyWord=${params.keyWord}&searchStartDay=${moment(params.searchStartDay).format("YYYY-MM-DD")=="Invalid date"?"":moment(params.searchStartDay).format("YYYY-MM-DD")}&searchEndDay=${moment(params.searchEndDay).format("YYYY-MM-DD")=="Invalid date"?"":moment(params.searchEndDay).format("YYYY-MM-DD")}`, options)
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

  export const downloadReportDetail = async (params) => {
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
  
      fetch(`${ConfigConstants.API_URL}material-report/download-report-detail?LotId=${params.LotId}`, options)
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
  