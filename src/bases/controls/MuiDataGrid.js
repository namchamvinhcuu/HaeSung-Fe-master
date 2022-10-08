import { styled } from '@mui/material/styles';
import { DataGrid } from "@mui/x-data-grid";
import React, { useImperativeHandle } from 'react';

const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
    // minHeight: '400px',
    // maxHeight: '700px',
    // overflow: 'auto',
    boxShadow: 'rgba(0, 0, 0, 0.1) 0px 0px 5px 0px, rgba(0, 0, 0, 0.1) 0px 0px 1px 0px;',
    color:
        theme.palette.mode === 'light' ? 'rgba(0,0,0,.85)' : 'rgba(255,255,255,0.85)',
    fontFamily: [
        '-apple-system',
        'BlinkMacSystemFont',
        '"Segoe UI"',
        'Roboto',
        '"Helvetica Neue"',
        'Arial',
        'sans-serif',
        '"Apple Color Emoji"',
        '"Segoe UI Emoji"',
        '"Segoe UI Symbol"',
    ].join(','),
    WebkitFontSmoothing: 'auto',
    letterSpacing: 'normal',
    padding: '4px',
    '& .MuiDataGrid-columnsContainer': {
        backgroundColor: theme.palette.mode === 'light' ? '#dddddd' : '#1d1d1d',
    },

    '& .MuiDataGrid-iconSeparator': {
        display: 'none',
    },

    '& .MuiDataGrid-columnHeader, .MuiDataGrid-cell': {
        borderRight: `1px solid ${theme.palette.mode === 'light' ? '#f0f0f0' : '#303030'}`,

    },

    '& .MuiDataGrid-columnsContainer, .MuiDataGrid-cell': {
        borderBottom: `1px solid ${theme.palette.mode === 'light' ? '#f0f0f0' : '#303030'}`,
    },

    '& .MuiDataGrid-cell': {
        color: theme.palette.mode === 'light' ? 'rgba(0,0,0,.85)' : 'rgba(255,255,255,0.65)',
        fontSize: '14px',
    },

    '& .MuiDataGrid-footerContainer': {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '30px',
        backgroundColor: theme.palette.mode === 'light' ? '#D5D5D5' : '#1d1d1d',

        '.MuiTablePagination-root': {

            '.MuiTablePagination-toolbar': {

                minHeight: '30px',

                '.MuiTablePagination-selectLabel': {
                    margin: '0 auto',
                    fontSize: '1.1em',
                },

                '.MuiTablePagination-displayedRows': {
                    margin: '0 auto',
                    fontSize: '1.1em'
                },

                '.MuiInputBase-root': {
                    margin: '0 auto',
                    fontSize: '1.1em'
                }
            },
        },
    },

    '& .MuiDataGrid-columnHeaders': {
        backgroundColor: 'rgba(0, 0, 0, 0.6)',
        color: 'white',
        fontWeight: 'bold',
        fontSize: '16px',

        '& .MuiDataGrid-sortIcon': {
            color: '#fff'
        },

        '& .MuiDataGrid-columnHeader': {
            outline: 'none'
        }
    },

    '& .MuiDataGrid-row': {
        '&:hover': {
            backgroundColor: 'palegoldenrod',
        }
    },

    '& .MuiDataGrid-row.Mui-selected': {
        backgroundColor: 'palegoldenrod',
        '&:hover': {
            backgroundColor: 'palegoldenrod',
        }
    }
}));

// const MuiDataGrid = React.forwardRef((props, ref) => {
const MuiDataGrid = (props) => {

    const {
        isPagingServer,
        headerHeight,
        rowHeight,
        gridHeight,

        showLoading,
        rows,
        columns,
        rowCount,
        page,
        pageSize,
        rowsPerPageOptions,
        onPageChange,
        onPageSizeChange,
        getRowId,

        onSelectionModelChange,

    } = props;

    // useImperativeHandle(ref, () => ({
    //     getDataGrid: () => getDataGrid(),
    // }));

    // const getDataGrid = () => {
    //     return [...rows]
    // }

    const dynamicHeight = Math.min(pageSize * (rowHeight ?? 32) + 96, (gridHeight ?? 740)) + 'px'

    return (
        <React.Fragment>
            {/* <div style={{ height: 108 + (pageSize * rowHeight) + 'px', maxHeight: '740px', overflow: "auto" }}> */}
            {
                isPagingServer
                    ?
                    <StyledDataGrid style={{ height: dynamicHeight }}
                        // autoHeight
                        headerHeight={headerHeight}
                        rowHeight={rowHeight ?? 32}
                        // getRowHeight={() => 'auto'}
                        columns={columns}
                        rows={rows}
                        loading={showLoading}

                        pagination
                        paginationMode="server"
                        page={page ?? 1}
                        pageSize={pageSize ?? 0}
                        rowCount={rowCount ?? 0}
                        rowsPerPageOptions={rowsPerPageOptions}

                        onPageChange={onPageChange}
                        onPageSizeChange={onPageSizeChange}
                        getRowId={getRowId}

                        onSelectionModelChange={onSelectionModelChange}
                        {...props}
                    />
                    :
                    <StyledDataGrid
                        // autoHeight
                        headerHeight={headerHeight}
                        rowHeight={rowHeight ?? 32}
                        // getRowHeight={() => 'auto'}
                        columns={columns}
                        rows={rows}

                        pagination
                        page={page ?? 1}
                        pageSize={pageSize ?? 0}
                        rowCount={rowCount ?? 0}
                        rowsPerPageOptions={rowsPerPageOptions}

                        onPageChange={onPageChange}
                        onPageSizeChange={onPageSizeChange}
                        getRowId={getRowId}

                        onSelectionModelChange={onSelectionModelChange}
                        {...props}
                    />

            }
            {/* </div> */}
        </React.Fragment>
    )
}
// });

export default MuiDataGrid;