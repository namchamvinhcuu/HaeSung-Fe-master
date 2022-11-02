import React, { useEffect, useRef, useState } from "react";
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { CombineStateToProps, CombineDispatchToProps } from '@plugins/helperJS'
import { User_Operations } from '@appstate/user'
import { Store } from '@appstate'

import { HubConnectionBuilder, LogLevel, HttpTransportType } from "@microsoft/signalr";
import moment from "moment";

import { useIntl } from "react-intl";
import Grid from "@mui/material/Grid";
import {
    MuiAutoComplete,
    MuiButton,
    MuiDataGrid,
    MuiDateTimeField,
    MuiSearchField
} from "@controls";
import { WorkOrderDto } from "@models";
import { workOrderService } from "@services";
import { BASE_URL, TOKEN_ACCESS } from "@constants/ConfigConstants";
import { GetLocalStorage } from '@utils'

const KPIDashboard = (props) => {
    let isRendered = useRef(true);
    const intl = useIntl();
    const [isLoading, setIsLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(20);
    const [selectedRow, setSelectedRow] = useState({});
    const [workOrders, setWorkOrders] = useState([]);
    const [connection, setConnection] = useState(
        new HubConnectionBuilder()
            .withUrl(
                `${BASE_URL}/signalr`, {
                accessTokenFactory: () => GetLocalStorage(TOKEN_ACCESS),
                skipNegotiation: true,
                transport: HttpTransportType.WebSockets
            })
            .configureLogging(LogLevel.None)
            .withAutomaticReconnect({
                nextRetryDelayInMilliseconds: retryContext => {
                    //reconnect after 5-20s
                    return 5000 + (Math.random() * 15000);
                }
            })
            .build()
    );

    const startConnection = async () => {
        try {
            connection.on("ReceivedWorkOrders", (data) => {
                if (data && data.length > 0) {
                    setWorkOrders([...data]);
                    setSelectedRow({ ...data[0] });
                }
            });
            connection.onclose(e => {
                setConnection(null);
            });
            await connection.start();
            await connection.invoke("SendWorkOrders");

        } catch (error) {
            console.log("websocket connect error")
        }
    }

    const closeConnection = async () => {
        try {
            await connection.stop();
        } catch (error) {
            console.log(error);
        }
    };

    const handleRowSelection = (arrIds) => {
        const rowSelected = workOrders.filter(item => item.woId === arrIds[0]);

        if (rowSelected && rowSelected.length > 0) {
            setSelectedRow({ ...rowSelected[0] });
        } else {
            setSelectedRow({});
        }
    };

    const columns = [
        { field: "woId", headerName: "", hide: true },
        {
            field: "id",
            headerName: "",
            width: 100,
            filterable: false,
            renderCell: (index) =>
                index.api.getRowIndex(index.row.woId) +
                1 +
                (page - 1) * pageSize,
        },
        {
            field: "woCode",
            headerName: intl.formatMessage({ id: "work_order.WoCode" }),
            width: 120,
        },

        {
            field: "orderQty",
            headerName: intl.formatMessage({ id: "work_order.OrderQty" }),
            width: 120,
        },

        {
            field: "actualQty",
            headerName: intl.formatMessage({ id: "work_order.ActualQty" }),
            width: 120,
        },

        {
            field: "startDate",
            headerName: intl.formatMessage({ id: "work_order.StartDate" }),
            width: 150,
            valueFormatter: (params) => {
                if (params.value !== null) {
                    return moment(params?.value)
                        .add(7, "hours")
                        .format("YYYY-MM-DD HH:mm:ss");
                }
            },
        },

        {
            field: "createdDate",
            headerName: intl.formatMessage({ id: "general.created_date" }),
            width: 150,
            valueFormatter: (params) => {
                if (params.value !== null) {
                    return moment(params?.value)
                        .add(7, "hours")
                        .format("YYYY-MM-DD HH:mm:ss");
                }
            },
        },

        {
            field: "modifiedDate",
            headerName: intl.formatMessage({ id: "general.modified_date" }),
            width: 150,
            valueFormatter: (params) => {
                if (params.value !== null) {
                    return moment(params?.value)
                        .add(7, "hours")
                        .format("YYYY-MM-DD HH:mm:ss");
                }
            },
        },
    ];

    useEffect(() => {
        if (isRendered) {
            startConnection();
        }

        return () => {
            closeConnection()
            isRendered = false;
        };
    }, [])

    return (
        <React.Fragment>
            <MuiDataGrid
                showLoading={isLoading}
                // isPagingServer={true}
                headerHeight={45}
                // rowHeight={30}
                gridHeight={736}
                columns={columns}
                rows={workOrders}
                page={page - 1}
                pageSize={pageSize}
                rowCount={workOrders.length}
                onPageChange={(newPage) => {
                    setPage(newPage + 1);
                }}
                getRowId={(rows) => rows.woId}
                onSelectionModelChange={(newSelectedRowId) =>
                    handleRowSelection(newSelectedRowId)
                }
                getRowClassName={(params) => {
                    // if (_.isEqual(params.row, newData)) {
                    //     return `Mui-created`;
                    // }
                }}
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

export default connect(mapStateToProps, mapDispatchToProps)(KPIDashboard);