import React, { useState, useRef, useEffect } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { CombineStateToProps, CombineDispatchToProps } from "@plugins/helperJS";
import { User_Operations } from "@appstate/user";
import { Store } from "@appstate";
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
  Zoom
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import UndoIcon from "@mui/icons-material/Undo";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  MuiButton,
  MuiDataGrid,
  MuiSearchField,
  MuiDateField,
} from "@controls";
import { useIntl } from "react-intl";
import moment from "moment";
import IQCDialog from "./IQCDialog";
import { LotDto } from "@models";
import { CREATE_ACTION, UPDATE_ACTION } from "@constants/ConfigConstants";
import { useModal, useModal2 } from "@basesShared";
import { iqcService } from "@services";
import { ErrorAlert, SuccessAlert, addDays } from "@utils";
import ReactToPrint from "react-to-print";
import CloseIcon from "@mui/icons-material/Close";
import QRCode from "react-qr-code";
import { gridColumnReorderDragColSelector } from "@mui/x-data-grid-pro";

const IQC = (props) => {
  const intl = useIntl();
  const [mode, setMode] = useState(CREATE_ACTION);
  const [rowData, setRowData] = useState({ ...LotDto });
  const { isShowing, toggle } = useModal();
  const { isShowing2, toggle2 } = useModal2();
  const [newData, setNewData] = useState({ ...LotDto });
  const [updateData, setUpdateData] = useState({});
  let isRendered = useRef(true);
  const initETDLoad = new Date();
  const [rowSelected, setRowSelected] = useState([]);
  const [iqcState, setIQCState] = useState({
    isLoading: false,
    data: [],
    totalRow: 0,
    page: 1,
    pageSize: 20,
    searchData: {
      keyWord: "",
      showDelete: true,
      searchStartDay: addDays(initETDLoad, -1),
      searchEndDay: initETDLoad,
    },
  });
  const columns = [
    { field: "Id", headerName: "", hide: true },
    {
      field: "id",
      headerName: "",
      width: 80,
      filterable: false,
      renderCell: (index) =>
        index.api.getRowIndex(index.row.Id) +
        1 +
        (iqcState.page - 1) * iqcState.pageSize,
    },
    {
      field: "action",
      headerName: "",
      width: 80,
      disableClickEventBubbling: true,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => {
        return (
          <Grid
            container
            spacing={1}
            alignItems="center"
            justifyContent="center"
          >
            <Grid item xs={6} style={{ textAlign: "center" }}>
              <IconButton
                aria-label="delete"
                color="error"
                size="small"
                sx={[{ "&:hover": { border: "1px solid red" } }]}
                onClick={() => handleDelete(params.row)}
              >
                {params.row.isActived ? (
                  <DeleteIcon fontSize="inherit" />
                ) : (
                  <UndoIcon fontSize="inherit" />
                )}
              </IconButton>
            </Grid>

            <Grid item xs={6} style={{ textAlign: "center" }}>
              <IconButton
                aria-label="edit"
                color="warning"
                size="small"
                sx={[{ "&:hover": { border: "1px solid orange" } }]}
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
      field: "LotCode",
      headerName: "Lot Code",
      width: 200,
      hide:false
    },

    {
      field: "MaterialCode",
      headerName: "Material Code",
      width: 170,
    },
    {
      field: "LotSerial",
      headerName: "Lot Serial",
      width: 170,
    },
    {
      field: "Qty",
      headerName: "Qty",
      width: 100,
    },
    {
      field: "QCDate",
      headerName: "QC Date",
      width: 150,
      valueFormatter: (params) => {
        if (params.value !== null) {
          return moment(params?.value)
            .add(7, "hours")
            .format("YYYY-MM-DD HH:mm:ss");
        }
      },
    },
    {
      field: "QCResult",
      headerName: "QC Result",
      width: 100,
      renderCell: (params) => {
        return params.row.QCResult == true ? (
          <Typography sx={{ fontSize: "14px" }}>
            <b>OK</b>
          </Typography>
        ) : (
          <Typography sx={{ fontSize: "14px", color:"red" }}>
            <b>NG</b>
          </Typography>
        );
      },
    },
    {
      field: "createdName",
      headerName: intl.formatMessage({ id: "general.createdName" }),
      width: 150,
    },
    {
      field: "createdDate",
      headerName: intl.formatMessage({ id: "general.created_date" }),
      width: 150,
      valueFormatter: (params) => {
        if (params.value !== null) {
          return moment(params?.value)
            .add(7, "hours")
            .format("YYYY-MM-DD HH:mm:ss");
        }
      },
    },
    {
      field: "modifiedName",
      headerName: intl.formatMessage({ id: "general.modifiedName" }),
      width: 150,
    },
    {
      field: "modifiedDate",
      headerName: intl.formatMessage({ id: "general.modified_date" }),
      width: 150,
      valueFormatter: (params) => {
        if (params.value !== null) {
          return moment(params?.value)
            .add(7, "hours")
            .format("YYYY-MM-DD HH:mm:ss");
        }
      },
    },
  ];
  const handleAdd = () => {
    setMode(CREATE_ACTION);
    setRowData({ ...LotDto });
    toggle();
  };
  const handleUpdate = (row) => {
    setMode(UPDATE_ACTION);
    setRowData({ ...row });
    toggle();
  };
  const handleDelete = async (iqc) => {
    if (
      window.confirm(
        intl.formatMessage({
          id: iqc.isActived
            ? "general.confirm_delete"
            : "general.confirm_redo_deleted",
        })
      )
    ) {
      try {
        let res = await iqcService.deleteIQC({
          Id: iqc.Id,
          row_version: iqc.row_version,
        });
        if (res && res.HttpResponseCode === 200) {
          SuccessAlert(intl.formatMessage({ id: "general.success" }));
          await fetchData();
        } else {
          ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
        }
      } catch (error) {
        console.log(error);
      }
    }
  };
  const handleSearch = (e, inputName) => {
    let newSearchData = { ...iqcState.searchData };

    newSearchData[inputName] = e;
    if (inputName == "showDelete") {
      setIQCState({
        ...iqcState,
        page: 1,
        searchData: { ...newSearchData },
      });
    } else {
      setIQCState({ ...iqcState, searchData: { ...newSearchData } });
    }
  };


  async function fetchData() {
    // if (
    //   iqcState.searchData.searchStartDay >
    //   iqcState.searchData.searchEndDay &&
    //   iqcState.searchData.searchEndDay != null
    // ) {
    //   ErrorAlert(intl.formatMessage({ id: "lot.DaySearchNotValid" }));
    //   return;
    // }
    setIQCState({ ...iqcState, isLoading: true });
    const params = {
      page: iqcState.page,
      pageSize: iqcState.pageSize,
      keyWord: iqcState.searchData.keyWord,
      searchStartDay: iqcState.searchData.searchStartDay,
      searchEndDay: iqcState.searchData.searchEndDay,
      showDelete: iqcState.searchData.showDelete,
    };

    const res = await iqcService.getIQCList(params);
    if (res && res.Data && isRendered)
      setIQCState({
        ...iqcState,
        data: res.Data ?? [],
        totalRow: res.TotalRow,
        isLoading: false,
      });
  }

  const handleRowSelection = (arrIds) => {
    const rowSelected = iqcState.data.filter(function (item) {
      return arrIds.includes(item.Id);
      // return _.findIndex(iqcState.data, function(o) { return o.user == 'barney'; });
    });
    setRowSelected(rowSelected)
    // console.log('rowSelected', rowSelected)

    // if (rowSelected && rowSelected.length > 0) {
    //   setSelectedRow({ ...rowSelected[0] });
    // } else {
    //   setSelectedRow({ ...WorkOrderDto });
    // }
  };

  useEffect(() => {
    return () => {
      isRendered = false;
    };
  }, []);
  useEffect(() => {
    fetchData();
  }, [iqcState.page, iqcState.pageSize, iqcState.searchData.showDelete]);
  useEffect(() => {
    if (!_.isEmpty(newData) && isRendered && !_.isEqual(newData, LotDto)) {
      const data = [newData, ...iqcState.data];
      if (data.length > iqcState.pageSize) {
        data.pop();
      }
      setIQCState({
        ...iqcState,
        data: [...data],
        totalRow: iqcState.totalRow + 1,
      });
    }
  }, [newData]);

  useEffect(() => {
    if (
      !_.isEmpty(updateData) &&
      !_.isEqual(updateData, rowData) &&
      isRendered
    ) {
      let newArr = [...iqcState.data];
      const index = _.findIndex(newArr, function (o) {
        return o.Id == updateData.Id;
      });
      if (index !== -1) {
        newArr[index] = updateData;
      }
      setIQCState({ ...iqcState, data: [...newArr] });
    }
  }, [updateData]);

  return (
    <React.Fragment>
      <Grid
        container
        direction="row"
        justifyContent="space-between"
        alignItems="center"
      >
        <Grid item>
          <MuiButton text="create" color="success" onClick={handleAdd} />
          <Button
            disabled={rowSelected.length > 0 ? false : true}
            variant="contained"
            color="secondary"
            onClick={() => toggle2()} sx={{ mx: 2 }}>Print QR Code</Button>
        </Grid>
        <Grid item>
          <Grid container spacing={2} justifyContent="center">
            <Grid item>
              <MuiDateField
                disabled={iqcState.isLoading}
                label="Start QC Date"
                value={iqcState.searchData.searchStartDay}
                onChange={(e) => {
                  handleSearch(e, "searchStartDay");
                }}
                variant="standard"
              />
            </Grid>
            <Grid item>
              <MuiDateField
                disabled={iqcState.isLoading}
                label="End QC Date"
                value={iqcState.searchData.searchEndDay}
                onChange={(e) => {
                  handleSearch(e, "searchEndDay");
                }}
                variant="standard"
              />
            </Grid>
            <Grid item>
              <MuiSearchField
                label="general.code"
                name="Code"
                onClick={fetchData}
                onChange={(e) => handleSearch(e.target.value, "keyWord")}
              />
            </Grid>
            <Grid item>
              <MuiButton text="search" color="info" onClick={fetchData} />
            </Grid>
            <Grid item>
              <FormControlLabel
                sx={{ mt: 0.5 }}
                control={
                  <Switch
                    defaultChecked={true}
                    color="primary"
                    onChange={(e) =>
                      handleSearch(e.target.checked, "showDelete")
                    }
                  />
                }
                label={intl.formatMessage({
                  id: iqcState.searchData.showDelete
                    ? "general.data_actived"
                    : "general.data_deleted",
                })}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <MuiDataGrid
        showLoading={iqcState.isLoading}
        isPagingServer={true}
        headerHeight={45}
        disableSelectionOnClick
        checkboxSelection
        columns={columns}
        rows={iqcState.data}
        page={iqcState.page - 1}
        pageSize={iqcState.pageSize}
        rowCount={iqcState.totalRow}
        onSelectionModelChange={(ids) => {
          // setRowSelected(ids)
          handleRowSelection(ids)
        }}
        onPageChange={(newPage) => {
          setIQCState({ ...iqcState, page: newPage + 1 });
        }}
        getRowId={(rows) => rows.Id}
        getRowClassName={(params) => {
          if (_.isEqual(params.row, newData)) {
            return `Mui-created`;
          }
        }}
        initialState={{ pinnedColumns: { right: ["action"] } }}
      />
      <IQCDialog
        initModal={rowData}
        setNewData={setNewData}
        setUpdateData={setUpdateData}
        isOpen={isShowing}
        onClose={toggle}
        mode={mode}
      />
     {isShowing2 && ( 
        <Modal_Qr_Code
          isShowing={true}
          hide={toggle2}
          rowSelected={rowSelected}
        />
      )} 
    </React.Fragment>
  );
};
const Modal_Qr_Code = ({ isShowing, hide, rowSelected }) => {

  const DialogTransition = React.forwardRef(function DialogTransition(props, ref) {
    return <Zoom direction="up" ref={ref} {...props} />;
  })
  const componentPringtRef = React.useRef();
  const [listPrint, setListPrint] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  useEffect(async () => {
    setIsLoading(true)
    setListPrint(rowSelected)
    setIsLoading(false)
  }, []);
  const style = {
    styleBorderAndCenter : {
      borderRight:"1px solid black",
     textAlign:"center",

    },
    borderBot : {
        borderBottom:"1px solid black",
        padding:"10px"
    }
  }
  const getWeekByCreatedDate = (date) => {
    let todaydate = new Date(date);
    let oneJan = new Date(todaydate.getFullYear(), 0, 1);
    let numberOfDays = Math.floor((todaydate - oneJan) / (24 * 60 * 60 * 1000));
    let curWeek = Math.ceil((todaydate.getDay() + 1 + numberOfDays) / 7);
    return curWeek;
  }
  return (
    <React.Fragment>
      {!isLoading && <Dialog open={isShowing} maxWidth="md" fullWidth TransitionComponent={DialogTransition} transitionDuration={300}>
        <DialogTitle
          sx={{
            p: 1,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography sx={{ fontWeight: 600, fontSize: "22px" }}>
            QR CODE
          </Typography>
          <IconButton
            aria-label="delete"
            size="small"
            onClick={() => hide()}
            sx={{ backgroundColor: "rgba(0,0,0,0.1)" }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent
          ref={componentPringtRef}
          sx={{ display: "flex", justifyContent: "center" }}
        >
          <Box >
          {
            listPrint?.map((item, index) =>{
              return (
                <Box sx={{border:"1px solid black", mb:2}} key={`IQCQRCODE_${index}`}>
                <TableContainer sx={{overflowX:"hidden"}}>
                  <Table>
                    <TableBody>
                      <TableRow >
                          <TableCell style={{...style.styleBorderAndCenter,...style.borderBot}}>CODE</TableCell>
                          <TableCell colSpan={2} style={{...style.styleBorderAndCenter,...style.borderBot}}>
                            <b style={{fontSize:"24px"}}>{item?.MaterialColorCode}</b>
                            </TableCell> 
                           <TableCell rowSpan={2} sx={{ textAlign:"center"}} style={style.borderBot} >
                           <QRCode value={`${item?.LotCode}`} size={80} />
                           </TableCell>
                      </TableRow>
                      <TableRow>
                          <TableCell colSpan={3} style={{...style.styleBorderAndCenter,...style.borderBot}}>{item?.Description}</TableCell>
                      </TableRow>
                      <TableRow>
                          <TableCell  style={{...style.styleBorderAndCenter,...style.borderBot}} >QTY</TableCell>
                          <TableCell  style={{...style.styleBorderAndCenter,...style.borderBot}}>
                            <b style={{fontSize:"24px"}}>{`${item?.Qty} ${item?.Unit}`} </b>
                            </TableCell>
                          <TableCell  style={{...style.styleBorderAndCenter,...style.borderBot}}>VENDOR</TableCell>
                          <TableCell sx={{textAlign:"center"}}  style={style.borderBot}>{item?.SupplierCode}</TableCell>
                      </TableRow>
                      <TableRow>
                          <TableCell style={{...style.styleBorderAndCenter,...style.borderBot}}>LOT No.</TableCell>
                          <TableCell style={{...style.styleBorderAndCenter,...style.borderBot}} sx={{backgroundColor:"yellow"}}></TableCell>
                          <TableCell style={{...style.styleBorderAndCenter,...style.borderBot}}>20212221</TableCell>
                          <TableCell  sx={{textAlign:"center"}}  style={style.borderBot}>{item?.QCResult?"OK":"NG"}</TableCell>
                      </TableRow>
                      <TableRow>
                          <TableCell style={{...style.styleBorderAndCenter,...style.borderBot}}>
                            {moment(item?.createdDate).add(7, "hours").format("YYYY-MM-DD")}
                          </TableCell>
                          <TableCell rowSpan={2} colSpan={2} sx={{textAlign:"center"}}>
                          <b style={{fontSize:"24px"}}>{item?.LotSerial}</b>
                          </TableCell>
                      </TableRow>
                      <TableRow>
                          <TableCell  style={style.styleBorderAndCenter} sx={{padding:"10px"}}>
                            W{getWeekByCreatedDate(item?.createdDate)} / T{moment(item?.createdDate).add(7, "hours").format("MM")}
                          </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </TableContainer>
             </Box>
              )
            })
          }
          </Box>
        </DialogContent>
        <DialogActions sx={{ pt: 1}}>
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
      </Dialog>}
    </React.Fragment>
  );
};
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

export default connect(mapStateToProps, mapDispatchToProps)(IQC);
