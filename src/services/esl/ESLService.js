import axios from 'axios';
import { axios as axiosInstance } from '@utils';
import _ from 'lodash';

const apiName = 'api/esl';
const eslApi = 'http://118.69.130.73:9001';
const initialESLData = { ITEM_NAME: '', LOCATION: '', SHELVE_LEVEL: -32768 };

export const getESLDataByBinId = async (binId) => {
  try {
    return await axiosInstance.get(`${apiName}/get-els-data-by-binId?BinId=${binId}`);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const updateESLDataByBinId = async (binId) => {
  let dataList = [];

  let res = await getESLDataByBinId(binId);

  if (_.isEqual(res.data, initialESLData)) {
    const response = await axiosInstance.get(`${apiName}/get-bin-by-id?binId=${binId}`);

    if (response && response.Data) {
      res.data.LOCATION = response.Data.BinCode;
      res.data.SHELVE_LEVEL = response.Data.BinLevel;
    } else {
      res.data.LOCATION = '';
      res.data.SHELVE_LEVEL = 0;
    }
  }
  // else {
  //   let item_name = '';

  //   let splitItem = res.data.ITEM_NAME.split(',');
  //   for (let i = 0; i < splitItem.length; i++) {
  //     item_name += splitItem[i].trim() + (' ', 22 + (i - splitItem[i].trim().length))
  //   }

  //   // let str = item_name.join("", res.data.ITEM_NAME.split(',').select(a => a.trim()).select((a, index) => {
  //   //   return a + (' ', 22 + index - a.length);
  //   // }));

  //   res.data.ITEM_NAME = item_name;
  // }

  res.id = res.data.LOCATION;
  dataList.push(res);

  if (dataList.length > 0)
    try {
      await axios.post(`${eslApi}/articles`, {
        dataList: dataList,
      });
      // console.log(response)
    } catch (error) {
      console.log(error);
    }
};

export const getESLDataByBinCode = async (binCode) => {
  try {
    return await axiosInstance.get(`${apiName}/get-els-data-by-binCode?BinCode=${binCode}`);
  } catch (error) {
    console.log(`ERROR: ${error}`);
  }
};

export const updateESLDataByBinCode = async (binCode) => {
  let dataList = [];

  let res = await getESLDataByBinCode(binCode);

  if (_.isEqual(res.data, initialESLData)) {
    const response = await axiosInstance.get(`${apiName}/get-bin-by-code?binCode=${binCode}`);

    if (response && response.Data) {
      res.data.LOCATION = response.Data.BinCode;
      res.data.SHELVE_LEVEL = response.Data.BinLevel;
    } else {
      res.data.LOCATION = '';
      res.data.SHELVE_LEVEL = 0;
    }
  }

  res.id = res.data.LOCATION;
  dataList.push(res);

  if (dataList.length > 0)
    try {
      await axios.post(`${eslApi}/articles`, {
        dataList: dataList,
      });
      // console.log(response)
    } catch (error) {
      console.log(error);
    }
};

export const findBinByBinId = async (binId) => {
  const response = await axiosInstance.get(`${apiName}/get-bin-by-id?binId=${binId}`);

  if (response && response.Data) {
    let ESLCode = response.Data.ESLCode;
    let putArr = [
      {
        color: 'BLUE',
        duration: '10s',
        labelCode: ESLCode,
        patternId: 0,
      },
    ];

    try {
      const res = await axios.put(`${eslApi}/labels/contents/led`, putArr);
      console.log(res);
    } catch (error) {
      console.log(error);
    }
  }
};

export const createBinOnESLServer = async (binCode, articleId) => {
  if (!articleId) {
    articleId = 'Bin-1';
  }

  let eslURL = `${eslApi}/dashboardWeb/common/articles?store=DEFAULT_STATION_CODE&company=Auto&SI`;
  let postData = [
    {
      articleId: binCode,
      articleName: '',
      nfcUrl: '',
      data: {
        STORE_CODE: null,
        ARTICLE_ID: articleId,
        BARCODE: null,
        ITEM_NAME: null,
        ALIAS: null,
        SALE_PRICE: null,
        LIST_PRICE: null,
        UNIT_PRICE: null,
        ORIGIN: null,
        MANUFACTURER: null,
        TYPE: null,
        WEIGHT: null,
        WEIGHT_UNIT: null,
        UNIT_PRICE_UNIT: null,
        UNIT_DIMENSION: null,
        A_MARKER: null,
        R_MARKER: null,
        CATEGORY1: null,
        CATEGORY2: null,
        CATEGORY3: null,
        CATEGORY4: null,
        CATEGORY5: null,
        DISPLAY_TYPE: null,
        DISPLAY_TYPE2: null,
        DISPLAY_TYPE3: null,
        NFC_URL: null,
        ETC_0: null,
        ETC_1: null,
        ETC_2: null,
        ETC_3: null,
        ETC_4: null,
        ETC_5: null,
        ETC_6: null,
        ETC_7: null,
        ETC_8: null,
        ETC_9: null,
        TEST1: null,
      },
    },
  ];
  try {
    return await axios.post(eslURL, postData);
    // return res;
  } catch (error) {
    console.log('error', error);
  }
};

export const linkESLTagWithBin = async (binCode, eslCode) => {
  let eslURL = `${eslApi}/dashboardWeb/common/labels/link?store=DEFAULT_STATION_CODE`;
  let articleIdList = [];
  articleIdList.push(binCode);
  let postData = {
    assignList: [
      {
        articleIdList: [...articleIdList],
        labelCode: eslCode,
      },
    ],
  };

  try {
    return await axios.post(eslURL, postData);
  } catch (error) {
    console.log('error', error);
  }
};

export const unLinkESLTagWithBin = async (eslCode) => {
  let eslURL = `${eslApi}/dashboardWeb/common/labels/unlink?store=DEFAULT_STATION_CODE`;
  let unAssignList = [];
  unAssignList.push(eslCode);
  let postData = {
    unAssignList: [...unAssignList],
  };

  axios
    .post(eslURL, postData)
    .then((response) => {
      console.log(response);
      return response;
    })
    .catch((err) => {
      console.log(err.response);
      return err.response;
    });

  // try {
  //   return await axios.post(eslURL, postData);
  // } catch (error) {
  //   return error.response;
  // }
};

export const getRegisteredESLTags = async () => {
  let eslURL = `${eslApi}/dashboardWeb/common/labels?company=Auto&SI&size=10&sort=&store=DEFAULT_STATION_CODE&page=0&isLabelAlive=true`;

  try {
    return await axios.get(eslURL);
  } catch (error) {
    return error.response;
  }
};

export const getRegisteredESLTagByCode = async (eslCode) => {
  let eslURL = `${eslApi}/dashboardWeb/common/labels?company=Auto%26SI&store=DEFAULT_STATION_CODE&isLabelAlive=true&label=${eslCode}`;

  try {
    return await axios.get(eslURL);
  } catch (error) {
    return error.response;
  }
};
