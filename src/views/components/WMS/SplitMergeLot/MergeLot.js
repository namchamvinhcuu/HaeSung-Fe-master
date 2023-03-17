import { Store } from '@appstate';
import { User_Operations } from '@appstate/user';
import { CombineDispatchToProps, CombineStateToProps } from '@plugins/helperJS';
import { ErrorAlert, SuccessAlert } from '@utils';
import React, { useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import QRCode from 'react-qr-code';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { MuiButton, MuiTextField } from '@controls';
import { Box, Grid, Table, TableBody, TableCell, TableContainer, TableRow } from '@mui/material';
import { splitMergeLotService } from '@services';
import moment from 'moment';
import { useModal } from '@basesShared';
import ActualPrintDialog from '../../MMS/Actual/ActualPrintDialog';
import ActualPrint from '../../MMS/Actual/ActualPrint';
import ReactDOMServer from 'react-dom/server';

const MergeLot = (props) => {
  let isRendered = useRef(true);
  const lotInputRef = useRef(null);
  const { isShowing, toggle } = useModal();
  const intl = useIntl();
  const [LotModel, setLotModel] = useState(null);
  const [LotModel2, setLotModel2] = useState(null);
  const [state, setState] = useState({ isLoading: false });

  const keyPress = async (e) => {
    if (e.key === 'Enter') {
      await scanBtnClick();
    }
  };

  const scanBtnClick = async () => {
    let inputVal = '';

    if (lotInputRef.current.value) {
      inputVal = lotInputRef.current.value.trim().toUpperCase();
      if (LotModel != null && LotModel.Id == inputVal) {
        lotInputRef.current.value = '';
        return ErrorAlert(intl.formatMessage({ id: 'lot.Scan2LotDifferenceToMerge' }));
      }
      setState({ ...state, isLoading: true });

      var res = await splitMergeLotService.getLotById(inputVal);

      if (res.HttpResponseCode === 200 && res.Data) {
        if (LotModel == null) setLotModel(res.Data);
        else setLotModel2(res.Data);
        lotInputRef.current.value = '';
        setState({ ...state, isLoading: false });
      } else {
        ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
        lotInputRef.current.value = '';
        setState({ ...state, isLoading: false });
      }
    }
  };

  const saveBtnClick = async () => {
    if (LotModel != null && LotModel2 != null) {
      if (window.confirm(intl.formatMessage({ id: 'lot.confirm_merge' }))) {
        try {
          setState({ ...state, isLoading: true });
          var res = await splitMergeLotService.mergeLot({ LotId: String(LotModel.Id), LotId2: String(LotModel2.Id) });

          if (res.HttpResponseCode === 200 && res.Data) {
            SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }));
            setLotModel(res.Data);
            setLotModel2(null);
            setState({ ...state, isLoading: false });
          } else {
            ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
            setState({ ...state, isLoading: false });
          }
        } catch (error) {
          console.log(error);
        }
      }
    } else {
      ErrorAlert(intl.formatMessage({ id: 'lot.Scan2LotToMerge' }));
    }
  };

  const handleButtonPrintClick = () => {
    const newWindow = window.open('', '', '');
    const listData = [LotModel, LotModel2];
    const htmlContent = ReactDOMServer.renderToString(<ActualPrint listData={listData} />);
    newWindow.document.write(htmlContent);
    newWindow.document.close();
  };

  const style = {
    styleBorderAndCenter: {
      borderRight: '1px solid black',
      textAlign: 'center',
    },
    borderBot: {
      borderBottom: '1px solid black',
      padding: '10px',
    },
  };

  return (
    <React.Fragment>
      <Grid container spacing={2.5} justifyContent="space-between" alignItems="width-end">
        <Grid item xs={7}>
          <Grid item sx={{ mb: 1, textAlign: 'right', display: 'flex', alignItems: 'center' }}>
            <MuiTextField
              autoFocus
              sx={{ width: 300, mr: 1 }}
              ref={lotInputRef}
              label="lot"
              onChange={(e) => (lotInputRef.current.value = e.target.value)}
              onKeyDown={keyPress}
            />
            <MuiButton text="scan" color="primary" onClick={scanBtnClick} sx={{ whiteSpace: 'nowrap' }} />
          </Grid>
        </Grid>
        <Grid item>
          <MuiButton
            text="print"
            disabled={LotModel == null ? true : false}
            // onClick={() => toggle()}
            onClick={() => handleButtonPrintClick()}
            color="info"
          />
          <MuiButton
            text="save"
            color="success"
            onClick={saveBtnClick}
            sx={{ whiteSpace: 'nowrap', mr: 2 }}
            disabled={LotModel2 == null ? true : false}
          />
        </Grid>
      </Grid>
      <Grid container spacing={2.5} justifyContent="space-between" sx={{ pt: 5 }}>
        <Grid item xs={6}>
          {LotModel != null && (
            <>
              <Box
                sx={{
                  border: '1px solid black',
                  mb: 2,
                  maxWidth: '500px',
                  pageBreakAfter: 'always',
                  margin: 'auto',
                  mt: 5,
                }}
              >
                <TableContainer sx={{ overflowX: 'hidden' }}>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell style={{ ...style.styleBorderAndCenter, ...style.borderBot }}>CODE</TableCell>
                        <TableCell
                          colSpan={2}
                          style={{ ...style.styleBorderAndCenter, ...style.borderBot }}
                          sx={{ padding: '0px 3px !important' }}
                        >
                          <b style={{ fontSize: '22px' }}>{LotModel?.MaterialCode}</b>
                        </TableCell>
                        <TableCell rowSpan={2} sx={{ textAlign: 'center' }} style={style.borderBot}>
                          <QRCode value={`${LotModel?.Id}`} size={80} />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={3} style={{ ...style.styleBorderAndCenter, ...style.borderBot }}>
                          {LotModel.MaterialDescription}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell style={{ ...style.styleBorderAndCenter, ...style.borderBot }}>QTY</TableCell>
                        <TableCell
                          style={{ ...style.styleBorderAndCenter, ...style.borderBot }}
                          sx={{ padding: '0px 3px !important' }}
                        >
                          <b style={{ fontSize: '22px' }}>{LotModel.Qty + ' ' + LotModel.UnitName} </b>
                        </TableCell>
                        <TableCell style={{ ...style.styleBorderAndCenter, ...style.borderBot }}>VENDOR</TableCell>
                        <TableCell sx={{ textAlign: 'center', padding: '5px !important' }} style={style.borderBot}>
                          {LotModel.SupplierCode || 'HANLIM'}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell style={{ ...style.styleBorderAndCenter, ...style.borderBot }}>LOT No.</TableCell>
                        <TableCell colSpan={2} style={{ ...style.styleBorderAndCenter, ...style.borderBot }}>
                          {LotModel?.Id}
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }} style={style.borderBot}>
                          {LotModel?.QCResult ? 'OK' : 'NG'}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          style={{ ...style.styleBorderAndCenter, ...style.borderBot, padding: 5 }}
                          sx={{ whiteSpace: 'nowrap' }}
                        >
                          <p style={{ margin: 0 }}>
                            {moment(LotModel?.createdDate).add(7, 'hours').format('YYYY-MM-DD')}
                          </p>
                          {moment(LotModel?.createdDate).add(7, 'hours').format('hh:mm:ss')}
                        </TableCell>
                        <TableCell
                          rowSpan={2}
                          colSpan={3}
                          sx={{ textAlign: 'center', borderBottom: '1px solid black' }}
                        >
                          <b style={{ fontSize: '22px' }}>{LotModel?.LotSerial}</b>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          style={style.styleBorderAndCenter}
                          sx={{ padding: '10px', borderBottom: '1px solid black' }}
                        >
                          {`W${moment(LotModel.QCDate).week()} / T${moment(LotModel.QCDate).format('MM')}`}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={4} style={{ textAlign: 'center', borderTop: '1px solid black' }}>
                          <MuiButton
                            text="delete"
                            onClick={() => {
                              setLotModel(LotModel2);
                              setLotModel2(null);
                            }}
                            color="error"
                          />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </>
          )}
        </Grid>
        <Grid item xs={6}>
          {LotModel2 != null && (
            <>
              <Box
                sx={{
                  border: '1px solid black',
                  mb: 2,
                  maxWidth: '500px',
                  pageBreakAfter: 'always',
                  margin: 'auto',
                  mt: 5,
                }}
              >
                <TableContainer sx={{ overflowX: 'hidden' }}>
                  <Table>
                    <TableBody>
                      <TableRow>
                        <TableCell style={{ ...style.styleBorderAndCenter, ...style.borderBot }}>CODE</TableCell>
                        <TableCell
                          colSpan={2}
                          style={{ ...style.styleBorderAndCenter, ...style.borderBot }}
                          sx={{ padding: '0px 3px !important' }}
                        >
                          <b style={{ fontSize: '22px' }}>{LotModel2?.MaterialCode}</b>
                        </TableCell>
                        <TableCell rowSpan={2} sx={{ textAlign: 'center' }} style={{ ...style.borderBot }}>
                          {LotModel2.Id != null && <QRCode value={`${LotModel2?.Id}`} size={80} />}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={3} style={{ ...style.styleBorderAndCenter, ...style.borderBot }}>
                          {LotModel2.MaterialDescription}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell style={{ ...style.styleBorderAndCenter, ...style.borderBot }}>QTY</TableCell>
                        <TableCell
                          style={{ ...style.styleBorderAndCenter, ...style.borderBot }}
                          sx={{ padding: '0px 3px !important' }}
                        >
                          <b style={{ fontSize: '22px' }}>{LotModel2.Qty + ' ' + LotModel2.UnitName} </b>
                        </TableCell>
                        <TableCell style={{ ...style.styleBorderAndCenter, ...style.borderBot }}>VENDOR</TableCell>
                        <TableCell sx={{ textAlign: 'center', padding: '5px !important' }} style={style.borderBot}>
                          {LotModel2.SupplierCode || 'HANLIM'}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell style={{ ...style.styleBorderAndCenter, ...style.borderBot }}>LOT No.</TableCell>
                        <TableCell colSpan={2} style={{ ...style.styleBorderAndCenter, ...style.borderBot }}>
                          {LotModel2?.Id}
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }} style={style.borderBot}>
                          {LotModel2?.QCResult ? 'OK' : 'NG'}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          style={{ ...style.styleBorderAndCenter, ...style.borderBot, padding: 5 }}
                          sx={{ whiteSpace: 'nowrap' }}
                        >
                          <p style={{ margin: 0 }}>
                            {moment(LotModel2?.createdDate).add(7, 'hours').format('YYYY-MM-DD')}
                          </p>
                          {moment(LotModel2?.createdDate).add(7, 'hours').format('hh:mm:ss')}
                        </TableCell>
                        <TableCell
                          rowSpan={2}
                          colSpan={3}
                          sx={{ textAlign: 'center', borderBottom: '1px solid black' }}
                        >
                          <b style={{ fontSize: '22px' }}>{LotModel2?.LotSerial}</b>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          style={{ ...style.styleBorderAndCenter, borderBottom: '1px solid black' }}
                          sx={{ padding: '10px' }}
                        >
                          {`W${moment(LotModel2.QCDate).week()} / T${moment(LotModel2.QCDate).format('MM')}`}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={4} style={{ textAlign: 'center', borderTop: '1px solid black' }}>
                          <MuiButton text="delete" onClick={() => setLotModel2(null)} color="error" />
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </>
          )}
        </Grid>
        <ActualPrintDialog isOpen={isShowing} onClose={toggle} listData={[LotModel, LotModel2]} />
      </Grid>
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

export default connect(mapStateToProps, mapDispatchToProps)(MergeLot);
