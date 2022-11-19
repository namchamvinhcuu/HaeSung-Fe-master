import React, { useEffect, useRef, useState } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { CombineStateToProps, CombineDispatchToProps } from "@plugins/helperJS";
import { User_Operations } from "@appstate/user";
import { Store } from "@appstate";
import { CREATE_ACTION, UPDATE_ACTION } from "@constants/ConfigConstants";
import {
  MuiAutocomplete,
  MuiButton,
  MuiDataGrid,
  MuiDateField,
  MuiSearchField,
} from "@controls";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import { addDays, ErrorAlert, SuccessAlert, isNumber } from "@utils";
import _ from "lodash";
import moment from "moment";
import { useIntl } from "react-intl";
import { materialSOService } from "@services";
import { MaterialSOMasterDto, MaterialSODetailDto } from "@models";
import MaterialSODetailDialog from "./MaterialSODetailDialog";
import { useModal, useModal2 } from "@basesShared";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Tooltip,
  Typography,
} from "@mui/material";
import { memo } from "react";
import CloseIcon from "@mui/icons-material/Close";

import axios from "axios";

const MaterialSODetail = ({ MsoId, fromPicking, MsoStatus }) => {
  let isRendered = useRef(true);
  const { isShowing2, toggle2 } = useModal2();
  const intl = useIntl();
  const [mode, setMode] = useState(CREATE_ACTION);
  const { isShowing, toggle } = useModal();
  const [rowData, setRowData] = useState({ ...MaterialSODetailDto });
  const [updateData, setUpdateData] = useState({});
  const [materialSODetailState, setMaterialSODetailState] = useState({
    isLoading: false,
    data: [],
    totalRow: 0,
    page: 1,
    pageSize: 8,
    searchData: {
      ...MaterialSODetailDto,
      MaterialCode: "",
      isActived: true,
    },
    MsoId: MsoId,
  });

  const [newData, setNewData] = useState({ ...MaterialSODetailDto });
  const [newDataArr, setNewDataArr] = useState([]);
  const [rowConfirm, setRowConfirm] = useState([]);

  useEffect(() => {
    fetchData(MsoId);
  }, [
    materialSODetailState.page,
    materialSODetailState.pageSize,
    MsoId,
    materialSODetailState.searchData.isActived,
  ]);

  useEffect(() => {
    if (isRendered && newDataArr.length) {
      const data = [...newDataArr, ...materialSODetailState.data];
      while (data.length > materialSODetailState.pageSize) {
        data.pop();
      }
      setMaterialSODetailState({
        ...materialSODetailState,
        data: [...data],
        totalRow: materialSODetailState.totalRow + newDataArr.length,
      });
    }
  }, [newDataArr]);

  useEffect(() => {
    if (
      !_.isEmpty(updateData) &&
      !_.isEqual(updateData, rowData) &&
      isRendered
    ) {
      let newArr = [...materialSODetailState.data];
      const index = _.findIndex(newArr, function (o) {
        return o.MsoDetailId == updateData.MsoDetailId;
      });
      if (index !== -1) {
        newArr[index] = updateData;
      }
      setMaterialSODetailState({ ...materialSODetailState, data: [...newArr] });
    }
  }, [updateData]);

  const handleDelete = async (materialSODetail) => {
    if (
      window.confirm(
        intl.formatMessage({
          id: materialSODetail.isActived
            ? "general.confirm_delete"
            : "general.confirm_redo_deleted",
        })
      )
    ) {
      try {
        let res = await materialSOService.handleDeleteSODetail({
          MsoDetailId: materialSODetail.MsoDetailId,
          row_version: materialSODetail.row_version,
        });
        if (res) {
          if (res && res.HttpResponseCode === 200) {
            await fetchData(MsoId);
          } else {
            ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
          }
        } else {
          ErrorAlert(intl.formatMessage({ id: "general.system_error" }));
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const fetchData = async (MsoId) => {
    setNewDataArr([]);
    setMaterialSODetailState({ ...materialSODetailState, isLoading: true });
    const params = {
      page: materialSODetailState.page,
      pageSize: materialSODetailState.pageSize,
      MaterialCode: materialSODetailState.searchData.MaterialCode,
      isActived: materialSODetailState.searchData.isActived,
      MsoId: MsoId,
    };

    const res = await materialSOService.getMsoDetails(params);
    if (res && res.Data && isRendered)
      setMaterialSODetailState({
        ...materialSODetailState,
        data: res.Data ?? [],
        totalRow: res.TotalRow,
        isLoading: false,
      });
  };

  const columns = [
    { field: "MsoDetailId", headerName: "", hide: true },
    // { field: "MsoId", headerName: "", hide: true },
    // { field: "MaterialId", headerName: "", hide: true },

    {
      field: "id",
      headerName: "",
      width: 100,
      filterable: false,
      renderCell: (index) =>
        index.api.getRowIndex(index.row.MsoDetailId) +
        1 +
        (materialSODetailState.page - 1) * materialSODetailState.pageSize,
    },

    {
      field: "action",
      headerName: "",
      width: 80,
      // headerAlign: 'center',
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
            <Grid item xs={6}>
              <IconButton
                aria-label="delete"
                color="error"
                size="small"
                disabled={params.row.MsoDetailStatus == false ? false : true}
                sx={[{ "&:hover": { border: "1px solid red" } }]}
                onClick={() => handleDelete(params.row)}
              >
                <DeleteIcon fontSize="inherit" />
              </IconButton>
            </Grid>
          </Grid>
        );
      },
    },

    {
      field: "MsoCode",
      headerName: intl.formatMessage({ id: "material-so-detail.MsoCode" }),
      /*flex: 0.7,*/ width: 150,
    },

    {
      field: "MaterialColorCode",
      headerName: intl.formatMessage({
        id: "material-so-detail.MaterialColorCode",
      }),
      /*flex: 0.7,*/ width: 200,
    },
    {
      field: "SOrderQty",
      headerName: intl.formatMessage({ id: "material-so-detail.SOrderQty" }),
      /*flex: 0.7,*/ width: 150, editable: true,
      renderCell: (params) => {
        return (
          <Tooltip title={params.row.MsoDetailStatus ? "" : intl.formatMessage({ id: "material-so-detail.SOrderQty_tip" })}>
            <Typography sx={{ fontSize: 14, width: '100%' }}>{params.row.SOrderQty}</Typography>
          </Tooltip>
        );
      },
    },
    {
      field: "LotSerial",
      headerName: intl.formatMessage({ id: "material-so-detail.LotSerial" }),
      /*flex: 0.7,*/ width: 150,
    },
    {
      field: "BinCode",
      headerName: intl.formatMessage({ id: "material-so-detail.BinCode" }),
      /*flex: 0.7,*/ width: 150,
    },
  ];
  const columnsFromPicking = [
    { field: "MsoDetailId", headerName: "", hide: true },
    // { field: "MsoId", headerName: "", hide: true },
    // { field: "MaterialId", headerName: "", hide: true },

    {
      field: "id",
      headerName: "",
      width: 100,
      filterable: false,
      renderCell: (index) =>
        index.api.getRowIndex(index.row.MsoDetailId) +
        1 +
        (materialSODetailState.page - 1) * materialSODetailState.pageSize,
    },

    {
      field: "MsoCode",
      headerName: intl.formatMessage({ id: "material-so-detail.MsoCode" }),
      /*flex: 0.7,*/ width: 150,
    },

    {
      field: "MaterialColorCode",
      headerName: intl.formatMessage({
        id: "material-so-detail.MaterialColorCode",
      }),
      /*flex: 0.7,*/ width: 200,
    },

    // {
    //   field: "MsoDetailStatus",
    //   headerName: intl.formatMessage({
    //     id: "material-so-detail.MsoDetailStatus",
    //   }),
    //   /*flex: 0.7,*/ width: 120,
    // },

    {
      field: "SOrderQty",
      headerName: intl.formatMessage({ id: "material-so-detail.SOrderQty" }),
      /*flex: 0.7,*/ width: 150,
    },
    {
      field: "Button",
      headerName: "Action",
      align: "center",
      renderCell: (params) => {
        return (
          <Button
            disabled={params.row.MsoDetailStatus}
            variant="contained"
            color="success"
            size="small"
            sx={{ textTransform: "capitalize", fontSize: "14px" }}
            onClick={() => handleConfirm(params)}
          >
            {params.row.MsoDetailStatus ? <span style={{ color: "rgba(0,0,0,0.7)" }}>Picked</span> : "Picking"}
          </Button>
        );
      },
    },
    {
      field: "PickingDate",
      headerName: "Picking Date",
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
      field: "pickingUser",
      headerName: "User Picking",
      width: 150,
    },
  ];
  const handleConfirm = (params) => {
    toggle2();
    setRowConfirm(params.row)
  };
  const handleAdd = () => {
    setMode(CREATE_ACTION);
    setRowData({ ...MaterialSODetailDto });
    toggle();
  };

  const handleRowUpdate = async (newRow) => {
    const index = _.findIndex(materialSODetailState.data, function (o) {
      return o.MsoDetailId == newRow.MsoDetailId;
    });
    var oldRow = materialSODetailState.data[index];

    if (newRow.SOrderQty == oldRow.SOrderQty) {
      return oldRow;
    }

    setMaterialSODetailState({ ...materialSODetailState, isSubmit: true });
    if (!isNumber(newRow.SOrderQty) || newRow.SOrderQty < 0) {
      ErrorAlert(intl.formatMessage({ id: "forecast.OrderQty_required_bigger" }));
      newRow.SOrderQty = 0;
    }
    newRow = { ...newRow, SOrderQty: parseInt(newRow.SOrderQty) }

    const res = await materialSOService.modifyMsoDetail(newRow);
    if (res.HttpResponseCode === 200 && res.Data) {
      SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }));
      setUpdateData(res.Data);
      setMaterialSODetailState({ ...materialSODetailState, isSubmit: false });
      return newRow;
    }
    else {
      ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
      setMaterialSODetailState({ ...materialSODetailState, isSubmit: false });
      const index = _.findIndex(materialSODetailState.data, function (o) {
        return o.MsoDetailId == newRow.MsoDetailId;
      });

      return materialSODetailState.data[index];
    }

  }

  const handleProcessRowUpdateError = React.useCallback((error) => {
    console.log('update error', error)
    ErrorAlert(intl.formatMessage({ id: "general.system_error" }));
  }, []);

  const handleSearch = (e, inputName) => {
    let newSearchData = { ...materialSODetailState.searchData };
    newSearchData[inputName] = e;
    setMaterialSODetailState({
      ...materialSODetailState,
      searchData: { ...newSearchData },
    });
  };

  return (
    <React.Fragment>
      <Grid
        container
        spacing={2}
        justifyContent="flex-end"
        alignItems="flex-end"
      >
        <Grid item xs={1.5}>
          {!fromPicking && (
            <MuiButton
              disabled={MsoId ? MsoStatus : true}
              text="create"
              color="success"
              onClick={handleAdd}
            />
          )}
        </Grid>

        <Grid item xs>
          <MuiSearchField
            disabled={MsoId ? false : true}
            label="material-so-detail.MaterialColorCode"
            name="MaterialColorCode"
            onClick={() => fetchData(MsoId)}
            onChange={(e) => handleSearch(e.target.value, "MaterialCode")}
          />
        </Grid>

        <Grid item xs={2.5}>
          <Grid container justifyContent="space-around" alignItems="flex-end">
            <Grid item>
              <MuiButton
                disabled={MsoId ? false : true}
                text="search"
                color="info"
                onClick={() => fetchData(MsoId)}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <MuiDataGrid
        showLoading={materialSODetailState.isLoading}
        isPagingServer={true}
        headerHeight={45}
        // rowHeight={30}
        // gridHeight={736}
        columns={fromPicking ? columnsFromPicking : columns}
        rows={materialSODetailState.data}
        page={materialSODetailState.page - 1}
        pageSize={materialSODetailState.pageSize}
        rowCount={materialSODetailState.totalRow}
        processRowUpdate={handleRowUpdate}
        isCellEditable={(params) => params.row.MsoDetailStatus == false}
        onProcessRowUpdateError={handleProcessRowUpdateError}
        experimentalFeatures={{ newEditingApi: true }}
        onPageChange={(newPage) => {
          setMaterialSODetailState({
            ...materialSODetailState,
            page: newPage + 1,
          });
        }}
        getRowId={(rows) => rows.MsoDetailId}
        // onSelectionModelChange={(newSelectedRowId) =>
        //   handleRowSelection(newSelectedRowId)
        // }
        getRowClassName={(params) => {
          var item = newDataArr.find(x => x.MsoDetailId == params.row.MsoDetailId)
          if (item) {
            return `Mui-created`;
          }
        }}
        initialState={{ pinnedColumns: { right: ["action"] } }}
      />

      <MaterialSODetailDialog
        initModal={rowData}
        setNewData={setNewDataArr}
        setUpdateData={setUpdateData}
        isOpen={isShowing}
        onClose={toggle}
        mode={mode}
        MsoId={MsoId}
      />
      <PopupConfirm isShowing={isShowing2} hide={toggle2} rowConfirm={rowConfirm} setUpdateData={setUpdateData} />
    </React.Fragment>
  );
};


const initialESLData = { ITEM_NAME: '', LOCATION: '', SHELVE_LEVEL: -32768 }

const PopupConfirm = memo(({ isShowing, hide, rowConfirm, setUpdateData }) => {
  const intl = useIntl();

  const verifyConfirm = async () => {

    console.log('rowConfirm', rowConfirm);

    const res = await materialSOService.pickingMsoDetail({
      ...rowConfirm,
    })
    if (res.HttpResponseCode === 200) {
      SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }));
      setUpdateData({ ...res.Data });
      hide();
      await updateESLData(rowConfirm.BinCode);

    } else {
      ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
    }
  }

  const updateESLData = async (binCode) => {
    let dataList = []

    let res = await materialSOService.getESLDataByBinCode(binCode);

    if (_.isEqual(res.data, initialESLData)) {
      res.data.LOCATION = binCode;
      res.data.SHELVE_LEVEL = binLevel
    }

    res.id = `Bin-${binCode}`;
    dataList.push(res);

    if (dataList.length > 0)
      try {
        let response = await axios.post('http://118.69.130.73:9001/articles', { dataList: dataList });
        console.log(response)
      } catch (error) {
        console.log(error)
      }
  }

  return (
    <Dialog open={isShowing} maxWidth="sm" fullWidth>
      <DialogTitle
        sx={{
          p: 1,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography sx={{ fontWeight: 600, fontSize: "22px" }}>
          Confirm Picking
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
      <DialogContent sx={{ textAlign: "center" }}>
        <Typography variant="h5"> Are you sure picking?</Typography>
        <Box sx={{ mt: 1 }}>
          <Button variant="contained" color="success" sx={{ m: 1 }} onClick={verifyConfirm}>
            Confirm
          </Button>
          <Button variant="contained" color="error" sx={{ m: 1 }} onClick={hide}>
            Cancel
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
});

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

export default connect(mapStateToProps, mapDispatchToProps)(MaterialSODetail);
