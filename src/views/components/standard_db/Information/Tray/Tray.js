import { useModal, useModal2 } from '@basesShared';
import { CREATE_ACTION, UPDATE_ACTION } from '@constants/ConfigConstants';
import { MuiAutocomplete, MuiButton, MuiDataGrid, MuiSearchField } from '@controls';
import CloseIcon from '@mui/icons-material/Close';
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
  Grid,
  IconButton,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableRow,
  Typography,
  Zoom,
} from '@mui/material';
import { GRID_CHECKBOX_SELECTION_COL_DEF } from '@mui/x-data-grid-pro';
import { trayService } from '@services';
import { ErrorAlert, SuccessAlert } from '@utils';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import QRCode from 'react-qr-code';
import ReactToPrint from 'react-to-print';
import TrayDialog from './TrayDialog';

export default function Tray() {
  const intl = useIntl();
  let isRendered = useRef(true);
  const [mode, setMode] = useState(CREATE_ACTION);
  const { isShowing2, toggle2 } = useModal2();
  const { isShowing, toggle } = useModal();
  const [rowSelected, setRowSelected] = useState([]);
  const [trayState, setTrayState] = useState({
    isLoading: false,
    data: [],
    totalRow: 0,
    page: 1,
    pageSize: 20,
    searchData: {
      keyWord: '',
      TrayType: null,
      showDelete: true,
    },
  });
  const [newData, setNewData] = useState({});
  const [updateData, setUpdateData] = useState({});
  const [rowData, setRowData] = useState({});
  const [TrayTypeList, setTrayTypeList] = useState([]);
  const QrCode = (params) => {
    toggle2();
  };

  const columns = [
    {
      field: 'id',
      headerName: '',
      width: 70,
      align: 'center',
      filterable: false,
      renderCell: (index) => index.api.getRowIndex(index.row.TrayId) + 1 + (trayState.page - 1) * trayState.pageSize,
    },
    { field: 'TrayId', hide: true },
    // { field: "row_version", hide: true },
    {
      field: 'action',
      headerName: '',
      width: 80,
      disableClickEventBubbling: true,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => {
        return (
          <Grid container spacing={1} alignItems="center" justifyContent="center">
            <Grid item xs={6} style={{ textAlign: 'center' }}>
              <IconButton
                aria-label="delete"
                color="error"
                size="small"
                sx={[{ '&:hover': { border: '1px solid red' } }]}
                onClick={() => handleDelete(params.row)}
              >
                {params.row.isActived ? <DeleteIcon fontSize="inherit" /> : <UndoIcon fontSize="inherit" />}
              </IconButton>
            </Grid>
            <Grid item xs={6} style={{ textAlign: 'center' }}>
              <IconButton
                aria-label="edit"
                color="warning"
                size="small"
                sx={[{ '&:hover': { border: '1px solid orange' } }]}
                onClick={() => handleUpdate(params.row)}
              >
                <EditIcon fontSize="inherit" />
              </IconButton>
            </Grid>
          </Grid>
        );
      },
    },
    {
      field: 'TrayCode',
      headerName: intl.formatMessage({ id: 'tray.TrayCode' }),
      width: 150,
    },
    {
      field: 'TrayTypeName',
      headerName: intl.formatMessage({ id: 'tray.TrayType' }),
      width: 150,
    },
    {
      field: 'IsReuse',
      headerName: intl.formatMessage({ id: 'tray.IsReuse' }),
      width: 80,
      align: 'center',
      renderCell: (params) => (params.row.IsReuse ? 'Y' : 'N'),
    },
    {
      field: 'createdName',
      headerName: intl.formatMessage({ id: 'general.createdName' }),
      width: 150,
    },
    {
      field: 'createdDate',
      headerName: intl.formatMessage({ id: 'general.createdDate' }),
      width: 150,
      valueFormatter: (params) =>
        params?.value ? moment(params?.value).add(7, 'hours').format('YYYY-MM-DD HH:mm:ss') : null,
    },
    {
      field: 'modifiedName',
      headerName: intl.formatMessage({ id: 'general.modifiedName' }),
      width: 150,
    },
    {
      field: 'modifiedDate',
      headerName: intl.formatMessage({ id: 'general.modifiedDate' }),
      width: 150,
      valueFormatter: (params) =>
        params?.value ? moment(params?.value).add(7, 'hours').format('YYYY-MM-DD HH:mm:ss') : null,
    },
  ];

  //useEffect

  useEffect(() => {
    fetchData();
    return () => {
      isRendered = false;
    };
  }, [trayState.page, trayState.pageSize, trayState.searchData.showDelete]);

  useEffect(() => {
    if (!_.isEmpty(newData) && isRendered) {
      const data = [newData, ...trayState.data];
      if (data.length > trayState.pageSize) {
        data.pop();
      }
      setTrayState({
        ...trayState,
        data: [...data],
        totalRow: trayState.totalRow + 1,
      });
    }
  }, [newData]);

  useEffect(() => {
    if (!_.isEmpty(updateData) && !_.isEqual(updateData, rowData) && isRendered) {
      let newArr = [...trayState.data];
      const index = _.findIndex(newArr, function (o) {
        return o.TrayId == updateData.TrayId;
      });
      if (index !== -1) {
        newArr[index] = updateData;
      }

      setTrayState({ ...trayState, data: [...newArr] });
    }
  }, [updateData]);

  //handle
  const handleDelete = async (tray) => {
    if (
      window.confirm(
        intl.formatMessage({
          id: tray.isActived ? 'general.confirm_delete' : 'general.confirm_redo_deleted',
        })
      )
    ) {
      try {
        let res = await trayService.deleteTray({
          TrayId: tray.TrayId,
          row_version: tray.row_version,
        });
        if (res && res.HttpResponseCode === 200) {
          SuccessAlert(intl.formatMessage({ id: 'general.success' }));
          await fetchData();
        } else {
          ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleAdd = () => {
    setMode(CREATE_ACTION);
    setRowData();
    toggle();
  };

  const handleUpdate = (row) => {
    setMode(UPDATE_ACTION);
    setRowData({ ...row });
    toggle();
  };

  const handleSearch = (e, inputName) => {
    let newSearchData = { ...trayState.searchData };
    newSearchData[inputName] = e;
    if (inputName == 'showDelete') {
      setTrayState({ ...trayState, page: 1, searchData: { ...newSearchData } });
    } else {
      setTrayState({ ...trayState, searchData: { ...newSearchData } });
    }
  };

  async function fetchData() {
    setTrayState({ ...trayState, isLoading: true });
    const params = {
      page: trayState.page,
      pageSize: trayState.pageSize,
      keyWord: trayState.searchData.keyWord,
      TrayType: trayState.searchData.TrayType,
      showDelete: trayState.searchData.showDelete,
    };
    const res = await trayService.getTrayList(params);
    if (res && res.Data && isRendered)
      setTrayState({
        ...trayState,
        data: res.Data ?? [],
        totalRow: res.TotalRow,
        isLoading: false,
      });
  }

  return (
    <React.Fragment>
      <Grid container direction="row" justifyContent="space-between" alignItems="width-end">
        <Grid item xs={3}>
          <MuiButton text="create" color="success" onClick={handleAdd} sx={{ mt: 1 }} />
          <Button
            disabled={rowSelected.length > 0 ? false : true}
            variant="contained"
            color="secondary"
            onClick={() => QrCode()}
            sx={{ marginTop: '5px', mx: 2 }}
          >
            Print QR Code
          </Button>
        </Grid>
        <Grid item xs>
          <Grid container columnSpacing={2} direction="row" justifyContent="flex-end" alignItems="flex-end">
            <Grid item style={{ width: '21%' }}>
              <MuiSearchField
                fullWidth
                variant="keyWord"
                label="general.code"
                onClick={fetchData}
                onChange={(e) => handleSearch(e.target.value, 'keyWord')}
              />
            </Grid>
            <Grid item style={{ width: '21%' }}>
              <MuiAutocomplete
                label={intl.formatMessage({ id: 'tray.TrayType' })}
                fetchDataFunc={trayService.GetTrayType}
                displayLabel="commonDetailName"
                displayValue="commonDetailId"
                onChange={(e, item) => handleSearch(item ? item.commonDetailId ?? null : null, 'TrayType')}
                variant="standard"
              />
            </Grid>
            <Grid item>
              <MuiButton text="search" color="info" onClick={fetchData} sx={{ mt: 1, mr: 2 }} />
            </Grid>
          </Grid>
        </Grid>

        <Grid item>
          <FormControlLabel
            sx={{ mt: 1 }}
            control={
              <Switch
                defaultChecked={true}
                color="primary"
                onChange={(e) => handleSearch(e.target.checked, 'showDelete')}
              />
            }
            label={intl.formatMessage({
              id: trayState.searchData.showDelete ? 'general.data_actived' : 'general.data_deleted',
            })}
          />
        </Grid>
      </Grid>
      <MuiDataGrid
        onSelectionModelChange={(ids) => {
          setRowSelected(ids);
        }}
        disableSelectionOnClick
        checkboxSelection
        showLoading={trayState.isLoading}
        isPagingServer={true}
        headerHeight={45}
        columns={columns}
        rows={trayState.data}
        gridHeight={736}
        page={trayState.page - 1}
        pageSize={trayState.pageSize}
        rowCount={trayState.totalRow}
        onPageChange={(newPage) => setTrayState({ ...trayState, page: newPage + 1 })}
        getRowId={(rows) => rows.TrayId}
        getRowClassName={(params) => {
          if (_.isEqual(params.row, newData)) return `Mui-created`;
        }}
        initialState={{
          pinnedColumns: {
            left: [GRID_CHECKBOX_SELECTION_COL_DEF.field, 'id', 'TrayCode', 'TrayTypeName'],
            right: ['action'],
          },
        }}
      />

      <TrayDialog
        setNewData={setNewData}
        setUpdateData={setUpdateData}
        initModal={rowData}
        isOpen={isShowing}
        onClose={toggle}
        mode={mode}
        fetchData={fetchData}
      />
      {isShowing2 && <Modal_Qr_Code isShowing={true} hide={toggle2} rowSelected={rowSelected} />}
    </React.Fragment>
  );
}

const Modal_Qr_Code = ({ isShowing, hide, rowSelected }) => {
  const DialogTransition = React.forwardRef(function DialogTransition(props, ref) {
    return <Zoom direction="up" ref={ref} {...props} />;
  });
  const componentPringtRef = React.useRef();
  const [listPrint, setListPrint] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(async () => {
    setIsLoading(true);
    const res = await trayService.GetListPrintQR(rowSelected);
    setListPrint(res.Data);
    setIsLoading(false);
  }, []);

  return (
    <React.Fragment>
      {!isLoading && (
        <Dialog
          open={isShowing}
          maxWidth="sm"
          fullWidth
          TransitionComponent={DialogTransition}
          transitionDuration={300}
        >
          <DialogTitle
            sx={{
              p: 1,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <Typography sx={{ fontWeight: 600, fontSize: '22px' }}>QR CODE</Typography>
            <IconButton
              aria-label="delete"
              size="small"
              onClick={() => hide()}
              sx={{ backgroundColor: 'rgba(0,0,0,0.1)' }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent ref={componentPringtRef} sx={{ display: 'flex', justifyContent: 'center' }}>
            <Box>
              {listPrint?.reverse()?.map((item, index) => {
                return (
                  <Box
                    key={`TRAY_${index}`}
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      mb: 1,
                      pb: 1,
                      pageBreakAfter: 'always',
                    }}
                  >
                    <Box sx={{ mr: 2 }}>
                      <QRCode value={`${item.TrayCode}`} size={80} />
                    </Box>
                    <TableContainer>
                      <Table>
                        <TableBody>
                          <TableRow>
                            <TableCell sx={{ fontSize: '12px', border: 'none', padding: '2px 0px 2px 0px' }}>
                              Tray Code: {item?.TrayCode}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ fontSize: '12px', border: 'none', padding: '2px 0px 2px 0px' }}>
                              Tray Type Name: {item?.TrayTypeName}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ fontSize: '12px', border: 'none', padding: '2px 0px 2px 0px' }}>
                              Created By: {item?.createdName}
                            </TableCell>
                          </TableRow>
                          <TableRow>
                            <TableCell sx={{ fontSize: '12px', border: 'none', padding: '2px 0px 2px 0px' }}>
                              Created Date: {moment(item?.createdDate).add(7, 'hours').format('YYYY-MM-DD HH:mm:ss')}
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
          <DialogActions sx={{ pt: 0 }}>
            <ReactToPrint
              trigger={() => {
                return (
                  <Button variant="contained" color="primary">
                    Print
                  </Button>
                );
              }}
              content={() => componentPringtRef.current}
            />
          </DialogActions>
        </Dialog>
      )}
    </React.Fragment>
  );
};
