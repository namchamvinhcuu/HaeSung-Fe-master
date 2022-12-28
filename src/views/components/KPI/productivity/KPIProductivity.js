import { Store } from '@appstate';
// import { Display_Operations } from '@appstate/display';
import { User_Operations } from '@appstate/user';
import { CombineDispatchToProps, CombineStateToProps } from '@plugins/helperJS';
import React, { useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import ScheduleIcon from '@mui/icons-material/Schedule';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';
import { useIntl } from 'react-intl';
import Clock from 'react-live-clock';

import ChartAssyProcess from './ChartAssyProcess';
import ChartInjectionProcess from './ChartInjectionProcess';
import PercentageChartAssy from './PercentageChartAssy';
import PercentageChartInjection from './PercentageChartInjection';
import PercentageChartTotal from './PercentageChartTotal';
import TableData from './TableData';
import TableEfficiency from './TableEfficiency';

const Item = styled(Paper)(({ theme }) => ({
  // backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  // ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
}));

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

  // const { language, totalOrderQty, totalActualQty, totalNGQty, totalEfficiency, data, saveDisplayData } = props;

  // const initConnection = new HubConnectionBuilder()
  //   .withUrl(`${BASE_URL}/signalr`, {
  //     accessTokenFactory: () => GetLocalStorage(TOKEN_ACCESS),
  //     skipNegotiation: true,
  //     transport: HttpTransportType.WebSockets,
  //   })
  //   .configureLogging(LogLevel.None)
  //   .withAutomaticReconnect({
  //     nextRetryDelayInMilliseconds: (retryContext) => {
  //       //reconnect after 5-20s
  //       return 5000 + Math.random() * 15000;
  //     },
  //   })
  //   .build();

  // const [connection, setConnection] = useState(initConnection);

  // const startConnection = async () => {
  //   try {
  //     if (connection) {
  //       connection.on('WorkOrderGetDisplay', (res) => {
  //         if (res && isRendered) {
  //           saveDisplayData(res);
  //         }
  //       });
  //       connection.onclose(async (e) => {
  //         if (isRendered) setConnection(null);
  //       });
  //     }

  //     if (connection.state === HubConnectionState.Disconnected) {
  //       await connection.start();
  //       console.log('websocket connect success');
  //       await connection.invoke('GetDisplayWO');
  //     } else if (connection.state === HubConnectionState.Connected) {
  //       await connection.invoke('GetDisplayWO');
  //     }
  //   } catch (error) {
  //     console.log('websocket connect error: ', error);
  //   }
  // };

  // const closeConnection = async () => {
  //   try {
  //     if (connection && connection.state === HubConnectionState.Connected) await connection.stop();
  //   } catch (error) {
  //     console.log(error);
  //   }
  // };

  useEffect(() => {
    if (isRendered) {
      // startConnection();
    }

    return () => {
      // closeConnection();
      isRendered = false;
    };
  }, []);

  return (
    <React.Fragment>
      <div style={{ ...style.grid, width: '100%', minHeight: 'unset' }}>
        <h2 style={{ margin: 0, fontWeight: '600', fontFamily: 'cursive' }}>
          <ScheduleIcon sx={{ fontSize: 33, mr: 2, mb: 1 }} />
          <Clock format={'DD/MM/YYYY (HH:mm:ss)'} ticking={true} />
        </h2>
      </div>

      <div style={{ display: 'flex', marginTop: '20px' }}>
        <Grid container spacing={5}>
          <Grid item xs={3}>
            <Box>
              <Grid container direction="column" spacing={2}>
                <Grid item xs={30} sm={50}>
                  <Item>
                    <PercentageChartTotal />
                  </Item>
                </Grid>
                <Grid item xs={30} sm={50}>
                  <Item>
                    <PercentageChartInjection />
                  </Item>
                </Grid>
                <Grid item xs={30} sm={50}>
                  <Item>
                    <PercentageChartAssy />
                  </Item>
                </Grid>
              </Grid>
            </Box>
          </Grid>

          <Grid item xs={9}>
            <Box sx={{ width: '100%', height: '90%' }}>
              <Grid container rowSpacing={1} columnSpacing={{ xs: 1, sm: 2, md: 3 }} sx={{ height: '100%' }}>
                <Grid item xs={6} sx={{ height: '50%' }}>
                  <Item>
                    <TableData />
                  </Item>
                </Grid>
                <Grid item xs={6}>
                  <Item>
                    <TableEfficiency />
                  </Item>
                </Grid>
                <Grid item xs={6}>
                  <Item>
                    <ChartInjectionProcess />
                  </Item>
                </Grid>
                <Grid item xs={6}>
                  <Item>
                    <ChartAssyProcess />
                  </Item>
                </Grid>
              </Grid>
            </Box>
          </Grid>
        </Grid>
      </div>
    </React.Fragment>
  );
};

User_Operations.toString = function () {
  return 'User_Operations';
};

// Display_Operations.toString = function () {
//   return 'Display_Operations';
// };

const mapStateToProps = (state) => {
  const {
    User_Reducer: { language },
  } = CombineStateToProps(state.AppReducer, [[Store.User_Reducer]]);

  const {
    Display_Reducer: { totalOrderQty, totalActualQty, totalNGQty, totalEfficiency, data },
  } = CombineStateToProps(state.AppReducer, [[Store.Display_Reducer]]);

  return { language, totalOrderQty, totalActualQty, totalNGQty, totalEfficiency, data };
};

const mapDispatchToProps = (dispatch) => {
  const {
    User_Operations: { changeLanguage },
  } = CombineDispatchToProps(dispatch, bindActionCreators, [[User_Operations]]);

  // const {
  //   Display_Operations: { saveDisplayData },
  // } = CombineDispatchToProps(dispatch, bindActionCreators, [[Display_Operations]]);

  return {
    changeLanguage,
    // , saveDisplayData
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(KPIProductivity);
