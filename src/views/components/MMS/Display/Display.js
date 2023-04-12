import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { CombineStateToProps, CombineDispatchToProps } from '@plugins/helperJS';
import { User_Operations } from '@appstate/user';
import { Store } from '@appstate';

import { HubConnectionBuilder, LogLevel, HttpTransportType } from '@microsoft/signalr';

import { useIntl } from 'react-intl';
import { BASE_URL, TOKEN_ACCESS } from '@constants/ConfigConstants';
import { GetLocalStorage } from '@utils';
import { FullScreen, useFullScreenHandle } from 'react-full-screen';
import Clock from 'react-live-clock';
import ScheduleIcon from '@mui/icons-material/Schedule';
import HomeIcon from '@mui/icons-material/Home';
import { Button, Grid } from '@mui/material';
import FullscreenIcon from '@mui/icons-material/Fullscreen';

const Display = (props) => {
  let isRendered = useRef(true);
  const intl = useIntl();
  const handle = useFullScreenHandle();
  //const [data, setData] = useState({ totalOrderQty: 0, totalActualQty: 0, totalEfficiency: 0, data: [] });
  const { totalOrderQty, totalActualQty, totalEfficiency, data } = props;

  const style = {
    grid: {
      textAlign: 'center',
      alignItems: 'center',
      display: 'grid',
      fontSize: 26,
      color: '#fff',
      fontWeight: '600',
      minHeight: '93px',
    },
  };

  return (
    <React.Fragment>
      <Grid item xs={4} sx={{ mb: 1 }}>
        <Button variant="contained" startIcon={<FullscreenIcon />} onClick={handle.enter}>
          Full Screen
        </Button>
      </Grid>
      <FullScreen handle={handle} style={{ height: '100%' }}>
        <div style={{ height: '100%', backgroundColor: '#000' }}>
          <div style={{ display: 'flex', height: '5%', backgroundColor: '#6c757d' }}>
            <div style={{ ...style.grid, width: '50%', minHeight: 'unset' }}>
              <h2 style={{ margin: 0, fontWeight: '600' }}>
                <HomeIcon sx={{ fontSize: 33, mr: 2, mb: 1 }} />
                HANLIM
              </h2>
            </div>
            <div style={{ ...style.grid, width: '50%', minHeight: 'unset' }}>
              <h2 style={{ margin: 0, fontWeight: '600' }}>
                <ScheduleIcon sx={{ fontSize: 33, mr: 2, mb: 1 }} />
                <Clock format={'DD/MM/YYYY (HH:mm:ss)'} ticking={true} />
              </h2>
            </div>
          </div>
          <div style={{ height: '95%' }}>
            <div style={{ height: '13%', display: 'flex' }}>
              <div style={{ ...style.grid, width: '33.3333%', backgroundColor: '#9370db' }}>
                <h2 style={{ fontWeight: '600', fontFamily: 'Arial, Helvetica, sans-serif' }}>Total Target</h2>
                <h1 style={{ fontWeight: '600' }}>{Number(totalOrderQty).toLocaleString()}</h1>
              </div>
              <div style={{ ...style.grid, width: '33.3333%', backgroundColor: '#00c6bb' }}>
                <h2 style={{ fontWeight: '600' }}>Total Actual</h2>
                <h1 style={{ fontWeight: '600' }}>{Number(totalActualQty).toLocaleString()}</h1>
              </div>
              <div style={{ ...style.grid, width: '33.3333%', backgroundColor: '#e9a424' }}>
                <h2 style={{ fontWeight: '600' }}>Avg Efficiency</h2>
                <h1 style={{ fontWeight: '600' }}>{totalEfficiency > 100 ? 100 : Math.round(totalEfficiency)}%</h1>
              </div>
            </div>
            <div style={{ height: '87%', display: 'flex' }}>
              <div style={{ width: '20%', height: '100%' }}>
                <div
                  style={{ ...style.grid, height: '14.22%', border: 'solid 1px #434242', backgroundColor: '#ff0000' }}
                >
                  <h2 style={{ fontWeight: '600' }}>WO</h2>
                </div>
                <div
                  style={{ ...style.grid, height: '14.22%', border: 'solid 1px #434242', backgroundColor: '#68B984' }}
                >
                  <h2 style={{ fontWeight: '600' }}>CODE</h2>
                </div>
                <div
                  style={{ ...style.grid, height: '14.22%', border: 'solid 1px #434242', backgroundColor: '#1F8A70' }}
                >
                  <h2 style={{ fontWeight: '600' }}>Line</h2>
                </div>
                <div
                  style={{ ...style.grid, height: '14.22%', border: 'solid 1px #434242', backgroundColor: '#9370db' }}
                >
                  <h2 style={{ fontWeight: '600' }}>Target</h2>
                </div>
                <div
                  style={{ ...style.grid, height: '14.22%', border: 'solid 1px #434242', backgroundColor: '#009EFF' }}
                >
                  <h2 style={{ fontWeight: '600' }}>Inject MC</h2>
                </div>
                <div
                  style={{ ...style.grid, height: '14.22%', border: 'solid 1px #434242', backgroundColor: '#00c6bb' }}
                >
                  <h2 style={{ fontWeight: '600' }}>Actual</h2>
                </div>
                <div
                  style={{ ...style.grid, height: '14.22%', border: 'solid 1px #434242', backgroundColor: '#e9a424' }}
                >
                  <h2 style={{ fontWeight: '600' }}>Efficiency</h2>
                </div>
              </div>
              <div style={{ width: '80%', height: '100%', display: 'flex', overflow: 'auto', whiteSpace: 'nowrap' }}>
                {data &&
                  data.map((item, index) => {
                    let efficiency = Math.round((item.actualQty / item.orderQty) * 100);
                    return (
                      <div style={{ width: '100%', height: '100%' }} key={index}>
                        <div style={{ ...style.grid, height: '14.22%', display: 'grid', border: 'solid 1px #222222' }}>
                          <h2 style={{ fontWeight: '600', marginLeft: 10, marginRight: 10 }}>{item.woCode}</h2>
                        </div>
                        <div style={{ ...style.grid, height: '14.22%', display: 'grid', border: 'solid 1px #222222' }}>
                          <h2 style={{ fontWeight: '600' }}>{item.materialCode}</h2>
                        </div>
                        <div style={{ ...style.grid, height: '14.22%', display: 'grid', border: 'solid 1px #222222' }}>
                          <h2 style={{ fontWeight: '600' }}>{item.lineName}</h2>
                        </div>
                        <div style={{ ...style.grid, height: '14.22%', display: 'grid', border: 'solid 1px #222222' }}>
                          <h2 style={{ fontWeight: '600' }}>{Number(item.orderQty).toLocaleString()}</h2>
                        </div>
                        <div style={{ ...style.grid, height: '14.22%', display: 'grid', border: 'solid 1px #222222' }}>
                          <h2 style={{ fontWeight: '600' }}>{Number(item.hmiQty).toLocaleString()}</h2>
                        </div>
                        <div style={{ ...style.grid, height: '14.22%', display: 'grid', border: 'solid 1px #222222' }}>
                          <h2 style={{ fontWeight: '600' }}>{Number(item.actualQty).toLocaleString()}</h2>
                        </div>
                        <div style={{ ...style.grid, height: '14.22%', display: 'grid', border: 'solid 1px #222222' }}>
                          <h2 style={{ fontWeight: '600' }}>{efficiency > 100 ? 100 : efficiency}%</h2>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          </div>
        </div>
      </FullScreen>
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

  const {
    Display_Reducer: { totalOrderQty, totalActualQty, totalNGQty, totalEfficiency, data },
  } = CombineStateToProps(state.AppReducer, [[Store.Display_Reducer]]);

  return { language, totalOrderQty, totalActualQty, totalNGQty, totalEfficiency, data };
};

const mapDispatchToProps = (dispatch) => {
  const {
    User_Operations: { changeLanguage },
  } = CombineDispatchToProps(dispatch, bindActionCreators, [[User_Operations]]);

  return { changeLanguage };
};

export default connect(mapStateToProps, mapDispatchToProps)(Display);
