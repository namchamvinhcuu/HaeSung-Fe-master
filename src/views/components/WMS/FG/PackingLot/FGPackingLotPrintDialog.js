import { Store } from '@appstate';
import { User_Operations } from '@appstate/user';
import { MuiDialog } from '@controls';
import { Box, DialogContent, Table, TableBody, TableCell, TableContainer, TableRow } from '@mui/material';
import { CombineDispatchToProps, CombineStateToProps } from '@plugins/helperJS';
import moment from 'moment';
import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import QRCode from 'react-qr-code';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

const FGPackingLotPrintDialog = ({ listData, isOpen, onClose }) => {
  const intl = useIntl();
  const [dialogState, setDialogState] = useState({ isSubmit: false });
  const componentPringtRef = React.useRef();
  const handleCloseDialog = () => {
    onClose();
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
      <MuiDialog
        maxWidth="md"
        title={intl.formatMessage({ id: 'general.print' })}
        isOpen={isOpen}
        disabledCloseBtn={dialogState.isSubmit}
        disable_animate={300}
        onClose={handleCloseDialog}
        isShowButtonPrint
      >
        <DialogContent ref={componentPringtRef} sx={{ display: 'flex', justifyContent: 'center' }}>
          <Box>
            {listData?.map((dataPrint, index) => {
              return (
                dataPrint != null && (
                  <Box
                    sx={{ border: '1px solid black', mb: 2, maxWidth: '450px', pageBreakAfter: 'always' }}
                    key={`IQCQRCODE_${index}`}
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
                              <b style={{ fontSize: '22px' }}>{dataPrint?.MaterialCode}</b>
                            </TableCell>
                            <TableCell rowSpan={2} sx={{ textAlign: 'center' }} style={style.borderBot}>
                              <QRCode value={`${dataPrint?.PackingLabelId}`} size={80} />
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell colSpan={3} style={{ ...style.styleBorderAndCenter, ...style.borderBot }}>
                              {dataPrint?.MaterialDescription}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell style={{ ...style.styleBorderAndCenter, ...style.borderBot }}>QTY</TableCell>
                            <TableCell
                              style={{ ...style.styleBorderAndCenter, ...style.borderBot }}
                              sx={{ padding: '0px 3px !important' }}
                            >
                              <b style={{ fontSize: '22px' }}>{dataPrint?.Qty + ' ' + dataPrint?.UnitName} </b>
                            </TableCell>
                            <TableCell style={{ ...style.styleBorderAndCenter, ...style.borderBot }}>VENDOR</TableCell>
                            <TableCell sx={{ textAlign: 'center', padding: '5px !important' }} style={style.borderBot}>
                              HANLIM
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell style={{ ...style.styleBorderAndCenter, ...style.borderBot }}>
                              Packing #
                            </TableCell>
                            <TableCell colSpan={2} style={{ ...style.styleBorderAndCenter, ...style.borderBot }}>
                              {dataPrint?.PackingLabelId}
                            </TableCell>
                            <TableCell sx={{ textAlign: 'center' }} style={style.borderBot}>
                              {dataPrint?.QCResult ? 'OK' : 'NG'}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell
                              style={{ ...style.styleBorderAndCenter, ...style.borderBot, padding: 5 }}
                              sx={{ whiteSpace: 'nowrap' }}
                            >
                              <p style={{ margin: 0 }}>
                                {moment(dataPrint?.PackingDate).add(7, 'hours').format('YYYY-MM-DD')}
                              </p>
                              {moment(dataPrint?.PackingDate).add(7, 'hours').format('HH:mm:ss')}
                            </TableCell>
                            <TableCell colSpan={3} sx={{ ...style.borderBot, textAlign: 'center' }}>
                              <b style={{ fontSize: '22px' }}>{dataPrint?.PackingSerial}</b>
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell style={style.styleBorderAndCenter} sx={{ padding: '10px' }}>
                              {`W${moment(dataPrint?.QCDate).week()} / T${moment(dataPrint?.QCDate).format('MM')}`}
                            </TableCell>
                            <TableCell colSpan={3} sx={{ textAlign: 'center' }}>
                              <b style={{ fontSize: '22px' }}>{dataPrint?.SamsungLabelCode}</b>
                            </TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </TableContainer>
                  </Box>
                )
              );
            })}
          </Box>
        </DialogContent>
      </MuiDialog>
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

export default connect(mapStateToProps, mapDispatchToProps)(FGPackingLotPrintDialog);
