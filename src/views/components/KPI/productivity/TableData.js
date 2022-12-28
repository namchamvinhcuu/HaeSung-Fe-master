import { Store } from '@appstate';
import { Display_Operations } from '@appstate/display';
import { User_Operations } from '@appstate/user';
import { CombineDispatchToProps, CombineStateToProps } from '@plugins/helperJS';
import React, { useEffect, useRef } from 'react';
import { useIntl } from 'react-intl';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';

const createData = (name, value) => {
  return { name, value };
};

const TableData = (props) => {
  let isRendered = useRef(true);
  const intl = useIntl();
  const { totalOrderQty, totalActualQty, totalNGQty, data } = props;

  const rows = [
    createData('TOTAL TARGET', totalOrderQty),
    createData('TOTAL ACTUAL', totalActualQty),
    createData('TOTAL NG', totalNGQty),
  ];

  useEffect(() => {
    if (isRendered) {
    }

    return () => {
      isRendered = false;
    };
  }, []);

  return (
    <React.Fragment>
      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 350 }} aria-label="simple table">
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.name} sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                <TableCell component="th" scope="row" sx={{ fontSize: '20px', fontWeight: 'bold' }}>
                  {row.name}
                </TableCell>
                <TableCell align="right" sx={{ fontSize: '20px', fontWeight: 'bold' }}>
                  {row.value}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </React.Fragment>
  );
};

User_Operations.toString = function () {
  return 'User_Operations';
};

Display_Operations.toString = function () {
  return 'Display_Operations';
};

const mapStateToProps = (state) => {
  const {
    User_Reducer: { language },
  } = CombineStateToProps(state.AppReducer, [[Store.User_Reducer]]);

  const {
    Display_Reducer: { totalOrderQty, totalActualQty, totalNGQty, totalEfficiency, data },
  } = CombineStateToProps(state.AppReducer, [[Store.Display_Reducer]]);

  return { language, totalOrderQty, totalActualQty, totalNGQty, totalEfficiency, data };
};

const mapDispatchToProps = (dispatch) => {
  const {
    User_Operations: { changeLanguage },
  } = CombineDispatchToProps(dispatch, bindActionCreators, [[User_Operations]]);

  const {
    Display_Operations: { saveDisplayData },
  } = CombineDispatchToProps(dispatch, bindActionCreators, [[Display_Operations]]);

  return { changeLanguage, saveDisplayData };
};

export default connect(mapStateToProps, mapDispatchToProps)(TableData);
