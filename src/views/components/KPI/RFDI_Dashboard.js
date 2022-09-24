import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { api_get, api_post, AlertSuccess, eventBus } from '@utils';
import { useModal, SelectBox, ButtonAsync, DataTable } from '@basesShared';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Grid';
import Link from '@mui/material/Link';
import ShortUniqueId from 'short-unique-id';
import * as ConfigConstants from '@constants/ConfigConstants';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import moment from 'moment';
import CountUp from 'react-countup';
import RFDI_AreaChart from './RFDI_AreaChart'
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import RFDI_LineChart from './RFDI_LineChart';

const RFDI_Dashboard = ({ t }) => {
  const [searchValue, setSearchValue] = useState({ startdate: null, enddate: null });
  const [dataCard, setDataCard] = React.useState({});
  const [dataLine, setDataLine] = React.useState();


  const gridRef = useRef();

  const columns = [
    { field: "Id", hide: true },
    { field: "Date_Created", headerClassName: 'super-app-theme--header', headerName: "Date", width: 150 },
    { field: "TagCode", headerClassName: 'super-app-theme--header', headerName: "Tag #", width: 300 },
    { field: "ItemName", headerClassName: 'super-app-theme--header', headerName: "Item Name", width: 180 },
    { field: "ItemCode", headerClassName: 'super-app-theme--header', headerName: "Item Code", width: 180 },
    {
      field: "Status",
      headerClassName: 'super-app-theme--header',
      headerName: "Status",
      width: 150,
      renderCell: (params) => {
        return (<span style={{ color: params.row.Status === 'OK' ? 'green' : 'red' }}><b>{params.row.Status}</b></span>);
      },
    },
    { field: "location_name", headerClassName: 'super-app-theme--header', headerName: "Location", width: 180 },
    { field: "description", headerClassName: 'super-app-theme--header', headerName: "Description", width: 180 },
    { field: "staff_name", headerClassName: 'super-app-theme--header', headerName: "Staff", width: 180 },
  ];

  useEffect(() => {
    //lấy dữ liệu data weely
    api_get("RFDIDashboardApi/GetDashboard_Weekly_Area").then((res) => {

      if (res.length) {
        setDataCard({ Entrance_Total: res[0].entrance_total, Issue_Total: res[0].issue_total, Entrance: res[0].total_weekly_Entrance_num, Issue: res[0].total_weekly_Issue_num, RegisterdTag: res[0].total_weekly_RegisterdTag_num })
        setDataLine(res);
      } else {
        setDataCard({ Entrance: 0, Issue: 0, RegisterdTag: 0 })
      }

    });
  }, []);

  const search = () => {
    gridRef.current.search(searchValue);
  };

  return (
    <Box sx={{
      pb: 5,
      height: 950,
      width: "100%"
    }}>

      <Grid container spacing={1}>
        <Grid item xs={12}>

          <Grid container spacing={5} sx={{ mb: 5 }}>
            <Grid item xs={2}></Grid>
            <Grid item xs={2}>
              <span style={{ fontSize: 24, fontWeight: "bold" }}>
                {"Weekly Statistic"}
              </span>
            </Grid>
            <Grid item xs={2}>

            </Grid>
            <Grid item xs={1.5}  >

              <Box

                sx={{
                  width: 200,
                  height: 65,
                  backgroundColor: "green",
                  "&:hover": {
                    backgroundColor: "green",
                    opacity: [0.9, 0.8, 0.7],
                  },
                }}
              >
                <div
                  style={{
                    color: "white",
                    fontWeight: "bold",
                    marginLeft: "15px",
                  }}
                >
                  <span>{t("Entrance")}</span>
                  <p style={{ fontSize: 28 }}><CountUp end={dataCard.Entrance} /></p>
                </div>
              </Box>
            </Grid>

            <Grid item xs={1.5}>
              <Box
                sx={{
                  width: 200,
                  height: 65,
                  backgroundColor: "red",
                  "&:hover": {
                    backgroundColor: "red",
                    opacity: [0.9, 0.8, 0.7],
                  },
                }}
              >
                <div
                  style={{
                    color: "white",
                    fontWeight: "bold",
                    marginLeft: "15px",
                  }}
                >
                  <span>{t("Issue")}</span>
                  <p style={{ fontSize: 28 }}><CountUp end={dataCard.Issue} /></p>
                </div>
              </Box>
            </Grid>

            <Grid item xs={1.5}>
              <Box
                sx={{
                  width: 200,
                  height: 65,
                  backgroundColor: "blue",
                  "&:hover": {
                    backgroundColor: "blue",
                    opacity: [0.9, 0.8, 0.7],
                  },
                }}
              >
                <div
                  style={{
                    color: "white",
                    fontWeight: "bold",
                    marginLeft: "15px",
                  }}
                >
                  <span>{t("Registerd tag")}</span>
                  <p style={{ fontSize: 28 }}><CountUp end={dataCard.RegisterdTag} /></p>
                </div>
              </Box>
            </Grid>
          </Grid>

        </Grid>

        <Grid item xs={12} sx={{ height: '400px' }}>
          <Grid container spacing={1}>
            <Grid item xs={8} >

              <Card >
                <CardContent>

                  <RFDI_AreaChart />
                </CardContent>
              </Card>

            </Grid>
            <Grid item xs={4} >
              <Card >
                <CardContent>
                  <span style={{ fontSize: 18, fontWeight: "bold" }}>{t("Passes of Gate (Issue/Entrance)")}</span>
                  <RFDI_LineChart data={dataLine} />
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <Grid item xs={12} >

      </Grid>
      <Card sx={{ height: '50px', my: 1 }}>
        <CardContent>

          <Grid
            container
            direction="row"
            justifyContent="space-between"
            alignItems="center"
          >

            <Grid item sx={{ ml: '250px' }}>
              <h5 >Total Entrance <span className="badge badge-success"><CountUp end={dataCard.Entrance_Total} /></span></h5>

            </Grid>


            <Grid item sx={{ mr: '250px' }}>
              <h5 >Total Issue <span className="badge badge-danger"><CountUp end={dataCard.Issue_Total} /></span></h5>
            </Grid>

          </Grid>
        </CardContent>
      </Card>

      <Card >
        <CardContent>

          <Grid
            container
            direction="row"
            justifyContent="flex-end"
            alignItems="center"
            sx={{ mb: 1 }}
          >
            <Grid item>
            </Grid>
            <Grid item container
              direction="row"
              justifyContent="flex-end"
              alignItems="center">
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <SelectBox
                  variantInput="standard"
                  placeholder="Location"
                  url={`RFDIDashboardApi/get-location`}
                  onChange={(item) => {
                    setSearchValue({ ...searchValue, LocationId: item.value });
                  }}
                  sx={{ mx: 2, width: '180px' }}
                />
                <SelectBox
                  variantInput="standard"
                  placeholder="Reader"
                  url={`RFDIDashboardApi/get-reader`}
                  onChange={(item) => {
                    setSearchValue({ ...searchValue, ReaderId: item.value });
                  }}
                  sx={{ mx: 2, width: '180px' }}
                />
                <DatePicker
                  label="Start Date"
                  value={searchValue.startdate}
                  mask="____-__-__"
                  inputFormat="yyyy-MM-dd"
                  onChange={(newValue) => {
                    setSearchValue({ ...searchValue, startdate: newValue ? moment(newValue).format('YYYY-MM-DD') : null })
                  }}
                  renderInput={(params) => <TextField sx={{ width: 180, mx: 2 }} variant="standard" {...params} />}
                />
                <DatePicker
                  inputFormat="yyyy-MM-dd"
                  mask="____-__-__"
                  label="End Date"
                  value={searchValue.enddate}
                  onChange={(newValue) => {
                    setSearchValue({ ...searchValue, enddate: newValue ? moment(newValue).format('YYYY-MM-DD') : null })
                  }}
                  renderInput={(params) => <TextField sx={{ width: 180, mx: 2 }} variant="standard" {...params} />}
                />
              </LocalizationProvider>
              <Button
                variant="contained"
                color="primary"
                sx={{ mx: 3, boxShadow: 1, mb: -2 }}
                onClick={search}
              >
                {t("Search")}
              </Button>
            </Grid>
          </Grid>

          <DataTable
            ref={gridRef}
            url="RFDIDashboardApi"
            columns={columns}
            rowHeight={35}
            headerHeight={25}
            sx={{ height: 250 }}
            IsPagingServer={true}
            getRowId={(rows) => rows.Id}
          />
        </CardContent>
      </Card>

    </Box>
  );
}

export default RFDI_Dashboard;
