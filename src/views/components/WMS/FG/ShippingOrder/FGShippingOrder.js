import { Store } from '@appstate';
import { User_Operations } from '@appstate/user';
import { CombineDispatchToProps, CombineStateToProps } from '@plugins/helperJS';
import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import CloseIcon from '@mui/icons-material/Close';
import { CREATE_ACTION, UPDATE_ACTION } from '@constants/ConfigConstants';
import { MuiButton, MuiDataGrid, MuiDateField, MuiSearchField, MuiDialog } from '@controls';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import UndoIcon from '@mui/icons-material/Undo';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Icon,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
  Zoom,
} from '@mui/material';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import ReactToPrint from 'react-to-print';
import { addDays, ErrorAlert, SuccessAlert } from '@utils';
import _ from 'lodash';
import { debounce } from 'lodash';
import moment from 'moment';
import { useIntl } from 'react-intl';

import { FGSOMasterDto } from '@models';
import { fgSOService } from '@services';
import { useModal, useModal2 } from '@basesShared';
import QRCode from 'react-qr-code';
import FGMasterSODialog from './FGSOMasterDialog';
import FGSODetail from './FGSODetail';

const FGSOMaster = (props) => {
  let isRendered = useRef(true);
  const intl = useIntl();
  const { isShowing, toggle } = useModal();
  const [FGsoId, setFGsoId] = useState(null);
  const [FGsoStatus, setFGSOStatus] = useState(false);
  const [fgSOState, setFGSOState] = useState({
    isLoading: false,
    data: [],
    totalRow: 0,
    page: 1,
    pageSize: 8,
    searchData: {
      ...FGSOMasterDto,
      EndSearchingDate: addDays(new Date(), 7),
    },
  });

  const [mode, setMode] = useState(CREATE_ACTION);

  const [newData, setNewData] = useState({ ...FGSOMasterDto });

  const [isOpenDialog, setIsOpenDialog] = useState(false);

  const [showActivedData, setShowActivedData] = useState(true);

  const [selectedRow, setSelectedRow] = useState({
    ...FGSOMasterDto,
  });

  const toggleDialog = (mode) => {
    setMode(mode === CREATE_ACTION ? CREATE_ACTION : UPDATE_ACTION);
    setIsOpenDialog(!isOpenDialog);
  };

  const changeSearchData = (e, inputName) => {
    let newSearchData = { ...fgSOState.searchData };

    newSearchData[inputName] = e;

    switch (inputName) {
      case 'StartSearchingDate':
      case 'EndSearchingDate':
        newSearchData[inputName] = e;
        break;
      default:
        newSearchData[inputName] = e.target.value;
        break;
    }

    setFGSOState({
      ...fgSOState,
      searchData: { ...newSearchData },
    });
  };

  const handleshowActivedData = async (event) => {
    setShowActivedData(event.target.checked);
    if (!event.target.checked) {
      setFGSOState({
        ...fgSOState,
        page: 1,
      });
    }
  };

  const handleRowSelection = (arrIds) => {
    // const rowSelected = fgSOState.data.filter(function (item) {
    //   return item.FGsoId === arrIds[0];
    // });

    // if (rowSelected && rowSelected.length > 0) {
    //   setSelectedRow({ ...rowSelected[0] });
    // } else {
    //   setSelectedRow({ ...FGSOMasterDto });
    // }

    const rowSelected = deliveryOrderState.data.find((item) => item.FGsoId === arrIds[0]);
    setSelectedRow(rowSelected ? { ...rowSelected } : { ...FGSOMasterDto });
  };

  const handleDelete = async (materialSOMaster) => {
    if (
      window.confirm(
        intl.formatMessage({
          id: showActivedData ? 'general.confirm_delete' : 'general.confirm_redo_deleted',
        })
      )
    ) {
      try {
        let res = await fgSOService.deleteFGSOMaster({
          FGsoId: materialSOMaster.FGsoId,
          row_version: materialSOMaster.row_version,
        });
        if (res) {
          if (res && res.HttpResponseCode === 200) {
            SuccessAlert(intl.formatMessage({ id: 'general.success' }));
            await fetchData();
            // setFGsoId(null)
          } else {
            ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
          }
        } else {
          ErrorAlert(intl.formatMessage({ id: 'general.system_error' }));
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const fetchData = async () => {
    setFGsoId(null);
    let flag = true;
    let message = '';
    const checkObj = { ...fgSOState.searchData };
    _.forOwn(checkObj, (value, key) => {
      switch (key) {
        case 'StartSearchingDate':
          if (value == 'Invalid Date') {
            message = 'general.StartSearchingDate_invalid';
            flag = false;
          }
          break;
        case 'EndSearchingDate':
          if (value == 'Invalid Date') {
            message = 'general.EndSearchingDate_invalid';
            flag = false;
          }
          break;

        default:
          break;
      }
    });

    if (flag && isRendered) {
      setFGSOState({
        ...fgSOState,
        isLoading: true,
      });

      const params = {
        page: fgSOState.page,
        pageSize: fgSOState.pageSize,
        FGsoCodeSearch: fgSOState.searchData.FGsoCodeSearch,
        StartSearchingDate: fgSOState.searchData.StartSearchingDate,
        EndSearchingDate: fgSOState.searchData.EndSearchingDate,
        isActived: showActivedData,
      };

      const res = await fgSOService.getFGSOMasters(params);

      if (res && isRendered)
        setFGSOState({
          ...fgSOState,
          data: !res.Data ? [] : [...res.Data],
          totalRow: res.TotalRow,
          isLoading: false,
        });
    } else {
      ErrorAlert(intl.formatMessage({ id: message }));
    }
  };

  const columns = [
    // { field: 'FGsoId', headerName: '', hide: true },
    {
      field: 'id',
      headerName: '',
      width: 100,
      filterable: false,
      renderCell: (index) => index.api.getRowIndex(index.row.FGsoId) + 1 + (fgSOState.page - 1) * fgSOState.pageSize,
    },

    {
      field: 'action',
      headerName: '',
      width: 80,
      // headerAlign: 'center',
      disableClickEventBubbling: true,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => {
        return (
          <Grid container spacing={1} alignItems="center" justifyContent="center">
            <Grid item xs={6}>
              <IconButton
                aria-label="edit"
                color="warning"
                size="small"
                sx={[{ '&:hover': { border: '1px solid orange' } }]}
                onClick={() => {
                  toggleDialog(UPDATE_ACTION);
                }}
              >
                <EditIcon fontSize="inherit" />
              </IconButton>
            </Grid>

            <Grid item xs={6}>
              <IconButton
                aria-label="delete"
                color="error"
                size="small"
                sx={[{ '&:hover': { border: '1px solid red' } }]}
                onClick={() => handleDelete(params.row)}
              >
                {showActivedData ? <DeleteIcon fontSize="inherit" /> : <UndoIcon fontSize="inherit" />}
              </IconButton>
            </Grid>
          </Grid>
        );
      },
    },

    {
      field: 'FGsoId',
      headerName: 'FG SO Code',
      /*flex: 0.7,*/ width: 150,
    },

    {
      field: 'FGsoStatus',
      headerName: intl.formatMessage({ id: 'material-so-master.MsoStatus' }),
      /*flex: 0.7,*/ width: 120,
      align: 'center',
      renderCell: (params) => {
        return params.row.FGsoStatus ? (
          <span className="badge badge-success" style={{ fontSize: '13px' }}>
            {intl.formatMessage({ id: 'material-so-master.MsoStatus_true' })}
          </span>
        ) : (
          <span className="badge badge-danger" style={{ fontSize: '13px' }}>
            {intl.formatMessage({ id: 'material-so-master.MsoStatus_false' })}
          </span>
        );
      },
    },

    {
      field: 'Requester',
      headerName: intl.formatMessage({ id: 'material-so-master.Requester' }),
      /*flex: 0.7,*/ width: 200,
    },

    {
      field: 'DueDate',
      headerName: intl.formatMessage({ id: 'material-so-master.DueDate' }),
      width: 150,
      valueFormatter: (params) => {
        if (params.value !== null) {
          return moment(params?.value).add(7, 'hours').format('YYYY-MM-DD');
        }
      },
    },

    {
      field: 'Remark',
      headerName: intl.formatMessage({ id: 'material-so-master.Remark' }),
      /*flex: 0.7,*/ width: 400,
    },

    {
      field: 'createdName',
      headerName: intl.formatMessage({ id: 'general.createdName' }),
      width: 150,
    },

    {
      field: 'createdDate',
      headerName: intl.formatMessage({ id: 'general.created_date' }),
      width: 150,
      valueFormatter: (params) => {
        if (params.value !== null) {
          return moment(params?.value).add(7, 'hours').format('YYYY-MM-DD HH:mm:ss');
        }
      },
    },

    {
      field: 'modifiedName',
      headerName: intl.formatMessage({ id: 'general.modifiedName' }),
      width: 150,
    },

    {
      field: 'modifiedDate',
      headerName: intl.formatMessage({ id: 'general.modified_date' }),
      width: 150,
      valueFormatter: (params) => {
        if (params.value !== null) {
          return moment(params?.value).add(7, 'hours').format('YYYY-MM-DD HH:mm:ss');
        }
      },
    },
  ];

  useEffect(() => {
    fetchData();

    return () => {
      isRendered = false;
    };
  }, [fgSOState.page, fgSOState.pageSize, showActivedData]);

  useEffect(() => {
    if (!_.isEmpty(newData) && !_.isEqual(newData, FGSOMasterDto)) {
      const data = [newData, ...fgSOState.data];
      if (data.length > fgSOState.pageSize) {
        data.pop();
      }
      if (isRendered)
        setFGSOState({
          ...fgSOState,
          data: [...data],
          totalRow: fgSOState.totalRow + 1,
        });
    }
  }, [newData]);

  useEffect(() => {
    if (!_.isEmpty(selectedRow) && !_.isEqual(selectedRow, FGSOMasterDto)) {
      let newArr = [...fgSOState.data];
      const index = _.findIndex(newArr, function (o) {
        return o.FGsoId == selectedRow.FGsoId;
      });
      if (index !== -1) {
        newArr[index] = selectedRow;
      }

      setFGSOState({
        ...fgSOState,
        data: [...newArr],
      });
    }
  }, [selectedRow]);

  return (
    <React.Fragment>
      <Grid container spacing={2} justifyContent="flex-end" alignItems="flex-end">
        <Grid item xs={2.5} className="d-flex">
          <MuiButton
            text="create"
            color="success"
            onClick={() => {
              toggleDialog(CREATE_ACTION);
            }}
          />
          <MuiButton
            disabled={FGsoId > 0 ? false : true}
            text="print"
            color="secondary"
            onClick={() => {
              toggle();
            }}
          />
        </Grid>

        <Grid item xs>
          <MuiSearchField
            label="material-so-master.MsoCode"
            name="FGsoCodeSearch"
            onClick={fetchData}
            onChange={(e) => changeSearchData(e, 'FGsoCodeSearch')}
          />
        </Grid>

        <Grid item xs>
          <MuiDateField
            disabled={fgSOState.isLoading}
            label={intl.formatMessage({
              id: 'general.StartSearchingDate',
            })}
            value={fgSOState.searchData.StartSearchingDate}
            onChange={(e) => {
              changeSearchData(e, 'StartSearchingDate');
            }}
            variant="standard"
          />
        </Grid>

        <Grid item xs>
          <MuiDateField
            disabled={fgSOState.isLoading}
            label={intl.formatMessage({
              id: 'general.EndSearchingDate',
            })}
            value={fgSOState.searchData.EndSearchingDate}
            onChange={(e) => {
              changeSearchData(e, 'EndSearchingDate');
            }}
            variant="standard"
          />
        </Grid>

        <Grid item xs={2.5}>
          <Grid container justifyContent="space-around" alignItems="flex-end">
            <Grid item>
              <MuiButton text="search" color="info" onClick={fetchData} />
            </Grid>

            <Grid item>
              <FormControlLabel
                sx={{ mb: 0, ml: '1px' }}
                control={<Switch defaultChecked={true} color="primary" onChange={(e) => handleshowActivedData(e)} />}
                label={showActivedData ? 'Actived' : 'Deleted'}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <MuiDataGrid
        showLoading={fgSOState.isLoading}
        isPagingServer={true}
        headerHeight={45}
        // rowHeight={30}
        // gridHeight={736}
        columns={columns}
        rows={fgSOState.data}
        page={fgSOState.page - 1}
        pageSize={fgSOState.pageSize}
        rowCount={fgSOState.totalRow}
        onPageChange={(newPage) => {
          setFGSOState({ ...fgSOState, page: newPage + 1 });
        }}
        getRowId={(rows) => rows.FGsoId}
        onSelectionModelChange={(newSelectedRowId) => {
          handleRowSelection(newSelectedRowId);
          setFGsoId(newSelectedRowId[0]);
          var row = fgSOState.data.find((x) => x.FGsoId == newSelectedRowId[0]);
          if (row) setFGSOStatus(row.FGsoStatus);
        }}
        getRowClassName={(params) => {
          if (_.isEqual(params.row, newData)) {
            return `Mui-created`;
          }
        }}
        initialState={{ pinnedColumns: { right: ['action'] } }}
      />

      <FGMasterSODialog
        setNewData={setNewData}
        setUpdateData={setSelectedRow}
        initModal={mode === CREATE_ACTION ? FGSOMasterDto : selectedRow}
        isOpen={isOpenDialog}
        onClose={toggleDialog}
        mode={mode}
      />

      <FGSODetail FGsoId={FGsoId} fromPicking={false} FGsoStatus={FGsoStatus} />

      {isShowing && <Material_Info isShowing={true} hide={toggle} FGsoId={FGsoId} />}
    </React.Fragment>
  );
};
const Material_Info = ({ isShowing, hide, FGsoId }) => {
  const [dataPrint, setDataPrint] = useState('');
  const [dialogState, setDialogState] = useState({ isSubmit: false });
  useEffect(async () => {
    const data = await fgSOService.getDataPrint({ FGsoId: FGsoId });
    setDataPrint(data);
  }, []);

  const utcDateTime = new Date().toUTCString();
  const componentPringtRef = React.useRef();
  const intl = useIntl();

  // const DialogTransition = React.forwardRef(function DialogTransition(props, ref) {
  //   return <Zoom direction="up" ref={ref} {...props} />;
  // });

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

  const handleCloseDialog = () => {
    hide();
  };

  return (
    <MuiDialog
      maxWidth="md"
      title={intl.formatMessage({ id: 'general.print' })}
      isOpen={isShowing}
      disabledCloseBtn={dialogState.isSubmit}
      disable_animate={300}
      onClose={handleCloseDialog}
      isShowButtonPrint
    >
      <DialogContent ref={componentPringtRef} sx={{ mt: 2 }}>
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
              {intl.formatMessage({ id: 'material-so-detail.MsoCode' })}: {dataPrint?.parent?.FGsoId}
            </Typography>
          </Grid>
          <Grid item xs={3.5} md={3.5} sx={{ border: '1px solid black', height: '60px', borderLeft: 'none' }}>
            <Box sx={{ borderBottom: '1px solid black' }}>
              <Typography sx={{ fontSize: '18px' }}>
                SO DueDate: {moment(dataPrint?.parent?.DueDate).format('YYYY-MM-DD')}
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: '18px' }}>
                {intl.formatMessage({ id: 'material-so-master.Requester' })}: {dataPrint?.parent?.Requester}
              </Typography>
            </Box>
          </Grid>
        </Grid>
        <Typography sx={{ fontSize: '20px', fontWeight: 600, margin: '5px 0px' }}>
          Material Detail List
          <span style={{ float: 'right' }}>
            <b>Date Time:</b> {moment(utcDateTime).format('YYYY-MM-DD HH:mm:ss')}
          </span>
        </Typography>
        <TableContainer>
          <Table sx={{ minWidth: 500 }} aria-label="custom pagination table">
            <TableBody>
              <TableRow>
                <TableCell style={style.titleCell}>
                  {intl.formatMessage({
                    id: 'material-so-detail.MaterialColorCode',
                  })}
                </TableCell>
                <TableCell style={style.titleCell}>
                  {intl.formatMessage({
                    id: 'general.description',
                  })}
                </TableCell>
                <TableCell style={style.titleCell} sx={{ whiteSpace: 'nowrap !important' }}>
                  {intl.formatMessage({ id: 'material-so-detail.SOrderQty' })}
                </TableCell>
                <TableCell style={style.titleCell}>
                  {intl.formatMessage({ id: 'material-so-detail.LotSerial' })}
                </TableCell>
                <TableCell style={style.titleCell}>
                  {intl.formatMessage({ id: 'material-so-detail.BinCode' })}
                </TableCell>
              </TableRow>
              {dataPrint?.detail?.map((item, index) => {
                return (
                  <>
                    <TableRow key={`FGSODetail_${index}`}>
                      <TableCell style={style.dataCell}>{item?.MaterialColorCode}</TableCell>
                      <TableCell style={style.dataCell}>{item?.Description}</TableCell>
                      <TableCell style={style.dataCell} sx={{ whiteSpace: 'nowrap !important' }}>
                        {item?.FGsoOrderQty}
                      </TableCell>
                      <TableCell style={style.dataCell} sx={{ whiteSpace: 'nowrap !important' }}>
                        {item?.LotSerial}
                      </TableCell>
                      <TableCell style={style.dataCell} sx={{ whiteSpace: 'nowrap !important' }}>
                        {item?.BinCode}
                      </TableCell>
                    </TableRow>
                  </>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <Typography sx={{ fontSize: '20px', fontWeight: 600, margin: '5px 0px', mt: 10 }}>Label List</Typography>
        <TableContainer>
          <Table sx={{ minWidth: 500 }} aria-label="custom pagination table">
            <TableBody>
              {dataPrint?.detail?.map((item, index) => {
                return (
                  <>
                    {item?.PId && (
                      <TableRow key={`FGSODetail_${index}_TEM`}>
                        <TableCell style={{ ...style.dataCell, textAlign: 'center', padding: '20px' }} colSpan={5}>
                          <Box style={{ border: '1px solid black', maxWidth: '450px', margin: 'auto' }}>
                            <Table>
                              <TableBody>
                                <TableRow>
                                  <TableCell style={{ ...style.styleBorderAndCenter, ...style.borderBot }}>
                                    CODE
                                  </TableCell>
                                  <TableCell
                                    colSpan={2}
                                    style={{ ...style.styleBorderAndCenter, ...style.borderBot }}
                                    sx={{ padding: '0px 3px !important' }}
                                  >
                                    <b style={{ fontSize: '22px' }}>{item?.MaterialColorCode}</b>
                                  </TableCell>
                                  <TableCell rowSpan={2} sx={{ textAlign: 'center' }} style={style.borderBot}>
                                    <QRCode value={`${item?.PId}`} size={80} />
                                  </TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell colSpan={3} style={{ ...style.styleBorderAndCenter, ...style.borderBot }}>
                                    {item?.MaterialDescription}
                                  </TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell style={{ ...style.styleBorderAndCenter, ...style.borderBot }}>
                                    QTY
                                  </TableCell>
                                  <TableCell
                                    style={{ ...style.styleBorderAndCenter, ...style.borderBot }}
                                    sx={{ padding: '0px 3px !important' }}
                                  >
                                    <b style={{ fontSize: '22px' }}>{item.PQty + ' ' + item.UnitName} </b>
                                  </TableCell>
                                  <TableCell style={{ ...style.styleBorderAndCenter, ...style.borderBot }}>
                                    VENDOR
                                  </TableCell>
                                  <TableCell
                                    sx={{ textAlign: 'center', padding: '5px !important' }}
                                    style={style.borderBot}
                                  >
                                    HANLIM
                                  </TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell style={{ ...style.styleBorderAndCenter, ...style.borderBot }}>
                                    LOT No.
                                  </TableCell>
                                  <TableCell colSpan={2} style={{ ...style.styleBorderAndCenter, ...style.borderBot }}>
                                    {item?.PId}
                                  </TableCell>
                                  <TableCell sx={{ textAlign: 'center' }} style={style.borderBot}>
                                    {item?.QCResult ? 'OK' : 'NG'}
                                  </TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell
                                    style={{ ...style.styleBorderAndCenter, ...style.borderBot, padding: 5 }}
                                    sx={{ whiteSpace: 'nowrap' }}
                                  >
                                    <p style={{ margin: 0 }}>
                                      {moment(item?.createdDate).add(7, 'hours').format('YYYY-MM-DD')}
                                    </p>
                                    {moment(item?.createdDate).add(7, 'hours').format('hh:mm:ss')}
                                  </TableCell>
                                  <TableCell rowSpan={2} colSpan={3} sx={{ textAlign: 'center' }}>
                                    <b style={{ fontSize: '22px' }}>{item?.PLotSerial}</b>
                                  </TableCell>
                                </TableRow>
                                <TableRow style={{ borderBottom: '1px solid black' }}>
                                  <TableCell style={style.styleBorderAndCenter} sx={{ padding: '10px' }}>
                                    {`W${moment(item.QCDate).week()} / T${moment(item.QCDate).format('MM')}`}
                                  </TableCell>
                                </TableRow>
                              </TableBody>
                            </Table>
                          </Box>
                        </TableCell>
                      </TableRow>
                    )}
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

export default connect(mapStateToProps, mapDispatchToProps)(FGSOMaster);
