import { Store } from '@appstate';
import { User_Operations } from '@appstate/user';
import { CombineDispatchToProps, CombineStateToProps } from '@plugins/helperJS';
import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import moment from 'moment';

import { useIntl } from 'react-intl';

//Highcharts
import Highcharts from 'highcharts';
// import highchartsAccessibility from "highcharts/modules/accessibility";
import exporting from 'highcharts/modules/exporting.js';
// accessibility module
require('highcharts/modules/accessibility')(Highcharts);

const TableData = (props) => {
  let isRendered = useRef(true);
  const intl = useIntl();
  exporting(Highcharts);

  const [isLoading, setIsLoading] = useState(false);
  const [workOrders, setWorkOrders] = useState([]);
  const [chartOption, setChartOption] = useState({});

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

  return (
    <React.Fragment>
      <div style={{ display: 'flex', height: '100%' }}></div>
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

export default connect(mapStateToProps, mapDispatchToProps)(TableData);
