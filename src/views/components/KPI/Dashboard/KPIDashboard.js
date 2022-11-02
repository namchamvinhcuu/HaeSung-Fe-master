import React, { useEffect, useRef, useState } from "react";
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { CombineStateToProps, CombineDispatchToProps } from '@plugins/helperJS'
import { User_Operations } from '@appstate/user'
import { Store } from '@appstate'

import Highcharts from 'highcharts'
import HighchartsReact from 'highcharts-react-official'

import { HubConnectionBuilder, LogLevel, HttpTransportType } from "@microsoft/signalr";
import moment from "moment";

import { useIntl } from "react-intl";
import Grid from "@mui/material/Grid";
import {
    MuiAutocomplete,
	MuiButton,
	MuiDataGrid,
	MuiDateTimeField,
	MuiSearchField
} from "@controls";
import { WorkOrderDto } from "@models";
import { workOrderService } from "@services";
import { BASE_URL, TOKEN_ACCESS } from "@constants/ConfigConstants";
import { GetLocalStorage } from '@utils'
require('highcharts-exporting');
import Paper from '@mui/material/Paper';
import {
	Chart,
	ArgumentAxis,
	ValueAxis,
	BarSeries,
	Title,
	Legend,
} from '@devexpress/dx-react-chart-material-ui';
import { Stack, Animation } from '@devexpress/dx-react-chart';


const KPIDashboard = (props) => {
	let isRendered = useRef(true);
	const intl = useIntl();
	const [isLoading, setIsLoading] = useState(false);
	const [page, setPage] = useState(1);
	const [pageSize, setPageSize] = useState(5);
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

	const options = {
		title: {
			text: 'My chart'
		},
		series: [{
			data: [1, 2, 3]
		}]
	}
	const startConnection = async () => {
		try {
			connection.on("ReceivedWorkOrders", (data) => {
				if (data && data.length > 0) {
					setWorkOrders([...data]);
					setSelectedRow({ ...data[0] });
					CreateHighcharts([...data]);
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

	const Root = props => {
		return <Legend.Root {...props} sx={{ display: 'flex', margin: 'auto', flexDirection: 'row' }} />
	};
	const Label = props => {
		return <Legend.Label {...props} sx={{ whiteSpace: 'nowrap' }} />
	};

	const getPath = (x, width, y, y1) => `M ${x} ${y1}
	L ${width + x} ${y1}
	L ${width + x} ${y}
	L ${x} ${y}
	L ${x} ${y}
	Z`;


	const BarWithLabel = ({
		arg, barWidth, maxBarWidth, val, startVal, color, value, style,
	}) => {
		const width = maxBarWidth * barWidth;
		return (
			<React.Fragment>
				<path d={getPath(arg - width / 2, width, val, startVal)} fill={color} style={style} />
				<Chart.Label
					x={arg}
					y={(val + startVal) / 2}
					dominantBaseline="middle"
					textAnchor="middle"
					style={{ fill: 'black' }}
				>
					{value}
				</Chart.Label>
			</React.Fragment>
		);
	};

	const CreateHighcharts = (workOrders) => {

		const categoryList = [];
		const ActualQtyList = [];
		const OrderQtyList = [];

		if (workOrders.length > 0) {
			for (let i = 0; i < workOrders.length; i++) {
				let item = workOrders[i];
				categoryList.push(item.woCode);
				ActualQtyList.push(item.actualQty);
				OrderQtyList.push(item.orderQty);
			}
		}

		Highcharts.chart('highcharts2', {
			chart: {
				navigation: {
					buttonOptions: {
						enabled: true
					}
				},
				type: 'column',
				// styledMode: true,
				// options3d: {
				// 	enabled: true,
				// 	alpha: 15,
				// 	beta: 15,
				// 	depth: 50
				// }
			},
			exporting: {
				enabled: true
			},
			title: {
				text: 'Work Order Dashboard'
			},
			// subtitle: {
			// 	text: 'Source: ' +
			// 		'<a href="https://www.ssb.no/en/statbank/table/08940/" ' +
			// 		'target="_blank">SSB</a>'
			// },
			xAxis: {
				categories: categoryList,
				crosshair: true
			},
			// yAxis: {
			// 	title: {
			// 		useHTML: true,
			// 		text: 'Million tonnes CO<sub>2</sub>-equivalents'
			// 	}
			// },
			credits: {
				enabled: false
			},
			tooltip: {
				headerFormat: '<span style="font-size:10px">Wo code: {point.key}</span><table>',
				pointFormat: '<tr><td style="color:{series.color};padding:0">{series.name}: </td>' +
					'<td style="padding:0"><b>{point.y:.1f}</b></td></tr>',
				footerFormat: '</table>',
				shared: true,
				useHTML: true
			},
			plotOptions: {
				column: {
					pointPadding: 0.2,
					borderWidth: 0,
					dataLabels: {
						enabled: true
					}
				}
			},
			series: [{
				name: 'OrderQty',
				data: OrderQtyList,
				color: '#ffd700'
			}, {
				name: 'ActualQty',
				data: ActualQtyList,
				color: '#c0c0c0'
			}]
		});
	}

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


			<Paper sx={{ mt: 2 }}>
				<Chart data={workOrders}>
					<ArgumentAxis />
					<ValueAxis />
					<BarSeries
						name={intl.formatMessage({ id: "work_order.OrderQty" })}
						valueField="orderQty"
						argumentField="woCode"
						color="#ffd700"
						//rotated
						pointComponent={BarWithLabel}
					/>
					<BarSeries
						name={intl.formatMessage({ id: "work_order.ActualQty" })}
						valueField="actualQty"
						argumentField="woCode"
						color="#c0c0c0"
						//rotated
						pointComponent={BarWithLabel}
					/>
					<Animation />
					<Legend position="bottom" rootComponent={Root} labelComponent={Label} />
					<Title text="Work Order Dashboard" />
					<Stack />
				</Chart>
			</Paper>
			<div id="highcharts2" style={{ width: '50%' }}></div>

			<HighchartsReact
				highcharts={Highcharts}
				options={options}
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
