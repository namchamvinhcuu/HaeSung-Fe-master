import { Store } from '@appstate';
import { User_Operations } from '@appstate/user';
import { Display_Operations } from '@appstate/display';
import { CombineDispatchToProps, CombineStateToProps } from '@plugins/helperJS';
import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { MuiDataGrid } from '@controls';
import { Grid } from '@mui/material';
import Clock from 'react-live-clock';
import ChartAssyProcess from '../productivity/ChartAssyProcess';

const KPIAssy = (props) => {
  const { totalOrderQty, totalActualQty, totalEfficiency, data } = props;
  const [dataCount, setDataCount] = useState({
    actual: 0,
    ng: 0,
    efficiency: 0,
  });

  const [workOrderState, setWorkOrderState] = useState({
    isLoading: false,
    data: [],
    totalRow: 0,
    page: 1,
    pageSize: 10,
    searchData: {},
  });
  useEffect(async () => {
    const dataFilter = await data.filter((dt) => dt.woProcess === true);
    const sumActualQty = await dataFilter.reduce((accumulator, object) => {
      return accumulator + object.actualQty;
    }, 0);
    const sumNGQty = await dataFilter.reduce((accumulator, object) => {
      return accumulator + object.ngQty;
    }, 0);
    const sumOrderQty = await dataFilter.reduce((accumulator, object) => {
      return accumulator + object.orderQty;
    }, 0);
    const opeEfficiency = (sumActualQty / sumOrderQty) * 100;

    setDataCount((pre) => ({
      ...pre,
      actual: sumActualQty,
      ng: sumNGQty,
      efficiency: opeEfficiency || 0,
    }));
    setWorkOrderState((pre) => ({
      ...pre,
      data: dataFilter,
      totalRow: dataFilter?.length,
    }));
  }, [data]);

  //Highcharts

  const columns = [
    {
      field: 'id',
      headerName: '',
      width: 50,
      filterable: false,
      renderCell: (index) =>
        index.api.getRowIndex(index.row.woId) + 1 + (workOrderState.page - 1) * workOrderState.pageSize,
    },
    {
      field: 'lineName',
      headerName: 'Line',
      /*flex: 0.7,*/ width: 150,
    },
    {
      field: 'hmiStatusName',
      headerName: 'Status',
      /*flex: 0.7,*/ width: 100,
    },
    {
      field: 'woCode',
      headerName: 'WO',
      /*flex: 0.7,*/ width: 150,
    },
    {
      field: 'materialCode',
      headerName: 'Item',
      /*flex: 0.7,*/ width: 150,
    },
    {
      field: 'orderQty',
      headerName: 'Target',
      /*flex: 0.7,*/ width: 100,
    },
    {
      field: 'actualQty',
      headerName: 'Actual',
      /*flex: 0.7,*/ width: 100,
    },
  ];
  return (
    <React.Fragment>
      <Grid sx={{ backgroundColor: 'white !important', width: '100%', minHeight: '80vh' }}>
        <div className="d-flex justify-content-between">
          <div className="py-3 px-5" style={{ backgroundColor: '#54a7b5' }}>
            <h3 style={{ color: 'white' }} className="mb-0">
              Assy
            </h3>
          </div>
          <div className="py-3 px-5" style={{ backgroundColor: '#54a7b5' }}>
            <h4 style={{ color: 'white' }} className="mb-0">
              <Clock format={'YYYY-MM-DD HH:mm :ss'} ticking={true} style={{ fontSize: '1.75rem' }} />
            </h4>
          </div>
        </div>
        <div className="row px-5 py-4 d-flex">
          <div className="col-sm-7 col-md-7 mr-auto mt-3">
            <div className="row">
              <div className="col">
                <h4>
                  <b>Actual</b>
                </h4>
              </div>
              <div className="col">
                <h4 className="text-info">
                  <b>{dataCount?.actual}</b>
                </h4>
              </div>
              <div className="col">
                <h4>
                  <b>NG</b>
                </h4>
              </div>
              <div className="col">
                <h4>
                  <b className="text-info">{dataCount?.ng}</b>
                </h4>
              </div>
              <div className="col">
                <h4>
                  <b>Efficiency</b>
                </h4>
              </div>
              <div className="col">
                <h4>
                  <b className="text-info">{dataCount?.efficiency > 100 ? 100 : dataCount?.efficiency}</b>
                </h4>
              </div>
            </div>
          </div>
          <div className="mr-5">
            <div
              style={{
                backgroundColor: 'black',
                width: '200px',
                height: '120px',
                borderRadius: '10%',
                overflow: 'hidden',
              }}
            >
              <div style={{ width: '100%', height: '35%', backgroundColor: '#92d14f' }} className="d-flex-centerXY">
                <b style={{ fontSize: '1.5rem' }}>Working</b>
              </div>
              <div style={{ width: '100%', height: '65%' }} className="d-flex-centerXY">
                <b style={{ fontSize: '3.5rem', color: 'white' }}>8</b>
              </div>
            </div>
          </div>
          <div>
            <div
              style={{
                backgroundColor: 'black',
                width: '200px',
                height: '120px',
                borderRadius: '10%',
                overflow: 'hidden',
              }}
            >
              <div style={{ width: '100%', height: '35%', backgroundColor: '#f43ac9' }} className="d-flex-centerXY">
                <b style={{ fontSize: '1.5rem' }}>Stop</b>
              </div>
              <div style={{ width: '100%', height: '65%' }} className="d-flex-centerXY">
                <b style={{ fontSize: '3.5rem', color: 'white' }}>8</b>
              </div>
            </div>
          </div>
        </div>
        <div className="row  px-5">
          <div className="col-sm-7 col-md-7 pr-3" id="tableKPIProductivity">
            <MuiDataGrid
              disableSelectionOnClick
              showLoading={workOrderState.isLoading}
              isPagingServer={true}
              headerHeight={45}
              rowHeight={50}
              gridHeight={736}
              columns={columns}
              rows={workOrderState.data}
              page={workOrderState.page - 1}
              pageSize={workOrderState.pageSize}
              rowCount={workOrderState.totalRow}
              onPageChange={(newPage) => {
                setWorkOrderState({ ...workOrderState, page: newPage + 1 });
              }}
              getRowId={(rows) => rows.woId}
              getRowClassName={(params) => params.indexRelativeToCurrentPage % 2 === 0 && 'bg-rgba-03'}
            />
          </div>
          <div className="col-sm-5 col-md-5" style={{ backgroundColor: 'white' }}>
            <div style={{ transform: ' translate(1%, 25%)' }}>
              <ChartAssyProcess />
            </div>
          </div>
        </div>
      </Grid>
    </React.Fragment>
  );
};

User_Operations.toString = function () {
  return 'User_Operations';
};

Display_Operations.toString = function () {
  return 'Display_Operations';
};

const mapStateToProps = (state) => {
  const {
    User_Reducer: { language },
    Display_Reducer: { totalOrderQty, totalActualQty, totalEfficiency, data },
  } = CombineStateToProps(state.AppReducer, [[Store.User_Reducer], [Store.Display_Reducer]]);

  return { language, totalOrderQty, totalActualQty, totalEfficiency, data };
};

const mapDispatchToProps = (dispatch) => {
  const {
    User_Operations: { changeLanguage },
  } = CombineDispatchToProps(dispatch, bindActionCreators, [[User_Operations]]);

  return { changeLanguage };
};

export default connect(mapStateToProps, mapDispatchToProps)(KPIAssy);
