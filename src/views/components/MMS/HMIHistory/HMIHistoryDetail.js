import React, { useEffect, useRef, useState } from 'react';
import { MuiButton, MuiDataGrid, MuiSearchField, MuiSelectField } from '@controls';
import { hmiService, workOrderService } from '@services';
import moment from 'moment';
const HMIHistoryDetail = ({ WoId }) => {
  let isRendered = useRef(true);
  const [hmiDetail, setHMIDetail] = useState({
    isLoading: false,
    data: [],
    totalRow: 0,
    page: 1,
    pageSize: 8,
    searchData: {},
    WoId: WoId,
  });

  const columns = [
    { field: 'Id', headerName: '', hide: true },
    {
      field: 'id',
      headerName: '',
      width: 80,
      filterable: false,
      renderCell: (index) => index.api.getRowIndex(index.row.Id) + 1 + (hmiDetail.page - 1) * hmiDetail.pageSize,
    },

    {
      field: 'WoCode',
      headerName: 'WO Code',
      width: 150,
    },
    {
      field: 'MoldCode',
      headerName: 'Mold Code',
      width: 120,
    },
    {
      field: 'MACAddress',
      headerName: 'MAC Address',
      width: 200,
    },
    {
      field: 'HMIStatusName',
      headerName: 'HMI Status',
      width: 200,
    },
    {
      field: 'PostQty',
      headerName: 'Post Qty',
      width: 200,
      renderCell: (params) => {
        if (params.value !== null) {
          return (
            params.value.toLocaleString()
          );
        }
      },
    },

    {
      field: 'EventTime',
      headerName: 'Event Time',
      width: 150,
      valueFormatter: (params) => {
        if (params.value !== null) {
          return moment(params?.value).add(7, 'hours').format('YYYY-MM-DD HH:mm:ss');
        }
      },
    },
    {
      field: 'Remark',
      headerName: 'Remark',
      width: 200,
    },
  ];
  async function fetchData(WoId) {
    setHMIDetail({ ...hmiDetail, isLoading: true });
    const params = {
      page: hmiDetail.page,
      pageSize: hmiDetail.pageSize,
      WoId: WoId,
    };
    const res = await hmiService.getDetailList(params);
    if (res && res.Data && isRendered)
      setHMIDetail({
        ...hmiDetail,
        data: res.Data ?? [],
        totalRow: res.TotalRow,
        isLoading: false,
      });
  }
  useEffect(() => {
    fetchData(WoId);
  }, [hmiDetail.page, hmiDetail.pageSize, WoId]);
  return (
    <React.Fragment>
      <MuiDataGrid
        showLoading={hmiDetail.isLoading}
        isPagingServer={true}
        headerHeight={45}
        // rowHeight={30}
        gridHeight={350}
        columns={columns}
        rows={hmiDetail.data}
        page={hmiDetail.page - 1}
        pageSize={hmiDetail.pageSize}
        rowCount={hmiDetail.totalRow}
        // rowsPerPageOptions={[5, 10, 20, 30]}

        onPageChange={(newPage) => {
          setHMIDetail({ ...hmiDetail, page: newPage + 1 });
        }}
        // onPageSizeChange={(newPageSize) => {
        //     setLineState({ ...lineState, pageSize: newPageSize, page: 1 });
        // }}
        getRowId={(rows) => rows.Id}
        // onSelectionModelChange={(newSelectedRowId) => {
        //   handleRowSelection(newSelectedRowId);
        // }}
        // selectionModel={selectedRow.menuId}

        initialState={{ pinnedColumns: { right: ['action'] } }}
      />
    </React.Fragment>
  );
};
export default HMIHistoryDetail;
