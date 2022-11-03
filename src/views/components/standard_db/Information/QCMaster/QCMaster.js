import { Store } from "@appstate";
import { User_Operations } from "@appstate/user";
import {
  MuiButton,
  MuiDataGrid,
  MuiSearchField,
  MuiSelectField,
  MuiAutocomplete
} from "@controls";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import UndoIcon from "@mui/icons-material/Undo";
import {
  Autocomplete,
  createTheme,
  ThemeProvider,
  TextField,
  Switch,
  Tooltip,
  Typography,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import { CombineDispatchToProps, CombineStateToProps } from "@plugins/helperJS";
import _ from "lodash";
import moment from "moment";
import React, { useEffect, useState } from "react";
import { useIntl } from "react-intl";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import FormControlLabel from "@mui/material/FormControlLabel";
import { ErrorAlert, SuccessAlert } from "@utils";

import CreateDialog from "./CreateDialog";
import ModifyDialog from "./ModifyDialog";
import { qcMasterService } from "@services";
import { QCMasterDto } from "@models";
import QCDetail from "./QCDetail.js";

const QCMaster = (props) => {
  const intl = useIntl();

  const [isOpenCreateDialog, setIsOpenCreateDialog] = useState(false);
  const [isOpenModifyDialog, setIsOpenModifyDialog] = useState(false);

  const [qCMasterState, setqCMasterState] = useState({
    isLoading: false,
    data: [],
    totalRow: 0,
    page: 1,
    pageSize: 7,
    searchData: {
      QCMasterCode: null,
      Description: null,
      MaterialTypeId: 0,
      QCType: 0,
      showDelete: true,
    },
  });

  // const [materialArr, setmaterialArr] = useState([]);
  // const [qcArr, setqcArr] = useState([]);
  const [qcType, setqcType] = useState(0);

  const [selectedRow, setSelectedRow] = useState({
    ...QCMasterDto,
  });

  const [newData, setNewData] = useState({ ...QCMasterDto });

  const toggleCreateDialog = () => {
    setIsOpenCreateDialog(!isOpenCreateDialog);
  };
  const toggleModifyDialog = () => {
    setIsOpenModifyDialog(!isOpenModifyDialog);
  };


  useEffect(() => {
    fetchData();
  }, [
    qCMasterState.page,
    qCMasterState.pageSize,
    qCMasterState.searchData.showDelete,
  ]);

  useEffect(() => {
    if (!_.isEmpty(newData) && !_.isEqual(newData, QCMasterDto)) {
      const data = [newData, ...qCMasterState.data];
      if (data.length > qCMasterState.pageSize) {
        data.pop();
      }
      setqCMasterState({
        ...qCMasterState,
        data: [...data],
        totalRow: qCMasterState.totalRow + 1,
      });
    }
  }, [newData]);

  useEffect(() => {
    if (!_.isEmpty(selectedRow) && !_.isEqual(selectedRow, QCMasterDto)) {
      let newArr = [...qCMasterState.data];
      const index = _.findIndex(newArr, function (o) {
        return o.QCMasterId == selectedRow.QCMasterId;
      });
      if (index !== -1) {
        newArr[index] = selectedRow;
      }

      setqCMasterState({
        ...qCMasterState,
        data: [...newArr],
      });
    }
  }, [selectedRow]);

  async function fetchData() {

    setqCMasterState({ ...qCMasterState, isLoading: true });
    const params = {
      page: qCMasterState.page,
      pageSize: qCMasterState.pageSize,
      QCMasterCode: qCMasterState.searchData.QCMasterCode,
      MaterialTypeId: qCMasterState.searchData.QCType !== null ? qCMasterState.searchData.MaterialTypeId : 0,
      QCType: qCMasterState.searchData.QCType,
      Description: qCMasterState.searchData.Description,
      showDelete: qCMasterState.searchData.showDelete,
    };
    const res = await qcMasterService.getQcMasterList(params);

    setqCMasterState({
      ...qCMasterState,
      data: [...res.Data],
      totalRow: res.TotalRow,
      isLoading: false,
    });
  }
  const handleRowSelection = (arrIds) => {
    const rowSelected = qCMasterState.data.filter(function (item) {
      return item.QCMasterId === arrIds[0];
    });
    if (rowSelected && rowSelected.length > 0) {
      setSelectedRow({ ...rowSelected[0] });
    } else {
      setSelectedRow({ ...QCMasterDto });
    }
  };
  const handleSearch = (e, inputName) => {

    let newSearchData = { ...qCMasterState.searchData };
    newSearchData[inputName] = e;
    if (inputName == "showDelete") {
      setqCMasterState({
        ...qCMasterState,
        page: 1,
        searchData: { ...newSearchData },
      });
    }
    if (inputName == "QCType") {
      newSearchData = { ...newSearchData, MaterialTypeId: 0 }
      setqCMasterState({ ...qCMasterState, searchData: { ...newSearchData } })
    }
    else {
      setqCMasterState({ ...qCMasterState, searchData: { ...newSearchData } });
    }
  };
  const handleDelete = async (row) => {
    let message = qCMasterState.searchData.showDelete
      ? intl.formatMessage({ id: "general.confirm_delete" })
      : intl.formatMessage({ id: "general.confirm_redo_deleted" });
    if (window.confirm(message)) {
      try {
        let res = await qcMasterService.deleteQCMaster({
          QCMasterId: row.QCMasterId,
          row_version: row.row_version,
        });
        if (res && res.HttpResponseCode === 200) {
          SuccessAlert(intl.formatMessage({ id: "general.success" }));
          await fetchData();
        }
        if (res && res.HttpResponseCode === 300) {
          ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
          return;
        }
      } catch (error) {
        console.log(error);
      }
    }
  };


  const getMaterial = async (qcType) => {
    const res = await qcMasterService.getMaterialForSelect({ qcType: qcType });
    return res;

  };
  const getQC = async () => {
    const res = await qcMasterService.getQCTypeForSelect();
    return res;

  };
  const columns = [
    { field: "QCMasterId", headerName: "", flex: 0.3, hide: true },
    { field: "QCType", headerName: "QCType", flex: 0.3, hide: true },
    { field: "MaterialTypeId", headerName: "MaterialTypeId", flex: 0.3, hide: true },
    {
      field: "id",
      headerName: "",
      flex: 0.2,
      filterable: false,
      renderCell: (index) =>
        index.api.getRowIndex(index.row.QCMasterId) +
        1 +
        (qCMasterState.page - 1) * qCMasterState.pageSize,
    },
    {
      field: "action",
      headerName: "",
      flex: 0.2,
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
                aria-label="edit"
                color="warning"
                size="small"
                sx={[{ "&:hover": { border: "1px solid orange" } }]}
                onClick={toggleModifyDialog}
              >
                {params.row.isActived ? <EditIcon fontSize="inherit" /> : ""}
              </IconButton>
            </Grid>
            <Grid item xs={6}>
              <IconButton
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
          </Grid>
        );
      },
    },
    {
      field: "QCMasterCode",
      headerName: intl.formatMessage({ id: "qcMaster.QCMasterCode" }),
      flex: 0.4,
    },
    {
      field: "QCTypeName",
      headerName: intl.formatMessage({ id: "qcMaster.qcType" }),
      flex: 0.3,
    },
    {
      field: "MaterialTypeName",
      headerName: intl.formatMessage({ id: "qcMaster.MaterialTypeName" }),
      flex: 0.3,
    },
    {
      field: "Description",
      headerName: intl.formatMessage({ id: "general.description" }),
      flex: 0.3,
      renderCell: (params) => {
        return (
          <Tooltip title={params.row.Description} className="col-text-elip">
            <Typography sx={{ fontSize: 14, maxWidth: 200 }}>
              {params.row.Description}
            </Typography>
          </Tooltip>
        );
      },
    },
    { field: "isActived", headerName: "isActived", flex: 0.3, hide: true },
    {
      field: "createdName",
      headerName: intl.formatMessage({ id: "general.createdName" }),
      flex: 0.3,
    },
    {
      field: "createdDate",
      headerName: "Created Date",
      flex: 0.3,
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
      flex: 0.3,
    },
    {
      field: "modifiedDate",
      headerName: intl.formatMessage({ id: "general.modifiedDate" }),
      flex: 0.3,
      valueFormatter: (params) => {
        if (params.value !== null) {
          return moment(params?.value)
            .add(7, "hours")
            .format("YYYY-MM-DD HH:mm:ss");
        }
      },
    },
  ];
  return (
    <React.Fragment>
      <Grid
        container
        direction="row"
        justifyContent="space-between"
        alignItems="width-end"
        sx={{ pr: 1 }}
      >
        <Grid item xs={3}>
          <MuiButton
            text="create"
            color="success"
            onClick={toggleCreateDialog}
          />
        </Grid>
        <Grid item xs>
          <Grid
            container
            columnSpacing={2}
            direction="row"
            justifyContent="flex-end"
            alignItems="flex-end"
          >
            <Grid item style={{ width: "21%" }}>
              <MuiSearchField
                fullWidth
                variant="QCMasterCode"
                size="small"
                label="qcMaster.QCMasterCode"
                onClick={fetchData}
                onChange={(e) => handleSearch(e.target.value, "QCMasterCode")}
              />
            </Grid>

            <Grid item style={{ width: "21%" }}>
              <MuiAutocomplete
                label={intl.formatMessage({ id: "qcMaster.qcType" })}
                fetchDataFunc={getQC}
                displayLabel="commonDetailName"
                displayValue="commonDetailId"
                onChange={(e, item) => {
                  handleSearch(
                    item ? item.commonDetailId ?? null : null,
                    "QCType"
                  );
                  setqcType(item?.commonDetailName || "");

                }}
                variant="standard"
              />

            </Grid>
            <Grid item style={{ width: "21%" }}>
                        <MuiAutocomplete
                        disabled={qcType ? false : true}
                        label={intl.formatMessage({ id: "material.MaterialType" })}
                        fetchDataFunc={() => getMaterial(qcType)}
                        displayLabel="MaterialTypeName"
                        displayValue="MaterialTypeId"
                        key={qcType}
                        onChange={(e, item) =>
                          handleSearch(
                            item ? item.MaterialTypeId ?? null : null,
                            "MaterialTypeId"
                          )
                        }
                        variant="standard"
                      />
            </Grid>
            <Grid item style={{ width: "21%" }}>
              <MuiSearchField
                fullWidth
                variant="Description"
                size="small"
                label="general.description"
                onClick={fetchData}
                onChange={(e) => handleSearch(e.target.value, "Description")}
              />
            </Grid>
            <Grid item>
              <MuiButton
                text="search"
                color="info"
                onClick={fetchData}
                sx={{ m: 0, mr: 2 }}
              />
            </Grid>
          </Grid>
        </Grid>

        <Grid item>
          <FormControlLabel
            sx={{ mt: 2 }}
            control={
              <Switch
                defaultChecked={true}
                color="primary"
                onChange={(e) => handleSearch(e.target.checked, "showDelete")}
              />
            }
            label={
              qCMasterState.searchData.showDelete
                ? "Active Data"
                : "Delete Data"
            }
          />
        </Grid>
      </Grid>
      <MuiDataGrid
        showLoading={qCMasterState.isLoading}
        isPagingServer={true}
        headerHeight={45}
        columns={columns}
        gridHeight={736}
        rows={qCMasterState.data}
        page={qCMasterState.page - 1}
        pageSize={qCMasterState.pageSize}
        rowCount={qCMasterState.totalRow}
        rowsPerPageOptions={[5, 10, 20]}
        onPageChange={(newPage) =>
          setqCMasterState({ ...qCMasterState, page: newPage + 1 })
        }
        onPageSizeChange={(newPageSize) =>
          setqCMasterState({ ...qCMasterState, pageSize: newPageSize, page: 1 })
        }
        onSelectionModelChange={(newSelectedRowId) => {
          handleRowSelection(newSelectedRowId);
        }}
        getRowId={(rows) => rows.QCMasterId}
        getRowClassName={(params) => {
          if (_.isEqual(params.row, newData)) {
            return `Mui-created`;
          }
        }}
        initialState={{ pinnedColumns: { right: ['action'] } }}
      />
      <CreateDialog
        initModal={QCMasterDto}
        setNewData={setNewData}
        isOpen={isOpenCreateDialog}
        onClose={toggleCreateDialog}
      />
      <ModifyDialog
        initModal={selectedRow}
        setModifyData={setSelectedRow}
        isOpen={isOpenModifyDialog}
        onClose={toggleModifyDialog}
      />
      {selectedRow && <QCDetail QCMasterId={selectedRow.QCMasterId} />}
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

export default connect(mapStateToProps, mapDispatchToProps)(QCMaster);
