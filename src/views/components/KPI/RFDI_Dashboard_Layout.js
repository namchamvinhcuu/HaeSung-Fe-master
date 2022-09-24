import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import ReactDOM from 'react-dom';
import { api_get } from '@utils';
import { SelectBox, DataTable } from '@basesShared';
import { TextField, Box, Button, Grid, Card, CardContent } from '@mui/material';
import * as ConfigConstants from '@constants/ConfigConstants';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import moment from 'moment';
import HideImageIcon from '@mui/icons-material/HideImage';
import { PhotoProvider, PhotoView } from 'react-photo-view';

const RFDI_Dashboard_Layout = ({ t }) => {
  const [searchValue, setSearchValue] = useState({ startdate: null, enddate: null });
  const [location, setLocation] = React.useState({});
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
    getLocation(0);
  }, []);

  const getLocation = (id) => {
    if (id != null && id != undefined)
      api_get(`RFDIDashboardApi/get-location-default/${id}`).then((res) => {
        setLocation(res);
      });
  }

  const search = () => {
    gridRef.current.search(searchValue);
  };

  return (
    <Box sx={{
      pb: 5,
      height: 800,
      width: "100%"
    }}>
      <Grid item xs={12} sx={{ mb: 1 }}>
        <Card >
          <CardContent>
            <Grid sx={{ height: '400px', mb: 1 }}>
              <SelectBox
                key={"l" + location.location_id}
                variantInput="standard"
                placeholder="Location"
                url={`RFDIDashboardApi/get-location`}
                onChange={(item) => {
                  getLocation(item.value);
                }}
                sx={{ mx: 2, width: '180px', mb: 1 }}
                defaultValue={{ title: location.location_name, value: location.location_id }}
              />
              <div style={{ textAlign: 'center' }}>
                {location.url_image ?
                  <PhotoProvider>
                    <PhotoView src={ConfigConstants.BASE_URL + "files/" + location.url_image}>
                      <img
                        src={ConfigConstants.BASE_URL + "files/" + location.url_image}
                        crossOrigin="anonymous"
                        alt={location.location_name}
                        style={{ height: '350px', width: 'auto' }}
                      />
                    </PhotoView>
                  </PhotoProvider>
                  :
                  <div style={{ fontSize: '25px', marginTop: '100px' }}>
                    <HideImageIcon sx={{ fontSize: 40 }} />
                    <p>No image</p>
                  </div>
                }
              </div>
            </Grid>
          </CardContent>
        </Card>
      </Grid>

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
    </Box >
  );
}

export default RFDI_Dashboard_Layout;
