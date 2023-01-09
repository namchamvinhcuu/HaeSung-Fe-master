import { Store } from '@appstate';
import { User_Operations } from '@appstate/user';
import { Box, Card, CardContent, Grid, Typography } from '@mui/material';
import { CombineDispatchToProps, CombineStateToProps } from '@plugins/helperJS';
import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { MuiTextField, MuiButton } from '@controls';
import QRCode from 'react-qr-code';
import { lotInformation } from '@services';
import { ErrorAlert, SuccessAlert } from '@utils';
import { useIntl } from 'react-intl';
import moment from 'moment';

const LotInformation = (props) => {
  const [lot, setLot] = useState('');
  const intl = useIntl();
  let isRendered = useRef(true);
  const lotInputRef = useRef(null);

  const handleLotInputChange = (e) => {
    lotInputRef.current.value = e.target.value;
  };
  const keyPress = async (e) => {
    if (e.key === 'Enter') {
      await scanBtnClick();
    }
  };
  const scanBtnClick = async () => {
    let inputVal = '';

    if (lotInputRef.current.value) {
      inputVal = lotInputRef.current.value.trim();
    }
    await handleReceivingLot(inputVal);
    lotInputRef.current.value = '';
    lotInputRef.current.focus();
  };
  const handleReceivingLot = async (inputValue) => {
    const res = await lotInformation.getLot({ Id: inputValue || 0 });
    if (res.HttpResponseCode === 200) {
      setLot({ ...res.Data });
    } else {
      ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
    }
  };
  useEffect(() => {
    lotInputRef.current.focus();

    return () => {
      isRendered = false;
    };
  }, []);
  const styles = {
    underline: {
      borderBottom: '1px dashed #b0a0a0',
      width: '100%',
      display: 'inline-block',
      fontSize: '20px',
      fontWeight: '700',
      marginTop: '-5px',
      whiteSpace: 'nowrap',
    },
    title: {
      fontSize: 21,
      whiteSpace: 'nowrap',
    },
  };
  return (
    <React.Fragment>
      <Box sx={{ display: 'grid', justifyContent: 'center' }}>
        <Grid container spacing={2} className="align-items-center mb-5" sx={{ minWidth: '45vw' }}>
          <Grid item xs={9.5}>
            <MuiTextField ref={lotInputRef} label="Lot" onChange={handleLotInputChange} onKeyDown={keyPress} />
          </Grid>
          <Grid item xs={2.5}>
            <MuiButton text="scan" color="success" onClick={scanBtnClick} sx={{ whiteSpace: 'nowrap' }} />
          </Grid>
        </Grid>
        {lot?.Id && (
          <Card>
            <CardContent sx={{ minWidth: '45vw' }}>
              <Grid container spacing={3}>
                <Grid item xs={6.5} md={6.5}>
                  <Box className="d-flex mb-2">
                    <Typography sx={{ ...styles.title }}>Lot Code:</Typography>
                    <p style={{ ...styles.underline }} className="ml-2">
                      {lot?.Id}
                    </p>
                  </Box>
                  <Box className="d-flex mb-2">
                    <Typography sx={{ ...styles.title }}>Lot Serial:</Typography>
                    <p style={{ ...styles.underline }} className="ml-2">
                      {lot?.LotSerial}
                    </p>
                  </Box>
                  <Box className="d-flex mb-2">
                    <Typography sx={{ ...styles.title }}>Material Code:</Typography>
                    <p style={{ ...styles.underline }} className="ml-2">
                      {lot?.MaterialCode}
                    </p>
                  </Box>
                  <Box className="d-flex mb-2">
                    <Typography sx={{ ...styles.title }}>Material Type:</Typography>
                    <p style={{ ...styles.underline }} className="ml-2">
                      {lot?.MaterialTypeName}
                    </p>
                  </Box>
                  <Box className="d-flex mb-2">
                    <Typography sx={{ ...styles.title }}>Warehouse Name:</Typography>
                    <p style={{ ...styles.underline }} className="ml-2">
                      {lot?.WarehouseTypeName}
                    </p>
                  </Box>
                  <Box className="d-flex mb-2">
                    <Typography sx={{ ...styles.title }}>Qty:</Typography>
                    <p style={{ ...styles.underline }} className="ml-2">
                      {lot?.Qty}
                    </p>
                  </Box>
                  <Box className="d-flex mb-2">
                    <Typography sx={{ ...styles.title }}>NG Qty:</Typography>
                    <p style={{ ...styles.underline }} className="ml-2">
                      {lot?.NGQty}
                    </p>
                  </Box>
                  <Box className="d-flex mb-2">
                    <Typography sx={{ ...styles.title }}>Total Qty:</Typography>
                    <p style={{ ...styles.underline }} className="ml-2">
                      {lot?.TotalSOQty}
                    </p>
                  </Box>
                </Grid>
                <Grid item xs={5.5} md={5.5}>
                  <Box
                    sx={{
                      border: '1px solid rgba(0,0,0,0.3)',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      padding: '10px',
                      marginBottom: '10px',
                    }}
                  >
                    <QRCode value={`${lot?.Id}`} size={90} />
                  </Box>
                  <Box className="d-flex mb-2">
                    <Typography sx={{ ...styles.title }}>Bin Code:</Typography>
                    {lot?.BinCode && (
                      <p style={{ ...styles.underline }} className="ml-2">
                        {lot?.BinCode}
                      </p>
                    )}
                  </Box>
                  <Box className="d-flex mb-2">
                    <Typography sx={{ ...styles.title }}>WO Code:</Typography>
                    {lot?.WoCode && (
                      <p style={{ ...styles.underline }} className="ml-2">
                        {lot?.WoCode}
                      </p>
                    )}
                  </Box>
                  <Box className="d-flex mb-2">
                    <Typography sx={{ ...styles.title }}>QC Date:</Typography>
                    <p style={{ ...styles.underline }} className="ml-2">
                      {moment(lot?.QCDate).add(7, 'hours').format('YYYY-MM-DD HH:mm:ss')}
                    </p>
                  </Box>
                  <Box className="d-flex mb-2">
                    <Typography sx={{ ...styles.title }}>Incomming Date:</Typography>
                    {lot?.IncomingDate && (
                      <p style={{ ...styles.underline }} className="ml-2">
                        {moment(lot?.IncomingDate).add(7, 'hours').format('YYYY-MM-DD HH:mm:ss')}
                      </p>
                    )}
                  </Box>
                  <Box className="d-flex mb-2">
                    <Typography sx={{ ...styles.title }}>QC Result:</Typography>
                    <p style={{ ...styles.underline }} className="ml-2">
                      {lot?.QCResult ? 'OKE' : 'NG'}
                    </p>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        )}
      </Box>
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

export default connect(mapStateToProps, mapDispatchToProps)(LotInformation);
