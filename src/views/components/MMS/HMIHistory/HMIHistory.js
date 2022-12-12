import React, { useEffect, useRef, useState } from 'react';
import { MuiAutocomplete, MuiButton, MuiDataGrid, MuiDateField, MuiSearchField } from '@controls';
import { FormControlLabel, Grid, Switch } from '@mui/material';
import { WorkOrderDto } from '@models';
import { addDays, ErrorAlert, SuccessAlert } from '@utils';
import { useIntl } from 'react-intl';

const HMIHistory = (props) => {
  const initStartDate = new Date();
  const intl = useIntl();
  const [showActivedData, setShowActivedData] = useState(true);
  const [workOrderState, setWorkOrderState] = useState({
    isLoading: false,
    data: [],
    totalRow: 0,
    page: 1,
    pageSize: 20,
    searchData: {
      ...WorkOrderDto,
      StartSearchingDate: initStartDate,
      EndSearchingDate: addDays(initStartDate, 30),
    },
  });
  const fetchData = () => {
    console.log('DATAA');
  };
  const changeSearchData = (e, inputName) => {
    let newSearchData = { ...workOrderState.searchData };

    newSearchData[inputName] = e;

    switch (inputName) {
      case 'StartSearchingDate':
      case 'EndSearchingDate':
        newSearchData[inputName] = e;
        break;
      case 'MaterialId':
        newSearchData[inputName] = e ? e.MaterialId : WorkOrderDto.MaterialId;
        newSearchData['MaterialCode'] = e ? e.MaterialCode : WorkOrderDto.MaterialCode;
        break;

      default:
        newSearchData[inputName] = e.target.value;
        break;
    }

    setWorkOrderState({
      ...workOrderState,
      searchData: { ...newSearchData },
    });
  };
  const getSearchMaterialArr = () => {
    console.log('asas');
  };
  const handleshowActivedData = async (event) => {
    setShowActivedData(event.target.checked);
    if (!event.target.checked) {
      setWorkOrderState({
        ...workOrderState,
        page: 1,
      });
    }
  };
  return (
    <React.Fragment>
      <Grid container spacing={2} justifyContent="flex-end" alignItems="flex-end">
        <Grid item xs={1.5}></Grid>
        <Grid item xs>
          <MuiSearchField
            label="work_order.WoCode"
            name="WoCode"
            onClick={fetchData}
            onChange={(e) => changeSearchData(e, 'WoCode')}
          />
        </Grid>
        <Grid item xs>
          <MuiAutocomplete
            label={intl.formatMessage({ id: 'work_order.MaterialCode' })}
            fetchDataFunc={getSearchMaterialArr}
            displayLabel="MaterialCode"
            displayValue="MaterialId"
            displayGroup="GroupMaterial"
            value={
              workOrderState.searchData.MaterialId !== 0
                ? {
                    MaterialId: workOrderState.searchData.MaterialId,
                    MaterialCode: workOrderState.searchData.MaterialCode,
                  }
                : null
            }
            onChange={(e, item) => {
              changeSearchData(item ?? null, 'MaterialId');
            }}
            variant="standard"
          />
        </Grid>
        <Grid item>
          <MuiDateField
            disabled={workOrderState.isLoading}
            label={intl.formatMessage({
              id: 'general.StartSearchingDate',
            })}
            value={workOrderState.searchData.StartSearchingDate}
            onChange={(e) => {
              changeSearchData(e, 'StartSearchingDate');
            }}
            variant="standard"
          />
        </Grid>
        <Grid item xs>
          <MuiDateField
            disabled={workOrderState.isLoading}
            label={intl.formatMessage({
              id: 'general.EndSearchingDate',
            })}
            value={workOrderState.searchData.EndSearchingDate}
            onChange={(e) => {
              changeSearchData(e, 'EndSearchingDate');
            }}
            variant="standard"
          />
        </Grid>
        <Grid item xs={2.5}>
          <Grid container justifyContent="space-around" alignItems="flex-end">
            <Grid item>
              <MuiButton text="search" color="info" onClick={fetchData} />
            </Grid>
            <Grid item>
              <FormControlLabel
                sx={{ mb: 0, ml: '1px' }}
                control={<Switch defaultChecked={true} color="primary" onChange={(e) => handleshowActivedData(e)} />}
                label={showActivedData ? 'Actived' : 'Deleted'}
              />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </React.Fragment>
  );
};
export default HMIHistory;
