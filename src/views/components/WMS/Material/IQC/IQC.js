import React, { useState, useRef, useEffect } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { CombineStateToProps, CombineDispatchToProps } from "@plugins/helperJS";
import { User_Operations } from "@appstate/user";
import { Store } from "@appstate";
import {
  FormControlLabel,
  Grid,
  IconButton,
  Switch,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import UndoIcon from "@mui/icons-material/Undo";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  MuiButton,
  MuiDataGrid,
  MuiSearchField,
} from "@controls";
import { useIntl } from "react-intl";
import moment from "moment";
import IQCDialog from "./IQCDialog";
import { LotDto } from "@models";
import { CREATE_ACTION, UPDATE_ACTION } from "@constants/ConfigConstants";
import { useModal } from "@basesShared";
import { iqcService } from "@services";
import { ErrorAlert, SuccessAlert } from "@utils";

const IQC = (props) => {
  const intl = useIntl();
  const [mode, setMode] = useState(CREATE_ACTION);
  const [rowData, setRowData] = useState({ ...LotDto });
  const { isShowing, toggle } = useModal();
  const [newData, setNewData] = useState({ ...LotDto });
  const [updateData, setUpdateData] = useState({});
  let isRendered = useRef(true);
  const [iqcState, setIQCState] = useState({
    isLoading: false,
    data: [],
    totalRow: 0,
    page: 1,
    pageSize: 20,
    searchData: {
      keyWord: "",
      showDelete: true,
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
    },

    {
      field: "MaterialCode",
      headerName: "Material Code",
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
        if (params.row.QCResult == true) {
          return <Typography>OK</Typography>;
        } else {
          return <Typography>NG</Typography>;
        }
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
    setIQCState({ ...iqcState, isLoading: true });
    const params = {
      page: iqcState.page,
      pageSize: iqcState.pageSize,
      keyWord: iqcState.searchData.keyWord,
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
        </Grid>
        <Grid item>
          <Grid container spacing={2} justifyContent="center">
            <Grid item>
              <MuiSearchField
                label="general.name"
                name="LineName"
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
        // rowHeight={30}
        columns={columns}
        rows={iqcState.data}
        page={iqcState.page - 1}
        pageSize={iqcState.pageSize}
        rowCount={iqcState.totalRow}
        // rowsPerPageOptions={[5, 10, 20, 30]}

        onPageChange={(newPage) => {
          setIQCState({ ...iqcState, page: newPage + 1 });
        }}
        // onSelectionModelChange={(newSelectedRowId) => setFPOMasterId(newSelectedRowId[0])}
        getRowId={(rows) => rows.Id}
        // onSelectionModelChange={(newSelectedRowId) => {
        //   handleRowSelection(newSelectedRowId);
        // }}
        // selectionModel={selectedRow.menuId}
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
