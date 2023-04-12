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
  borderTop: {
    borderTop: '1px solid #000',
  },
  borderTopBold: {
    borderTop: '3px solid #000',
  },
  borderRight: {
    borderRight: '1px solid #000',
  },
  borderRightBold: {
    borderRight: '3px solid #000',
  },
  borderLeftBold: {
    borderLeft: '3px solid #000',
  },
  borderBottomBold: {
    borderBottom: '3px solid #000',
  },

  bgGreen: {
    backgroundColor: '#92D050',
  },
  bgGrey: {
    backgroundColor: '#D9D9D9',
  },
  bgYellow: {
    backgroundColor: '#FFFF00',
  },
  bgOrange: {
    backgroundColor: '#FFC000',
  },
  bgRed: {
    backgroundColor: 'red',
  },
};

const Display = (props) => {
  let isRendered = useRef(true);
  const intl = useIntl();
  const handle = useFullScreenHandle();
  //const [data, setData] = useState({ totalOrderQty: 0, totalActualQty: 0, totalEfficiency: 0, data: [] });
  const { totalOrderQty, totalActualQty, totalEfficiency, data } = props;

  const renderProcess = (percent, bgRed) => {
    return (
      <div
        style={{
          width: `${percent}%`,
          backgroundColor: bgRed ? 'red' : '#A9D18E',
          border: '1px solid red',
          height: '33px',
          position: 'relative',
        }}
      >
        {percent > 10 && (
          <>
            <div
              style={{
                content: '',
                position: 'absolute',
                top: 0,
                left: 0,
                width: '30px',
                height: ' 32px',
                borderRight: '1px solid red',
              }}
            />
            <div
              style={{
                content: '',
                position: 'absolute',
                top: 0,
                right: 0,
                width: '30px',
                height: ' 32px',
                borderLeft: '1px solid red',
              }}
            />
          </>
        )}
      </div>
    );
  };

  return (
    <React.Fragment>
      <Grid item xs={4} sx={{ mb: 1 }}>
        <Button variant="contained" startIcon={<FullscreenIcon />} onClick={handle.enter}>
          Full Screen
        </Button>
      </Grid>
      <FullScreen handle={handle} style={{ height: '100%' }}>
        <div style={{ height: '100%' }}>
          {/* <div style={{ display: 'flex', height: '5%', backgroundColor: '#6c757d' }}>
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
          </div> */}
          <div style={{ height: '100%' }} className="bg-white">
            <table style={{ width: '100%' }} className="tbl_display">
              <tbody>
                <tr>
                  <td width="7%"></td>
                  <td width="7%"></td>
                  <td width="7%"></td>
                  <td width="7%"></td>
                  <td width="7%"></td>
                  <td width="7%"></td>
                  <td width="7%"></td>
                  <td width="10%"></td>
                  <td width="7%"></td>
                  <td width="7%"></td>
                  <td width="7%"></td>
                  <td width="10%"></td>
                  <td width="7%"></td>
                </tr>
                <tr style={{ height: '70px' }}>
                  <td
                    className="text-center"
                    colSpan={7}
                    style={{ ...style.borderTopBold, ...style.borderRightBold, ...style.borderLeftBold }}
                  >
                    <b style={{ fontSize: 25 }}>Current status of injection machine</b>
                  </td>
                  <td className="text-center" colSpan={4} style={{ ...style.borderTopBold, ...style.borderRightBold }}>
                    <b style={{ fontSize: 25 }}>Assembly Line Status</b>
                  </td>
                  <td className="text-center" colSpan={2} style={{ ...style.borderTopBold, ...style.borderRightBold }}>
                    <b style={{ fontSize: 25 }}>DO</b>
                  </td>
                </tr>
                <tr>
                  <td
                    className="pl-1 pr-1 text-center"
                    style={{ ...style.borderTopBold, ...style.borderRight, ...style.borderLeftBold }}
                    rowSpan={2}
                  >
                    <b>Machine</b>
                  </td>
                  <td
                    className="pl-1 pr-1 text-center"
                    style={{ ...style.borderTopBold, ...style.borderRight }}
                    rowSpan={2}
                    colSpan={3}
                  >
                    <b>Model</b>
                  </td>
                  <td
                    className="pl-1 pr-1 text-center"
                    style={{ ...style.borderTopBold, ...style.borderRight }}
                    rowSpan={2}
                  >
                    <b>Target</b>
                  </td>
                  <td
                    className="pl-1 pr-1 text-center"
                    style={{ ...style.borderTopBold, ...style.borderRight }}
                    rowSpan={2}
                  >
                    <b>OK</b>
                  </td>
                  <td
                    className="pl-1 pr-1 text-center"
                    style={{ ...style.borderTopBold, ...style.borderRightBold }}
                    rowSpan={2}
                  >
                    <b>N.G</b>
                  </td>
                  <td
                    className="pl-1 pr-1 text-center"
                    style={{ ...style.borderTopBold, ...style.borderRight }}
                    rowSpan={2}
                  >
                    <b>A-Line</b>
                  </td>
                  <td
                    className="pl-1 pr-1 text-center"
                    style={{ ...style.borderTopBold, ...style.borderRight }}
                    rowSpan={2}
                  >
                    <b>Target</b>
                  </td>
                  <td
                    className="pl-1 pr-1 text-center"
                    style={{ ...style.borderTopBold, ...style.borderRight }}
                    rowSpan={2}
                  >
                    <b>OK</b>
                  </td>
                  <td
                    className="pl-1 pr-1 text-center"
                    style={{ ...style.borderTopBold, ...style.borderRightBold }}
                    rowSpan={2}
                  >
                    <b>N.G</b>
                  </td>
                  <td className="pl-1 pr-1 text-center" style={{ ...style.borderTopBold, ...style.borderRight }}>
                    BN83-18295A
                  </td>
                  <td
                    className="pl-1 pr-1 text-center"
                    style={{ ...style.borderTopBold, ...style.borderRightBold, ...style.bgGreen }}
                  >
                    OK
                  </td>
                </tr>
                <tr>
                  <td className="pl-1 pr-1 text-center" style={{ ...style.borderTop, ...style.borderRight }}>
                    BN83-18769A
                  </td>
                  <td
                    className="pl-1 pr-1 text-center"
                    style={{ ...style.borderTop, ...style.borderRightBold, ...style.bgGreen }}
                  >
                    OK
                  </td>
                </tr>
                {/* start #1 */}
                <tr>
                  <td
                    className="pl-1 pr-1 text-center"
                    rowSpan={2}
                    style={{ ...style.borderTopBold, ...style.borderRight, ...style.borderLeftBold }}
                  >
                    #1
                  </td>
                  <td className="text-center" colSpan={3} style={{ ...style.borderTopBold, ...style.borderRight }}>
                    {renderProcess(5)}
                  </td>
                  <td
                    className="pl-1 pr-1 text-center"
                    rowSpan={2}
                    style={{ ...style.borderTopBold, ...style.borderRight }}
                  >
                    1000
                  </td>
                  <td className="pl-1 pr-1 text-center" style={{ ...style.borderTopBold, ...style.borderRight }}>
                    800
                  </td>
                  <td className="pl-1 pr-1 text-center" style={{ ...style.borderTopBold, ...style.borderRightBold }}>
                    4
                  </td>
                  <td
                    className="pl-1 pr-1 text-center"
                    style={{ ...style.borderTopBold, ...style.borderRight, ...style.bgGrey }}
                  >
                    #1
                  </td>
                  <td
                    className="pl-1 pr-1 text-center"
                    rowSpan={2}
                    style={{ ...style.borderTopBold, ...style.borderRight }}
                  >
                    1000
                  </td>
                  <td className="pl-1 pr-1 text-center" style={{ ...style.borderTopBold, ...style.borderRight }}>
                    500
                  </td>
                  <td className="pl-1 pr-1 text-center" style={{ ...style.borderTopBold, ...style.borderRightBold }}>
                    4
                  </td>
                  <td className="pl-1 pr-1 text-center" style={{ ...style.borderTop, ...style.borderRight }}>
                    BN83-18958A
                  </td>
                  <td
                    className="pl-1 pr-1 text-center"
                    style={{ ...style.borderTop, ...style.borderRightBold, ...style.bgGreen }}
                  >
                    OK
                  </td>
                </tr>
                <tr>
                  <td
                    className="pl-1 pr-1 text-center"
                    colSpan={3}
                    style={{ ...style.borderTop, ...style.borderRight }}
                  >
                    BN69 - 24568A
                  </td>
                  <td className="pl-1 pr-1 text-center" style={{ ...style.borderTop, ...style.borderRight }}>
                    80%
                  </td>
                  <td
                    className="pl-1 pr-1 text-center"
                    style={{ ...style.borderTop, ...style.borderRightBold, ...style.bgGreen }}
                  >
                    0,50%
                  </td>
                  <td className="pl-1 pr-1 text-center" style={{ ...style.borderTop, ...style.borderRight }}>
                    BN69 - 24568A
                  </td>
                  <td className="pl-1 pr-1 text-center" style={{ ...style.borderTop, ...style.borderRight }}>
                    50%
                  </td>
                  <td
                    className="pl-1 pr-1 text-center"
                    style={{ ...style.borderTop, ...style.borderRightBold, ...style.bgGreen }}
                  >
                    0,80%
                  </td>
                  <td className="pl-1 pr-1 text-center" style={{ ...style.borderTop, ...style.borderRight }}>
                    BN83-19197A
                  </td>
                  <td className="pl-1 pr-1 text-center" style={{ ...style.borderTop, ...style.borderRightBold }}></td>
                </tr>
                {/* end #1 */}
                {/* start #2 */}
                <tr>
                  <td
                    className="pl-1 pr-1 text-center"
                    rowSpan={2}
                    style={{ ...style.borderTopBold, ...style.borderRight, ...style.borderLeftBold }}
                  >
                    #2
                  </td>
                  <td className="text-center" colSpan={3} style={{ ...style.borderTopBold, ...style.borderRight }}>
                    {renderProcess(60)}
                  </td>
                  <td
                    className="pl-1 pr-1 text-center"
                    rowSpan={2}
                    style={{ ...style.borderTopBold, ...style.borderRight }}
                  >
                    800
                  </td>
                  <td className="pl-1 pr-1 text-center" style={{ ...style.borderTopBold, ...style.borderRight }}>
                    600
                  </td>
                  <td className="pl-1 pr-1 text-center" style={{ ...style.borderTopBold, ...style.borderRightBold }}>
                    4
                  </td>
                  <td
                    className="pl-1 pr-1 text-center"
                    style={{ ...style.borderTopBold, ...style.borderRight, ...style.bgGrey }}
                  >
                    #2
                  </td>
                  <td
                    className="pl-1 pr-1 text-center"
                    rowSpan={2}
                    style={{ ...style.borderTopBold, ...style.borderRight }}
                  >
                    1300
                  </td>
                  <td className="pl-1 pr-1 text-center" style={{ ...style.borderTopBold, ...style.borderRight }}>
                    900
                  </td>
                  <td className="pl-1 pr-1 text-center" style={{ ...style.borderTopBold, ...style.borderRightBold }}>
                    1
                  </td>
                  <td className="pl-1 pr-1 text-center" style={{ ...style.borderTop, ...style.borderRight }}>
                    BN83-19407A
                  </td>
                  <td
                    className="pl-1 pr-1 text-center"
                    style={{ ...style.borderTop, ...style.borderRightBold, ...style.bgGreen }}
                  >
                    OK
                  </td>
                </tr>
                <tr>
                  <td
                    className="pl-1 pr-1 text-center"
                    colSpan={3}
                    style={{ ...style.borderTop, ...style.borderRight }}
                  >
                    BN69 - 00288A
                  </td>
                  <td className="pl-1 pr-1 text-center" style={{ ...style.borderTop, ...style.borderRight }}>
                    75%
                  </td>
                  <td
                    className="pl-1 pr-1 text-center"
                    style={{ ...style.borderTop, ...style.borderRightBold, ...style.bgGreen }}
                  >
                    0,67%
                  </td>
                  <td className="pl-1 pr-1 text-center" style={{ ...style.borderTop, ...style.borderRight }}>
                    BN96-54297A
                  </td>
                  <td className="pl-1 pr-1 text-center" style={{ ...style.borderTop, ...style.borderRight }}>
                    69%
                  </td>
                  <td
                    className="pl-1 pr-1 text-center"
                    style={{ ...style.borderTop, ...style.borderRightBold, ...style.bgYellow }}
                  >
                    0,11%
                  </td>
                  <td className="pl-1 pr-1 text-center" style={{ ...style.borderTop, ...style.borderRight }}>
                    BN83-19408A
                  </td>
                  <td className="pl-1 pr-1 text-center" style={{ ...style.borderTop, ...style.borderRightBold }}></td>
                </tr>
                {/* end #2 */}
                {/* start #3 */}
                <tr>
                  <td
                    className="pl-1 pr-1 text-center"
                    rowSpan={2}
                    style={{ ...style.borderTopBold, ...style.borderRight, ...style.borderLeftBold }}
                  >
                    #3
                  </td>
                  <td className="text-center" colSpan={3} style={{ ...style.borderTopBold, ...style.borderRight }}>
                    {renderProcess(100, true)}
                  </td>
                  <td
                    className="pl-1 pr-1 text-center"
                    rowSpan={2}
                    style={{ ...style.borderTopBold, ...style.borderRight }}
                  >
                    800
                  </td>
                  <td className="pl-1 pr-1 text-center" style={{ ...style.borderTopBold, ...style.borderRight }}>
                    600
                  </td>
                  <td className="pl-1 pr-1 text-center" style={{ ...style.borderTopBold, ...style.borderRightBold }}>
                    4
                  </td>
                  <td
                    className="pl-1 pr-1 text-center"
                    style={{ ...style.borderTopBold, ...style.borderRight, ...style.bgGrey }}
                  >
                    #3
                  </td>
                  <td
                    className="pl-1 pr-1 text-center"
                    rowSpan={2}
                    style={{ ...style.borderTopBold, ...style.borderRight }}
                  >
                    1300
                  </td>
                  <td className="pl-1 pr-1 text-center" style={{ ...style.borderTopBold, ...style.borderRight }}>
                    900
                  </td>
                  <td className="pl-1 pr-1 text-center" style={{ ...style.borderTopBold, ...style.borderRightBold }}>
                    1
                  </td>
                  <td className="pl-1 pr-1 text-center" style={{ ...style.borderTop, ...style.borderRight }}>
                    BN83-19407A
                  </td>
                  <td
                    className="pl-1 pr-1 text-center"
                    style={{ ...style.borderTop, ...style.borderRightBold, ...style.bgGreen }}
                  >
                    OK
                  </td>
                </tr>
                <tr>
                  <td
                    className="pl-1 pr-1 text-center"
                    colSpan={3}
                    style={{ ...style.borderTop, ...style.borderRight }}
                  >
                    BN69 - 00288A
                  </td>
                  <td className="pl-1 pr-1 text-center" style={{ ...style.borderTop, ...style.borderRight }}>
                    75%
                  </td>
                  <td
                    className="pl-1 pr-1 text-center"
                    style={{ ...style.borderTop, ...style.borderRightBold, ...style.bgYellow }}
                  >
                    0,67%
                  </td>
                  <td className="pl-1 pr-1 text-center" style={{ ...style.borderTop, ...style.borderRight }}>
                    BN96-54297A
                  </td>
                  <td className="pl-1 pr-1 text-center" style={{ ...style.borderTop, ...style.borderRight }}>
                    69%
                  </td>
                  <td
                    className="pl-1 pr-1 text-center"
                    style={{ ...style.borderTop, ...style.borderRightBold, ...style.bgGreen }}
                  >
                    0,11%
                  </td>
                  <td className="pl-1 pr-1 text-center" style={{ ...style.borderTop, ...style.borderRight }}>
                    BN83-19408A
                  </td>
                  <td className="pl-1 pr-1 text-center" style={{ ...style.borderTop, ...style.borderRightBold }}></td>
                </tr>
                {/* end #3 */}
                {/* start #4 */}
                <tr>
                  <td
                    className="pl-1 pr-1 text-center"
                    rowSpan={2}
                    style={{ ...style.borderTopBold, ...style.borderRight, ...style.borderLeftBold }}
                  >
                    #4
                  </td>
                  <td className="text-center" colSpan={3} style={{ ...style.borderTopBold, ...style.borderRight }}>
                    {renderProcess(30)}
                  </td>
                  <td
                    className="pl-1 pr-1 text-center"
                    rowSpan={2}
                    style={{ ...style.borderTopBold, ...style.borderRight }}
                  >
                    800
                  </td>
                  <td className="pl-1 pr-1 text-center" style={{ ...style.borderTopBold, ...style.borderRight }}>
                    600
                  </td>
                  <td className="pl-1 pr-1 text-center" style={{ ...style.borderTopBold, ...style.borderRightBold }}>
                    4
                  </td>
                  <td
                    className="pl-1 pr-1 text-center"
                    style={{ ...style.borderTopBold, ...style.borderRight, ...style.bgGrey }}
                  >
                    #4
                  </td>
                  <td
                    className="pl-1 pr-1 text-center"
                    rowSpan={2}
                    style={{ ...style.borderTopBold, ...style.borderRight }}
                  >
                    1300
                  </td>
                  <td className="pl-1 pr-1 text-center" style={{ ...style.borderTopBold, ...style.borderRight }}>
                    900
                  </td>
                  <td className="pl-1 pr-1 text-center" style={{ ...style.borderTopBold, ...style.borderRightBold }}>
                    1
                  </td>
                  <td className="pl-1 pr-1 text-center" style={{ ...style.borderTop, ...style.borderRight }}>
                    BN83-19407A
                  </td>
                  <td
                    className="pl-1 pr-1 text-center"
                    style={{ ...style.borderTop, ...style.borderRightBold, ...style.bgGreen }}
                  >
                    OK
                  </td>
                </tr>
                <tr>
                  <td
                    className="pl-1 pr-1 text-center"
                    colSpan={3}
                    style={{ ...style.borderTop, ...style.borderRight }}
                  >
                    Under repair : 00:01:00
                  </td>
                  <td className="pl-1 pr-1 text-center" style={{ ...style.borderTop, ...style.borderRight }}>
                    75%
                  </td>
                  <td
                    className="pl-1 pr-1 text-center"
                    style={{ ...style.borderTop, ...style.borderRightBold, ...style.bgRed }}
                  >
                    0,67%
                  </td>
                  <td className="pl-1 pr-1 text-center" style={{ ...style.borderTop, ...style.borderRight }}>
                    BN96-54297A
                  </td>
                  <td className="pl-1 pr-1 text-center" style={{ ...style.borderTop, ...style.borderRight }}>
                    69%
                  </td>
                  <td
                    className="pl-1 pr-1 text-center"
                    style={{ ...style.borderTop, ...style.borderRightBold, ...style.bgOrange }}
                  >
                    0,11%
                  </td>
                  <td className="pl-1 pr-1 text-center" style={{ ...style.borderTop, ...style.borderRight }}>
                    BN83-19408A
                  </td>
                  <td className="pl-1 pr-1 text-center" style={{ ...style.borderTop, ...style.borderRightBold }}></td>
                </tr>
                {/* end #4 */}
                {/* start #4 */}
                <tr>
                  <td
                    className="pl-1 pr-1 text-center"
                    rowSpan={2}
                    style={{ ...style.borderTopBold, ...style.borderRight, ...style.borderLeftBold }}
                  >
                    #5
                  </td>
                  <td className="text-center" colSpan={3} style={{ ...style.borderTopBold, ...style.borderRight }}>
                    {renderProcess(70, true)}
                  </td>
                  <td
                    className="pl-1 pr-1 text-center"
                    rowSpan={2}
                    style={{ ...style.borderTopBold, ...style.borderRight }}
                  >
                    800
                  </td>
                  <td className="pl-1 pr-1 text-center" style={{ ...style.borderTopBold, ...style.borderRight }}>
                    600
                  </td>
                  <td className="pl-1 pr-1 text-center" style={{ ...style.borderTopBold, ...style.borderRightBold }}>
                    4
                  </td>
                  <td
                    className="pl-1 pr-1 text-center"
                    style={{ ...style.borderTopBold, ...style.borderRight, ...style.bgGrey }}
                  >
                    #5
                  </td>
                  <td
                    className="pl-1 pr-1 text-center"
                    rowSpan={2}
                    style={{ ...style.borderTopBold, ...style.borderRight }}
                  >
                    1300
                  </td>
                  <td className="pl-1 pr-1 text-center" style={{ ...style.borderTopBold, ...style.borderRight }}>
                    900
                  </td>
                  <td className="pl-1 pr-1 text-center" style={{ ...style.borderTopBold, ...style.borderRightBold }}>
                    1
                  </td>
                  <td className="pl-1 pr-1 text-center" style={{ ...style.borderTop, ...style.borderRight }}>
                    BN83-19407A
                  </td>
                  <td
                    className="pl-1 pr-1 text-center"
                    style={{ ...style.borderTop, ...style.borderRightBold, ...style.bgGreen }}
                  >
                    OK
                  </td>
                </tr>
                <tr>
                  <td
                    className="pl-1 pr-1 text-center"
                    colSpan={3}
                    style={{ ...style.borderTop, ...style.borderRight }}
                  >
                    Replacement of molds : 01:25:35
                  </td>
                  <td className="pl-1 pr-1 text-center" style={{ ...style.borderTop, ...style.borderRight }}>
                    75%
                  </td>
                  <td
                    className="pl-1 pr-1 text-center"
                    style={{ ...style.borderTop, ...style.borderRightBold, ...style.bgOrange }}
                  >
                    0,67%
                  </td>
                  <td className="pl-1 pr-1 text-center" style={{ ...style.borderTop, ...style.borderRight }}>
                    BN96-54297A
                  </td>
                  <td className="pl-1 pr-1 text-center" style={{ ...style.borderTop, ...style.borderRight }}>
                    69%
                  </td>
                  <td
                    className="pl-1 pr-1 text-center"
                    style={{ ...style.borderTop, ...style.borderRightBold, ...style.bgGreen }}
                  >
                    0,11%
                  </td>
                  <td className="pl-1 pr-1 text-center" style={{ ...style.borderTop, ...style.borderRight }}>
                    BN83-19408A
                  </td>
                  <td className="pl-1 pr-1 text-center" style={{ ...style.borderTop, ...style.borderRightBold }}></td>
                </tr>
                {/* end #5 */}

                {/* start footer */}
                <tr>
                  <td
                    className="pl-1 pr-1 text-center"
                    style={{ ...style.borderTopBold, ...style.borderRight, ...style.borderLeftBold }}
                  >
                    0~1
                  </td>
                  <td className="pl-1 pr-1 text-center" style={{ ...style.borderTopBold, ...style.borderRight }}></td>
                  <td className="pl-1 pr-1 text-center" style={{ ...style.borderTopBold, ...style.borderRight }}>
                    1~2
                  </td>
                  <td className="pl-1 pr-1 text-center" style={{ ...style.borderTopBold, ...style.borderRight }}></td>
                  <td className="pl-1 pr-1 text-center" style={{ ...style.borderTopBold, ...style.borderRight }}>
                    2~3
                  </td>
                  <td className="pl-1 pr-1 text-center" style={{ ...style.borderTopBold, ...style.borderRight }}></td>
                  <td className="pl-1 pr-1 text-center" style={{ ...style.borderTopBold, ...style.borderRightBold }}>
                    3
                  </td>
                  <td className="pl-1 pr-1 text-center" style={{ ...style.borderTopBold, ...style.borderRight }}></td>
                  <td
                    className="pl-1 pr-1 text-center"
                    rowSpan={2}
                    style={{ ...style.borderTopBold, ...style.borderRight, ...style.borderBottomBold }}
                  >
                    500
                  </td>
                  <td className="pl-1 pr-1 text-center" style={{ ...style.borderTopBold, ...style.borderRight }}></td>
                  <td
                    className="pl-1 pr-1 text-center"
                    style={{ ...style.borderTopBold, ...style.borderRightBold }}
                  ></td>
                  <td className="pl-1 pr-1 text-center" style={{ ...style.borderTopBold, ...style.borderRight }}></td>
                  <td
                    className="pl-1 pr-1 text-center"
                    style={{ ...style.borderTopBold, ...style.borderRightBold }}
                  ></td>
                </tr>
                <tr>
                  <td
                    className="pl-1 pr-1 text-center"
                    style={{
                      ...style.borderTop,
                      ...style.borderRight,
                      ...style.borderLeftBold,
                      ...style.bgGreen,
                      ...style.borderBottomBold,
                    }}
                  ></td>
                  <td
                    className="pl-1 pr-1 text-center"
                    style={{ ...style.borderTop, ...style.borderRight, ...style.borderBottomBold }}
                  ></td>
                  <td
                    className="pl-1 pr-1 text-center"
                    style={{ ...style.borderTop, ...style.borderRight, ...style.borderBottomBold, ...style.bgYellow }}
                  ></td>
                  <td
                    className="pl-1 pr-1 text-center"
                    style={{ ...style.borderTop, ...style.borderRight, ...style.borderBottomBold }}
                  ></td>
                  <td
                    className="pl-1 pr-1 text-center"
                    style={{ ...style.borderTop, ...style.borderRight, ...style.borderBottomBold, ...style.bgOrange }}
                  ></td>
                  <td
                    className="pl-1 pr-1 text-center"
                    style={{ ...style.borderTop, ...style.borderRight, ...style.borderBottomBold }}
                  ></td>
                  <td
                    className="pl-1 pr-1 text-center"
                    style={{ ...style.borderTop, ...style.borderRightBold, ...style.borderBottomBold, ...style.bgRed }}
                  ></td>
                  <td
                    className="pl-1 pr-1 text-center"
                    style={{ ...style.borderTop, ...style.borderRight, ...style.borderBottomBold }}
                  >
                    BN96-54793B
                  </td>

                  <td
                    className="pl-1 pr-1 text-center"
                    style={{ ...style.borderTop, ...style.borderRight, ...style.borderBottomBold }}
                  ></td>
                  <td
                    className="pl-1 pr-1 text-center"
                    style={{ ...style.borderTop, ...style.borderRightBold, ...style.borderBottomBold }}
                  ></td>
                  <td
                    className="pl-1 pr-1 text-center"
                    colSpan={2}
                    style={{ ...style.borderTop, ...style.borderRightBold, ...style.borderBottomBold }}
                  >
                    ongoing…..
                  </td>
                </tr>
                {/* end footer */}
              </tbody>
            </table>
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
