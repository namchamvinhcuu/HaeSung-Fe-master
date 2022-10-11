import React, { forwardRef, useRef, useImperativeHandle, useState } from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import { DataGrid } from "@mui/x-data-grid";
import BoxLoading from './BoxLoading'
import { api_get, api_post, SuccessAlert, ErrorAlert } from "@utils";
import * as ConfigConstants from '@constants/ConfigConstants';
import { styled } from '@mui/material/styles';

const StyledDataGrid = styled(DataGrid)(({ theme }) => ({

  boxShadow: 'rgba(0, 0, 0, 0.1) 0px 0px 5px 0px, rgba(0, 0, 0, 0.1) 0px 0px 1px 0px;',
  color:
    theme.palette.mode === 'light' ? 'rgba(0,0,0,.85)' : 'rgba(255,255,255,0.85)',
  fontFamily: [
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial'
  ].join(','),
  WebkitFontSmoothing: 'auto',
  letterSpacing: 'normal',
  '& .MuiDataGrid-columnsContainer': {
    backgroundColor: theme.palette.mode === 'light' ? '#fafafa' : '#1d1d1d',
  },
  '& .MuiDataGrid-iconSeparator': {
    display: 'none',
  },
  '& .MuiDataGrid-columnHeader, .MuiDataGrid-cell': {
    borderRight: `1px solid ${theme.palette.mode === 'light' ? '#f0f0f0' : '#303030'
      }`,
  },
  '& .MuiDataGrid-columnsContainer, .MuiDataGrid-cell': {
    borderBottom: `1px solid ${theme.palette.mode === 'light' ? '#f0f0f0' : '#303030'
      }`,
  },
  '& .MuiDataGrid-cell': {
    color:
      theme.palette.mode === 'light' ? 'rgba(0,0,0,.85)' : 'rgba(255,255,255,0.65)',
  },
  // '& .MuiDataGrid-cell:hover': {
  //   color: 'blue',
  // },

  '& .MuiPaginationItem-root': {
    borderRadius: 0,
  },

  '& .MuiDataGrid-columnHeaders': {
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    color: 'white',
    fontWeight: 'bold',
  },

  '& .MuiDataGrid-row.Mui-selected': {
    backgroundColor: 'palegoldenrod !important'
  },


}));



//by mrhieu84 23-6-2022
class DataTable extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      isGettingData: false,
      isFirstloading: true,
      datasearch: {},
      rows: [],
      pageSize: props.pageSizeIndex ?? 10,
      rowCount: 0,
      currentPage: 0,
      isPaging: false
    };
  }

  componentWillUnmount() {

  }

  UNSAFE_componentWillMount() {

    this.loadData();
  }

  componentDidUpdate(prevProps, prevState) {
    this.props.setTrigger({
      refreshGrid: this.refreshGrid,
      search: this.search,
      addNewRow: this.addNewRow,
      updateRow: this.updateRow,
      getDataGrid: this.getDataGrid,
      // onRefreshComplete:this.onRefreshComplete
    })

    const { url } = this.props;

    if (prevState.pageSize != this.state.pageSize || url !== prevProps.url) {
      this.loadData();
    }
  }

  refreshGrid = () => {
    return this.loadData(this.state.datasearch);
  }
  search = (datasearch) => {

    return this.loadData(datasearch, true);
  }

  addNewRow = (dataRow) => {
    const newRows = [dataRow].concat(this.state.rows);
    this.setState({ rows: newRows })
  }

  updateRow = (dataRow) => {
    var listrows = this.state.rows.map((row, index) =>
      row.id === dataRow.id ? { ...row, ...dataRow } : row,
    );
    this.setState({ rows: listrows })
  }

  getDataGrid = () => {
    return { rows: this.state.rows, total: this.state.rowCount }
  }


  loadData(datasearch, IsResetPage) {
    const { url, rows, IsPagingServer } = this.props;
    //  if (rows!==undefined ) return;
    if (url === undefined) {

      this.setState({ rows: this.props.rows })
      return;
    }
    let filterObj = datasearch || {};
    const pageSize = this.props.pageSize || this.state.pageSize
    if (IsPagingServer !== undefined) {

      filterObj = { ...datasearch, page: IsResetPage ? 0 : this.state.currentPage, pagesize: pageSize }

    }

    var objstate = { isGettingData: true, pageSize: pageSize }
    if (IsResetPage) {
      objstate.currentPage = 0;
    }
    if (datasearch) objstate.isFirstloading = true;
    this.setState({ ...objstate, datasearch: datasearch })


    return new Promise((resolve, reject) => {

      if (!url) {
        this.setState({ isGettingData: false, isFirstloading: false, rowCount: 0, rows: [] })
        resolve([]);
        return;
      }


      api_get(url, filterObj).then((data) => {
        let rows = []
        if (data.hasOwnProperty("items"))
          rows = data.items;
        else rows = data;

        this.props.onRefreshComplete && this.props.onRefreshComplete(rows)
        this.setState({ isGettingData: false, isFirstloading: false, rowCount: data.totalCount, rows: rows })
        resolve(rows);
      });
    });

  }
  renderSkeletons() {
    let arrSkeleton = []
    for (var i = 0; i < this.props.number; i++) {
      arrSkeleton.push(<Skeleton key={"ske_" + i} />)
    }
    return arrSkeleton;
  }

  pageChange(newpage) {
    //console.log(newpage)
    this.setState({ currentPage: newpage, isPaging: true })

    //get data from server
    const pageSize = this.props.pageSize || this.state.pageSize
    api_get(this.props.url, { ...this.state.datasearch, page: newpage, pagesize: pageSize }).then((data) => {

      let rows = []
      if (data.hasOwnProperty("items"))
        rows = data.items;
      else rows = data;

      this.setState({ isPaging: false, rowCount: data.totalCount, rows: rows })
    });
  }


  render() {
    const {
      numberLoading,
      showLoading,
      IsPagingServer,
    } = this.props;

    const { isGettingData, isFirstloading, rows, currentPage, rowCount, isPaging } = this.state;
    const isShowLoading = showLoading === undefined ? isGettingData : showLoading;
    const pageSize = this.props.pageSize || this.state.pageSize

    return (
      <> {
        IsPagingServer
          ? <BoxLoading number={numberLoading || 3} show={isFirstloading}>
            <StyledDataGrid
              pageSize={pageSize}
              onPageSizeChange={(newPageSize) => {
                this.setState({ pageSize: newPageSize });

              }}
              rowsPerPageOptions={[5, 10, 20]}

              loading={isPaging}
              rowCount={rowCount}
              page={currentPage}
              paginationMode="server"
              onPageChange={(newPage) => { this.pageChange(newPage) }}
              pagination

              {...this.props}
              rows={rows} //important below ...this.props
            />
          </BoxLoading>
          : <BoxLoading number={numberLoading || 3} show={isFirstloading}>
            <StyledDataGrid

              pageSize={pageSize}
              onPageSizeChange={(newPageSize) => this.setState({ pageSize: newPageSize })}
              rowsPerPageOptions={[10, 20, 50]}
              pagination
              {...this.props}
              rows={rows} //important below ...this.props
            />
          </BoxLoading>

      }

      </>
    );
  }
}

export default React.forwardRef((props, ref) => {

  var refreshGrid_2 = () => { }
  var search_2 = () => { }
  var addNewRow_2 = () => { }
  var updateRow_2 = () => { }
  var getDataGrid_2 = () => { }



  useImperativeHandle(ref, () => ({

    refreshGrid() {
      return refreshGrid_2();
    },

    search(data) {
      search_2(data)
    },

    addNewRow(dataRow) {
      addNewRow_2(dataRow);
    },

    updateRow(dataRow) {
      updateRow_2(dataRow);
    },

    getDataGrid() {
      return getDataGrid_2();
    },





  }));

  return <DataTable
    setTrigger={funcObj => {
      refreshGrid_2 = funcObj.refreshGrid;
      search_2 = funcObj.search;
      addNewRow_2 = funcObj.addNewRow;
      updateRow_2 = funcObj.updateRow;
      getDataGrid_2 = funcObj.getDataGrid;


    }}

    rows={[]}   {...props}
  />
});
