import { Store } from '@appstate';
import { User_Operations } from '@appstate/user';
import { CombineDispatchToProps, CombineStateToProps } from '@plugins/helperJS';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import CloseIcon from '@mui/icons-material/Close';
import { MuiButton, MuiDialog } from '@controls';
import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from '@mui/material';
import { wmsLayoutService } from '@services';
import moment from 'moment';
import { useIntl } from 'react-intl';
import QRCode from 'react-qr-code';
import ReactToPrint from 'react-to-print';

const WMSLayoutPrintLotDialog = ({ BinId, isOpen, onClose }) => {
  const intl = useIntl();
  const [dialogState, setDialogState] = useState({ isSubmit: false });
  const [listData, setListData] = useState([]);
  const componentPringtRef = React.useRef();

  useEffect(() => {
    if (BinId && isOpen) getBins();
  }, [isOpen]);

  const getBins = async () => {
    const res = await wmsLayoutService.getLotByBinId({ page: 1, pageSize: 0, BinId: BinId });
    setListData(res.Data);
  };

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
            {listData?.map((item, index) => {
              return (
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
                            <b style={{ fontSize: '22px' }}>{item?.MaterialCode}</b>
                          </TableCell>
                          <TableCell rowSpan={2} sx={{ textAlign: 'center' }} style={style.borderBot}>
                            <QRCode value={`${item?.Id}`} size={80} />
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell colSpan={3} style={{ ...style.styleBorderAndCenter, ...style.borderBot }}>
                            {item.MaterialDescription}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell style={{ ...style.styleBorderAndCenter, ...style.borderBot }}>QTY</TableCell>
                          <TableCell
                            style={{ ...style.styleBorderAndCenter, ...style.borderBot }}
                            sx={{ padding: '0px 3px !important' }}
                          >
                            <b style={{ fontSize: '22px' }}>{`${item?.Qty} ${item?.UnitName}`} </b>
                          </TableCell>
                          <TableCell style={{ ...style.styleBorderAndCenter, ...style.borderBot }}>VENDOR</TableCell>
                          <TableCell sx={{ textAlign: 'center', padding: '5px !important' }} style={style.borderBot}>
                            {item?.SupplierCode ?? 'HANLIM'}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell style={{ ...style.styleBorderAndCenter, ...style.borderBot }}>LOT No.</TableCell>
                          <TableCell colSpan={2} style={{ ...style.styleBorderAndCenter, ...style.borderBot }}>
                            {item?.Id}
                          </TableCell>
                          {/* <TableCell style={{ ...style.styleBorderAndCenter, ...style.borderBot }}>
                              20212221
                            </TableCell> */}
                          <TableCell sx={{ textAlign: 'center' }} style={style.borderBot}>
                            {item?.QCResult ? 'OK' : 'NG'}
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell
                            style={{ ...style.styleBorderAndCenter, ...style.borderBot }}
                            sx={{ whiteSpace: 'nowrap' }}
                          >
                            {moment(item.QCDate).add(7, 'hours').format('YYYY.MM.DD')}
                            <span style={{ display: 'block' }}>
                              {moment(item?.QCDate).add(7, 'hours').format('HH:mm:ss')}
                            </span>
                          </TableCell>
                          <TableCell rowSpan={2} colSpan={3} sx={{ textAlign: 'center' }}>
                            <b style={{ fontSize: '22px' }}>{item?.LotSerial}</b>
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell style={style.styleBorderAndCenter} sx={{ padding: '5px' }}>
                            {`W${moment(item.QCDate).week()} / T${moment(item.QCDate).format('MM')}`}
                          </TableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              );
            })}
          </Box>
        </DialogContent>
      </MuiDialog>

      {/* <DialogContent>
          <div style={{ overflow: 'visible', height: '500px' }} ref={componentPringtRef}>
            {listData.map((item, index) => {
              return (
                <div key={index} style={{ padding: '20px 50px' }}>
                  <table key={index} style={style.table}>
                    <tbody>
                      <tr>
                        <td style={style.cell}>CODE</td>
                        <td style={{ ...style.cell, fontWeight: '600' }} colSpan="2">
                          {item.MaterialCode}
                        </td>
                        <td style={style.cell} rowSpan="2">
                          <QRCode value={`${item.Id}`} size={90} />
                        </td>
                      </tr>
                      <tr>
                        <td style={style.cell} colSpan="3">
                          Desc: {item.MaterialDescription}
                        </td>
                      </tr>
                      <tr>
                        <td style={{ ...style.cell, width: '25%' }}>QTY</td>
                        <td style={{ ...style.cell, width: '25%', fontWeight: '600' }}>
                          {item.Qty + ' ' + item.UnitName}
                        </td>
                        <td style={{ ...style.cell, width: '25%' }}>Vendor</td>
                        <td style={{ ...style.cell, width: '25%' }}>
                          {item?.SupplierCode ? item?.SupplierCode : 'HANLIM'}
                        </td>
                      </tr>
                      <tr>
                        <td style={style.cell}>LOT No.</td>
                        <td style={style.cell} colSpan="2">
                          {item.Id}
                        </td>
              
                        <td style={style.cell}>{item.QCResult ? 'OK' : 'NG'}</td>
                      </tr>
                      <tr>
                        <td style={style.cell}>{moment(item.QCDate).format('YYYY.MM.DD')}</td>
                        <td style={{ ...style.cell, fontSize: '45px', fontWeight: '600' }} colSpan="3" rowSpan="2">
                          {item.LotSerial}
                        </td>
                      </tr>
                      <tr>
                        <td style={style.cell}>{`W${moment(item.QCDate).week()} / T${moment(item.QCDate).format(
                          'MM'
                        )}`}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              );
            })}
          </div>
        </DialogContent> */}
      {/* <DialogActions sx={{ pt: 3 }}>
          <ReactToPrint
            trigger={() => {
              return <MuiButton text="print" />;
            }}
            content={() => componentPringtRef.current}
          />
        </DialogActions> */}
    </React.Fragment>
  );
};

const style = {
  table: {
    width: '100%',
    marginTop: '40px',
    textAlign: 'center',
    fontSize: '20px',
    pageBreakAfter: 'always',
    border: 'black solid 2px',
  },
  cell: {
    border: 'black solid 1px',
    padding: '15px 0',
  },
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

export default connect(mapStateToProps, mapDispatchToProps)(WMSLayoutPrintLotDialog);
