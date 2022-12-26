import { Store } from '@appstate';
import { User_Operations } from '@appstate/user';
import { CombineDispatchToProps, CombineStateToProps } from '@plugins/helperJS';
import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { HttpTransportType, HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';
import moment from 'moment';

import { BASE_URL, TOKEN_ACCESS } from '@constants/ConfigConstants';
import { GetLocalStorage } from '@utils';
import { useIntl } from 'react-intl';
import Grid from '@mui/material/Grid';
import Clock from 'react-live-clock';
import ScheduleIcon from '@mui/icons-material/Schedule';

//Highcharts
import Highcharts from 'highcharts';
// import highchartsAccessibility from "highcharts/modules/accessibility";
import exporting from 'highcharts/modules/exporting.js';
// accessibility module
require('highcharts/modules/accessibility')(Highcharts);

const style = {
  grid: {
    textAlign: 'center',
    alignItems: 'center',
    display: 'grid',
    fontSize: 26,
    color: '#000000',
    fontWeight: '600',
    minHeight: '105px',
  },
};

const KPIProductivity = (props) => {
  let isRendered = useRef(true);
  const intl = useIntl();
  exporting(Highcharts);

  const initConnection = new HubConnectionBuilder()
    .withUrl(`${BASE_URL}/signalr`, {
      accessTokenFactory: () => GetLocalStorage(TOKEN_ACCESS),
      skipNegotiation: true,
      transport: HttpTransportType.WebSockets,
    })
    .configureLogging(LogLevel.None)
    .withAutomaticReconnect({
      nextRetryDelayInMilliseconds: (retryContext) => {
        //reconnect after 5-20s
        return 5000 + Math.random() * 15000;
      },
    })
    .build();

  const [isLoading, setIsLoading] = useState(false);
  const [workOrders, setWorkOrders] = useState([]);
  const [chartOption, setChartOption] = useState({});
  const [connection, setConnection] = useState(initConnection);

  const startConnection = async () => {
    try {
      if (connection) {
        connection.on('ReceivedWorkOrders', (data) => {
          if (data && data.length > 0 && isRendered) {
            setWorkOrders([...data]);
            // setSelectedRow({ ...data[0] });
            handleHighcharts([...data]);
          }
        });
        connection.onclose(async (e) => {
          if (isRendered) setConnection(null);
        });
      }

      if (connection.state === HubConnectionState.Disconnected) {
        await connection.start();
        console.log('websocket connect success');
        await connection.invoke('SendWorkOrders');
      } else if (connection.state === HubConnectionState.Connected) {
        await connection.invoke('SendWorkOrders');
      }
    } catch (error) {
      console.log('websocket connect error: ', error);
    }
  };

  const closeConnection = async () => {
    try {
      if (connection && connection.state === HubConnectionState.Connected) await connection.stop();
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    if (isRendered) {
      startConnection();
    }

    return () => {
      closeConnection();
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
      {/* <Paper sx={{ mb: 2, p: 3 }}>
        <HighchartsReact highcharts={Highcharts} options={chartOption} />
      </Paper> */}
      <div style={{ ...style.grid, width: '100%', minHeight: 'unset' }}>
        <h2 style={{ margin: 0, fontWeight: '600', fontFamily: 'cursive' }}>
          <ScheduleIcon sx={{ fontSize: 33, mr: 2, mb: 1 }} />
          <Clock format={'DD/MM/YYYY (HH:mm:ss)'} ticking={true} />
        </h2>
      </div>
      <div style={{ display: 'flex', height: '100%', marginTop: '5px', border: '1px solid' }}>
        <Grid container>
          <Grid item xs={3} style={{ border: '1px solid black' }}>
            <Grid container direction="column" spacing={2}>
              <Grid item xs={33.33} sm={50}>
                ...PercentageChartTotal
              </Grid>
              <Grid item xs={33.33} sm={50}>
                ...PercentageChartInjection
              </Grid>
              <Grid item xs={33.33} sm={50}>
                ...PercentageChartAssy
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={9} style={{ border: '1px solid black' }}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                ...TableData
              </Grid>
              <Grid item xs={12} sm={6}>
                ...TableEfficiency
              </Grid>
              <Grid item xs={12} sm={6}>
                ...ChartInjectionProcess
              </Grid>
              <Grid item xs={12} sm={6}>
                ...ChartAssyProcess
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </div>
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

export default connect(mapStateToProps, mapDispatchToProps)(KPIProductivity);
