import { Store } from '@appstate';
import { User_Operations } from '@appstate/user';
import { CombineDispatchToProps, CombineStateToProps } from '@plugins/helperJS';
import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { WorkOrderDto } from '@models';
import moment from 'moment';

import { useIntl } from 'react-intl';
import { MuiDataGrid } from '@controls';
//Highcharts
import Highcharts from 'highcharts';
// import highchartsAccessibility from "highcharts/modules/accessibility";
import exporting from 'highcharts/modules/exporting.js';
import { Grid } from '@mui/material';
// accessibility module
require('highcharts/modules/accessibility')(Highcharts);

const KPIInjection = (props) => {
  let isRendered = useRef(true);
  const intl = useIntl();
  exporting(Highcharts);
  const data = [
    {
      WoId: 13131,
      Line: 'Inj-01',
      Status: 'Working',
      WO: '1314141414414',
      Item: 'BN12-1313131',
      Target: 1293,
      Actual: 1213,
    },
    {
      WoId: 134414,
      Line: 'Inj-02',
      Status: 'Stop',
      WO: '1314141414414',
      Item: 'BN12-1313131',
      Target: 1293,
      Actual: 1213,
    },
    {
      WoId: 14155,
      Line: 'Inj-03',
      Status: 'Working',
      WO: '1314141414414',
      Item: 'BN12-1313131',
      Target: 1293,
      Actual: 1213,
    },
    {
      WoId: 14514,
      Line: 'Inj-04',
      Status: 'Pause',
      WO: '1314141414414',
      Item: 'BN12-1313131',
      Target: 1293,
      Actual: 1213,
    },
  ];
  const [isLoading, setIsLoading] = useState(false);
  const [workOrders, setWorkOrders] = useState([]);
  const [chartOption, setChartOption] = useState({});
  const [workOrderState, setWorkOrderState] = useState({
    isLoading: false,
    data: data,
    totalRow: 0,
    page: 1,
    pageSize: 10,
    searchData: {},
  });
  useEffect(() => {
    if (isRendered) {
    }

    return () => {
      isRendered = false;
    };
  }, []);

  //Highcharts
  const handleHighcharts = (workOrders) => {
    const categoryList = [];
    const ActualQtyList = [];
    const OrderQtyList = [];
    const HMIQtyList = [];
    const EfficiencyList = [];

    if (workOrders.length > 0) {
      for (let i = 0; i < workOrders.length; i++) {
        let item = workOrders[i];
        categoryList.push(item.woCode);
        ActualQtyList.push(item.actualQty);
        HMIQtyList.push(item.hmiQty);
        OrderQtyList.push(item.orderQty);
        if (item.orderQty != 0) {
          let efficiency = Math.round((item.actualQty / item.orderQty) * 100);
          EfficiencyList.push(efficiency > 100 ? 100 : efficiency);
        } else EfficiencyList.push(0);
      }
    }

    if (isRendered) {
      setChartOption({
        chart: {
          navigation: {
            buttonOptions: {
              enabled: true,
            },
          },
          type: 'column',
          zoomType: 'xy',
          // styledMode: true,
          // options3d: {
          // 	enabled: true,
          // 	alpha: 15,
          // 	beta: 15,
          // 	depth: 50
          // }
        },
        // accessibility: {
        // 	enabled: false
        // },
        exporting: {
          enabled: true,
        },
        title: {
          text: `${moment(new Date()).add(7, 'hours').format('YYYY/MM/DD')} Work Order Dashboard`,
        },
        // subtitle: {
        // 	text: 'Source: ' +
        // 		'<a href="https://www.ssb.no/en/statbank/table/08940/" ' +
        // 		'target="_blank">SSB</a>'
        // },
        xAxis: {
          categories: categoryList,
          crosshair: true,
        },
        yAxis: [
          {
            title: {
              useHTML: true,
              text: 'Quantity',
            },
          },
          {
            labels: {
              format: '{value}%',
              style: {
                color: Highcharts.getOptions().colors[1],
              },
            },
            title: {
              text: intl.formatMessage({ id: 'work_order.Efficiency' }),
              style: {
                color: Highcharts.getOptions().colors[1],
              },
            },
            opposite: true,
          },
        ],
        credits: {
          enabled: false,
        },
        tooltip: {
          headerFormat: '<span style="font-size:10px">Wo code: {point.key}</span><table>',
          pointFormat:
            '<tr><td style="color:{series.color};padding:0">{series.name}: </td><td style="padding:0"><b>{point.y:.1f}</b></td></tr>',
          footerFormat: '</table>',
          shared: true,
          useHTML: true,
        },
        plotOptions: {
          column: {
            pointPadding: 0.2,
            borderWidth: 0,
            dataLabels: {
              enabled: true,
            },
          },
        },
        series: [
          {
            name: intl.formatMessage({ id: 'work_order.OrderQty' }),
            data: OrderQtyList,
            color: '#ffd700',
            yAxis: 0,
          },
          {
            name: intl.formatMessage({ id: 'work_order.HMIQty' }),
            data: HMIQtyList,
            color: '#009EFF',
            yAxis: 0,
          },
          {
            name: intl.formatMessage({ id: 'work_order.ActualQty' }),
            data: ActualQtyList,
            color: '#c0c0c0',
            yAxis: 0,
          },
          {
            name: intl.formatMessage({ id: 'work_order.Efficiency' }),
            type: 'spline',
            data: EfficiencyList,
            tooltip: {
              valueSuffix: '%',
            },
            yAxis: 1,
          },
        ],
      });
    }
  };
  const columns = [
    {
      field: 'id',
      headerName: '',
      width: 80,
      filterable: false,
      renderCell: (index) =>
        index.api.getRowIndex(index.row.WoId) + 1 + (workOrderState.page - 1) * workOrderState.pageSize,
    },
    {
      field: 'Line',
      headerName: 'Line',
      /*flex: 0.7,*/ width: 150,
    },
    {
      field: 'Status',
      headerName: 'Status',
      /*flex: 0.7,*/ width: 100,
    },
    {
      field: 'WO',
      headerName: 'WO',
      /*flex: 0.7,*/ width: 150,
    },
    {
      field: 'Item',
      headerName: 'Item',
      /*flex: 0.7,*/ width: 150,
    },
    {
      field: 'Target',
      headerName: 'Target',
      /*flex: 0.7,*/ width: 100,
    },
    {
      field: 'Actual',
      headerName: 'Actual',
      /*flex: 0.7,*/ width: 100,
    },
  ];

  return (
    <React.Fragment>
      <Grid sx={{ backgroundColor: 'white !important', width: '100%', minHeight: '80vh' }}>
        <div className="d-flex justify-content-between">
          <div className="py-3 px-5" style={{ backgroundColor: '#54a7b5' }}>
            <h4 style={{ color: 'white' }} className="mb-0">
              Injection
            </h4>
          </div>
          <div className="py-3 px-5" style={{ backgroundColor: '#54a7b5' }}>
            <h4 style={{ color: 'white' }} className="mb-0">
              2023-xx-xx 13:xx :xx
            </h4>
          </div>
        </div>
        <div className="row px-5 py-4 d-flex">
          <div className="col-sm-7 col-md-7 mr-auto mt-3">
            <div className="row">
              <div className="col">
                <b>Actual</b>
              </div>
              <div className="col">
                <b className="text-info">XXXXX</b>
              </div>
              <div className="col">
                <b>NG</b>
              </div>
              <div className="col">
                <b className="text-info">XXXXX</b>
              </div>
              <div className="col">
                <b>Efficiency</b>
              </div>
              <div className="col">
                <b className="text-info">XXXXX</b>
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
              getRowId={(rows) => rows.WoId}
              getRowClassName={(params) => params.indexRelativeToCurrentPage % 2 === 0 && 'bg-rgba-03'}
            />
            {/* <table className="table table-borderless table-striped">
              <thead>
                <tr>
                  <th scope="col">Line</th>
                  <th scope="col">Status</th>
                  <th scope="col">WO</th>
                  <th scope="col">Item</th>
                  <th scope="col">Target</th>
                  <th scope="col">Actual</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <th scope="row">Inj-01</th>
                  <td className="text-white">Working</td>
                  <td className="text-white">541524154354153</td>
                  <td className="text-white">BN83-17993A</td>
                  <td className="text-white">1,500</td>
                  <td className="text-white">1,200</td>
                </tr>
                <tr>
                  <th scope="row">Inj-02</th>
                  <td className="text-white">Stop</td>
                </tr>
                <tr>
                  <th scope="row">Inj-01</th>
                  <td className="text-white">Working</td>
                  <td className="text-white">541524154354153</td>
                  <td className="text-white">BN83-17993A</td>
                  <td className="text-white">1,500</td>
                  <td className="text-white">1,200</td>
                </tr>
              </tbody>
            </table> */}
          </div>
          <div className="col-sm-5 col-md-5" style={{ backgroundColor: 'white' }}>
            <h3>CHART</h3>
          </div>
        </div>
      </Grid>
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

export default connect(mapStateToProps, mapDispatchToProps)(KPIInjection);
