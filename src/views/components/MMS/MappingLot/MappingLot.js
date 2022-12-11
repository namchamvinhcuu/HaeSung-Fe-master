import { Store } from '@appstate';
import { User_Operations } from '@appstate/user';
import { CombineDispatchToProps, CombineStateToProps } from '@plugins/helperJS';
import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import LinkOffIcon from '@mui/icons-material/LinkOff';
import IconButton from '@mui/material/IconButton';
import { ErrorAlert, SuccessAlert, delayDuration } from '@utils';
import { useIntl } from 'react-intl';

import { MuiButton, MuiDataGrid, MuiTextField } from '@controls';
import LinkIcon from '@mui/icons-material/Link';
import { Button, Grid, Box, Table, TableBody, TableCell, TableContainer, TableRow } from '@mui/material';
import { splitMergeLotService, eslService } from '@services';
import _ from 'lodash';
import moment from 'moment';
import QRCode from 'react-qr-code';

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

const MappingLot = (props) => {
  let isRendered = useRef(true);
  const eslInputRef = useRef(null);
  const lotInputRef = useRef(null);
  const intl = useIntl();
  //   const [eslCode, setEslCode] = useState('');
  //   const [lotId, setLotId] = useState('');
  const [lotModel, setLotModel] = useState(null);
  const [state, setState] = useState({
    isLoading: false,
    eslCode: '',
    lotId: '',
    // page: 1,
    // pageSize: 20,
  });

  useEffect(() => {
    return () => (isRendered = false);
  }, []);

  const keyPress = async (e) => {
    if (e.key === 'Enter') {
      await scanBtnClick();
    }
  };

  const scanBtnClick = async () => {
    let inputVal = '';

    if (lotModel == null) {
      if (lotInputRef.current.value) {
        setState({ ...state, isLoading: true });
        inputVal = lotInputRef.current.value.trim().toUpperCase();

        var res = await splitMergeLotService.getLotById(inputVal);

        if (res.HttpResponseCode === 200 && res.Data) {
          setLotModel(res.Data);
          setState({ ...state, isLoading: false });
          eslInputRef.current.focus();
        } else {
          ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
          lotInputRef.current.value = '';
          lotInputRef.current.focus();
          setState({ ...state, isLoading: false });
        }
      }
    } else {
      if (!eslInputRef.current.value || eslInputRef.current.value.length !== 12) {
        ErrorAlert(intl.formatMessage({ id: 'esl.tag_unregistered' }));
        return;
      } else {
        const getRegisteredESLTag = await eslService.getRegisteredESLTagByCode(eslInputRef.current.value);

        if (getRegisteredESLTag.status !== 200) {
          ErrorAlert(intl.formatMessage({ id: 'esl.tag_unregistrated' }));
          eslInputRef.current.value = '';
          return;
        }

        // Create/Update ESL
        const createResponse = await eslService.createLotOnESLServer(lotModel, 'Bin-1');

        if (createResponse.status === 200) {
          await delayDuration(1000);
          const linkResponse = await eslService.linkESLTagWithBin(lotModel.Id, eslInputRef.current.value);
          if (linkResponse.status === 200) {
            // Update ESL Data
            await delayDuration(1000);
            const updateESLDataRes = await eslService.updateESLDataByLot(lotModel);

            if (updateESLDataRes.status === 200) {
              SuccessAlert(intl.formatMessage({ id: 'esl.mapping_success' }));
              eslInputRef.current.value = '';
            } else {
              ErrorAlert(intl.formatMessage({ id: 'esl.mapping_error' }));
            }
          }
        }
      }
    }
  };

  const handleScanMapping = async (inputValue) => {
    const res = await mappingTrayService.scanMapping({
      LotId: inputValue,
      TrayCode: TrayCode,
    });

    if (res.HttpResponseCode === 200) {
      setNewData(res.Data);
      SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }));
    } else {
      ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
    }
    lotInputRef.current.value = '';
  };

  return (
    <React.Fragment>
      <Grid container spacing={2.5} justifyContent="space-between" alignItems="width-end">
        <Grid item xs={7}>
          <Grid item sx={{ mb: 1, textAlign: 'right', display: 'flex', alignItems: 'center' }}>
            <MuiTextField
              autoFocus
              sx={{ width: 300 }}
              ref={lotInputRef}
              label={'Lot'}
              onChange={(e) => (lotInputRef.current.value = e.target.value)}
              onKeyDown={keyPress}
            />

            <LinkIcon sx={{ mr: 1, ml: 1 }} />

            <MuiTextField
              sx={{ width: 300 }}
              ref={eslInputRef}
              label={intl.formatMessage({ id: 'MappingBin.ESLCode' })}
              onChange={(e) => {
                if (state.eslCode != '') setState({ ...state, eslCode: '' });
                eslInputRef.current.value = e.target.value;
              }}
              onKeyDown={keyPress}
            />

            <MuiButton text="scan" color="success" onClick={scanBtnClick} sx={{ whiteSpace: 'nowrap', mr: 1 }} />
            <Button
              variant="outlined"
              color="error"
              disabled={lotModel ? false : true}
              onClick={() => {
                setState({ ...state, eslCode: '', lotId: '' });

                eslInputRef.current.value = '';
                lotInputRef.current.value = '';
                lotInputRef.current?.focus();
                setLotModel(null);
              }}
            >
              CLEAR
            </Button>
          </Grid>
        </Grid>
      </Grid>
      <Grid container spacing={2.5} justifyContent="space-between" sx={{ pt: 5 }}>
        <Grid item xs={12}>
          {lotModel != null && (
            <>
              <Box
                // ref={PrintRef1}
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
                          <b style={{ fontSize: '22px' }}>{lotModel?.MaterialCode}</b>
                        </TableCell>
                        <TableCell rowSpan={2} sx={{ textAlign: 'center' }} style={style.borderBot}>
                          <QRCode value={`${lotModel?.Id}`} size={80} />
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell colSpan={3} style={{ ...style.styleBorderAndCenter, ...style.borderBot }}>
                          {lotModel?.MaterialDescription}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell style={{ ...style.styleBorderAndCenter, ...style.borderBot }}>QTY</TableCell>
                        <TableCell
                          style={{ ...style.styleBorderAndCenter, ...style.borderBot }}
                          sx={{ padding: '0px 3px !important' }}
                        >
                          <b style={{ fontSize: '22px' }}>{lotModel.Qty + ' ' + lotModel.UnitName} </b>
                        </TableCell>
                        <TableCell style={{ ...style.styleBorderAndCenter, ...style.borderBot }}>VENDOR</TableCell>
                        <TableCell sx={{ textAlign: 'center', padding: '5px !important' }} style={style.borderBot}>
                          {lotModel?.SupplierCode}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell style={{ ...style.styleBorderAndCenter, ...style.borderBot }}>LOT No.</TableCell>
                        <TableCell colSpan={2} style={{ ...style.styleBorderAndCenter, ...style.borderBot }}>
                          {lotModel?.Id}
                        </TableCell>
                        <TableCell sx={{ textAlign: 'center' }} style={style.borderBot}>
                          {lotModel?.QCResult ? 'OK' : 'NG'}
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell
                          style={{ ...style.styleBorderAndCenter, ...style.borderBot, padding: 5 }}
                          sx={{ whiteSpace: 'nowrap' }}
                        >
                          <p style={{ margin: 0 }}>
                            {moment(lotModel?.createdDate).add(7, 'hours').format('YYYY-MM-DD')}
                          </p>
                          {moment(lotModel?.createdDate).add(7, 'hours').format('hh:mm:ss')}
                        </TableCell>
                        <TableCell rowSpan={2} colSpan={3} sx={{ textAlign: 'center' }}>
                          <b style={{ fontSize: '22px' }}>{lotModel?.LotSerial}</b>
                        </TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell style={style.styleBorderAndCenter} sx={{ padding: '10px' }}>
                          {`W${moment(lotModel.QCDate).week()} / T${moment(lotModel.QCDate).format('MM')}`}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            </>
          )}
        </Grid>
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

export default connect(mapStateToProps, mapDispatchToProps)(MappingLot);
