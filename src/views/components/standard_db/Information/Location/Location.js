import React, { useEffect, useRef, useState } from 'react'
import DeleteIcon from '@mui/icons-material/Delete'
import EditIcon from '@mui/icons-material/Edit'
import UndoIcon from '@mui/icons-material/Undo';
import { FormControlLabel, Grid, IconButton, Switch, TextField } from '@mui/material'
import { useIntl } from 'react-intl'
import { MuiButton, MuiDataGrid, MuiSelectField } from '@controls'
import { locationService } from '@services'
import { useModal } from "@basesShared"
import { ErrorAlert, SuccessAlert } from '@utils'
import moment from 'moment';
import { LocationDto } from "@models"
import CreateLocationDialog from './CreateLocationDialog'
import ModifyLocationDialog from './ModifyLocationDialog'



const Location = (props) => {
    const intl = useIntl();

  let isRendered = useRef(true);
  const [locationState, setLocationState] = useState({
    isLoading: false,
    data: [],
    totalRow: 0,
    page: 1,
    pageSize: 20,
    searchData: {
      keyWord: '',
      AreaId: null,
      showDelete: true
    }
  });

  const [isOpenCreateDialog, setIsOpenCreateDialog] = useState(false)
  const [isOpenModifyDialog, setIsOpenModifyDialog] = useState(false)

  const [selectedRow, setSelectedRow] = useState({
    ...LocationDto
  })
  const [newData, setNewData] = useState({ ...LocationDto })
   const [AreaList, setAreaList] = useState([]); //Area

  const toggleCreateDialog = () => {

    setIsOpenCreateDialog(!isOpenCreateDialog);
  }
  const toggleModifyDialog = () => {
    setIsOpenModifyDialog(!isOpenModifyDialog);
  }

  const columns = [
    {
      field: 'id', headerName: '', flex: 0.01, align: 'center',
      filterable: false,
      renderCell: (index) => (index.api.getRowIndex(index.row.LocationId) + 1) + (locationState.page - 1) * locationState.pageSize,
    },
    { field: 'LocationId', hide: true },
    { field: 'row_version', hide: true },
    {
      field: "action",
      headerName: "",
      width: 100,
      disableClickEventBubbling: true,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => {
        return (
          <Grid container spacing={1} alignItems="center" justifyContent="center">
            
            <Grid item xs={6} style={{ textAlign: "center" }}>
              <IconButton
                aria-label="edit"
                color="warning"
                size="small"
                sx={[{ '&:hover': { border: '1px solid orange', }, }]}
                onClick={toggleModifyDialog}
              >
                <EditIcon fontSize="inherit" />
              </IconButton>
            </Grid>
            <Grid item xs={6} style={{ textAlign: "center" }}>
              <IconButton
                aria-label="delete"
                color="error"
                size="small"
                sx={[{ '&:hover': { border: '1px solid red', }, }]}
                onClick={() => handleDelete(params.row)}
              >
                {params.row.isActived ? <DeleteIcon fontSize="inherit" /> : <UndoIcon fontSize="inherit" />}
              </IconButton>
            </Grid>
          </Grid>
        );
      },
    },
    { field: 'LocationCode', headerName: intl.formatMessage({ id: "location.LocationCode" }), flex: 0.5, },
    { field: 'AreaName', headerName: intl.formatMessage({ id: "location.AreaId" }), flex: 0.5, },
    { field: 'createdName', headerName: 'User Create', width: 150, },
    {
        field: 'createdDate', headerName: intl.formatMessage({ id: "general.created_date" }), width: 150, valueFormatter: params => {
            if (params.value !== null) {
                return moment(params?.value).add(7, 'hours').format("YYYY-MM-DD HH:mm:ss")
            }
        },
    },
    { field: 'modifiedName', headerName: 'User Update', width: 150, },
    {
        field: 'modifiedDate', headerName: intl.formatMessage({ id: "general.modified_date" }), width: 150, valueFormatter: params => {
            if (params.value !== null) {
                return moment(params?.value).add(7, 'hours').format("YYYY-MM-DD HH:mm:ss")
            }
        },
    },
  ];

  useEffect(() => {
    getArea();
    return () => { isRendered = false; }
  }, [])

  useEffect(() => {
    fetchData();
  }, [locationState.page, locationState.pageSize, locationState.searchData.showDelete]);

  useEffect(() => {
    if (!_.isEmpty(newData) && isRendered && !_.isEqual(newData, LocationDto)) {
      const data = [newData, ...locationState.data];
      if (data.length > locationState.pageSize) {
        data.pop();
      }
      setLocationState({
        ...locationState
        , data: [...data]
        , totalRow: locationState.totalRow + 1
      });
    }
  }, [newData]);

  useEffect(() => {
    if (!_.isEmpty(selectedRow) && !_.isEqual(selectedRow, LocationDto) && isRendered) {
      let newArr = [...locationState.data]
      const index = _.findIndex(newArr, function (o) { return o.LocationId == selectedRow.LocationId; });
      if (index !== -1) {
        newArr[index] = selectedRow
      }
      setLocationState({ ...locationState, data: [...newArr] });
    }
  }, [selectedRow]);

  //handle
  const handleDelete = async (location) => {
    if (window.confirm(intl.formatMessage({ id: location.isActived ? 'general.confirm_delete' : 'general.confirm_redo_deleted' }))) {
      try {
        let res = await locationService.deleteLocation({ LocationId: location.LocationId, row_version: location.row_version });
        if (res && res.HttpResponseCode === 200) {
          SuccessAlert(intl.formatMessage({ id: 'general.success' }))
          await fetchData();
        }
        else {
          ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }))
        }
      } catch (error) {
        console.log(error)
      }
    }
  }

  const handleRowSelection = (arrIds) => {

    const rowSelected = locationState.data.filter(function (item) {
        return item.LocationId === arrIds[0]
    });
    if (rowSelected && rowSelected.length > 0) {
        setSelectedRow({ ...rowSelected[0] });
    }
    else {
        setSelectedRow({ ...LocationDto });
    }
  }

  const handleSearch = (e, inputName) => {
    let newSearchData = { ...locationState.searchData };
    newSearchData[inputName] = e;
    if (inputName == 'showDelete') {
        setLocationState({ ...locationState, page: 1, searchData: { ...newSearchData } })
    }
    else {
        setLocationState({ ...locationState, searchData: { ...newSearchData } })
    }
  }

  async function fetchData() {
    setLocationState({ ...locationState, isLoading: true });
    const params = {
      page: locationState.page,
      pageSize: locationState.pageSize,
      keyWord: locationState.searchData.keyWord,
      AreaId: locationState.searchData.AreaId,
      showDelete: locationState.searchData.showDelete

    }
    const res = await locationService.getLocationList(params);
    if (res && res.Data && isRendered)
      setLocationState({
        ...locationState
        , data: res.Data ?? []
        , totalRow: res.TotalRow
        , isLoading: false
      });
  }

  const getArea = async () => {
    const res = await locationService.GetArea();
    if (res.HttpResponseCode === 200 && res.Data && isRendered) {
        setAreaList([...res.Data])
    }
  }

  return (
    <React.Fragment>
      <Grid container
        direction="row"
        justifyContent="space-between"
        alignItems="width-end">
        <Grid item xs={6}>
          <MuiButton text="create" color='success' 
          onClick={toggleCreateDialog}
        />
        </Grid>
        <Grid item>
          <TextField
            sx={{ width: 220 }}
            fullWidth
            variant="standard"
            size='small'
            label='Code'
            onChange={(e) => handleSearch(e.target.value, 'keyWord')}
          />
        </Grid>
        <Grid item>
          <MuiSelectField
            label={intl.formatMessage({ id: 'location.AreaId' })}
            options={AreaList}
            displayLabel="commonDetailName"
            displayValue="commonDetailId"
            onChange={(e, item) => handleSearch(item ? item.commonDetailId ?? null : null, 'AreaId')}
            variant="standard"
            sx={{ width: 220 }}
          />
        </Grid>
        <Grid item>
          <MuiButton 
            text="search" 
            color='info' 
            onClick={fetchData} sx={{ mt: 1 }} 
            />
        </Grid>
        <Grid item>
          <FormControlLabel
            sx={{ mt: 1 }}
            control={<Switch defaultChecked={true} color="primary" onChange={(e) => handleSearch(e.target.checked, 'showDelete')} />}
            label={intl.formatMessage({ id: locationState.searchData.showDelete ? 'location.data_actived' : 'location.data_deleted' })} 
            />
        </Grid>
      </Grid>
      <MuiDataGrid
                getData={locationService.getLocationList}
                showLoading={locationState.isLoading}
                isPagingServer={true}
                headerHeight={45}
                gridHeight={736}
                columns={columns}
                rows={locationState.data}
                page={locationState.page - 1}
                pageSize={locationState.pageSize}
                rowCount={locationState.totalRow}
                //rowsPerPageOptions={[5, 10, 20, 30]}
                disableGrid={locationState.isLoading}

                onPageChange={(newPage) => {
                    setLocationState({ ...locationState, page: newPage + 1 });
                }}
                // onPageSizeChange={(newPageSize) => {
                //     setLocationState({ ...locationState, pageSize: newPageSize, page: 1 });
                // }}
                getRowId={(rows) => rows.LocationId}
                onSelectionModelChange={(newSelectedRowId) => {
                    handleRowSelection(newSelectedRowId)
                }}

                getRowClassName={(params) => {
                    if (_.isEqual(params.row, newData)) {
                        return `Mui-created`
                    }
                }}
            />
      
      <CreateLocationDialog
        initModal={LocationDto}
        setNewData={setNewData}
        isOpen={isOpenCreateDialog}
        onClose={toggleCreateDialog}
      />

      <ModifyLocationDialog
          initModal={selectedRow}
          setModifyData={setSelectedRow}
          isOpen={isOpenModifyDialog}
          onClose={toggleModifyDialog}
      />
    </React.Fragment>

  )
}

export default Location;