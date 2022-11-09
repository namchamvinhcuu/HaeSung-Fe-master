import React, { useEffect, useState, useRef } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { CombineStateToProps, CombineDispatchToProps } from "@plugins/helperJS";
import { User_Operations } from "@appstate/user";
import { Store } from "@appstate";

import { MuiDialog, MuiResetButton, MuiSubmitButton, MuiTextField, MuiButton, MuiDataGrid, MuiAutocomplete, MuiSelectField } from "@controls";
import { Badge, Button, Checkbox, DialogActions, DialogContent, FormControlLabel, Grid, TextField } from "@mui/material";
import { useIntl } from "react-intl";
import * as yup from "yup";
import { actualService } from "@services";
import { ErrorAlert, SuccessAlert, getCurrentWeek } from "@utils";
import { useFormik } from "formik";
import moment from "moment";
import ReactToPrint from "react-to-print";
import QRCode from "react-qr-code";

const ActualPrintDialog = ({ listData, isOpen, onClose }) => {
  const intl = useIntl();
  const [dialogState, setDialogState] = useState({ isSubmit: false });
  const componentPringtRef = React.useRef();
  const handleCloseDialog = () => {
    onClose();
  };

  return (
    <React.Fragment>
      <MuiDialog
        maxWidth="md"
        title={intl.formatMessage({ id: "general.create" })}
        isOpen={isOpen}
        disabledCloseBtn={dialogState.isSubmit}
        disable_animate={300}
        onClose={handleCloseDialog}
      >
        <DialogContent ref={componentPringtRef}>
          <div style={{ overflow: 'visible', height: '500px' }}>
            {listData.map((item, index) => {
              return <div key={index}>
                <table key={index} style={style.table}>
                  <tbody>
                    <tr>
                      <td style={style.cell}>Code</td>
                      <td style={{ ...style.cell, fontWeight: '600' }} colSpan="2">{item.MaterialCode}</td>
                      <td style={style.cell} rowSpan="2"><QRCode value={`${item.LotCode}`} size={80} /></td>
                    </tr>
                    <tr>
                      <td style={style.cell} colSpan="3">Desc: {item.MaterialDescription}</td>
                    </tr>
                    <tr>
                      <td style={{ ...style.cell, width: '25%' }}>Qty</td>
                      <td style={{ ...style.cell, width: '25%', fontWeight: '600' }}>{item.Qty + ' ' + item.UnitName}</td>
                      <td style={{ ...style.cell, width: '25%' }}>Vendor</td>
                      <td style={{ ...style.cell, width: '25%' }}>HANLIM</td>
                    </tr>
                    <tr>
                      <td style={style.cell}>Lot No</td>
                      <td style={style.cell}></td>
                      <td style={style.cell} colSpan="2"></td>
                    </tr>
                    <tr>
                      <td style={style.cell}>{moment(item.QCDate).format("YYYY.MM.DD")}</td>
                      <td style={{ ...style.cell, fontSize: '45px', fontWeight: '600' }} colSpan="3" rowSpan="2">{moment(item.QCDate).format("YY") + moment(item.QCDate).dayOfYear()}</td>
                    </tr>
                    <tr>
                      <td style={style.cell}>{'M' + moment(item.QCDate).week() + ' / T' + moment(item.QCDate).format("MM")}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            })}
          </div>
        </DialogContent>
        <DialogActions sx={{ mt: 3 }}>
          <ReactToPrint
            trigger={() => { return <MuiButton text="print" /> }}
            content={() => componentPringtRef.current}
          />
        </DialogActions>
      </MuiDialog>
    </React.Fragment >
  )
}

const style = {
  table: {
    width: '100%',
    marginBottom: '40px',
    textAlign: 'center',
    fontSize: '20px',
    pageBreakAfter: "always"
  },
  cell: {
    border: 'black solid 1px',
    padding: '10px 0'
  },
}

User_Operations.toString = function () {
  return "User_Operations";
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

export default connect(mapStateToProps, mapDispatchToProps)(ActualPrintDialog);