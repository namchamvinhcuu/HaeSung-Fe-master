import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { CombineStateToProps, CombineDispatchToProps } from '@plugins/helperJS'
import { User_Operations } from '@appstate/user'
import { Store } from '@appstate'
import {
    DataGrid,
    gridPageCountSelector,
    gridPageSelector,
    useGridApiContext,
    useGridSelector,
    gridColumnsTotalWidthSelector,
    gridColumnPositionsSelector
} from "@mui/x-data-grid";
import React, { useImperativeHandle } from 'react';
import { createTheme, ThemeProvider, Box, LinearProgress, CircularProgress, Pagination, PaginationItem, TablePagination, styled, Skeleton } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { useIntl } from 'react-intl';
import bat_ngo from '@static/images/bat_ngo.png'

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
            backgroundColor: '#EEE8AA',
        }
    },

    '& .MuiDataGrid-row.Mui-selected': {
        backgroundColor: '#EEE8AA',
        '&:hover': {
            backgroundColor: '#EEE8AA',
        }
    }
}));

const mulberry32 = (a) => {
    return () => {
        /* eslint-disable */
        let t = (a += 0x6d2b79f5);
        t = Math.imul(t ^ (t >>> 15), t | 1);
        t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
        /* eslint-enable */
    };
}

const SkeletonCell = styled(Box)(({ theme }) => ({
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    borderBottom: `1px solid ${theme.palette.divider}`
}));

const randomBetween = (seed, min, max) => {
    const random = mulberry32(seed);
    return () => min + (max - min) * random();
}

const StyledGridOverlay = styled('div')(({ theme }) => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    '& .ant-empty-img-1': {
        fill: theme.palette.mode === 'light' ? '#aeb8c2' : '#262626',
    },
    '& .ant-empty-img-2': {
        fill: theme.palette.mode === 'light' ? '#f5f5f7' : '#595959',
    },
    '& .ant-empty-img-3': {
        fill: theme.palette.mode === 'light' ? '#dce0e6' : '#434343',
    },
    '& .ant-empty-img-4': {
        fill: theme.palette.mode === 'light' ? '#fff' : '#1c1c1c',
    },
    '& .ant-empty-img-5': {
        fillOpacity: theme.palette.mode === 'light' ? '0.8' : '0.08',
        fill: theme.palette.mode === 'light' ? '#f5f5f5' : '#fff',
    },
}));

const myTheme = createTheme({
    components: {
        //@ts-ignore - this isn't in the TS because DataGird is not exported from `@mui/material`
        MuiDataGrid: {
            styleOverrides: {
                row: {
                    "&.Mui-created": {
                        backgroundColor: "#A0DB8E",
                        //   "&:hover": {
                        //     backgroundColor: "#98958F"
                        //   }
                    },
                    "&.Mui-deleted": {
                        backgroundColor: "#AEC6CF",
                        //   "&:hover": {
                        //     backgroundColor: "#98958F"
                        //   }
                    },
                }
            }
        }
    }
});

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
        language,
    } = props;

    const intl = useIntl();

    const CustomPagination = () => {
        const apiRef = useGridApiContext();
        const page = useGridSelector(apiRef, gridPageSelector);
        const pageCount = useGridSelector(apiRef, gridPageCountSelector);

        return (
            <Pagination
                color="error"
                size='small'
                disabled={showLoading}
                showFirstButton
                showLastButton
                count={pageCount}
                page={page + 1}
                onChange={(event, value) => apiRef.current.setPage(value - 1)}
                renderItem={(item) => (
                    <PaginationItem
                        components={{ previous: ArrowBackIcon, next: ArrowForwardIcon }}
                        {...item}
                    />
                )}
            />

            // <TablePagination
            //     rowsPerPageOptions={rowsPerPageOptions}
            //     component="div"
            //     count={rowCount}
            //     rowsPerPage={pageSize}
            //     page={page}
            //     onPageChange={onPageChange}
            //     onRowsPerPageChange={onPageSizeChange}
            // />
        );
    }

    // const CustomProgress = () => {
    //     return (
    //         // <LinearProgress
    //         //     variant='buffer'
    //         //     color='primary'
    //         // // sx={{ height: '20px' }}
    //         // />
    //         <CircularProgress />
    //     )
    // }

    const SkeletonLoadingOverlay = () => {
        const apiRef = useGridApiContext();

        const dimensions = apiRef.current?.getRootDimensions();
        const viewportHeight = dimensions?.viewportInnerSize.height ?? 0;

        // @ts-expect-error Function signature expects to be called with parameters, but the implementation suggests otherwise
        const rowHeight = apiRef.current.unstable_getRowHeight();
        const skeletonRowsCount = Math.ceil(viewportHeight / rowHeight);

        const totalWidth = gridColumnsTotalWidthSelector(apiRef);
        const positions = gridColumnPositionsSelector(apiRef);
        const inViewportCount = React.useMemo(
            () => positions.filter((value) => value <= totalWidth).length,
            [totalWidth, positions]
        );
        const columns = apiRef.current.getVisibleColumns().slice(0, inViewportCount);

        const children = React.useMemo(() => {
            // reseed random number generator to create stable lines betwen renders
            const random = randomBetween(12345, 25, 75);
            const array = [];

            for (let i = 0; i < skeletonRowsCount; i += 1) {
                for (const column of columns) {
                    const width = Math.round(random());
                    array.push(
                        <SkeletonCell
                            key={`column-${i}-${column.field}`}
                            sx={{ justifyContent: column.align }}
                        >
                            <Skeleton animation="wave" sx={{ mx: 1 }} width={`${width}%`} />
                        </SkeletonCell>
                    );
                }
                array.push(<SkeletonCell key={`fill-${i}`} />);
            }
            return array;
        }, [skeletonRowsCount, columns]);

        // const rowsCount = apiRef.current.getRowsCount();
        // return rowsCount < 0 ? (
        //     <LinearProgress />
        // ) 
        // : 
        // (
        //     <div
        //         style={{
        //             display: "grid",
        //             gridTemplateColumns: `${columns
        //                 .map(({ computedWidth }) => `${computedWidth}px`)
        //                 .join(" ")} 1fr`,
        //             gridAutoRows: rowHeight
        //         }}
        //     >
        //         {children}
        //     </div>
        // );

        return (
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: `${columns
                        .map(({ computedWidth }) => `${computedWidth}px`)
                        .join(" ")} 1fr`,
                    gridAutoRows: rowHeight
                }}
            >
                {children}
            </div>
        )
    }

    const CustomNoRowsOverlay = () => {
        return (
            <StyledGridOverlay>
                {language !== 'VI' ? <svg
                    width="120"
                    height="100"
                    viewBox="0 0 184 152"
                    aria-hidden
                    focusable="false"
                >
                    <g fill="none" fillRule="evenodd">
                        <g transform="translate(24 31.67)">
                            <ellipse
                                className="ant-empty-img-5"
                                cx="67.797"
                                cy="106.89"
                                rx="67.797"
                                ry="12.668"
                            />
                            <path
                                className="ant-empty-img-1"
                                d="M122.034 69.674L98.109 40.229c-1.148-1.386-2.826-2.225-4.593-2.225h-51.44c-1.766 0-3.444.839-4.592 2.225L13.56 69.674v15.383h108.475V69.674z"
                            />
                            <path
                                className="ant-empty-img-2"
                                d="M33.83 0h67.933a4 4 0 0 1 4 4v93.344a4 4 0 0 1-4 4H33.83a4 4 0 0 1-4-4V4a4 4 0 0 1 4-4z"
                            />
                            <path
                                className="ant-empty-img-3"
                                d="M42.678 9.953h50.237a2 2 0 0 1 2 2V36.91a2 2 0 0 1-2 2H42.678a2 2 0 0 1-2-2V11.953a2 2 0 0 1 2-2zM42.94 49.767h49.713a2.262 2.262 0 1 1 0 4.524H42.94a2.262 2.262 0 0 1 0-4.524zM42.94 61.53h49.713a2.262 2.262 0 1 1 0 4.525H42.94a2.262 2.262 0 0 1 0-4.525zM121.813 105.032c-.775 3.071-3.497 5.36-6.735 5.36H20.515c-3.238 0-5.96-2.29-6.734-5.36a7.309 7.309 0 0 1-.222-1.79V69.675h26.318c2.907 0 5.25 2.448 5.25 5.42v.04c0 2.971 2.37 5.37 5.277 5.37h34.785c2.907 0 5.277-2.421 5.277-5.393V75.1c0-2.972 2.343-5.426 5.25-5.426h26.318v33.569c0 .617-.077 1.216-.221 1.789z"
                            />
                        </g>
                        <path
                            className="ant-empty-img-3"
                            d="M149.121 33.292l-6.83 2.65a1 1 0 0 1-1.317-1.23l1.937-6.207c-2.589-2.944-4.109-6.534-4.109-10.408C138.802 8.102 148.92 0 161.402 0 173.881 0 184 8.102 184 18.097c0 9.995-10.118 18.097-22.599 18.097-4.528 0-8.744-1.066-12.28-2.902z"
                        />
                        <g className="ant-empty-img-4" transform="translate(149.65 15.383)">
                            <ellipse cx="20.654" cy="3.167" rx="2.849" ry="2.815" />
                            <path d="M5.698 5.63H0L2.898.704zM9.259.704h4.985V5.63H9.259z" />
                        </g>
                    </g>
                </svg>
                    :
                    <img src={bat_ngo} style={{ width: 350, height: 200 }} />}
                <Box sx={{ mt: 1 }}>{intl.formatMessage({ id: 'general.no_data' })}</Box>
            </StyledGridOverlay>
        );
    }

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
            <div style={{ height: dynamicHeight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ThemeProvider theme={myTheme}>
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
                                // rowsPerPageOptions={rowsPerPageOptions}

                                components={{
                                    Pagination: CustomPagination,
                                    LoadingOverlay: SkeletonLoadingOverlay,
                                    NoRowsOverlay: CustomNoRowsOverlay,
                                }}

                                // onPageChange={onPageChange}
                                // onPageSizeChange={onPageSizeChange}
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
                </ThemeProvider>
            </div>
        </React.Fragment>
    )
}
// });


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

export default connect(mapStateToProps, mapDispatchToProps)(MuiDataGrid)
// export default MuiDataGrid;