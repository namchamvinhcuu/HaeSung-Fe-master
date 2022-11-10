import React, { useEffect, useRef, useState } from "react";
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { CombineStateToProps, CombineDispatchToProps } from '@plugins/helperJS'
import { User_Operations } from '@appstate/user'
import { forecastService } from "@services";
import { Store } from '@appstate'
import { FormControlLabel, Grid, IconButton, Switch, TextField, Tooltip, Typography, } from "@mui/material";
import { useIntl } from "react-intl";
import { MuiAutocomplete, MuiButton, MuiDataGrid, MuiDateTimeField, MuiSearchField, MuiSelectField, } from "@controls";
import { useModal } from "@basesShared";
import { ErrorAlert, SuccessAlert, getCurrentWeek } from "@utils";

const Analytics = (props) => {
  const intl = useIntl();
  let isRendered = useRef(true);
  const curWeekS = getCurrentWeek() - 5;
  const curWeekE = getCurrentWeek() + 5;
  const [YearList, setYearList] = useState([]);
  const [state, setState] = useState({
    isLoading: false,
    data: [],
    totalRow: 0,
    page: 1,
    pageSize: 20,
    searchData: {
      FPoMasterId: 0,
      weekStart: curWeekS < 1 ? 1 : curWeekS,
      weekEnd: curWeekE > 52 ? 52 : curWeekE,
      Year: 2022,
    },
  });

  const columns = [
    { field: "MaterialId", hide: true },
    {
      field: "LineName", headerName: intl.formatMessage({ id: "forecast.LineName" }), width: 200, renderCell: (params) => {
        return (
          <Tooltip title={params.row.LineName ?? ""} className="col-text-elip">
            <Typography sx={{ fontSize: 14, maxWidth: 200 }}>{params.row.LineName}</Typography>
          </Tooltip>
        );
      },
    },
    { field: "MaterialCode", headerName: intl.formatMessage({ id: "forecast.MaterialCode" }), width: 120 },
    {
      field: "DescriptionMaterial", headerName: intl.formatMessage({ id: "forecast.DescriptionMaterial" }), width: 200, renderCell: (params) => {
        return (
          <Tooltip title={params.row.DescriptionMaterial ?? ""} className="col-text-elip">
            <Typography sx={{ fontSize: 14 }}>{params.row.DescriptionMaterial}</Typography>
          </Tooltip>
        );
      },
    },
    { field: "Description", headerName: intl.formatMessage({ id: "forecast.Desciption" }), width: 120 },
    { field: "Year", headerName: intl.formatMessage({ id: "forecast.Year" }), width: 100 },
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

    let col = [...columns];
    for (let i = state.searchData.weekStart; i <= state.searchData.weekEnd; i++) {
      if (i < 1)
        continue;
      if (i > 52)
        break;
      col.push({ field: "Week" + i, headerName: intl.formatMessage({ id: "forecast.Week_number" }, { number: i }), width: 100, align: "right" })
    }
    setGridCol([...col]);

    if (isRendered) {
      setState({
        ...state,
        data: res.Data ?? [],
        totalRow: res.TotalRow,
        isLoading: false,
      })
    };
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

  const handleDownload = async (e) => {
    try {
      const params = {
        FPoMasterId: state.searchData.FPoMasterId,
        weekStart: state.searchData.weekStart,
        weekEnd: state.searchData.weekEnd,
        Year: state.searchData.Year
      };

      await forecastService.downloadReport(params);
    }
    catch (error) {
      console.log(`ERROR: ${error}`);
    }
  }

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
            sx={{ width: "200px" }}
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
            sx={{ width: "200px" }}
            value={state.searchData.weekEnd}
            inputProps={{ min: 1, max: 52 }}
            onChange={(e) => {
              var value = parseInt(e.target.value, 10);
              //value = value > 52 ? 52 : value < state.searchData.weekStart ? state.searchData.weekStart : value
              // < 1 ? 1 : value;
              handleSearch(value || 0, "weekEnd");
            }}
          />
        </Grid>
        <Grid item sx={{ width: "200px" }}>
          <MuiSelectField
            variant="standard"
            sx={{ mb: 0 }}
            value={state.searchData.Year ? { YearId: state.searchData.Year, YearName: state.searchData.Year.toString() } : null}
            label={intl.formatMessage({ id: "forecast.Year" })}
            options={YearList}
            displayLabel="YearName"
            displayValue="YearId"
            onChange={(e, item) => handleSearch(item?.YearId || 0, "Year")}
          />
        </Grid>
        <Grid item>
          <MuiButton
            text="search"
            color="info"
            onClick={fetchData}
          />
          <MuiButton
            text="excel"
            color="primary"
            onClick={handleDownload}
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
        getRowId={(rows) => rows.FPOId}
        initialState={{ pinnedColumns: { left: ['LineName', 'MaterialCode'] } }}
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