import { Store } from '@appstate';
import { Display_Operations } from '@appstate/display';
import { User_Operations } from '@appstate/user';
import { CombineDispatchToProps, CombineStateToProps } from '@plugins/helperJS';
import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useIntl } from 'react-intl';

//Highcharts
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import exporting from 'highcharts/modules/exporting.js';
// accessibility module
require('highcharts/modules/accessibility')(Highcharts);

const PercentageChartInjection = (props) => {
  let isRendered = useRef(true);
  const intl = useIntl();
  exporting(Highcharts);

  const { totalOrderQty, totalActualQty, totalEfficiency, data } = props;
  const [chartOption, setChartOption] = useState({});

  const handleHighcharts = (workOrders) => {
    let totalOrder = 0;
    let totalActual = 0;

    if (workOrders.length > 0) {
      for (let i = 0; i < workOrders.length; i++) {
        let item = workOrders[i];

        if (!item.woProcess) {
          totalOrder += item.orderQty;
          totalActual += item.actualQty;
        }
      }
    }

    if (isRendered) {
      setChartOption({
        chart: {
          type: 'pie',
          width: 360,
          height: 230,
        },
        credits: {
          enabled: false,
        },
        title: {
          text: 'Injection',
        },
        plotOptions: {
          pie: {
            innerSize: 100,
            depth: 45,
            dataLabels: {
              enabled: true,
              // format: '<b>{point.name}</b>: {point.percentage:.1f} %',
              formatter: function () {
                return Math.round(this.percentage * 100) / 100 + ' %';
              },
              distance: -25,
              style: {
                fontSize: '20px',
              },
              color: 'white',
            },
          },
        },
        series: [
          {
            name: 'Progress',
            data: [
              ['Completed', totalActual],
              ['In Progress', totalOrder - totalActual],
            ],
            colors: ['#fdcb6e', '#163F4C'],
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
      <HighchartsReact highcharts={Highcharts} options={chartOption} />
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

export default connect(mapStateToProps, mapDispatchToProps)(PercentageChartInjection);
