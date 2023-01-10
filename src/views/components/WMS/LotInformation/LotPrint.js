import { Box, Button, Table, TableBody, TableCell, TableContainer, TableRow } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'react-qr-code';
import moment from 'moment';
import { useIntl } from 'react-intl';

const LotPrint = ({ item, innerRef }) => {
  const intl = useIntl();
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
  const getWeekByCreatedDate = (date) => {
    let todaydate = new Date(date);
    let oneJan = new Date(todaydate.getFullYear(), 0, 1);
    let numberOfDays = Math.floor((todaydate - oneJan) / (24 * 60 * 60 * 1000));
    let curWeek = Math.ceil((todaydate.getDay() + 1 + numberOfDays) / 7);
    return curWeek;
  };

  return (
    <React.Fragment>
      <Box sx={{ display: 'flex', justifyContent: 'center', paddingTop: '30px' }} ref={innerRef}>
        <Box
          sx={{
            border: '1px solid black',
            mb: 2,
            maxWidth: '450px',
          }}
          className="print-hidden"
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
                    {item?.Description}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ ...style.styleBorderAndCenter, ...style.borderBot }}>QTY</TableCell>
                  <TableCell
                    style={{ ...style.styleBorderAndCenter, ...style.borderBot }}
                    sx={{ padding: '0px 3px !important' }}
                  >
                    <b style={{ fontSize: '22px' }}>{`${item?.Qty} ${item?.Unit}`} </b>
                  </TableCell>
                  <TableCell style={{ ...style.styleBorderAndCenter, ...style.borderBot }}>VENDOR</TableCell>
                  <TableCell sx={{ textAlign: 'center', padding: '5px !important' }} style={style.borderBot}>
                    {item?.SupplierCode}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={{ ...style.styleBorderAndCenter, ...style.borderBot }}>LOT No.</TableCell>
                  <TableCell colSpan={2} style={{ ...style.styleBorderAndCenter, ...style.borderBot }}>
                    {item?.Id}
                  </TableCell>
                  <TableCell sx={{ textAlign: 'center' }} style={style.borderBot}>
                    {item?.QCResult ? 'OK' : 'NG'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell
                    style={{ ...style.styleBorderAndCenter, ...style.borderBot }}
                    sx={{ whiteSpace: 'nowrap' }}
                  >
                    {moment(item?.createdDate).add(7, 'hours').format('YYYY-MM-DD')}
                    <span style={{ display: 'block' }}>
                      {moment(item?.createdDate).add(7, 'hours').format('HH:mm:ss')}
                    </span>
                  </TableCell>
                  <TableCell rowSpan={2} colSpan={3} sx={{ textAlign: 'center' }}>
                    <b style={{ fontSize: '22px' }}>{item?.LotSerial}</b>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell style={style.styleBorderAndCenter} sx={{ padding: '5px' }}>
                    W{getWeekByCreatedDate(item?.createdDate)} / T
                    {moment(item?.createdDate).add(7, 'hours').format('MM')}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Box>
    </React.Fragment>
  );
};
export default LotPrint;
