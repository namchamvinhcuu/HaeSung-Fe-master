import { Store } from '@appstate';
import { User_Operations } from '@appstate/user';
import { MuiButton, MuiDataGrid, MuiDateField, MuiSearchField } from '@controls';
import { Grid, Typography } from '@mui/material';
import { CombineDispatchToProps, CombineStateToProps } from '@plugins/helperJS';
import { wipReportService } from '@services';
import { ErrorAlert } from '@utils';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import WIPReportDetail from './WIPReportDetail';

const WIPReport = (props) => {
  const intl = useIntl();
  let isRendered = useRef(true);
  const [LotId, setLotId] = useState(null);
  const [iqcState, setIQCState] = useState({
    isLoading: false,
    data: [],
    totalRow: 0,
    page: 1,
    pageSize: 8,
    searchData: {
      keyWord: '',
      showDelete: true,
      searchStartDay: '',
      searchEndDay: '',
    },
  });
  const columns = [
    { field: 'Id', headerName: '', hide: true },
    {
      field: 'id',
      headerName: '',
      width: 80,
      filterable: false,
      renderCell: (index) => index.api.getRowIndex(index.row.Id) + 1 + (iqcState.page - 1) * iqcState.pageSize,
    },

    {
      field: 'LotCode',
      headerName: 'Lot Code',
      width: 200,
      hide: true,
    },

    {
      field: 'MaterialColorCode',
      headerName: 'Material Code',
      width: 170,
    },
    {
      field: 'LotSerial',
      headerName: 'Lot Serial',
      width: 170,
    },
    {
      field: 'Qty',
      headerName: 'Qty',
      width: 100,
    },
    {
      field: 'ActualQty',
      headerName: 'Actual Qty',
      width: 100,
    },
    {
      field: 'HMIQty',
      headerName: 'HMI Qty',
      width: 100,
    },
    {
      field: 'NGQty',
      headerName: 'NG Qty',
      width: 100,
    },
    {
      field: 'QCDate',
      headerName: 'QC Date',
      width: 150,
      valueFormatter: (params) => {
        if (params.value !== null) {
          return (
            moment(params?.value)
              // .add(7, "hours")
              .format('YYYY-MM-DD HH:mm:ss')
          );
        }
      },
    },
    {
      field: 'QCResult',
      headerName: 'QC Result',
      width: 100,
      renderCell: (params) => {
        return params.row.QCResult == true ? (
          <Typography sx={{ fontSize: '14px' }}>
            <b>OK</b>
          </Typography>
        ) : (
          <Typography sx={{ fontSize: '14px', color: 'red' }}>
            <b>NG</b>
          </Typography>
        );
      },
    },
    {
      field: 'createdName',
      headerName: intl.formatMessage({ id: 'general.createdName' }),
      width: 150,
    },
    {
      field: 'createdDate',
      headerName: intl.formatMessage({ id: 'general.created_date' }),
      width: 150,
      valueFormatter: (params) => {
        if (params.value !== null) {
          return moment(params?.value).add(7, 'hours').format('YYYY-MM-DD HH:mm:ss');
        }
      },
    },
    {
      field: 'modifiedName',
      headerName: intl.formatMessage({ id: 'general.modifiedName' }),
      width: 150,
    },
    {
      field: 'modifiedDate',
      headerName: intl.formatMessage({ id: 'general.modified_date' }),
      width: 150,
      valueFormatter: (params) => {
        if (params.value !== null) {
          return moment(params?.value).add(7, 'hours').format('YYYY-MM-DD HH:mm:ss');
        }
      },
    },
  ];
  async function fetchData() {
    if (
      iqcState.searchData.searchStartDay > iqcState.searchData.searchEndDay &&
      iqcState.searchData.searchEndDay != null &&
      iqcState.searchData.searchEndDay != ''
    ) {
      ErrorAlert(intl.formatMessage({ id: 'lot.DaySearchNotValid' }));
      return;
    }
    if (iqcState.searchData.searchStartDay == 'Invalid date') {
      ErrorAlert(intl.formatMessage({ id: 'general.StartSearchingDate_invalid' }));
    } else if (iqcState.searchData.searchEndDay == 'Invalid date') {
      ErrorAlert(intl.formatMessage({ id: 'general.StartSearchingDate_invalid' }));
    } else {
      setIQCState({ ...iqcState, isLoading: true });
      const params = {
        page: iqcState.page,
        pageSize: iqcState.pageSize,
        keyWord: iqcState.searchData.keyWord,
        searchStartDay: iqcState.searchData.searchStartDay,
        searchEndDay: iqcState.searchData.searchEndDay,
        showDelete: iqcState.searchData.showDelete,
      };
      const res = await wipReportService.getReport(params);
      if (res && res.Data && isRendered)
        setIQCState({
          ...iqcState,
          data: res.Data ?? [],
          totalRow: res.TotalRow,
          isLoading: false,
        });
    }
  }
  useEffect(() => {
    fetchData();
  }, [iqcState.page, iqcState.pageSize, iqcState.searchData.showDelete]);
  useEffect(() => {
    return () => {
      isRendered = false;
    };
  }, []);
  const handleSearch = (e, inputName) => {
    let newSearchData = { ...iqcState.searchData };

    newSearchData[inputName] = e;
    if (inputName == 'showDelete') {
      setIQCState({
        ...iqcState,
        page: 1,
        searchData: { ...newSearchData },
      });
    } else {
      setIQCState({ ...iqcState, searchData: { ...newSearchData } });
    }
  };
  const handleDownload = async () => {
    try {
      const params = {
        keyWord: iqcState.searchData.keyWord,
        searchStartDay: iqcState.searchData.searchStartDay,
        searchEndDay: iqcState.searchData.searchEndDay,
      };
      await wipReportService.downloadReport(params);
    } catch (error) {
      console.log(`ERROR: ${error}`);
    }
  };
  return (
    <React.Fragment>
      <Grid container direction="row" justifyContent="space-between" alignItems="center">
        <Grid item>
          <MuiButton text="excel" color="success" onClick={handleDownload} />
        </Grid>
        <Grid item>
          <Grid container spacing={2} justifyContent="center">
            <Grid item sx={{ width: '170px' }}>
              <MuiDateField
                disabled={iqcState.isLoading}
                label="Start QC Date"
                value={iqcState.searchData.searchStartDay}
                onChange={(e) => {
                  handleSearch(e ? moment(e).format('YYYY-MM-DD') : null, 'searchStartDay');
                }}
                variant="standard"
              />
            </Grid>
            <Grid item sx={{ width: '170px' }}>
              <MuiDateField
                label="End QC Date"
                value={iqcState.searchData.searchEndDay}
                onChange={(e) => {
                  handleSearch(e ? moment(e).format('YYYY-MM-DD') : null, 'searchEndDay');
                }}
                variant="standard"
              />
            </Grid>
            <Grid item sx={{ width: '350px' }}>
              <MuiSearchField
                label="general.code"
                name="Code"
                onClick={fetchData}
                onChange={(e) => handleSearch(e.target.value, 'keyWord')}
              />
            </Grid>
            <Grid item>
              <MuiButton text="search" color="info" onClick={fetchData} />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <MuiDataGrid
        showLoading={iqcState.isLoading}
        isPagingServer={true}
        headerHeight={45}
        columns={columns}
        rows={iqcState.data}
        page={iqcState.page - 1}
        pageSize={iqcState.pageSize}
        rowCount={iqcState.totalRow}
        onSelectionModelChange={(ids) => {
          setLotId(ids[0]);
        }}
        onPageChange={(newPage) => {
          setIQCState({ ...iqcState, page: newPage + 1 });
        }}
        getRowId={(rows) => rows.Id}
        // getRowClassName={(params) => {
        //   if (_.isEqual(params.row, newData)) {
        //     return `Mui-created`;
        //   }
        // }}
        initialState={{ pinnedColumns: { right: ['action'] } }}
      />
      <WIPReportDetail LotId={LotId} />
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

export default connect(mapStateToProps, mapDispatchToProps)(WIPReport);
