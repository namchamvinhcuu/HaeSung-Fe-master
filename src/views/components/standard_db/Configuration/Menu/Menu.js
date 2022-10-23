import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { CombineStateToProps, CombineDispatchToProps } from '@plugins/helperJS'
import { User_Operations } from '@appstate/user'
import { Store } from '@appstate'
import { useIntl } from 'react-intl';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { createTheme, ThemeProvider } from "@mui/material";
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';

import { MuiButton, MuiDataGrid, MuiSearchField } from '@controls';
import { menuService } from '@services';

import _ from 'lodash';
import CreateMenuDialog from './CreateMenuDialog';
import ModifyMenuDialog from './ModifyMenuDialog';

import CreateMenuFormik from './CreateMenuFormik';
import { MenuDto } from '@models'

const Menu = (props) => {

    const intl = useIntl();
    let isRendered = useRef(false);

    const initMenuModel = {
        ...MenuDto
    }

    const menuGridRef = useRef();

    const [menuState, setMenuState] = useState({
        isLoading: false,
        data: [],
        totalRow: 0,
        page: 1,
        pageSize: 20,
        searchData: {
            keyWord: ''
        }
    });

    const [isOpenCreateDialog, setIsOpenCreateDialog] = useState(false)
    const [isOpenModifyDialog, setIsOpenModifyDialog] = useState(false)

    const [selectedRow, setSelectedRow] = useState({
        ...initMenuModel
    })

    const [newData, setNewData] = useState({ ...initMenuModel })

    const toggleCreateMenuDialog = () => {
        setIsOpenCreateDialog(!isOpenCreateDialog);
    }

    const toggleModifyMenuDialog = () => {
        setIsOpenModifyDialog(!isOpenModifyDialog);
    }

    const handleRowSelection = (arrIds) => {

        // let currentGridData = menuGridRef.current.getDataGrid();
        // let selectedRow = menuState.data.filter(function (item) {
        //     return item.menuId === arrIds[0]
        // });

        const rowSelected = menuState.data.filter(function (item) {
            return item.menuId === arrIds[0]
        });

        if (rowSelected && rowSelected.length > 0) {
            setSelectedRow({ ...rowSelected[0] });
        }
        else {
            setSelectedRow({ ...initMenuModel });
        }
    }

    const changeSearchData = (e, inputName) => {

        let newSearchData = { ...menuState.searchData };
        newSearchData[inputName] = e.target.value;

        setMenuState({ ...menuState, searchData: { ...newSearchData } })
    }

    const fetchData = async () => {
        setMenuState({
            ...menuState
            , isLoading: true

        });
        const params = {
            page: menuState.page,
            pageSize: menuState.pageSize,
            keyWord: menuState.searchData.keyWord
        }
        const res = await menuService.getMenuList(params);
        if (res && isRendered)
            setMenuState({
                ...menuState
                , data: !res.Data ? [] : [...res.Data]
                , totalRow: res.TotalRow
                , isLoading: false
            });
    }

    useEffect(() => {
        isRendered = true;
        if (isRendered)
            fetchData();

        return () => {
            isRendered = false;
        };

    }, [menuState.page, menuState.pageSize]);

    useEffect(() => {
        if (!_.isEmpty(newData) && !_.isEqual(newData, initMenuModel)) {
            const data = [newData, ...menuState.data]
            if (data.length > menuState.pageSize) {
                data.pop();
            }
            setMenuState({
                ...menuState
                , data: [...data]
                , totalRow: menuState.totalRow + 1
            });
        }

    }, [newData]);

    useEffect(() => {
        if (!_.isEmpty(selectedRow) && !_.isEqual(selectedRow, initMenuModel)) {
            let newArr = [...menuState.data]
            const index = _.findIndex(newArr, function (o) { return o.menuId == selectedRow.menuId; });
            if (index !== -1) {
                newArr[index] = selectedRow
            }

            setMenuState({
                ...menuState
                , data: [...newArr]
            });
        }
    }, [selectedRow]);

    const handleDeleteMenu = async (menu) => {
        if (window.confirm(intl.formatMessage({ id: 'general.confirm_delete' }))) {
            try {
                let res = await menuService.deleteMenu(menu);
                if (res && res.HttpResponseCode === 200) {
                    await fetchData();
                }
            } catch (error) {
                console.log(error)
            }
        }
    }

    const columns = [
        { field: 'menuId', headerName: '', hide: true },
        { field: 'parentId', headerName: 'ParentId', hide: true },
        {
            field: 'id', headerName: '', flex: 0.01,
            filterable: false,
            renderCell: (index) => (index.api.getRowIndex(index.row.menuId) + 1) + (menuState.page - 1) * menuState.pageSize,
        },
        {
            field: "action",
            headerName: "",
            flex: 0.4,
            // headerAlign: 'center',
            disableClickEventBubbling: true,
            sortable: false,
            disableColumnMenu: true,
            renderCell: (params) => {
                return (
                    <Grid container spacing={1} alignItems="center" justifyContent="center">
                        <Grid item xs={6}>
                            <IconButton
                                aria-label="edit"
                                color="warning"
                                size="small"
                                sx={[{ '&:hover': { border: '1px solid orange', }, }]}
                                onClick={toggleModifyMenuDialog}
                            >
                                <EditIcon fontSize="inherit" />
                            </IconButton>
                        </Grid>

                        <Grid item xs={6}>
                            <IconButton
                                aria-label="delete"
                                color="error"
                                size="small"
                                sx={[{ '&:hover': { border: '1px solid red', }, }]}
                                onClick={() => handleDeleteMenu(params.row)}
                            >
                                <DeleteIcon fontSize="inherit" />
                            </IconButton>
                        </Grid>
                    </Grid>
                );
            },
        },
        { field: 'menuName', headerName: intl.formatMessage({ id: "general.name" }), flex: 0.7, },
        { field: 'parentMenuName', headerName: intl.formatMessage({ id: "general.parent" }), flex: 0.7, },
        { field: 'menuLevel', headerName: intl.formatMessage({ id: "general.level" }), flex: 0.3, },
        {
            field: 'sortOrder',
            headerName: 'Sort Order',
            description: 'This column has a value getter and is not sortable.',
            sortable: false,
            flex: 0.5,
            // valueGetter: (params) =>
            //   `${params.row.firstName || ''} ${params.row.lastName || ''}`,
        },
        { field: 'menuIcon', headerName: intl.formatMessage({ id: "general.icon" }), flex: 0.6, },
        { field: 'languageKey', headerName: intl.formatMessage({ id: "general.language_key" }), flex: 1, },
        { field: 'menuComponent', headerName: intl.formatMessage({ id: "general.component" }), flex: 0.7, },
        { field: 'navigateUrl', headerName: intl.formatMessage({ id: "general.url" }), flex: 0.6, },
        { field: 'forRoot', headerName: intl.formatMessage({ id: "general.root_only" }), flex: 0.5, },
        { field: 'forApp', headerName: 'For App', flex: 0.5, },
    ];

    return (
        <React.Fragment>
            <Grid
                container
                direction="row"
                justifyContent="space-between"
                alignItems="flex-end"
            >
                <Grid item xs={6}>
                    <MuiButton
                        text="create"
                        color='success'
                        onClick={toggleCreateMenuDialog}
                    />
                </Grid>
                <Grid item xs>
                    <Grid container columnSpacing={2}
                        direction="row"
                        justifyContent="flex-end"
                        alignItems="flex-end">
                        <Grid item xs={8}>
                            <MuiSearchField
                                label='general.name'
                                name='keyWord'
                                onClick={fetchData}
                                onChange={(e) => changeSearchData(e, 'keyWord')}
                            />
                        </Grid>
                        <Grid item xs>
                            <MuiButton
                                text="search"
                                color='info'
                                onClick={fetchData}
                            />
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>

            <MuiDataGrid
                // ref={menuGridRef}
                showLoading={menuState.isLoading}
                isPagingServer={true}
                headerHeight={45}
                // rowHeight={30}
                gridHeight={736}
                columns={columns}
                rows={menuState.data}
                page={menuState.page - 1}
                pageSize={menuState.pageSize}
                rowCount={menuState.totalRow}
                // rowsPerPageOptions={[5, 10, 20, 30]}
                disableGrid={menuState.isLoading}
                onPageChange={(newPage) => {
                    setMenuState({ ...menuState, page: newPage + 1 });
                }}
                // onPageSizeChange={(newPageSize) => {
                //     setMenuState({ ...menuState, pageSize: newPageSize, page: 1 });
                // }}
                getRowId={(rows) => rows.menuId}
                onSelectionModelChange={(newSelectedRowId) => {
                    handleRowSelection(newSelectedRowId)
                }}
                // selectionModel={selectedRow.menuId}
                getRowClassName={(params) => {
                    if (_.isEqual(params.row, newData)) {
                        return `Mui-created`
                    }
                }}
            />

            {/* <CreateMenuDialog
                initModal={initMenuModel}
                setNewData={setNewData}
                isOpen={isOpenCreateDialog}
                onClose={toggleCreateMenuDialog}
            /> */}

            <CreateMenuFormik
                initModal={initMenuModel}
                setNewData={setNewData}
                isOpen={isOpenCreateDialog}
                onClose={toggleCreateMenuDialog}
            />

            <ModifyMenuDialog
                initModal={selectedRow}
                setModifyData={setSelectedRow}
                isOpen={isOpenModifyDialog}
                onClose={toggleModifyMenuDialog}
            />
        </React.Fragment>
    )
}

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

export default connect(mapStateToProps, mapDispatchToProps)(Menu)
