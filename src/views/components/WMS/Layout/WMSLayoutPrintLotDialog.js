import { Store } from '@appstate';
import { User_Operations } from '@appstate/user';
import { CombineDispatchToProps, CombineStateToProps } from '@plugins/helperJS';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { MuiButton, MuiDialog } from '@controls';
import { DialogActions, DialogContent } from '@mui/material';
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

  return (
    <React.Fragment>
      <MuiDialog
        maxWidth="md"
        title={intl.formatMessage({ id: 'general.print' })}
        isOpen={isOpen}
        disabledCloseBtn={dialogState.isSubmit}
        disable_animate={300}
        onClose={handleCloseDialog}
      >
        <DialogContent>
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
                        <td style={style.cell}></td>
                        <td style={style.cell}></td>
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
        </DialogContent>
        <DialogActions sx={{ mt: 3 }}>
          <ReactToPrint
            trigger={() => {
              return <MuiButton text="print" />;
            }}
            content={() => componentPringtRef.current}
          />
        </DialogActions>
      </MuiDialog>
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
