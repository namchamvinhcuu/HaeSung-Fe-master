import { Store } from '@appstate';
import { User_Operations } from '@appstate/user';
import { CombineDispatchToProps, CombineStateToProps } from '@plugins/helperJS';
import React, { useEffect, useRef, useState } from 'react';
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
import { HubConnectionBuilder, LogLevel, HttpTransportType, HubConnectionState } from '@microsoft/signalr';
import * as ConfigConstants from '@constants/ConfigConstants';

const DisplayStatus = (props) => {
  let isRendered = useRef(true);
  const handle = useFullScreenHandle();
  // const [reload, setReload] = useState(0);
  const intl = useIntl();
  const { totalOrderQty, totalActualQty, totalEfficiency, data, deliveryOrder } = props;
  // console.log({ deliveryOrder });
  const [dataInjection, setDataInjection] = useState([]);
  const [dataAssembly, setDataAssembly] = useState([]);
  useEffect(() => {
    setDataInjection(handleRowData(false));
    setDataAssembly(handleRowData(true));
  }, [data]);

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
      fontWeight: '600',
    },
  };

  const handleRowData = (type) => {
    const rowData = [];
    for (let i = 1; i <= 9; i++) {
      rowData.push({ no: i, model: '', target: null, hmiQty: null, ok: '', ng: null });
    }
    data?.forEach((ele) => {
      if (ele?.woProcess === type && ele?.isShowing === true) {
        for (let j = 1; j <= rowData?.length; j++) {
          if (parseInt(ele?.lineName?.split('#')[1]) === j) {
            if (rowData[j - 1] && !rowData[j - 1].model) {
              rowData[j - 1] = {
                no: j,
                model: ele?.materialCode,
                target: ele?.orderQty,
                hmiQty: ele?.hmiQty,
                ok: ele?.actualQty - ele?.ngQty,
                ng: ele?.ngQty,
              };
            }
          }
        }
      }
    });
    //console.log('🚀 rowData:', { type, rowData });
    return rowData;
  };

  const handleDORowData = () => {
    const rowData = [];
    for (let i = 0; i < 9; i++) {
      rowData.push({ no: i, materialCode: '', isActived: '' });
    }
    let i = 0;
    deliveryOrder?.forEach((ele) => {
      rowData[i++] = { no: i, materialCode: ele?.materialCode, isActived: ele.isActived ? 'OK' : '' };
    });
    return rowData;
  };

  const totalTableData = (type, value) => {
    let total = 0;
    let newData = type ? dataAssembly : dataInjection;
    for (let i = 0; i < newData.length; i++) {
      total += newData[i][value] || 0;
    }

    return total;
  };

  const styleNg = (ng, target) => {
    const percentage = (ng / target) * 100;

    switch (true) {
      case percentage >= 0 && percentage < 1:
        return '#00B050';
      case percentage >= 1 && percentage < 2:
        return '#F9F914';
      case percentage >= 2 && percentage < 3:
        return '#FFA500';
      default:
        return 'red';
    }
  };

  const statusOK = () => {
    let totalOK = 0;
    deliveryOrder?.forEach((element) => {
      if (element?.isActived) {
        totalOK += 1;
      }
    });
    return totalOK;
  };

  // useEffect(() => {
  //   console.log("===============", data);
  //   setReload(1)
  // }, [data])
  return (
    <React.Fragment>
      <Grid item xs={4} sx={{ mb: 1 }}>
        <Button variant="contained" startIcon={<FullscreenIcon />} onClick={handle.enter}>
          Full Screen
        </Button>
      </Grid>
      <FullScreen handle={handle} style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', backgroundColor: 'white' }}>
          <div
            style={{
              width: '350px',
              fontSize: '25px',
              padding: '25px 50px',
              backgroundColor: '#D9D9D9',
              justifyContent: 'center',
              alignItems: 'center',
              display: 'flex',
            }}
          >
            <span>Hanlim Vina</span>
          </div>
          <div style={{ fontSize: '40px', display: 'flex', alignItems: 'center', backgroundColor: 'white' }}>
            <span>Status of Hanlim​</span>
          </div>
          <div
            style={{
              width: '350px',
              fontSize: '16px',
              padding: '25px 30px',
              textAlign: 'right',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: 'white',
            }}
          >
            <span>{new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(new Date())}</span>
            <Clock format={'YYYY-MM-DD HH:mm:ss'} ticking={true} />
          </div>
        </div>
        <div style={{ backgroundColor: '#1E2749', height: '100%', padding: '0 90px' }}>
          <div style={{ paddingTop: '50px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              {/* Injection */}
              <div style={{ border: '1px solid', width: '35%', border: '1px solid white', borderRadius: '10px' }}>
                <div style={{ ...style.grid, color: 'white', borderBottom: '1px solid white' }}>Injection</div>
                <div style={{ display: 'flex', width: '100%', padding: '10px' }}>
                  <div
                    style={{ ...style.grid, display: 'flex', width: '50%', flexDirection: 'column', color: 'white' }}
                  >
                    <span>
                      Target:&ensp;
                      {totalTableData(false, 'target').toLocaleString()}
                    </span>
                    <span>
                      OK:&ensp;
                      {totalTableData(false, 'ok').toLocaleString()}
                    </span>
                    <span>NG:&ensp; {totalTableData(false, 'ng').toLocaleString()}</span>
                  </div>
                  <div
                    style={{ ...style.grid, display: 'flex', width: '50%', flexDirection: 'column', color: 'white' }}
                  >
                    <span>​</span>
                    <span>
                      Efficiency:&ensp;
                      {((totalTableData(false, 'ok') / totalTableData(false, 'target')) * 100 || 0).toFixed(1)}%
                    </span>
                    <span>
                      NG Rate:&ensp;
                      {((totalTableData(false, 'ng') / totalTableData(false, 'target')) * 100 || 0).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Assembly */}
              <div style={{ border: '1px solid', width: '35%', border: '1px solid white', borderRadius: '10px' }}>
                <div style={{ ...style.grid, color: 'white', borderBottom: '1px solid white' }}>Assembly</div>
                <div style={{ display: 'flex', width: '100%', padding: '10px' }}>
                  <div
                    style={{ ...style.grid, display: 'flex', width: '50%', flexDirection: 'column', color: 'white' }}
                  >
                    <span>
                      Target:&ensp;
                      {totalTableData(true, 'target').toLocaleString()}
                    </span>
                    <span>
                      OK:&ensp;
                      {totalTableData(true, 'ok').toLocaleString()}
                    </span>
                    <span>NG:&ensp; {totalTableData(true, 'ng').toLocaleString()}</span>
                  </div>
                  <div
                    style={{ ...style.grid, display: 'flex', width: '50%', flexDirection: 'column', color: 'white' }}
                  >
                    <span>​</span>
                    <span>
                      Efficiency:&ensp;
                      {((totalTableData(true, 'ok') / totalTableData(true, 'target')) * 100 || 0).toFixed(1)}%
                    </span>
                    <span>
                      NG Rate:&ensp;
                      {((totalTableData(true, 'ng') / totalTableData(true, 'target')) * 100 || 0).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* D. O */}
              <div style={{ border: '1px solid', width: '25%', border: '1px solid white', borderRadius: '10px' }}>
                <div style={{ ...style.grid, color: 'white', borderBottom: '1px solid white' }}>D. O</div>
                {/* <div style={{ display: 'flex', width: '100%',  }}> */}
                <div
                  style={{ ...style.grid, display: 'flex', flexDirection: 'column', color: 'white', padding: '10px' }}
                >
                  <span>Total: &ensp;9​​</span>
                  <span>
                    OK:&ensp;
                    {statusOK()}
                  </span>
                  <span>
                    Wait:&ensp;
                    {9 - statusOK()}
                  </span>
                  {/* </div> */}
                </div>
              </div>
            </div>
            <div></div>
          </div>

          <div style={{ paddingTop: '50px', display: 'flex', justifyContent: 'space-between' }}>
            {/* table Injection */}
            <TableContainer
              component={Paper}
              sx={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#1E2749', width: '35%' }}
            >
              <Table aria-label="simple table" sx={{ width: '100%', border: '1px solid #4BACC6' }}>
                <TableHead>
                  <TableRow sx={{ ...style.grid, color: 'white', backgroundColor: '#0DE0C8' }}>
                    <TableCell align="center" sx={{ width: '50px', ...style.border }}>
                      No
                    </TableCell>
                    <TableCell align="center" sx={{ ...style.border }}>
                      Model
                    </TableCell>
                    <TableCell align="center" sx={{ ...style.border }}>
                      Target
                    </TableCell>
                    <TableCell align="center" sx={{ ...style.border }}>
                      Inject MC
                    </TableCell>
                    <TableCell align="center" sx={{ ...style.border }}>
                      OK
                    </TableCell>
                    <TableCell align="center" sx={{ ...style.border }}>
                      NG
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dataInjection.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell
                        component="th"
                        align="center"
                        scope="row"
                        sx={{ border: '1px solid #4BACC6', color: 'white' }}
                      >
                        {row.no}
                      </TableCell>
                      <TableCell align="center" sx={{ border: '1px solid #4BACC6', color: 'white' }}>
                        {row.model}
                      </TableCell>
                      <TableCell align="center" sx={{ border: '1px solid #4BACC6', color: 'white' }}>
                        {row?.target?.toLocaleString()}
                      </TableCell>
                      <TableCell align="center" sx={{ border: '1px solid #4BACC6', color: 'white' }}>
                        {row?.hmiQty?.toLocaleString()}
                      </TableCell>
                      <TableCell align="center" sx={{ border: '1px solid #4BACC6', color: 'white' }}>
                        {row?.ok?.toLocaleString()}
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          border: '1px solid #4BACC6',
                          color: 'black',
                          backgroundColor: row?.ng !== null ? styleNg(row.ng, row.target) : '#1E2749',
                        }}
                      >
                        {row?.ng?.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* table Assembly */}
            <TableContainer
              component={Paper}
              sx={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#1E2749', width: '35%' }}
            >
              <Table aria-label="simple table" sx={{ width: '100%', border: '1px solid #4BACC6' }}>
                <TableHead>
                  <TableRow sx={{ color: 'white', backgroundColor: '#0DE0C8' }}>
                    <TableCell align="center" sx={{ width: '50px', ...style.border }}>
                      No
                    </TableCell>
                    <TableCell align="center" sx={{ ...style.border }}>
                      Model
                    </TableCell>
                    <TableCell align="center" sx={{ ...style.border }}>
                      Target
                    </TableCell>
                    <TableCell align="center" sx={{ ...style.border }}>
                      OK
                    </TableCell>
                    <TableCell align="center" sx={{ ...style.border }}>
                      NG
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {dataAssembly.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell
                        component="th"
                        align="center"
                        scope="row"
                        sx={{ border: '1px solid #4BACC6', color: 'white' }}
                      >
                        {row.no}
                      </TableCell>
                      <TableCell align="center" sx={{ border: '1px solid #4BACC6', color: 'white' }}>
                        {row.model}
                      </TableCell>
                      <TableCell align="center" sx={{ border: '1px solid #4BACC6', color: 'white' }}>
                        {row?.target?.toLocaleString()}
                      </TableCell>
                      <TableCell align="center" sx={{ border: '1px solid #4BACC6', color: 'white' }}>
                        {row?.ok?.toLocaleString()}
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          border: '1px solid #4BACC6',
                          color: 'black',
                          backgroundColor: row.ng !== null ? styleNg(row.ng, row.target) : '#1E2749',
                        }}
                      >
                        {row?.ng?.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* table D.O */}
            <TableContainer
              component={Paper}
              sx={{ display: 'flex', justifyContent: 'space-between', backgroundColor: '#1E2749', width: '25%' }}
            >
              <Table aria-label="simple table" sx={{ width: '100%', border: '1px solid #4BACC6' }}>
                <TableHead>
                  <TableRow sx={{ color: 'white', backgroundColor: '#0DE0C8' }}>
                    <TableCell align="center" sx={{ width: '50px', ...style.border }}>
                      No
                    </TableCell>
                    <TableCell align="center" sx={{ ...style.border }}>
                      Model
                    </TableCell>
                    <TableCell align="center" sx={{ ...style.border }}>
                      Status
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {handleDORowData().map((row, index) => (
                    <TableRow key={index}>
                      <TableCell
                        component="th"
                        align="center"
                        scope="row"
                        sx={{ border: '1px solid #4BACC6', color: 'white' }}
                      >
                        {row.no}
                      </TableCell>
                      <TableCell align="center" sx={{ border: '1px solid #4BACC6', color: 'white' }}>
                        {row.materialCode}
                      </TableCell>
                      <TableCell
                        align="center"
                        sx={{
                          border: '1px solid #4BACC6',
                          color: 'white',
                          backgroundColor: row.isActived === 'OK' ? '#0E8901' : '',
                        }}
                      >
                        {row.isActived}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </div>

          <div style={{ height: '100px', display: 'flex', alignItems: 'center' }}>
            <div style={{ color: 'white', display: 'flex', justifyContent: 'end', width: '100%' }}>
              <span>NG</span>
              <span style={{ ...style.grid, backgroundColor: 'green', padding: '0 15px', marginLeft: '15px' }}>
                0 ~ 1 %
              </span>
              <span style={{ ...style.grid, backgroundColor: 'yellow', padding: '0 15px', marginLeft: '15px' }}>
                1 ~ 2 %
              </span>
              <span style={{ ...style.grid, backgroundColor: 'orange', padding: '0 15px', marginLeft: '15px' }}>
                2 ~ 3 %
              </span>
              <span style={{ ...style.grid, backgroundColor: 'red', padding: '0 15px', marginLeft: '15px' }}>
                3 ~ %
              </span>
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
    Display_Reducer: { totalOrderQty, totalActualQty, totalNGQty, totalEfficiency, data, deliveryOrder },
  } = CombineStateToProps(state.AppReducer, [[Store.Display_Reducer]]);

  return { language, totalOrderQty, totalActualQty, totalNGQty, totalEfficiency, data, deliveryOrder };
};

const mapDispatchToProps = (dispatch) => {
  const {
    User_Operations: { changeLanguage },
  } = CombineDispatchToProps(dispatch, bindActionCreators, [[User_Operations]]);

  return { changeLanguage };
};

export default connect(mapStateToProps, mapDispatchToProps)(DisplayStatus);
