import React, { useEffect, useRef, useState } from "react";
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { CombineStateToProps, CombineDispatchToProps } from '@plugins/helperJS'
import { User_Operations } from '@appstate/user'
import { forecastService } from "@services";
import { Store } from '@appstate'
import { FormControlLabel, Grid, IconButton, Switch, TextField, Tooltip, Typography, } from "@mui/material";
import { useIntl } from "react-intl";
import { MuiAutoComplete, MuiButton, MuiDataGrid, MuiDateTimeField, MuiSearchField, MuiSelectField, } from "@controls";
import { useModal } from "@basesShared";
import { ErrorAlert, SuccessAlert } from "@utils";
import { CREATE_ACTION, UPDATE_ACTION } from "@constants/ConfigConstants";
import moment from "moment";

const Analytics = (props) => {
  const intl = useIntl();
  let isRendered = useRef(true);
  const [YearList, setYearList] = useState([]);
  const [state, setState] = useState({
    isLoading: false,
    data: [],
    totalRow: 0,
    page: 1,
    pageSize: 20,
    searchData: {
      FPoMasterId: 0,
      weekStart: 20,
      weekEnd: 40,
      Year: 0,
    },
  });

  const columns = [
    { field: "MaterialId", hide: true },
    { field: "MaterialCode", headerName: intl.formatMessage({ id: "material.MaterialCode" }), width: 220 },
  ];

  const [gridCol, setGridCol] = useState([...columns]);

  useEffect(() => {
    fetchData();
    getYearList();
    return () => { isRendered = false; };
  }, [state.page, state.pageSize]);

  async function fetchData() {
    setState({ ...state, isLoading: true });
    const params = {
      FPoMasterId: state.searchData.FPoMasterId,
      weekStart: state.searchData.weekStart,
      weekEnd: state.searchData.weekEnd,
      Year: state.searchData.Year,
      page: state.page,
      pageSize: state.pageSize,
    };

    const res = await forecastService.getForecastPOReport(params);
    if (res && res.Data && isRendered) {
      console.log(res)
      var obj = res.Data[0]

      let col = [...columns];
      for (let i = state.searchData.weekStart; i <= state.searchData.weekEnd; i++) {
        // if (obj["Week" + i] !== undefined)
        col.push({ field: "Week" + i, headerName: "Week" + i, width: 100 })
      }
      setGridCol([...col]);
    };

    setState({
      ...state,
      data: res.Data ?? [],
      totalRow: res.TotalRow,
      isLoading: false,
    })
  }

  const handleSearch = (e, inputName) => {
    let newSearchData = { ...state.searchData };
    newSearchData[inputName] = e;
    setState({ ...state, searchData: { ...newSearchData } });
  };

  const getYearList = async () => {
    const currentYear = new Date().getFullYear();
    let yearList = [];
    for (let i = currentYear; i < 2100; i++) {
      yearList.push({ YearId: i, YearName: i.toString() });
    }
    setYearList(yearList);
  };

  return (
    <React.Fragment>
      <Grid container direction="row" justifyContent="space-between" alignItems="width-end" sx={{ mb: 1 }}>
        <Grid item xs={5}>
        </Grid>
        <Grid item>
          <TextField
            label={intl.formatMessage({ id: "forecast.Week_start" })}
            variant="standard"
            type="number"
            sx={{ width: "210px" }}
            value={state.searchData.weekStart}
            inputProps={{ min: 1, max: 52 }}
            onChange={(e) => {
              // var value = parseInt(e.target.value, 10);
              // if (value > max) value = max;
              // if (value < min) value = min;
              // setValueStart(value || "");
              handleSearch(e.target.value || 0, "weekStart");
            }}
          />
        </Grid>
        <Grid item>
          <TextField
            label={intl.formatMessage({ id: "forecast.Week_end" })}
            variant="standard"
            type="number"
            sx={{ width: "210px" }}
            value={state.searchData.weekEnd}
            inputProps={{ min: 1, max: 52 }}
            onChange={(e) => {
              // var value = parseInt(e.target.value, 10);
              // if (value > max) value = max;
              // if (value < min) value = min;
              // setValueStart(value || "");
              handleSearch(e.target.value || 0, "weekEnd");
            }}
          />
        </Grid>
        <Grid item sx={{ width: "210px" }}>
          <MuiSelectField
            variant="standard"
            sx={{ mb: 0 }}
            //value={values.Year ? { YearId: values.Year, YearName: values.Year } : null}
            label={intl.formatMessage({ id: "forecast.Year" })}
            options={YearList}
            displayLabel="YearName"
            displayValue="YearId"
            onChange={(e, item) => handleSearch(item?.YearId || 0, "Year")}
          // error={touched.Year && Boolean(errors.Year)}
          // helperText={touched.Year && errors.Year}
          />
        </Grid>
        <Grid item>
          <MuiButton
            text="search"
            color="info"
            onClick={fetchData}
          />
        </Grid>
      </Grid>
      <MuiDataGrid
        showLoading={state.isLoading}
        isPagingServer={true}
        headerHeight={45}
        columns={gridCol}
        rows={state.data}
        page={state.page - 1}
        pageSize={state.pageSize}
        rowCount={state.totalRow}
        rowsPerPageOptions={[5, 10, 20]}
        onPageChange={(newPage) => setState({ ...state, page: newPage + 1 })}
        getRowId={(rows) => rows.MaterialId}
      />

    </React.Fragment>
  )
}

User_Operations.toString = function () {
  return 'User_Operations';
}

const mapStateToProps = state => {

  const { User_Reducer: { language } } = CombineStateToProps(state.AppReducer, [
    [Store.User_Reducer]
  ]);

  return { language };

};

const mapDispatchToProps = dispatch => {

  const { User_Operations: { changeLanguage } } = CombineDispatchToProps(dispatch, bindActionCreators, [
    [User_Operations]
  ]);

  return { changeLanguage }

};

export default connect(mapStateToProps, mapDispatchToProps)(Analytics);