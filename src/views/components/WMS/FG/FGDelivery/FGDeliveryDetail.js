import { Store } from '@appstate';
import { User_Operations } from '@appstate/user';
import { CombineDispatchToProps, CombineStateToProps } from '@plugins/helperJS';
import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { MuiDataGrid, MuiTextField, MuiButton } from '@controls';
import { PackingLabelDto } from '@models';
import { FormControlLabel, Switch, Tooltip, Typography } from '@mui/material';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import { fgDeliveryService } from '@services';
import { addDays, ErrorAlert, SuccessAlert } from '@utils';
import _ from 'lodash';
import moment from 'moment';
import { useIntl } from 'react-intl';
import DeleteIcon from '@mui/icons-material/Delete';

const FGDeliveryDetail = ({ dataRow }) => {
  let isRendered = useRef(true);
  const intl = useIntl();
  const initETDLoad = new Date();
  const lotInputRef = useRef(null);
  const [deliveryFGDetail, setdeliveryFGDetail] = useState({
    isLoading: false,
    data: [],
    totalRow: 0,
    page: 1,
    pageSize: 8,
    searchData: {
      ...PackingLabelDto,
    },
    DoId: dataRow?.arrIds,
  });

  const [newData, setNewData] = useState({ ...PackingLabelDto });

  useEffect(() => {
    if (!_.isEmpty(newData) && !_.isEqual(newData, PackingLabelDto)) {
      let newArr = [...deliveryFGDetail.data];
      const index = _.findIndex(newArr, function (o) {
        return o.PackingLabelId == newData.PackingLabelId;
      });

      if (index !== -1) {
        //update
        newArr[index] = newData;
        setdeliveryFGDetail({
          ...deliveryFGDetail,
          data: newArr,
          totalRow: deliveryFGDetail.totalRow + 1,
        });
      } else {
        const data = [newData, ...deliveryFGDetail.data];
        if (data.length > deliveryFGDetail.pageSize) {
          data.pop();
        }
        if (isRendered)
          setdeliveryFGDetail({
            ...deliveryFGDetail,
            data: [...data],
            totalRow: deliveryFGDetail.totalRow + 1,
          });
      }
    }
  }, [newData]);

  const handleDelete = async (deliveryOrder) => {
    if (
      window.confirm(
        intl.formatMessage({
          id: 'general.confirm_delete',
        })
      )
    ) {
      try {
        let res = await fgDeliveryService.handleDelete(deliveryOrder);
        if (res && res.HttpResponseCode === 200) {
          await fetchData();
          SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }));
        } else {
          ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const fetchData = async (dataRow) => {
    setdeliveryFGDetail({ ...deliveryFGDetail, isLoading: true });
    const params = {
      page: deliveryFGDetail.page,
      pageSize: deliveryFGDetail.pageSize,
      DoId: dataRow?.arrIds,
    };
    console.log("🚀 ~ file: FGDeliveryDetail.js:97 ~ fetchData ~ params:", params)
    const res = await fgDeliveryService.getAll(params);
    if (res && res.Data && isRendered)
      setdeliveryFGDetail({
        ...deliveryFGDetail,
        data: res.Data ?? [],
        totalRow: res.TotalRow,
        isLoading: false,
      });
  };

  useEffect(() => {
    fetchData(dataRow);
  }, [deliveryFGDetail.page, deliveryFGDetail.pageSize, dataRow]);

  const columns = [
    { field: 'PackingLabelId', headerName: '', hide: true },

    {
      field: 'id',
      headerName: '',
      width: 80,
      filterable: false,
      renderCell: (index) =>
        index.api.getRowIndex(index.row.PackingLabelId) + 1 + (deliveryFGDetail.page - 1) * deliveryFGDetail.pageSize,
    },

    {
      field: 'action',
      headerName: '',
      width: 80,
      // headerAlign: 'center',
      disableClickEventBubbling: true,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => {
        return (
          <Grid container spacing={1} alignItems="center" justifyContent="center">
            <Grid item xs={6}>
              <IconButton
                aria-label="delete"
                color="error"
                size="small"
                sx={[{ '&:hover': { border: '1px solid red' } }]}
                onClick={() => handleDelete(params.row)}
              >
                <DeleteIcon fontSize="inherit" />
              </IconButton>
            </Grid>
          </Grid>
        );
      },
    },

    {
      field: 'DoCode',
      headerName: intl.formatMessage({ id: 'delivery_order.DoCode' }),
      /*flex: 0.7,*/ width: 135,
    },
    {
      field: 'MaterialCode',
      headerName: 'Material Code',
      /*flex: 0.7,*/ width: 135,
    },
    {
      field: 'PackingSerial',
      headerName: 'Packing Serial',
      /*flex: 0.7,*/ width: 135,
    },
    {
      field: 'SamsungLabelCode',
      headerName: 'Samsung Label Code',
      /*flex: 0.7,*/ width: 200,
    },

    {
      field: 'Qty',
      headerName: intl.formatMessage({ id: 'delivery_order.OrderQty' }),
      /*flex: 0.7,*/ width: 120,
      renderCell: (params) => {
        if (params.value !== null) {
          return (
            params.value.toLocaleString()
          );
        }
      },
    },

    {
      field: 'PackingDate',
      headerName: 'Packing Date',
      width: 150,
      valueFormatter: (params) => {
        if (params.value !== null) {
          return moment(params?.value).add(7, 'hours').format('YYYY-MM-DD HH:mm:ss');
        }
      },
    },

    {
      field: 'createdName',
      headerName: intl.formatMessage({ id: 'general.createdName' }),
      width: 150,
    },

    {
      field: 'createdDate',
      headerName: intl.formatMessage({ id: 'general.created_date' }),
      width: 150,
      valueFormatter: (params) => {
        if (params.value !== null) {
          return moment(params?.value).add(7, 'hours').format('YYYY-MM-DD HH:mm:ss');
        }
      },
    },

    {
      field: 'modifiedName',
      headerName: intl.formatMessage({ id: 'general.modifiedName' }),
      width: 150,
    },

    {
      field: 'modifiedDate',
      headerName: intl.formatMessage({ id: 'general.modified_date' }),
      width: 150,
      valueFormatter: (params) => {
        if (params.value !== null) {
          return moment(params?.value).add(7, 'hours').format('YYYY-MM-DD HH:mm:ss');
        }
      },
    },
  ];
  const handleLotInputChange = (e) => {
    lotInputRef.current.value = e.target.value;
  };

  const keyPress = async (e) => {
    if (e.key === 'Enter') {
      await scanBtnClick();
    }
  };

  const scanBtnClick = async () => {
    let inputVal = '';

    if (lotInputRef.current.value) {
      inputVal = lotInputRef.current.value.trim();
    }
    await handleReceivingLot(inputVal);
    lotInputRef.current.value = '';
    lotInputRef.current.focus();
  };
  const handleReceivingLot = async (inputValue) => {
    const res = await fgDeliveryService.scanFGDelivery({
      PackingLabelId: inputValue,
      DoId: String(dataRow?.arrIds),
      row_version: dataRow?.row_version
    });

    if (res && isRendered) {
      if (res.HttpResponseCode === 200 && res.Data) {
        setNewData({ ...res.Data });
        lotInputRef.current.value;
        SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }));
      } else {
        ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
      }
    } else {
      ErrorAlert(intl.formatMessage({ id: 'general.system_error' }));
    }
  };
  return (
    <React.Fragment>
      <Grid container direction="row" justifyContent="center" alignItems="center" className="py-2 my-1">
        <Grid item sx={{ minWidth: '35%' }}>
          <MuiTextField
            ref={lotInputRef}
            label="Lot"
            // autoFocus={focus}
            // value={lotInputRef.current.value}
            onChange={handleLotInputChange}
            onKeyDown={keyPress}
            disabled={dataRow?.arrIds > 0 ? false : true}
          />
        </Grid>
        <Grid item>
          <MuiButton
            text="scan"
            color="success"
            onClick={scanBtnClick}
            sx={{ whiteSpace: 'nowrap' }}
            disabled={dataRow?.arrIds > 0 ? false : true}
          />
        </Grid>
      </Grid>

      <MuiDataGrid
        showLoading={deliveryFGDetail.isLoading}
        isPagingServer={true}
        headerHeight={45}
        // rowHeight={30}
        gridHeight={736}
        columns={columns}
        rows={deliveryFGDetail.data}
        page={deliveryFGDetail.page - 1}
        pageSize={deliveryFGDetail.pageSize}
        rowCount={deliveryFGDetail.totalRow}
        onPageChange={(newPage) => {
          setdeliveryFGDetail({ ...deliveryFGDetail, page: newPage + 1 });
        }}
        getRowId={(rows) => rows.PackingLabelId}
        getRowClassName={(params) => {
          if (_.isEqual(params.row, newData)) {
            return `Mui-created`;
          }
        }}
        initialState={{
          pinnedColumns: { left: ['id'], right: ['action'] },
        }}
      />
    </React.Fragment>
  );
};

User_Operations.toString = function () {
  return 'User_Operations';
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

export default connect(mapStateToProps, mapDispatchToProps)(FGDeliveryDetail);
