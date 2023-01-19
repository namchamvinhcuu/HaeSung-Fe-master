import { Store } from '@appstate';
import { User_Operations } from '@appstate/user';
import { CombineDispatchToProps, CombineStateToProps } from '@plugins/helperJS';
import { ErrorAlert, SuccessAlert } from '@utils';
import React, { useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import QRCode from 'react-qr-code';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { useModal } from '@basesShared';
import { MuiAutocomplete, MuiButton, MuiTextField } from '@controls';
import { Box, Grid, Table, TableBody, TableCell, TableContainer, TableRow } from '@mui/material';
import { oqcService } from '@services';
import moment from 'moment';
import ActualPrintDialog from '../../../MMS/Actual/ActualPrintDialog';

const OQC = (props) => {
  let isRendered = useRef(true);
  const lotInputRef = useRef(null);

  const intl = useIntl();
  const [LotModel, setLotModel] = useState(null);
  const [LotModelQC, setLotModelQC] = useState(null);
  const [state, setState] = useState({ isLoading: false });
  const [QCModel, setQCModel] = useState({ NGQty: 0, QCId: [], Remark: '' });
  const { isShowing, toggle } = useModal();

  const keyPress = async (e) => {
    if (e.key === 'Enter') {
      await scanBtnClick();
    }
  };

  const scanBtnClick = async () => {
    let inputVal = '';

    if (lotInputRef.current.value) {
      setState({ ...state, isLoading: true });
      inputVal = lotInputRef.current.value.trim().toUpperCase();

      var res = await oqcService.scanOQC(inputVal);

      if (res.HttpResponseCode === 200 && res.Data) {
        setLotModel(res.Data);
        setLotModelQC(null);
        setState({ ...state, isLoading: false });
      } else {
        setLotModel(null);
        setLotModelQC(null);
        ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
        lotInputRef.current.value = '';
        setState({ ...state, isLoading: false });
      }
    }
  };

  const getQC = async () => {
    let inputVal = '';

    if (lotInputRef.current.value) {
      inputVal = lotInputRef.current.value.trim();
      var res = await oqcService.getSelectQC(inputVal);

      return res;
    }
  };

  const saveBtnClick = async () => {
    if (window.confirm(intl.formatMessage({ id: 'oqc.confirm_QC' }))) {
      try {
        if (QCModel.NGQty > LotModel.Qty || QCModel.NGQty < 0)
          return ErrorAlert(intl.formatMessage({ id: 'oqc.NGQty_wrong' }));

        var res = await oqcService.checkOQC({ ...QCModel, LotId: LotModel.Id });
        if (res.HttpResponseCode === 200 && res.Data) {
          SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }));
          setLotModelQC(res.Data);
          setState({ ...state, isLoading: false });
        } else {
          ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
          setState({ ...state, isLoading: false });
        }
      } catch (error) {
        console.log(error);
      }
    }
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
        <Grid item xs={5}>
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
        <Grid item xs={7} container spacing={2}>
          <Grid item xs={10} container spacing={2}>
            <Grid item xs={4}>
              <MuiTextField
                type="number"
                sx={{ width: '100%' }}
                disabled={LotModel == null ? true : false}
                label={intl.formatMessage({ id: 'oqc.NGQty' })}
                onChange={(e) => setQCModel({ ...QCModel, NGQty: e.target.value })}
              />
            </Grid>
            <Grid item xs={4}>
              <MuiAutocomplete
                multiple={true}
                disabled={LotModel == null ? true : false}
                sx={{ width: '100%' }}
                label={intl.formatMessage({ id: 'oqc.Qc' })}
                fetchDataFunc={getQC}
                displayLabel="QCCode"
                displayValue="QcId"
                onChange={(e, value) => setQCModel({ ...QCModel, QCId: value || [] })}
              />
            </Grid>
            <Grid item xs={4}>
              <MuiTextField
                sx={{ width: '100%' }}
                disabled={LotModel == null ? true : false}
                label={intl.formatMessage({ id: 'oqc.Remark' })}
                onChange={(e) => setQCModel({ ...QCModel, Remark: e.target.value })}
              />
            </Grid>
          </Grid>
          <Grid item xs={2}>
            <MuiButton
              disabled={LotModel == null ? true : LotModelQC?.Id != null ? true : false}
              text="save"
              color="success"
              onClick={saveBtnClick}
              sx={{ whiteSpace: 'nowrap', mr: 1 }}
            />
          </Grid>
        </Grid>
      </Grid>
      <Grid container spacing={2.5} justifyContent="space-between" sx={{ pt: 5 }}>
        <Grid item xs={6}>
          {LotModel != null && (
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
                        {LotModel?.MaterialDescription}
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
                        HANLIM
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
                        {moment(LotModel?.createdDate).add(7, 'hours').format('HH:mm:ss')}
                      </TableCell>
                      <TableCell rowSpan={2} colSpan={3} sx={{ textAlign: 'center' }}>
                        <b style={{ fontSize: '22px' }}>{LotModel?.LotSerial}</b>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell style={style.styleBorderAndCenter} sx={{ padding: '10px' }}>
                        {`W${moment(LotModel.QCDate).week()} / T${moment(LotModel.QCDate).format('MM')}`}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </Grid>
        <Grid item xs={6}>
          {LotModelQC != null && (
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
                        <b style={{ fontSize: '22px' }}>{LotModelQC?.MaterialCode}</b>
                      </TableCell>
                      <TableCell rowSpan={2} sx={{ textAlign: 'center' }} style={{ ...style.borderBot }}>
                        {LotModelQC.Id != null && <QRCode value={`${LotModelQC?.Id}`} size={80} />}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={3} style={{ ...style.styleBorderAndCenter, ...style.borderBot }}>
                        {LotModelQC.MaterialDescription}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell style={{ ...style.styleBorderAndCenter, ...style.borderBot }}>QTY</TableCell>
                      <TableCell
                        style={{ ...style.styleBorderAndCenter, ...style.borderBot }}
                        sx={{ padding: '0px 3px !important' }}
                      >
                        <b style={{ fontSize: '22px' }}>{LotModelQC.Qty + ' ' + LotModelQC.UnitName} </b>
                      </TableCell>
                      <TableCell style={{ ...style.styleBorderAndCenter, ...style.borderBot }}>VENDOR</TableCell>
                      <TableCell sx={{ textAlign: 'center', padding: '5px !important' }} style={style.borderBot}>
                        HANLIM
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell style={{ ...style.styleBorderAndCenter, ...style.borderBot }}>LOT No.</TableCell>
                      <TableCell colSpan={2} style={{ ...style.styleBorderAndCenter, ...style.borderBot }}>
                        {LotModelQC?.Id}
                      </TableCell>
                      <TableCell sx={{ textAlign: 'center' }} style={style.borderBot}>
                        {LotModelQC?.QCResult ? 'OK' : 'NG'}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell
                        style={{ ...style.styleBorderAndCenter, ...style.borderBot, padding: 5 }}
                        sx={{ whiteSpace: 'nowrap' }}
                      >
                        <p style={{ margin: 0 }}>
                          {moment(LotModelQC?.createdDate).add(7, 'hours').format('YYYY-MM-DD')}
                        </p>
                        {moment(LotModelQC?.createdDate).add(7, 'hours').format('hh:mm:ss')}
                      </TableCell>
                      <TableCell rowSpan={2} colSpan={3} sx={{ textAlign: 'center', ...style.borderBot }}>
                        <b style={{ fontSize: '22px' }}>{LotModelQC?.LotSerial}</b>
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell style={{ ...style.styleBorderAndCenter, ...style.borderBot }} sx={{ padding: '10px' }}>
                        {`W${moment(LotModelQC.QCDate).week()} / T${moment(LotModelQC.QCDate).format('MM')}`}
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell colSpan={4} style={{ textAlign: 'center', borderTop: '1px solid black' }}>
                        <MuiButton text="print" onClick={() => toggle()} color="info" />
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </Grid>
        <ActualPrintDialog isOpen={isShowing} onClose={toggle} listData={[LotModelQC]} />
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

export default connect(mapStateToProps, mapDispatchToProps)(OQC);
