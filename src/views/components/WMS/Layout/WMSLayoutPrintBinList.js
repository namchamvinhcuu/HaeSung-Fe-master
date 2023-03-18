import { Store } from '@appstate';
import { User_Operations } from '@appstate/user';
import { CombineDispatchToProps, CombineStateToProps } from '@plugins/helperJS';
import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { MuiButton, MuiDialog } from '@controls';
import { DialogActions, DialogContent, Grid } from '@mui/material';
import { wmsLayoutService } from '@services';
import { useIntl } from 'react-intl';
import QRCode from 'react-qr-code';
import ReactToPrint from 'react-to-print';

const WMSLayoutPrintBinList = ({ listData }) => {
  const style = {
    table: {
      width: '100%',
      marginTop: '5px',
      marginTop: '5px',
      textAlign: 'center',
      fontSize: '20px',
      // pageBreakAfter: 'always',
      border: 'black solid 2px',
    },
    cell: {
      padding: '5px 10px',
      textAlign: 'left',
    },
  };

  return (
    <React.Fragment>
      <div style={{ overflow: 'visible', height: '500px' }}>
        <Grid item container spacing={2} sx={{ p: 3 }}>
          {listData.map((item, index) => {
            return (
              <Grid key={index} item xs={6}>
                <table
                  key={index}
                  style={(index + 1) % 2 == 0 ? { ...style.table, pageBreakAfter: 'always' } : { ...style.table }}
                >
                  <tbody>
                    <tr>
                      <td style={style.cell} rowSpan="3">
                        <QRCode value={`${item.BinCode}`} size={100} />
                      </td>
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
            );
          })}
        </Grid>
      </div>
    </React.Fragment>
  );
};

export default WMSLayoutPrintBinList;
