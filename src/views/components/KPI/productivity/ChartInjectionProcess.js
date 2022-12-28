import { Store } from '@appstate';
import { Display_Operations } from '@appstate/display';
import { User_Operations } from '@appstate/user';
import { CombineDispatchToProps, CombineStateToProps } from '@plugins/helperJS';
import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useIntl } from 'react-intl';

import moment from 'moment';

//Highcharts
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official';
import exporting from 'highcharts/modules/exporting.js';
// accessibility module
require('highcharts/modules/accessibility')(Highcharts);

const ChartInjectionProcess = (props) => {
  let isRendered = useRef(true);
  const intl = useIntl();
  exporting(Highcharts);

  const { data } = props;
  const [chartOption, setChartOption] = useState({});

  const handleHighcharts = (workOrders) => {
    const categoryList = [];
    const actualQtyList = [];
    const ngQtyList = [];
    const orderQtyList = [];
    const hmiQtyList = [];
    const efficiencyList = [];

    if (workOrders.length > 0) {
      for (let i = 0; i < workOrders.length; i++) {
        let item = workOrders[i];
        if (!item.woProcess) {
          categoryList.push(`<p>${item.woCode}<br>${item.lineName}<br>${item.materialCode}</p>`);
          actualQtyList.push(item.actualQty);
          ngQtyList.push(item.ngQty);
          hmiQtyList.push(item.hmiQty);
          orderQtyList.push(item.orderQty);
          if (item.orderQty != 0) {
            let efficiency = Math.round((item.actualQty / item.orderQty) * 100);
            efficiencyList.push(efficiency > 100 ? 100 : efficiency);
          } else {
            efficiencyList.push(0);
          }
        }
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

          scrollablePlotArea: {
            minWidth: 1000,
            scrollPositionX: 0,
          },

          // scrollbar: true,

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
        navigator: {
          enabled: false,
        },
        rangeSelector: {
          enabled: false,
        },
        exporting: {
          enabled: true,
        },
        title: {
          text: `INJECTION WORK ORDER`,
        },
        // subtitle: {
        // 	text: 'Source: ' +
        // 		'<a href="https://www.ssb.no/en/statbank/table/08940/" ' +
        // 		'target="_blank">SSB</a>'
        // },
        xAxis: {
          // max: 10,
          categories: categoryList,
          crosshair: true,
          useHTML: true,
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
          series: {
            // pointWidth: 10,
            // pointPadding: 0,
            // groupPadding: -1,
            borderWidth: 0,
            dataLabels: {
              enabled: true,
            },
          },
        },
        series: [
          {
            name: intl.formatMessage({ id: 'work_order.OrderQty' }),
            data: orderQtyList,
            color: '#B75454',
            yAxis: 0,
          },
          {
            name: intl.formatMessage({ id: 'work_order.HMIQty' }),
            data: hmiQtyList,
            color: '#32a852',
            yAxis: 0,
          },
          {
            name: intl.formatMessage({ id: 'work_order.ActualQty' }),
            data: actualQtyList,
            color: '#ffd700',
            yAxis: 0,
          },
          {
            name: intl.formatMessage({ id: 'work_order.NGQty' }),
            data: ngQtyList,
            color: '#c0c0c0',
            yAxis: 0,
          },
          {
            name: intl.formatMessage({ id: 'work_order.Efficiency' }),
            type: 'spline',
            data: efficiencyList,
            color: '#f44336',
            tooltip: {
              valueSuffix: '%',
            },
            yAxis: 1,
          },
        ],
      });
    }
  };

  useEffect(() => {
    handleHighcharts(data);
    return () => {
      isRendered = false;
    };
  }, [data]);

  return (
    <React.Fragment>
      <HighchartsReact
        highcharts={Highcharts}
        // constructorType={'stockChart'}
        options={chartOption}
      />
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
  } = CombineStateToProps(state.AppReducer, [[Store.User_Reducer]]);

  const {
    Display_Reducer: { totalOrderQty, totalActualQty, totalEfficiency, data },
  } = CombineStateToProps(state.AppReducer, [[Store.Display_Reducer]]);

  return { language, totalOrderQty, totalActualQty, totalEfficiency, data };
};

const mapDispatchToProps = (dispatch) => {
  const {
    User_Operations: { changeLanguage },
  } = CombineDispatchToProps(dispatch, bindActionCreators, [[User_Operations]]);

  const {
    Display_Operations: { saveDisplayData },
  } = CombineDispatchToProps(dispatch, bindActionCreators, [[Display_Operations]]);

  return { changeLanguage, saveDisplayData };
};

export default connect(mapStateToProps, mapDispatchToProps)(ChartInjectionProcess);
