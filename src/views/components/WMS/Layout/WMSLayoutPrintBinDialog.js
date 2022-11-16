import React, { useEffect, useState, useRef } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { CombineStateToProps, CombineDispatchToProps } from "@plugins/helperJS";
import { User_Operations } from "@appstate/user";
import { Store } from "@appstate";

import { MuiDialog, MuiButton } from "@controls";
import { DialogActions, DialogContent, Grid } from "@mui/material";
import { useIntl } from "react-intl";
import { wmsLayoutService } from "@services";
import ReactToPrint from "react-to-print";
import QRCode from "react-qr-code";

const WMSLayoutPrintBinDialog = ({ ShelfId, isOpen, onClose }) => {
  const intl = useIntl();
  const [dialogState, setDialogState] = useState({ isSubmit: false });
  const [listData, setListData] = useState([]);
  const componentPringtRef = React.useRef();

  useEffect(() => {
    if (ShelfId && isOpen)
      getBins();
  }, [isOpen]);

  const getBins = async () => {
    var res = await wmsLayoutService.getBins(ShelfId);
    setListData(res.Data);
  }

  const handleCloseDialog = () => {
    onClose();
  };

  return (
    <React.Fragment>
      <MuiDialog
        maxWidth="md"
        title={intl.formatMessage({ id: "general.print" })}
        isOpen={isOpen}
        disabledCloseBtn={dialogState.isSubmit}
        disable_animate={300}
        onClose={handleCloseDialog}
      >
        <DialogContent >
          <div style={{ overflow: 'visible', height: '500px' }} ref={componentPringtRef}>
            <Grid item container spacing={2} sx={{ p: 3 }}>
              {listData.map((item, index) => {
                return <Grid key={index} item xs={6}>
                  <table key={index} style={style.table}>
                    <tbody>
                      <tr>
                        <td style={style.cell} rowSpan="3"><QRCode value={`${item.BinCode}`} size={100} /></td>
                        <td style={{ ...style.cell }}>Bin code: {item.BinCode}</td>
                      </tr>
                      <tr>
                        <td style={{ ...style.cell }}>Level: {item.BinLevel}</td>
                      </tr>
                      <tr>
                        <td style={{ ...style.cell }}>Index: {item.BinIndex}</td>
                      </tr>
                    </tbody>
                  </table>
                </Grid>
              })}
            </Grid>

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
    marginTop: '5px',
    textAlign: 'center',
    fontSize: '20px',
    pageBreakAfter: "always",
    border: 'black solid 2px',
  },
  cell: {
    padding: '5px 10px',
    textAlign: 'left'
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

export default connect(mapStateToProps, mapDispatchToProps)(WMSLayoutPrintBinDialog);