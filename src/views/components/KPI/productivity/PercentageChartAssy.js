import { Store } from '@appstate';
import { Display_Operations } from '@appstate/display';
import { User_Operations } from '@appstate/user';
import { CombineDispatchToProps, CombineStateToProps } from '@plugins/helperJS';
import React, { useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useIntl } from 'react-intl';

//Highcharts
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import exporting from 'highcharts/modules/exporting.js';
// accessibility module
require('highcharts/modules/accessibility')(Highcharts);

const PercentageChartAssy = (props) => {
  let isRendered = useRef(true);
  const intl = useIntl();
  exporting(Highcharts);

  const { totalOrderQty, totalActualQty, totalEfficiency, data } = props;

  const options = {
    chart: {
      type: 'pie',
      width: 500,
      height: 250,
    },
    credits: {
      enabled: false,
    },
    title: {
      text: 'Assembly',
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
          ['Completed', 70],
          ['In Progress', 30],
        ],
        colors: ['#4CD2FF', '#163F4C'],
      },
    ],
  };

  useEffect(() => {
    if (isRendered) {
    }

    return () => {
      isRendered = false;
    };
  }, []);

  //Highcharts

  return (
    <React.Fragment>
      <HighchartsReact highcharts={Highcharts} options={options} />
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

export default connect(mapStateToProps, mapDispatchToProps)(PercentageChartAssy);
