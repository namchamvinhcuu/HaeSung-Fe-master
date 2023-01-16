import { MuiDialog } from '@controls';
import {
  Box,
  DialogContent,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
} from '@mui/material';
import { stockAdjustmentService } from '@services';
import moment from 'moment';
import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';

const AdjustmentReportPrintDialog = ({ isOpen, onClose, DataPrint }) => {
  const intl = useIntl();
  const [state, setState] = useState({ isLoading: false, data: [] });
  const utcDateTime = new Date().toUTCString();

  useEffect(() => {
    fetchData(DataPrint.StockAdjustmentId);
  }, [DataPrint]);

  async function fetchData(StockAdjustmentId) {
    setState({ ...state, isLoading: true });
    const params = {
      isConfirm: true,
      CheckStatus: true,
      page: 0,
      pageSize: 0,
      StockAdjustmentId: StockAdjustmentId,
    };
    const res = await stockAdjustmentService.getSADetail(params);
    if (res) setState({ data: res.Data ?? [], isLoading: false });
  }

  const style = {
    titleCell: {
      padding: '3px 5px',
      border: '1px solid black',
      fontWeight: 600,
      fontSize: '20px',
    },
    dataCell: {
      padding: '3px 5px',
      border: '1px solid black',
      fontSize: '18px',
    },
    titleMain: {
      border: '1px solid black',
      height: '50px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      height: '60px',
    },
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
    <MuiDialog
      maxWidth="lg"
      title={intl.formatMessage({ id: 'general.print' })}
      isOpen={isOpen}
      disabledCloseBtn={state.isLoading}
      disable_animate={300}
      onClose={onClose}
      isShowButtonPrint
    >
      <DialogContent sx={{ mt: 2 }}>
        <Grid container flexDirection="row" alignItems="center" justifyContent="center" textAlign="center">
          <Grid
            item
            xs={3}
            md={3}
            style={style.titleMain}
            sx={{
              borderRight: 'none !important',
            }}
          >
            <Typography sx={{ fontSize: '30px', fontWeight: 800 }}>HANLIM</Typography>
          </Grid>
          <Grid item xs={5.5} md={5.5} style={style.titleMain}>
            <Typography sx={{ fontSize: '25px', fontWeight: 700 }}>
              Stock Adjustment #: {DataPrint?.StockAdjustmentId}
            </Typography>
          </Grid>
          <Grid item xs={3.5} md={3.5} sx={{ border: '1px solid black', height: '60px', borderLeft: 'none' }}>
            <Box sx={{ borderBottom: '1px solid black' }}>
              <Typography sx={{ fontSize: '18px' }}>
                Due Date: {moment(DataPrint?.DueDate).format('YYYY-MM-DD')}
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: '18px' }}>
                {intl.formatMessage({ id: 'material-so-master.Requester' })}: {DataPrint?.Requester}
              </Typography>
            </Box>
          </Grid>
        </Grid>
        <Typography sx={{ fontSize: '20px', fontWeight: 600, margin: '5px 0px' }}>
          Lot List
          <span style={{ float: 'right' }}>
            <b>Date Time:</b> {moment(utcDateTime).format('YYYY-MM-DD HH:mm:ss')}
          </span>
        </Typography>
        <TableContainer>
          <Table sx={{ minWidth: 500 }} aria-label="custom pagination table">
            <TableBody>
              <TableRow>
                <TableCell style={style.titleCell}>Lot</TableCell>
                <TableCell style={style.titleCell}>{intl.formatMessage({ id: 'lot.LotSerial' })}</TableCell>
                <TableCell style={style.titleCell}>{intl.formatMessage({ id: 'lot.BinCode' })}</TableCell>
                <TableCell style={style.titleCell}>{intl.formatMessage({ id: 'material.MaterialCode' })}</TableCell>
                <TableCell style={style.titleCell}>{intl.formatMessage({ id: 'stockAdjustment.StockQty' })}</TableCell>
                <TableCell style={style.titleCell}>{intl.formatMessage({ id: 'stockAdjustment.CheckQty' })}</TableCell>
                <TableCell style={style.titleCell}>{intl.formatMessage({ id: 'stockAdjustment.GapQty' })}</TableCell>
                <TableCell style={style.titleCell}>{intl.formatMessage({ id: 'stockAdjustment.Remark' })}</TableCell>
              </TableRow>
              {state?.data?.map((item, index) => {
                return (
                  <>
                    <TableRow key={`Detail_${index}`}>
                      <TableCell style={style.dataCell}>{item?.LotId}</TableCell>
                      <TableCell style={style.dataCell}>{item?.LotSerial}</TableCell>
                      <TableCell style={style.dataCell}>{item?.BinCode}</TableCell>
                      <TableCell style={style.dataCell}>{item?.MaterialCode}</TableCell>
                      <TableCell style={style.dataCell}>{item?.StockQty}</TableCell>
                      <TableCell style={style.dataCell}>{item?.CheckQty}</TableCell>
                      <TableCell style={style.dataCell}>{item?.GapQty}</TableCell>
                      <TableCell style={style.dataCell}>{item?.Remark}</TableCell>
                    </TableRow>
                  </>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </DialogContent>
    </MuiDialog>
  );
};

export default AdjustmentReportPrintDialog;
