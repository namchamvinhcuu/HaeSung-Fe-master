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
import { addDays, ErrorAlert, SuccessAlert } from "@utils";
import _ from "lodash";
import moment from "moment";
import { useIntl } from "react-intl";
import { materialSOService } from "@services";
import { MaterialSOMasterDto, MaterialSODetailDto } from "@models";
import  MaterialSODetailDialog  from "./MaterialSODetailDialog";
import { useModal, useModal2 } from "@basesShared";

const MaterialSODetail = ({ MsoId }) => {
  let isRendered = useRef(true);
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
      MaterialCode:"",
      isActived:true
    },
    MsoId: MsoId,
  });

  const [newData, setNewData] = useState({ ...MaterialSODetailDto });


  useEffect(() => {
    fetchData(MsoId);
  }, [
    materialSODetailState.page,
    materialSODetailState.pageSize,
    MsoId,
    materialSODetailState.searchData.isActived,
  ]);
  useEffect(() => {

    if (!_.isEmpty(newData) && isRendered && !_.isEqual(newData, MaterialSODetailDto)) {
      const data = [newData, ...materialSODetailState.data];
      if (data.length > materialSODetailState.pageSize) {
        data.pop();
      }
      setMaterialSODetailState({
        ...materialSODetailState,
        data: [...data],
        totalRow: materialSODetailState.totalRow + 1,
      });
    }
  }, [newData]);

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
                aria-label="edit"
                color="warning"
                size="small"
                sx={[{ "&:hover": { border: "1px solid orange" } }]}
                onClick={() => handleUpdate(params.row)}
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
                onClick={() => handleDelete(params.row)}
              >
                  <DeleteIcon fontSize="inherit" />
                {/* {params.row.isActived ? (
                  <DeleteIcon fontSize="inherit" />
                ) : (
                  <UndoIcon fontSize="inherit" />
                )} */}
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
      field: "MsoDetailStatus",
      headerName: intl.formatMessage({
        id: "material-so-detail.MsoDetailStatus",
      }),
      /*flex: 0.7,*/ width: 120,
    },

    {
      field: "SOrderQty",
      headerName: intl.formatMessage({ id: "material-so-detail.SOrderQty" }),
      /*flex: 0.7,*/ width: 150,
    },
  ];
  const handleAdd = () => {
    setMode(CREATE_ACTION);
    setRowData({...MaterialSODetailDto});
    toggle();
  };
  const handleUpdate = (row) => {
    setMode(UPDATE_ACTION);
    setRowData({ ...row, MsoId: MsoId });
    toggle();
  };
  const handleSearch = (e, inputName) => {
    let newSearchData = { ...materialSODetailState.searchData };
    newSearchData[inputName] = e;
        setMaterialSODetailState({ ...materialSODetailState, searchData: { ...newSearchData } });
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
          <MuiButton
            disabled={MsoId ? false : true}
            text="create"
            color="success"
            onClick={handleAdd}
          />
        </Grid>

        <Grid item xs>
          <MuiSearchField
            disabled={MsoId ? false : true}
            label="material-so-detail.MaterialColorCode"
            name="MaterialColorCode"
            onClick={()=>fetchData(MsoId)}
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
                onClick={()=>fetchData(MsoId)}
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
        columns={columns}
        rows={materialSODetailState.data}
        page={materialSODetailState.page - 1}
        pageSize={materialSODetailState.pageSize}
        rowCount={materialSODetailState.totalRow}
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
          if (_.isEqual(params.row, newData)) {
            return `Mui-created`;
          }
        }}
        initialState={{ pinnedColumns: { right: ["action"] } }}
      />
      <MaterialSODetailDialog
        initModal={rowData}
        setNewData={setNewData}
        setUpdateData={setUpdateData}
        isOpen={isShowing}
        onClose={toggle}
        mode={mode}
        MsoId={MsoId}
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

export default connect(mapStateToProps, mapDispatchToProps)(MaterialSODetail);
