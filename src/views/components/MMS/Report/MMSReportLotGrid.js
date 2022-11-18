import { Store } from "@appstate";
import { User_Operations } from "@appstate/user";
import { CombineDispatchToProps, CombineStateToProps } from "@plugins/helperJS";
import React, { useEffect, useRef, useState } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";

import { MuiAutocomplete, MuiButton, MuiDataGrid, MuiDateTimeField, MuiSearchField } from "@controls";
import Grid from "@mui/material/Grid";
import { mmsReportService } from "@services";
import { addDays, ErrorAlert } from "@utils";
import _ from "lodash";
import moment from "moment";
import { useIntl } from "react-intl";

const MMSReportLotGrid = ({ woId }) => {
  let isRendered = useRef(true);
  const intl = useIntl();
  const [state, setState] = useState({
    isLoading: false,
    data: [],
    totalRow: 0,
    page: 1,
    pageSize: 8,
    searchData: {
      Status: null,
    },
  });

  const columns = [
    {
      field: "id",
      headerName: "",
      width: 100,
      filterable: false,
      renderCell: (index) => index.api.getRowIndex(index.row.Id) + 1 + (state.page - 1) * state.pageSize,
    },
    { field: "LotCode", headerName: intl.formatMessage({ id: "actual.LotCode" }), flex: 0.7 },
    { field: "MaterialCode", headerName: intl.formatMessage({ id: "actual.MaterialId" }), flex: 0.5 },
    {
      field: 'QCResult', headerName: intl.formatMessage({ id: "actual.QCResult" }), flex: 0.4,
      valueFormatter: (params) => params?.value ? "OK" : "NG"
    },
    { field: 'Qty', headerName: intl.formatMessage({ id: "actual.Qty" }), flex: 0.4, },
  ];

  useEffect(() => {
    if (woId)
      fetchData();
    return () => isRendered = false;
  }, [state.page, state.pageSize, woId]);

  const handleSearch = (e, inputName) => {
    let newSearchData = { ...state.searchData };
    newSearchData[inputName] = e;
    if (inputName == "showDelete") {
      setState({ ...state, page: 1, searchData: { ...newSearchData } });
    } else {
      setState({ ...state, searchData: { ...newSearchData } });
    }
  };

  const fetchData = async () => {
    setState({ ...state, isLoading: true });

    const params = {
      page: state.page,
      pageSize: state.pageSize,
      WoId: woId,
      Status: state.searchData.Status
    };

    const res = await mmsReportService.getLotByWo(params);

    if (res && isRendered)
      setState({
        ...state,
        data: !res.Data ? [] : [...res.Data],
        totalRow: res.TotalRow,
        isLoading: false,
      });
  };

  const getDataStatus = async () => {
    const res = {
      Data: [
        { label: "OK", value: "true" },
        { label: "NG", value: "false" }
      ]
    }
    return res;
  };

  const handleDownload = async (e) => {
    try {
      const params = {
        WoId: woId,
        Status: state.searchData.Status
      };

      await mmsReportService.downloadLotReport(params);
    }
    catch (error) {
      console.log(`ERROR: ${error}`);
    }
  }

  return (
    <React.Fragment>
      <Grid
        container
        spacing={2.5}
        justifyContent="space-between"
        alignItems="width-end"
        sx={{ mt: 0 }}
      >
        <Grid item xs={9}>
          <MuiButton
            text="excel"
            color="success"
            disabled={woId == 0 ? true : false}
            onClick={() => handleDownload()}
          />
        </Grid>
        <Grid item sx={{ width: 220 }}>
          <MuiAutocomplete
            label={intl.formatMessage({ id: "actual.QCResult" })}
            fetchDataFunc={getDataStatus}
            displayLabel="label"
            displayValue="value"
            onChange={(e, item) => handleSearch(item ? item.value : '', "Status")}
            variant="standard"
            disabled={woId == 0 ? true : false}
          />
        </Grid>
        <Grid item>
          <MuiButton text="search" color="info" onClick={fetchData} disabled={woId == 0 ? true : false} />
        </Grid>
      </Grid>

      <MuiDataGrid
        showLoading={state.isLoading}
        isPagingServer={true}
        headerHeight={45}
        gridHeight={736}
        columns={columns}
        rows={state.data}
        page={state.page - 1}
        pageSize={state.pageSize}
        rowCount={state.totalRow}
        onPageChange={(newPage) => setState({ ...state, page: newPage + 1 })}
        getRowId={(rows) => rows.Id}
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

export default connect(mapStateToProps, mapDispatchToProps)(MMSReportLotGrid);