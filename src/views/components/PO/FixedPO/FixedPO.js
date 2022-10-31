import React, { useEffect, useState, useRef } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { CombineStateToProps, CombineDispatchToProps } from "@plugins/helperJS";
import { User_Operations } from "@appstate/user";
import { Store } from "@appstate";

import { MuiButton, MuiDataGrid, MuiSearchField, MuiAutoComplete } from "@controls";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveAsIcon from '@mui/icons-material/SaveAs';
import UndoIcon from "@mui/icons-material/Undo";
import DoDisturbIcon from '@mui/icons-material/DoDisturb';
import { FormControlLabel, Switch, TextField, Tooltip, Typography, } from "@mui/material";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import _ from "lodash";
import moment from "moment";
import { useIntl } from "react-intl";
import { CREATE_ACTION, UPDATE_ACTION } from "@constants/ConfigConstants";
import { ForecastPODto } from "@models";
import { fixedPOService } from "@services";
import { ErrorAlert, SuccessAlert, getCurrentWeek } from "@utils";

const FixedPO = (props) => {
  const currentDate = new Date();
  let isRendered = useRef(true);
  const intl = useIntl();

  const [fixedPOState, setFixedPOState] = useState({
    isLoading: false,
    data: [],
    totalRow: 0,
    page: 1,
    pageSize: 20,
    searchData: {
      ...ForecastPODto,
      Year: new Date().getFullYear(),
      Week: getCurrentWeek(),
    },
  });

  const [mode, setMode] = useState(CREATE_ACTION);
  const [newData, setNewData] = useState({ ...ForecastPODto });
  const [selectedRow, setSelectedRow] = useState({
    ...ForecastPODto,
  });
  const [isOpenDialog, setIsOpenDialog] = useState(false);
  const [showActivedData, setShowActivedData] = useState(true);

  const toggleDialog = (mode) => {
    if (mode === CREATE_ACTION) {
      setMode(CREATE_ACTION);
    } else {
      setMode(UPDATE_ACTION);
    }
    setIsOpenDialog(!isOpenDialog);
  };

  const handleshowActivedData = async (event) => {
    setShowActivedData(event.target.checked);
    if (!event.target.checked) {
      setFixedPOState({
        ...fixedPOState,
        page: 1,
      });
    }
  };

  const handleRowSelection = (arrIds) => {
    const rowSelected = fixedPOState.data.filter(function (item) {
      return item.FPOId === arrIds[0];
    });

    if (rowSelected && rowSelected.length > 0) {
      setSelectedRow({ ...rowSelected[0] });
    } else {
      setSelectedRow({ ...ForecastPODto });
    }
  };

  const handleDelete = async (fixedPO) => {
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
        let res = await fixedPOService.handleDelete(workOrder);
        if (res) {
          if (res && res.HttpResponseCode === 200) {
            await fetchData();
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

  const changeSearchData = (e, inputName) => {
    let newSearchData = { ...fixedPOState.searchData };

    switch (inputName) {
      case "MaterialId":
        newSearchData[inputName] = e ? e.MaterialId : ForecastPODto.MaterialId;
        newSearchData["MaterialCode"] = e
          ? e.MaterialCode
          : ForecastPODto.MaterialCode;
        break;

      default:
        newSearchData[inputName] = e.target.value;
        break;
    }
    setFixedPOState({
      ...fixedPOState,
      searchData: { ...newSearchData },
    });
  };

  const getSearchMaterialArr = async () => {
    const res = await fixedPOService.getSearchMaterialArr();
    return res;
  };

  // const handleRowUpdate = React.useCallback(
  //   async (newRow) => {
  //     // Make the HTTP request to save in the backend
  //     console.log('[newRow]', newRow);
  //     const response = await fixedPOService.modify(newRow);
  //     if (isRendered && response && response.Data) {
  //         setSelectedRow({ ...response.Data });
  //     }
  //     else{

  //     }
  //   },
  //   // [selectedRow],
  // );
  const handleRowUpdate = async (newRow) => {
    const res = await fixedPOService.modify(newRow);
    if (res && res.HttpResponseCode === 200) {
      SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }));
      return res.Data;
    }
    else {
      ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
      return null;
    }
  }

  const handleProcessRowUpdateError = React.useCallback((error) => {
    ErrorAlert(intl.formatMessage({ id: "general.system_error" }));
  }, []);

  const fetchData = async () => {
    let flag = true;
    let message = "";
    const checkObj = { ...fixedPOState.searchData };
    _.forOwn(checkObj, (value, key) => {
      switch (key) {
        case "Year":
          if (!Number.isInteger(value) && value > 2022) {
            message = "general.field_invalid";
            flag = false;
          }
          break;
        case "Week":
          if (!Number.isInteger(value) && value > 0 && value <= 52) {
            message = "general.field_invalid";
            flag = false;
          }
          break;

        default:
          break;
      }
    });

    if (flag && isRendered) {
      setFixedPOState({
        ...fixedPOState,
        isLoading: true,
      });

      const params = {
        page: fixedPOState.page,
        pageSize: fixedPOState.pageSize,
        MaterialId: fixedPOState.searchData.MaterialId,
        Year: fixedPOState.searchData.Year,
        Week: fixedPOState.searchData.Week,
        isActived: showActivedData,
      };

      const res = await fixedPOService.get(params);

      if (res && isRendered)
        setFixedPOState({
          ...fixedPOState,
          data: !res.Data ? [] : [...res.Data],
          totalRow: res.TotalRow,
          isLoading: false,
        });
    } else {
      ErrorAlert(intl.formatMessage({ id: message }));
    }
  };

  useEffect(() => {
    fetchData();

    return () => {
      isRendered = false;
    };
  }, [fixedPOState.page, fixedPOState.pageSize, showActivedData]);

  useEffect(() => {
    if (!_.isEmpty(selectedRow) && !_.isEqual(selectedRow, ForecastPODto)) {
      let newArr = [...fixedPOState.data];
      const index = _.findIndex(newArr, function (o) {
        return o.FPOId == selectedRow.FPOId;
      });
      if (index !== -1) {
        newArr[index] = selectedRow;
      }

      setFixedPOState({
        ...fixedPOState,
        data: [...newArr],
      });
    }
  }, [selectedRow]);

  const columns = [
    { field: "FPOId", headerName: "", hide: true },
    {
      field: "id", headerName: "", width: 80, filterable: false,
      renderCell: (index) => index.api.getRowIndex(index.row.FPOId) + 1 + (fixedPOState.page - 1) * fixedPOState.pageSize,
    },
    {
      field: "LineName",
      headerName: intl.formatMessage({ id: "forecast.LineName" }),
      width: 200,
    },
    {
      field: "FPoMasterCode",
      headerName: intl.formatMessage({ id: "forecast.FPoMasterCode" }),
      type: 'number',
      width: 140,
    },
    {
      field: "MaterialCode",
      headerName: intl.formatMessage({ id: "forecast.MaterialCode" }),
      width: 150,
    },

    {
      field: "DescriptionMaterial",
      headerName: intl.formatMessage({ id: "forecast.DescriptionMaterial" }),
      width: 300,
      renderCell: (params) => {
        return (
          <Tooltip
            title={params.row.DescriptionMaterial ?? ""}
            className="col-text-elip"
          >
            <Typography sx={{ fontSize: 14, maxWidth: 300 }}>
              {params.row.DescriptionMaterial}
            </Typography>
          </Tooltip>
        );
      },
    },
    {
      field: "Amount", headerName: intl.formatMessage({ id: "forecast.Amount" }), width: 150,
    },
    {
      field: "OrderQty", headerName: intl.formatMessage({ id: "forecast.OrderQty" }), width: 150, editable: true
    },
    {
      field: "Week",
      headerName: intl.formatMessage({ id: "forecast.Week" }),
      width: 100,
    },
    {
      field: "Year",
      headerName: intl.formatMessage({ id: "forecast.Year" }),
      width: 100,
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

  return (
    <React.Fragment>
      <Grid
        container
        spacing={2}
        justifyContent="flex-end"
        alignItems="flex-end"
      >
        <Grid item xs={4} sm={3} md={2}>
          <MuiSearchField
            label="forecast.Year"
            type="number"
            name="Year"
            value={fixedPOState.searchData.Year}
            onClick={fetchData}
            onChange={(e) => changeSearchData(e, "Year")}
          />
        </Grid>
        <Grid item xs={4} sm={3} md={2}>
          <MuiSearchField
            label="forecast.Week"
            type="number"
            name="Week"
            value={fixedPOState.searchData.Week}
            onClick={fetchData}
            onChange={(e) => changeSearchData(e, "Week")}
          />
        </Grid>
        <Grid item xs={4} sm={3} md={2}>
          <MuiAutoComplete
            label={intl.formatMessage({ id: 'forecast.MaterialId' })}
            fetchDataFunc={getSearchMaterialArr}
            displayLabel="MaterialCode"
            displayValue="MaterialId"
            value={
              fixedPOState.searchData.MaterialId !== 0
                ? {
                  MaterialId: fixedPOState.searchData.MaterialId,
                  MaterialCode: fixedPOState.searchData.MaterialCode,
                }
                : null
            }
            onChange={(e, item) => {
              changeSearchData(item ?? null, "MaterialId");
            }}
            variant="standard"
          />
        </Grid>
        <Grid item>
          <MuiButton text="search" color="info" onClick={fetchData} />
        </Grid>
        <Grid item>
          <FormControlLabel
            sx={{ mb: 0, ml: "1px" }}
            control={
              <Switch
                defaultChecked={true}
                color="primary"
                onChange={(e) => handleshowActivedData(e)}
              />
            }
            label={intl.formatMessage({ id: showActivedData ? "general.data_actived" : "general.data_deleted", })}
          />
        </Grid>
      </Grid>

      <MuiDataGrid
        showLoading={fixedPOState.isLoading}
        isPagingServer={true}
        headerHeight={45}
        // gridHeight={750}
        columns={columns}
        rows={fixedPOState.data}
        page={fixedPOState.page - 1}
        pageSize={fixedPOState.pageSize}
        rowCount={fixedPOState.totalRow}
        onPageChange={(newPage) => setFixedPOState({ ...fixedPOState, page: newPage + 1 })}
        getRowId={(rows) => rows.FPOId}
        onSelectionModelChange={(newSelectedRowId) =>
          handleRowSelection(newSelectedRowId)
        }
        processRowUpdate={handleRowUpdate}
        onProcessRowUpdateError={handleProcessRowUpdateError}
        experimentalFeatures={{ newEditingApi: true }}
        getRowClassName={(params) => {
          if (_.isEqual(params.row, newData)) return `Mui-created`;
        }}
        getCellClassName={(params) => {
          if (params.field === 'OrderQty' && params.value && params.value > 0) {
            return 'hot';
          }
          return '';
        }}
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

export default connect(mapStateToProps, mapDispatchToProps)(FixedPO);
