import { Store } from '@appstate';
import { Display_Operations } from '@appstate/display';
import { User_Operations } from '@appstate/user';
import { CombineDispatchToProps, CombineStateToProps } from '@plugins/helperJS';
import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { HttpTransportType, HubConnectionBuilder, HubConnectionState, LogLevel } from '@microsoft/signalr';

import { BASE_URL, TOKEN_ACCESS } from '@constants/ConfigConstants';
import ScheduleIcon from '@mui/icons-material/Schedule';
import Grid from '@mui/material/Grid';
import { GetLocalStorage } from '@utils';
import { useIntl } from 'react-intl';
import Clock from 'react-live-clock';

import PercentageChartTotal from './PercentageChartTotal';
import PercentageChartInjection from './PercentageChartInjection';
import PercentageChartAssy from './PercentageChartAssy';
import TableData from './TableData';

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

  const { language, totalOrderQty, totalActualQty, totalEfficiency, data, saveDisplayData } = props;

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

  const [connection, setConnection] = useState(initConnection);

  const startConnection = async () => {
    try {
      if (connection) {
        connection.on('WorkOrderGetDisplay', (res) => {
          if (res && isRendered) {
            saveDisplayData(res);
          }
        });
        // connection.on('WorkOrderGetDisplay', (data) => {
        //   if (data && data.length > 0 && isRendered) {
        //     setWorkOrders([...data]);
        //     // setSelectedRow({ ...data[0] });
        //     handleHighcharts([...data]);
        //   }
        // });
        connection.onclose(async (e) => {
          if (isRendered) setConnection(null);
        });
      }

      if (connection.state === HubConnectionState.Disconnected) {
        await connection.start();
        console.log('websocket connect success');
        await connection.invoke('GetDisplayWO');
      } else if (connection.state === HubConnectionState.Connected) {
        await connection.invoke('GetDisplayWO');
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
      <div style={{ display: 'flex', marginTop: '5px' }}>
        <Grid container spacing={5}>
          <Grid item xs={4}>
            <Grid container direction="column" spacing={2}>
              <Grid item xs={33.33} sm={50}>
                <PercentageChartTotal />
              </Grid>
              <Grid item xs={33.33} sm={50}>
                <PercentageChartInjection />
              </Grid>
              <Grid item xs={33.33} sm={50}>
                <PercentageChartAssy />
              </Grid>
            </Grid>
          </Grid>
          <Grid item xs={8}>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TableData />
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

export default connect(mapStateToProps, mapDispatchToProps)(KPIProductivity);
