import { Store } from '@appstate';
import { User_Operations } from '@appstate/user';
import { CombineDispatchToProps, CombineStateToProps } from '@plugins/helperJS';
import React, { useRef } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import { useIntl } from 'react-intl';
import { Button, Grid } from '@mui/material';
import { FullScreen, useFullScreenHandle } from 'react-full-screen';
import FullscreenIcon from '@mui/icons-material/Fullscreen';
import Clock from 'react-live-clock';

const DisplayStatus = (props) => {
  let isRendered = useRef(true);
  const handle = useFullScreenHandle();
  const intl = useIntl();
  //const [data, setData] = useState({ totalOrderQty: 0, totalActualQty: 0, totalEfficiency: 0, data: [] });

  const style = {
    grid: {
      textAlign: 'center',
      alignItems: 'center',
      fontSize: 16,
      color: 'black',
      fontWeight: '500',
    },
    border: {
      border: '1px solid #4BACC6',
      fontWeight: '600'
    }
  };
  function createData(no, model, target, ok, ng) {
    return { no, model, target, ok, ng };
  }

  const rows = [
    createData(1, 'BN69 - 24568A​', 1000, 800, 4),
    createData(2, 'BN69 - 00288A​', 800, 600, 4),
    createData(3, 'BN69 - 24568A​', 400, 350, 3),
    createData(4, 'BN69 - 24568A​', 1000, 600, 4),
    createData(5, 'BN69 - 24568A', 1000, 600, 20),
    createData(6, 'BN69 - 24568A', 2500, 1100, 4),
    createData(7, 'BN69 - 24568A', 1300, 1120, 8),
    createData(8, '', '', '', null),
    createData(9, 'BN69 - 24568A', 2000, 1400, 40),
  ];

  const rows2 = [
    createData(1, 'BN69 - 24568A​', 1000, 500, 4),
    createData(2, 'BN69 - 00288A​', 1300, 900, 1),
    createData(3, 'BN69 - 24568A​', 800, 870, 20),
    createData(4, 'BN69 - 24568A​', 900, 600, 5),
    createData(5, 'BN69 - 24568A', 500, 450, 4),
    createData(6, 'BN69 - 24568A', 300, 120, 1),
    createData('', '', '', '', null),
    createData('', '', '', '', null),
    createData('', '', '', '', null),
  ];
  const rows3 = [
    createData(1, 'BN83-18295A​​', 'OK'),
    createData(2, 'BN83-18769A​​​', 'OK'),
    createData(3, 'BN83-18958A​​', 'OK'),
    createData(4, 'BN83-19197A​', ''),
    createData(5, 'BN83-19407A​', 'OK'),
    createData(6, 'BN83-19408A​', ''),
    createData(7, 'BN83-19769A​', 'OK'),
    createData(8, 'BN83-19904A​', ''),
    createData(9, 'BN83-20121A​', 'OK'),
  ];

  const styleNg = (value) => {
    if (value % 2 === 0 && value < 10) {
      return "#00B050"
    } else if (value % 2 !== 0 && value < 10) {
      return "#F9F914"
    }
    else {
      return "red";
    }

  }
  return (
    <React.Fragment>
      <Grid item xs={4} sx={{ mb: 1 }}>
        <Button variant="contained" startIcon={<FullscreenIcon />} onClick={handle.enter}>
          Full Screen
        </Button>
      </Grid>
      <FullScreen handle={handle} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: 'white' }}>
          <div style={{ width: '350px', fontSize: '25px', padding: '25px 50px', backgroundColor: '#D9D9D9', justifyContent: 'center', alignItems: 'center', display: 'flex' }}>
            <span>Hanlim Vina</span>
          </div>
          <div style={{ fontSize: '40px', display: 'flex', alignItems: 'center', backgroundColor: 'white' }}>
            <span>Status of Hanlim​</span>
          </div>
          <div style={{ width: '350px', fontSize: '16px', padding: '25px 30px', textAlign: 'right', display: 'flex', flexDirection: 'column', backgroundColor: 'white' }}>
            <span>{new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date())}</span>
            <Clock format={'YYYY-MM-DD HH:mm:ss'} ticking={true} />

          </div>
        </div>
        <div style={{ backgroundColor: '#1E2749', height: '100%', padding: '0 90px', }}>
          <div style={{ paddingTop: '50px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>

              {/* Injection */}
              <div style={{ border: '1px solid', width: '35%', border: '1px solid white', borderRadius: '10px' }}>
                <div style={{ ...style.grid, color: 'white', borderBottom: '1px solid white' }}>Injection</div>
                <div style={{ display: 'flex', width: '100%', padding: '10px' }}>
                  <div style={{ ...style.grid, display: 'flex', width: '50%', flexDirection: 'column', color: 'white' }}>
                    <span>Target    : 12,000​</span>
                    <span>OK       :  8,270</span>
                    <span>NG       :  1,102</span>
                  </div>
                  <div style={{ ...style.grid, display: 'flex', width: '50%', flexDirection: 'column', color: 'white' }}>
                    <span>​</span>
                    <span>Efficiency  :  71 %</span>
                    <span>NG Rate    :   9%</span>
                  </div>
                </div>
              </div>

              {/* Assembly */}
              <div style={{ border: '1px solid', width: '35%', border: '1px solid white', borderRadius: '10px' }}>
                <div style={{ ...style.grid, color: 'white', borderBottom: '1px solid white' }}>Assembly</div>
                <div style={{ display: 'flex', width: '100%', padding: '10px' }}>
                  <div style={{ ...style.grid, display: 'flex', width: '50%', flexDirection: 'column', color: 'white' }}>
                    <span>Target    : 12,000​</span>
                    <span>OK       :  8,270</span>
                    <span>NG       :  1,102</span>
                  </div>
                  <div style={{ ...style.grid, display: 'flex', width: '50%', flexDirection: 'column', color: 'white' }}>
                    <span>​</span>
                    <span>Efficiency  :  71 %</span>
                    <span>NG Rate    :   0.1%​</span>
                  </div>
                </div>
              </div>

              {/* D. O */}
              <div style={{ border: '1px solid', width: '25%', border: '1px solid white', borderRadius: '10px' }}>
                <div style={{ ...style.grid, color: 'white', borderBottom: '1px solid white' }}>D. O</div>
                {/* <div style={{ display: 'flex', width: '100%',  }}> */}
                <div style={{ ...style.grid, display: 'flex', flexDirection: 'column', color: 'white', padding: '10px' }}>
                  <span>Total   :   9​​</span>
                  <span>OK  :  6</span>
                  <span>Wait   :   3​</span>
                  {/* </div> */}
                </div>
              </div>
            </div>
            <div></div>
          </div>

          <div style={{ paddingTop: '50px' }}>
            <TableContainer component={Paper} sx={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#1E2749', width: '100%' }}>

              {/* table 1 */}
              <Table aria-label="simple table" sx={{ width: '35%', border: '1px solid #4BACC6' }}>
                <TableHead >
                  <TableRow sx={{ ...style.grid, color: 'white', backgroundColor: '#0DE0C8' }}>
                    <TableCell align="center" sx={{ width: '50px', ...style.border }}>No</TableCell>
                    <TableCell align="center" sx={{ ...style.border }}>Model</TableCell>
                    <TableCell align="center" sx={{ ...style.border }}>Target</TableCell>
                    <TableCell align="center" sx={{ ...style.border }}>OK</TableCell>
                    <TableCell align="center" sx={{ ...style.border }}>NG</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.map((row) => (
                    <TableRow
                      key={row.no}
                    >
                      <TableCell component="th" align="center" scope="row" sx={{ border: '1px solid #4BACC6', color: 'white' }}>{row.no}</TableCell>
                      <TableCell align="center" sx={{ border: '1px solid #4BACC6', color: 'white' }}>{row.model}</TableCell>
                      <TableCell align="center" sx={{ border: '1px solid #4BACC6', color: 'white' }}>{row.target}</TableCell>
                      <TableCell align="center" sx={{ border: '1px solid #4BACC6', color: 'white' }}>{row.ok}</TableCell>
                      <TableCell align="center" sx={{ border: '1px solid #4BACC6', color: 'black', backgroundColor: row.ng !== null ? styleNg(row.ng) : '#1E2749' }}>{row.ng}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* table 2 */}
              <Table aria-label="simple table" sx={{ width: '35%', border: '1px solid #4BACC6' }}>
                <TableHead >
                  <TableRow sx={{ color: 'white', backgroundColor: '#0DE0C8' }}>
                    <TableCell align="center" sx={{ width: '50px', ...style.border }}>No</TableCell>
                    <TableCell align="center" sx={{ ...style.border }}>Model</TableCell>
                    <TableCell align="center" sx={{ ...style.border }}>Target</TableCell>
                    <TableCell align="center" sx={{ ...style.border }}>OK</TableCell>
                    <TableCell align="center" sx={{ ...style.border }}>NG</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows2.map((row) => (
                    <TableRow
                      key={row.no}
                    >
                      <TableCell component="th" align="center" scope="row" sx={{ border: '1px solid #4BACC6', color: 'white' }}>{row.no}</TableCell>
                      <TableCell align="center" sx={{ border: '1px solid #4BACC6', color: 'white' }}>{row.model}</TableCell>
                      <TableCell align="center" sx={{ border: '1px solid #4BACC6', color: 'white' }}>{row.target}</TableCell>
                      <TableCell align="center" sx={{ border: '1px solid #4BACC6', color: 'white' }}>{row.ok}</TableCell>
                      <TableCell align="center" sx={{ border: '1px solid #4BACC6', color: 'black', backgroundColor: row.ng !== null ? styleNg(row.ng) : '#1E2749' }}>{row.ng}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {/* table 3 */}
              <Table aria-label="simple table" sx={{ width: '25%', border: '1px solid #4BACC6' }}>
                <TableHead >
                  <TableRow sx={{ color: 'white', backgroundColor: '#0DE0C8' }}>
                    <TableCell align="center" sx={{ width: '50px', ...style.border }}>No</TableCell>
                    <TableCell align="center" sx={{ ...style.border }}>Model</TableCell>
                    <TableCell align="center" sx={{ ...style.border }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows3.map((row) => (
                    <TableRow
                      key={row.no}
                    >
                      <TableCell component="th" align="center" scope="row" sx={{ border: '1px solid #4BACC6', color: 'white' }}>{row.no}</TableCell>
                      <TableCell align="center" sx={{ border: '1px solid #4BACC6', color: 'white' }}>{row.model}</TableCell>
                      <TableCell align="center" sx={{ border: '1px solid #4BACC6', color: 'white', backgroundColor: row.target === 'OK' ? '#0E8901' : '' }}>{row.target}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>
          <div style={{ height: '100px', display: 'flex', alignItems: 'center' }}>
            <div style={{ color: 'white', display: 'flex', justifyContent: 'end', width: '100%' }}>
              <span>NG</span>
              <span style={{ ...style.grid, backgroundColor: 'green', padding: '0 15px', marginLeft: '15px' }}>0 ~ 1 %​</span>
              <span style={{ ...style.grid, backgroundColor: 'yellow', padding: '0 15px', marginLeft: '15px' }}>1  ~ 2 %​​</span>
              <span style={{ ...style.grid, backgroundColor: 'orange', padding: '0 15px', marginLeft: '15px' }}>2 ~ 3 %​</span>
              <span style={{ ...style.grid, backgroundColor: 'red', padding: '0 15px', marginLeft: '15px' }}>3 ~ %​</span>
            </div>
          </div>
        </div>
      </FullScreen>
    </React.Fragment >
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

export default connect(mapStateToProps, mapDispatchToProps)(DisplayStatus);
