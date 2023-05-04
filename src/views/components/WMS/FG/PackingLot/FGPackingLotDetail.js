import { useModal } from '@basesShared';
import { CREATE_ACTION } from '@constants/ConfigConstants';
import { MuiButton, MuiDataGrid } from '@controls';
import DeleteIcon from '@mui/icons-material/Delete';
import UndoIcon from '@mui/icons-material/Undo';
import { Grid, IconButton } from '@mui/material';
import { fgPackingService } from '@services';
import { ErrorAlert, SuccessAlert } from '@utils';
import moment from 'moment';
import React, { useEffect, useRef, useState } from 'react';
import { useIntl } from 'react-intl';
import FGPackingLotDetailDialog from './FGPackingLotDetailDialog';

export default function FGPackingLotDetail({ PackingLabelId, newDataChild, handleUpdateQty, IsShipped }) {
  const intl = useIntl();
  let isRendered = useRef(true);
  const [mode, setMode] = useState(CREATE_ACTION);
  const { isShowing, toggle } = useModal();
  const [state, setState] = useState({
    isLoading: false,
    data: [],
    totalRow: 0,
    page: 1,
    pageSize: 7,
    searchData: { showDelete: true, MaterialId: null },
    PackingLabelId: PackingLabelId,
  });
  const [newData, setNewData] = useState({});
  const [rowData, setRowData] = useState({});

  const columns = [
    {
      field: 'id',
      headerName: '',
      flex: 0.1,
      align: 'center',
      filterable: false,
      renderCell: (index) => index.api.getRowIndex(index.row.LotId) + 1 + (state.page - 1) * state.pageSize,
    },
    { field: 'PackingLabelId', hide: true },
    { field: 'row_version', hide: true },
    {
      field: 'action',
      headerName: '',
      witdh: 100,
      disableClickEventBubbling: true,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => {
        return (
          <Grid container spacing={1} alignItems="center" justifyContent="center">
            <IconButton
              aria-label="delete"
              color="error"
              size="small"
              sx={[{ '&:hover': { border: '1px solid red' } }]}
              onClick={() => handleDelete(params.row)}
              disabled={IsShipped ? true : false}
            >
              {params.row.isActived ? <DeleteIcon fontSize="inherit" /> : <UndoIcon fontSize="inherit" />}
            </IconButton>
          </Grid>
        );
      },
    },
    {
      field: 'LotId',
      headerName: 'Lot',
      flex: 0.5,
    },
    {
      field: 'LotSerial',
      headerName: intl.formatMessage({ id: 'lot.LotSerial' }),
      flex: 0.5,
    },
    {
      field: 'Qty',
      headerName: intl.formatMessage({ id: 'packing.Qty' }),
      flex: 0.5,
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
      headerName: intl.formatMessage({ id: 'packing.PackingDate' }),
      flex: 0.5,
      valueFormatter: (params) =>
        params?.value ? moment(params?.value).add(7, 'hours').format('YYYY-MM-DD HH:mm:ss') : null,
    },
  ];

  //useEffect
  useEffect(() => {
    fetchData(PackingLabelId);
    return () => {
      isRendered = false;
    };
  }, [state.page, state.pageSize, PackingLabelId, state.searchData.showDelete]);

  useEffect(() => {
    if (!_.isEmpty(newData)) {
      const data = [newData, ...state.data];
      if (data.length > state.pageSize) {
        data.pop();
      }
      setState({
        ...state,
        data: [...data],
        totalRow: state.totalRow + 1,
      });
    }
  }, [newData]);

  useEffect(() => {
    if (!_.isEmpty(newDataChild)) {
      const data = [newDataChild, ...state.data];
      if (data.length > state.pageSize) {
        data.pop();
      }
      setState({
        ...state,
        data: [...data],
        totalRow: state.totalRow + 1,
      });
    }
  }, [newDataChild]);

  //handle
  const handleDelete = async (item) => {
    if (
      window.confirm(
        intl.formatMessage({ id: item.isActived ? 'general.confirm_delete' : 'general.confirm_redo_deleted' })
      )
    ) {
      try {
        let res = await fgPackingService.deletePADetail(item);
        if (res && res.HttpResponseCode === 200) {
          SuccessAlert(intl.formatMessage({ id: 'general.success' }));
          await fetchData(PackingLabelId);
          handleUpdateQty(item.Qty * -1);
        } else {
          ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const handleAdd = () => {
    setMode(CREATE_ACTION);
    setRowData();
    toggle();
  };

  async function fetchData(PackingLabelId) {
    setState({ ...state, isLoading: true });
    const params = {
      page: state.page,
      pageSize: state.pageSize,
      PackingLabelId: PackingLabelId,
    };
    const res = await fgPackingService.getPADetail(params);
    if (res && isRendered)
      setState({
        ...state,
        data: res.Data ?? [],
        totalRow: res.TotalRow,
        isLoading: false,
      });
  }

  return (
    <>
      <Grid container direction="row" justifyContent="space-between" alignItems="width-end" sx={{ mb: 0, mt: 2 }}>
        <Grid item xs={12}>
          <MuiButton
            text="create"
            color="success"
            onClick={handleAdd}
            sx={{ mt: 1, mb: 1 }}
            disabled={PackingLabelId && !IsShipped ? false : true}
          />
        </Grid>
      </Grid>
      <MuiDataGrid
        showLoading={state.isLoading}
        isPagingServer={true}
        headerHeight={45}
        columns={columns}
        rows={state.data}
        gridHeight={736}
        page={state.page - 1}
        pageSize={state.pageSize}
        rowCount={state.totalRow}
        onPageChange={(newPage) => setState({ ...state, page: newPage + 1 })}
        getRowId={(rows) => rows.LotId}
        getRowClassName={(params) => {
          if (_.isEqual(params.row, newData) || _.isEqual(params.row, newDataChild)) return `Mui-created`;
        }}
        initialState={{ pinnedColumns: { right: ['action'] } }}
      />

      <FGPackingLotDetailDialog
        initModal={rowData}
        isOpen={isShowing}
        onClose={toggle}
        setNewData={setNewData}
        handleUpdateQty={handleUpdateQty}
        mode={mode}
        PackingLabelId={PackingLabelId}
      />
    </>
  );
}
