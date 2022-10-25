import { Store } from "@appstate";
import { User_Operations } from "@appstate/user";
import { MuiButton, MuiDataGrid, MuiSearchField } from "@controls";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import UndoIcon from "@mui/icons-material/Undo";
import { FormControlLabel, Switch } from "@mui/material";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import { CombineDispatchToProps, CombineStateToProps } from "@plugins/helperJS";
import _ from "lodash";
import moment from "moment";
import React, { useEffect, useState, useRef } from "react";
import { useIntl } from "react-intl";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { SupplierDto } from "@models";
import { supplierService } from "@services";
import { ErrorAlert, SuccessAlert } from "@utils";

import CreateSupplierDialog from "./CreateSupplierDialog";
import ModifySupplierDialog from "./ModifySupplierDialog";

const Supplier = (props) => {
  let isRendered = useRef(true);
  const intl = useIntl();

  const [supplierState, setSupplierState] = useState({
    isLoading: false,
    data: [],
    totalRow: 0,
    page: 1,
    pageSize: 20,
    searchData: {
      SupplierCode: "",
      SupplierName: "",
    },
  });

  const [isOpenCreateDialog, setIsOpenCreateDialog] = useState(false);
  const [isOpenModifyDialog, setIsOpenModifyDialog] = useState(false);
  const [showActivedData, setShowActivedData] = useState(true);

  const [selectedRow, setSelectedRow] = useState({
    ...SupplierDto,
  });

  const [newData, setNewData] = useState({ ...SupplierDto });

  const toggleCreateDialog = () => {
    setIsOpenCreateDialog(!isOpenCreateDialog);
  };

  const toggleModifyDialog = () => {
    setIsOpenModifyDialog(!isOpenModifyDialog);
  };

  const handleRowSelection = (arrIds) => {
    const rowSelected = supplierState.data.filter(function (item) {
      return item.SupplierId === arrIds[0];
    });

    if (rowSelected && rowSelected.length > 0) {
      setSelectedRow({ ...rowSelected[0] });
    } else {
      setSelectedRow({ ...SupplierDto });
    }
  };

  const changeSearchData = (e, inputName) => {
    let newSearchData = { ...supplierState.searchData };
    newSearchData[inputName] = e.target.value;

    setSupplierState({ ...supplierState, searchData: { ...newSearchData } });
  };

  const fetchData = async () => {
    setSupplierState({
      ...supplierState,
      isLoading: true,
    });
    const params = {
      page: supplierState.page,
      pageSize: supplierState.pageSize,
      SupplierCode: supplierState.searchData.SupplierCode.trim(),
      SupplierName: supplierState.searchData.SupplierName.trim(),
      isActived: showActivedData,
    };
    const res = await supplierService.getSuppliers(params);

    if (res && isRendered)
      setSupplierState({
        ...supplierState,
        data: !res.Data ? [] : [...res.Data],
        totalRow: res.TotalRow,
        isLoading: false,
      });
  };

  const handleDeleteSupplier = async (supplier) => {
    if (
      window.confirm(
        intl.formatMessage({
          id: showActivedData
            ? "general.confirm_delete"
            : "general.confirm_redo_deleted",
        })
      )
    ) {
      try {
        let res = await supplierService.handleDelete(supplier);
        if (res && res.HttpResponseCode === 200) {
          await fetchData();
        } else {
          ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleshowActivedData = async (event) => {
    setShowActivedData(event.target.checked);
    if (!event.target.checked) {
      setSupplierState({
        ...supplierState,
        page: 1,
      });
    }
  };

  useEffect(() => {
    if (isRendered) fetchData();

    return () => {
      isRendered = false;
    };
  }, [supplierState.page, supplierState.pageSize, showActivedData]);

  useEffect(() => {
    if (!_.isEmpty(newData) && !_.isEqual(newData, SupplierDto)) {
      const data = [newData, ...supplierState.data];
      if (data.length > supplierState.pageSize) {
        data.pop();
      }
      setSupplierState({
        ...supplierState,
        data: [...data],
        totalRow: supplierState.totalRow + 1,
      });
    }
  }, [newData]);

  useEffect(() => {
    if (!_.isEmpty(selectedRow) && !_.isEqual(selectedRow, SupplierDto)) {
      let newArr = [...supplierState.data];
      const index = _.findIndex(newArr, function (o) {
        return o.SupplierId == selectedRow.SupplierId;
      });
      if (index !== -1) {
        newArr[index] = selectedRow;
      }

      setSupplierState({
        ...supplierState,
        data: [...newArr],
      });
    }
  }, [selectedRow]);

  const columns = [
    { field: "SupplierId", headerName: "", hide: true },
    {
      field: "id",
      headerName: "",
      flex: 0.01,
      filterable: false,
      renderCell: (index) => index.api.getRowIndex(index.row.SupplierId) + 1,
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
                aria-label="edit"
                color="warning"
                size="small"
                sx={[{ "&:hover": { border: "1px solid orange" } }]}
                onClick={toggleModifyDialog}
              >
                <EditIcon fontSize="inherit" />
              </IconButton>
            </Grid>

            <Grid item xs={6}>
              <IconButton
                aria-label="delete"
                color="error"
                size="small"
                sx={[{ "&:hover": { border: "1px solid red" } }]}
                onClick={() => handleDeleteSupplier(params.row)}
              >
                {showActivedData ? (
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
      field: "SupplierCode",
      headerName: intl.formatMessage({ id: "supplier.SupplierCode" }),
      /*flex: 0.7,*/ width: 150,
    },
    {
      field: "SupplierName",
      headerName: intl.formatMessage({ id: "supplier.SupplierName" }),
      flex: 1,
    },
    {
      field: "SupplierContact",
      headerName: intl.formatMessage({ id: "supplier.SupplierContact" }),
      flex: 1,
    },
    {
      field: "createdDate",
      headerName: intl.formatMessage({ id: "general.created_date" }),
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
      field: "modifiedDate",
      headerName: intl.formatMessage({ id: "general.modified_date" }),
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
        spacing={2}
        direction="row"
        justifyContent="space-between"
        alignItems="flex-end"
      >
        <Grid item xs={5}>
          <MuiButton
            text="create"
            color="success"
            onClick={toggleCreateDialog}
          />
        </Grid>
        <Grid item xs>
          <MuiSearchField
            label="general.code"
            name="SupplierCode"
            onClick={fetchData}
            onChange={(e) => changeSearchData(e, "SupplierCode")}
          />
        </Grid>

        <Grid item xs>
          <MuiSearchField
            label="general.name"
            name="SupplierName"
            onClick={fetchData}
            onChange={(e) => changeSearchData(e, "SupplierName")}
          />
        </Grid>

        <Grid item xs sx={{ display: "flex", justifyContent: "right" }}>
          <MuiButton text="search" color="info" onClick={fetchData} />
          <FormControlLabel
            sx={{ mb: 0, ml: "1px" }}
            control={
              <Switch
                defaultChecked={true}
                color="primary"
                onChange={(e) => handleshowActivedData(e)}
              />
            }
            label={showActivedData ? "Actived" : "Deleted"}
          />
        </Grid>
      </Grid>

      <MuiDataGrid
        showLoading={supplierState.isLoading}
        isPagingServer={true}
        headerHeight={45}
        // rowHeight={30}
        gridHeight={736}
        columns={columns}
        rows={supplierState.data}
        page={supplierState.page - 1}
        pageSize={supplierState.pageSize}
        rowCount={supplierState.totalRow}
        // rowsPerPageOptions={[5, 10, 20, 30]}

        onPageChange={(newPage) => {
          setSupplierState({ ...supplierState, page: newPage + 1 });
        }}
        // onPageSizeChange={(newPageSize) => {
        //     setSupplierState({ ...supplierState, pageSize: newPageSize, page: 1 });
        // }}
        getRowId={(rows) => rows.SupplierId}
        onSelectionModelChange={(newSelectedRowId) => {
          handleRowSelection(newSelectedRowId);
        }}
        // selectionModel={selectedRow.menuId}
        getRowClassName={(params) => {
          if (_.isEqual(params.row, newData)) {
            return `Mui-created`;
          }
        }}
      />

      <CreateSupplierDialog
        initModal={SupplierDto}
        setNewData={setNewData}
        isOpen={isOpenCreateDialog}
        onClose={toggleCreateDialog}
      />

      <ModifySupplierDialog
        initModal={selectedRow}
        setModifyData={setSelectedRow}
        isOpen={isOpenModifyDialog}
        onClose={toggleModifyDialog}
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

export default connect(mapStateToProps, mapDispatchToProps)(Supplier);
