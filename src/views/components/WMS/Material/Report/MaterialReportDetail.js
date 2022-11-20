import { Store } from '@appstate';
import { User_Operations } from '@appstate/user';
import { MuiButton, MuiDataGrid } from '@controls';
import { Grid } from '@mui/material';
import { CombineDispatchToProps, CombineStateToProps } from '@plugins/helperJS';
import { materialReportService } from '@services';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

const MaterialReportDetail = ({ LotId }) => {
  const intl = useIntl();
  let isRendered = useRef(true);
  const [iqcStateDetail, setIQCDetailState] = useState({
    isLoading: false,
    data: [],
    totalRow: 0,
    page: 1,
    pageSize: 8,
    searchData: {},
  });
  const columns = [
    {
      field: 'id',
      headerName: '',
      flex: 0.1,
      align: 'center',
      filterable: false,
      renderCell: (index) =>
        index.api.getRowIndex(index.row.QcId) + 1 + (iqcStateDetail.page - 1) * iqcStateDetail.pageSize,
    },
    { field: 'MaterialCode', headerName: 'Material Code', flex: 0.5 },
    {
      field: 'QCCode',
      headerName: intl.formatMessage({ id: 'standardQC.QCCode' }),
      flex: 0.5,
      renderCell: (params) => (
        <div>
          {params.row.Description == null || params.row.Description == ''
            ? params.row.QCCode
            : params.row.QCCode + ' - ' + params.row.Description}
        </div>
      ),
    },
    { field: 'createdName', headerName: intl.formatMessage({ id: 'general.createdName' }), flex: 0.5 },
    {
      field: 'createdDate',
      headerName: intl.formatMessage({ id: 'general.createdDate' }),
      flex: 0.5,
      valueFormatter: (params) =>
        params?.value ? moment(params?.value).add(7, 'hours').format('YYYY-MM-DD HH:mm:ss') : null,
    },
    { field: 'modifiedName', headerName: intl.formatMessage({ id: 'general.modifiedName' }), flex: 0.5 },
    {
      field: 'modifiedDate',
      headerName: intl.formatMessage({ id: 'general.modifiedDate' }),
      flex: 0.5,
      valueFormatter: (params) =>
        params?.value ? moment(params?.value).add(7, 'hours').format('YYYY-MM-DD HH:mm:ss') : null,
    },
  ];
  async function fetchData(LotId) {
    setIQCDetailState({ ...iqcStateDetail, isLoading: true });
    const params = {
      page: iqcStateDetail.page,
      pageSize: iqcStateDetail.pageSize,
      LotId: LotId,
    };
    console.log('params', params);
    const res = await materialReportService.getReportDetail(params);
    if (res && res.Data && isRendered)
      setIQCDetailState({
        ...iqcStateDetail,
        data: res.Data ?? [],
        totalRow: res.TotalRow,
        isLoading: false,
      });
  }
  useEffect(() => {
    fetchData(LotId);
  }, [iqcStateDetail.page, iqcStateDetail.pageSize, LotId]);
  useEffect(() => {
    return () => {
      isRendered = false;
    };
  }, []);
  //   const handleSearch = (e, inputName) => {
  //     let newSearchData = { ...iqcStateDetail.searchData };

  //     newSearchData[inputName] = e;
  //     if (inputName == "showDelete") {
  //         setIQCDetailState({
  //         ...iqcStateDetail,
  //         page: 1,
  //         searchData: { ...newSearchData },
  //       });
  //     } else {
  //         setIQCDetailState({ ...iqcStateDetail, searchData: { ...newSearchData } });
  //     }
  //   };
  const handleDownloadDetail = async () => {
    try {
      const params = {
        LotId: LotId,
      };
      await materialReportService.downloadReportDetail(params);
    } catch (error) {
      console.log(`ERROR: ${error}`);
    }
  };
  return (
    <React.Fragment>
      <Grid container direction="row" justifyContent="space-between" alignItems="center">
        <Grid item>
          <MuiButton
            text="excel"
            color="success"
            onClick={handleDownloadDetail}
            disabled={LotId != null ? false : true}
          />
        </Grid>
        {/* <Grid item>
          <Grid container spacing={2} justifyContent="center">
            <Grid item sx={{ width: "170px" }}>
              <MuiDateField
                disabled={iqcState.isLoading}
                label="Start QC Date"
                value={iqcState.searchData.searchStartDay}
                onChange={(e) => {
                  handleSearch(
                    e ? moment(e).format("YYYY-MM-DD") : null,
                    "searchStartDay"
                  );
                }}
                variant="standard"
              />
            </Grid>
            <Grid item sx={{ width: "170px" }}>
              <MuiDateField
                label="End QC Date"
                value={iqcState.searchData.searchEndDay}
                onChange={(e) => {
                  handleSearch(
                    e ? moment(e).format("YYYY-MM-DD") : null,
                    "searchEndDay"
                  );
                }}
                variant="standard"
              />
            </Grid>
            <Grid item sx={{ width: "350px" }}>
              <MuiSearchField
                label="general.code"
                name="Code"
                onClick={fetchData}
                onChange={(e) => handleSearch(e.target.value, "keyWord")}
              />
            </Grid>
            <Grid item>
              <MuiButton text="search" color="info" onClick={fetchData} />
            </Grid>
          </Grid>
        </Grid> */}
      </Grid>
      <MuiDataGrid
        showLoading={iqcStateDetail.isLoading}
        isPagingServer={true}
        headerHeight={45}
        columns={columns}
        rows={iqcStateDetail.data}
        page={iqcStateDetail.page - 1}
        pageSize={iqcStateDetail.pageSize}
        rowCount={iqcStateDetail.totalRow}
        onSelectionModelChange={(ids) => {
          // setRowSelected(ids)
          //   handleRowSelection(ids);
        }}
        onPageChange={(newPage) => {
          setIQCDetailState({ ...iqcStateDetail, page: newPage + 1 });
        }}
        getRowId={(rows) => rows.QcId}
        // getRowClassName={(params) => {
        //   if (_.isEqual(params.row, newData)) {
        //     return `Mui-created`;
        //   }
        // }}
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

export default connect(mapStateToProps, mapDispatchToProps)(MaterialReportDetail);
