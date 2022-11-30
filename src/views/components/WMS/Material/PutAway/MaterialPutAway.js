import { Store } from '@appstate';
import { User_Operations } from '@appstate/user';
import { MuiAutocomplete, MuiButton, MuiDataGrid, MuiDateField, MuiTextField } from '@controls';
import { LotDto } from '@models';
import DeleteIcon from '@mui/icons-material/Delete';
import { Grid, IconButton } from '@mui/material';
import { CombineDispatchToProps, CombineStateToProps } from '@plugins/helperJS';
import { eslService, materialPutAwayService } from '@services';
import { ErrorAlert, SuccessAlert, isNumber } from '@utils';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import _ from 'lodash';

const MaterialPutAway = (props) => {
  let isRendered = useRef(true);
  const intl = useIntl();
  const initETDLoad = new Date();
  const [newData, setNewData] = useState({ ...LotDto });
  const lotInputRef = useRef(null);
  const [locationId, setLocationId] = useState(0);
  const [shelfId, setShelfId] = useState(0);
  const [binId, setBinId] = useState(0);
  const [binCode, setBinCode] = useState('');
  const [binLevel, setBinLevel] = useState(0);
  const [putAwayState, setPutAwayState] = useState({
    isLoading: false,
    data: [],
    totalRow: 0,
    page: 1,
    pageSize: 20,
    searchData: {
      searchStartDay: initETDLoad,
      searchEndDay: initETDLoad,
      BinCode: binCode,
    },
  });

  const keyPress = async (e) => {
    if (e.key === 'Enter') {
      await scanBtnClick();
    }
  };

  const getAilse = async () => {
    const res = await materialPutAwayService.getAilse();
    return res;
  };

  const getShelf = async (id) => {
    const res = await materialPutAwayService.getShelf({ LocationId: id });
    return res;
  };

  const getBin = async (id) => {
    const res = await materialPutAwayService.getBin({ ShelfId: id });
    return res;
  };

  const handleLotInputChange = (e) => {
    lotInputRef.current.value = e.target.value;
  };

  const handleDelete = async (lot) => {
    if (window.confirm(intl.formatMessage({ id: 'general.confirm_delete' }))) {
      try {
        let res = await materialPutAwayService.handleDelete(lot);
        if (res && res.HttpResponseCode === 200) {
          await fetchData();
          await eslService.updateESLDataByBinId(lot.BinId);
        } else {
          ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleInputChange = (e, inputName) => {
    let newState = { ...putAwayState };
    newState[inputName] = e;
    if (inputName === 'LocationId') {
      (newState.ShelfId = null), (newState.BinId = null);
    } else {
      if (inputName === 'ShelfId') {
        newState.BinId = null;
      }
    }
    setPutAwayState({ ...newState });
  };

  const fetchData = async () => {
    setPutAwayState({
      ...putAwayState,
      isLoading: true,
    });

    const params = {
      page: putAwayState.page,
      pageSize: putAwayState.pageSize,
      BinCode: binCode,
      searchStartDay: putAwayState.searchData.searchStartDay,
      searchEndDay: putAwayState.searchData.searchEndDay,
    };

    const res = await materialPutAwayService.get(params);
    if (res && isRendered)
      setPutAwayState({
        ...putAwayState,
        data: !res.Data ? [] : [...res.Data],
        totalRow: res.TotalRow,
        isLoading: false,
      });
  };

  useEffect(() => {
    fetchData();
    lotInputRef.current.focus();
    return () => {
      isRendered = false;
    };
  }, [putAwayState.page, putAwayState.pageSize]);

  useEffect(() => {
    if (!_.isEmpty(newData) && !_.isEqual(newData, LotDto)) {
      let newArr = [...putAwayState.data];
      const index = _.findIndex(newArr, function (o) {
        return o.Id == newData.Id;
      });

      if (index !== -1) {
        //update
        newArr[index] = newData;
        setPutAwayState({
          ...putAwayState,
          data: newArr,
          totalRow: putAwayState.totalRow + 1,
        });
      } else {
        const data = [newData, ...putAwayState.data];
        if (data.length > putAwayState.pageSize) {
          data.pop();
        }
        if (isRendered)
          setPutAwayState({
            ...putAwayState,
            data: [...data],
            totalRow: putAwayState.totalRow + 1,
          });
      }
    }
  }, [newData]);

  const scanBtnClick = async () => {
    const lot = lotInputRef.current.value.trim();
    await handlePutAway({ lot, binId });
    lotInputRef.current.value = '';
    lotInputRef.current.focus();

    await eslService.updateESLDataByBinId(binId);
  };

  const columns = [
    { field: 'Id', headerName: '', hide: true },

    {
      field: 'id',
      headerName: '',
      width: 80,
      filterable: false,
      renderCell: (index) => index.api.getRowIndex(index.row.Id) + 1 + (putAwayState.page - 1) * putAwayState.pageSize,
    },

    {
      field: 'action',
      headerName: '',
      width: 80,
      // headerAlign: 'center',
      disableClickEventBubbling: true,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => {
        return (
          <Grid container direction="row" alignItems="center" justifyContent="center">
            <Grid item xs={12} style={{ display: 'flex', justifyContent: 'center' }}>
              <IconButton
                aria-label="delete"
                color="error"
                size="small"
                sx={[{ '&:hover': { border: '1px solid red' } }]}
                onClick={() => handleDelete(params.row)}
              >
                <DeleteIcon fontSize="inherit" />
              </IconButton>
            </Grid>
          </Grid>
        );
      },
    },

    {
      field: 'MaterialColorCode',
      headerName: 'Material Code',
      width: 250,
    },

    {
      field: 'LotSerial',
      headerName: 'Lot Serial',
      width: 250,
    },

    {
      field: 'Qty',
      headerName: 'Qty',
      width: 100,
    },

    {
      field: 'LocationCode',
      headerName: 'Bin',
      width: 250,
    },

    {
      field: 'IncomingDate',
      headerName: 'Incoming Date',
      width: 150,
      valueFormatter: (params) => {
        if (params.value !== null) {
          return moment(params?.value).add(7, 'hours').format('YYYY-MM-DD HH:mm:ss');
        }
      },
    },
  ];

  const handlePutAway = async (inputValue) => {
    //if (isNumber(inputValue)) {
    if (inputValue.binId === 0 || inputValue.binId == undefined || inputValue.lot.trim() === '') {
      ErrorAlert(intl.formatMessage({ id: 'lot.binAndLot_required' }));
      return;
    }
    const res = await materialPutAwayService.scanPutAway({
      LotId: String(inputValue.lot.trim()),
      BinId: String(inputValue.binId),
    });

    if (res && isRendered) {
      if (res.HttpResponseCode === 200 && res.Data) {
        setNewData({ ...res.Data });
        SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }));
      } else {
        ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
      }
    } else {
      ErrorAlert(intl.formatMessage({ id: 'general.system_error' }));
    }
    // } else {
    //   ErrorAlert(intl.formatMessage({ id: 'general.no_data' }));
    // }
  };

  const handleSearch = (e, inputName) => {
    let newSearchData = { ...putAwayState.searchData };
    newSearchData[inputName] = e;
    setPutAwayState({ ...putAwayState, searchData: { ...newSearchData } });
  };

  return (
    <React.Fragment>
      <Grid container spacing={2} direction="row" justifyContent="flex-end" alignItems="center">
        <Grid item>
          <MuiDateField
            disabled={putAwayState.isLoading}
            label="From Incoming Date"
            value={putAwayState.searchData.searchStartDay}
            onChange={(e) => {
              handleSearch(e ? moment(e).format('YYYY-MM-DD') : null, 'searchStartDay');
            }}
            variant="standard"
          />
        </Grid>
        <Grid item>
          <MuiDateField
            disabled={putAwayState.isLoading}
            label="To Incoming Date"
            value={putAwayState.searchData.searchEndDay}
            onChange={(e) => {
              handleSearch(e ? moment(e).format('YYYY-MM-DD') : null, 'searchEndDay');
            }}
            variant="standard"
          />
        </Grid>
        <Grid item sx={{ ml: 0.5 }}>
          <MuiButton text="search" color="info" onClick={fetchData} />
        </Grid>
      </Grid>
      <Grid container direction="row" justifyContent="space-between" alignItems="center">
        <Grid item sx={{ ml: 2 }}>
          <Grid container spacing={2}>
            <Grid item sx={{ width: '215px' }}>
              <MuiAutocomplete
                label="Aisle"
                fetchDataFunc={getAilse}
                displayLabel="LocationCode"
                displayValue="LocationId"
                onChange={(e, item) => {
                  setBinId(0);
                  setBinCode(0);
                  handleInputChange(item ? item?.LocationId ?? null : null, 'LocationId');
                  setLocationId(item?.LocationId);
                }}
                variant="standard"
              />
            </Grid>

            <Grid item sx={{ width: '215px' }}>
              <MuiAutocomplete
                key={locationId}
                label="Shelf"
                fetchDataFunc={() => getShelf(locationId)}
                displayLabel="ShelfCode"
                displayValue="ShelfId"
                onChange={(e, item) => {
                  setBinId(0);
                  setBinCode(0);
                  handleInputChange(item ? item?.ShelfId ?? null : null, 'ShelfId');
                  setShelfId(item?.ShelfId);
                }}
                variant="standard"
              />
            </Grid>

            <Grid item sx={{ width: '215px' }}>
              <MuiAutocomplete
                key={[shelfId, locationId]}
                label="Bin"
                fetchDataFunc={() => getBin(shelfId)}
                displayLabel="BinCode"
                displayValue="BinId"
                onChange={(e, item) => {
                  handleInputChange(item ? item?.BinId ?? null : null, 'BinId');
                  setBinId(item?.BinId);
                  setBinCode(item?.BinCode);
                  setBinLevel(item?.BinLevel);
                }}
                variant="standard"
              />
            </Grid>
          </Grid>
        </Grid>

        <Grid item>
          <Grid container spacing={2}>
            <Grid item sx={{ width: '600px', mt: 0.5 }}>
              <MuiTextField
                ref={lotInputRef}
                label="Lot"
                // autoFocus={focus}
                // value={lotInputRef.current.value}
                onChange={handleLotInputChange}
                onKeyDown={keyPress}
              />
            </Grid>
            <Grid item>
              <MuiButton text="scan" color="success" onClick={scanBtnClick} />
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <MuiDataGrid
        showLoading={putAwayState.isLoading}
        isPagingServer={true}
        headerHeight={45}
        // rowHeight={30}
        // gridHeight={736}
        columns={columns}
        rows={putAwayState.data}
        page={putAwayState.page - 1}
        pageSize={putAwayState.pageSize}
        rowCount={putAwayState.totalRow}
        rowsPerPageOptions={[5, 10, 15, 20]}
        onPageChange={(newPage) => {
          setPutAwayState({ ...putAwayState, page: newPage + 1 });
        }}
        onPageSizeChange={(newPageSize) => {
          setPutAwayState({
            ...putAwayState,
            page: 1,
            pageSize: newPageSize,
          });
        }}
        getRowId={(rows) => rows.Id}
        // onSelectionModelChange={(newSelectedRowId) =>
        //     handleRowSelection(newSelectedRowId)
        // }
        getRowClassName={(params) => {
          if (_.isEqual(params.row, newData)) {
            return `Mui-created`;
          }
        }}
        initialState={{ pinnedColumns: { right: ['action'] } }}
      />
    </React.Fragment>
  );
};

User_Operations.toString = function () {
  return 'User_Operations';
};

const mapStateToProps = (state) => {
  const {
    User_Reducer: { language },
  } = CombineStateToProps(state.AppReducer, [[Store.User_Reducer]]);

  return { language };
};

const mapDispatchToProps = (dispatch) => {
  const {
    User_Operations: { changeLanguage },
  } = CombineDispatchToProps(dispatch, bindActionCreators, [[User_Operations]]);

  return { changeLanguage };
};

export default connect(mapStateToProps, mapDispatchToProps)(MaterialPutAway);
