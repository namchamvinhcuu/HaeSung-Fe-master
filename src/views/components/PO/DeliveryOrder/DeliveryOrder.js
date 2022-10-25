import React, { useEffect, useState, useRef } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { CombineStateToProps, CombineDispatchToProps } from "@plugins/helperJS";
import { User_Operations } from "@appstate/user";
import { Store } from "@appstate";

import EditIcon from "@mui/icons-material/Edit";
import UndoIcon from "@mui/icons-material/Undo";
import { FormControlLabel, Switch } from "@mui/material";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import _ from "lodash";
import moment from "moment";
import { useIntl } from "react-intl";
import {
  MuiButton,
  MuiDataGrid,
  MuiSearchField,
  MuiDateTimeField,
} from "@controls";
import { ErrorAlert, SuccessAlert } from "@utils";
import { DeliveryOrderDto } from "@models";

const DeliveryOrder = (props) => {
  let isRendered = useRef(true);
  const intl = useIntl();
  const currentDate = new Date();

  const [deliveryOrderState, setDeliveryOrderState] = useState({
    isLoading: false,
    data: [],
    totalRow: 0,
    page: 1,
    pageSize: 20,
    searchData: {
      DoCode: "",
      DoId: 0,
      MaterialId: 0,
      ETDLoad: currentDate,
      DeliveryTime: new Date().setDate(currentDate.getDate() + 1),
    },
  });

  const [selectedRow, setSelectedRow] = useState({
    ...DeliveryOrderDto,
  });
  const [newData, setNewData] = useState({ ...DeliveryOrderDto });
  const [isOpenCreateDialog, setIsOpenCreateDialog] = useState(false);
  const [isOpenModifyDialog, setIsOpenModifyDialog] = useState(false);
  const [showActivedData, setShowActivedData] = useState(true);

  const toggleCreateDialog = () => {
    setIsOpenCreateDialog(!isOpenCreateDialog);
  };

  const toggleModifyDialog = () => {
    setIsOpenModifyDialog(!isOpenModifyDialog);
  };

  const handleRowSelection = (arrIds) => {
    const rowSelected = deliveryOrderState.data.filter(function (item) {
      return item.DoId === arrIds[0];
    });

    if (rowSelected && rowSelected.length > 0) {
      setSelectedRow({ ...rowSelected[0] });
    } else {
      setSelectedRow({ ...DeliveryOrderDto });
    }
  };

  const changeSearchData = (e, inputName) => {
    let newSearchData = { ...deliveryOrderState.searchData };
    newSearchData[inputName] = e.target.value;

    setSupplierState({
      ...deliveryOrderState,
      searchData: { ...newSearchData },
    });
  };

  const fetchData = async () => {
    // setPurchaseOrderState({
    //   ...purchaseOrderState,
    //   isLoading: true,
    // });
    // const params = {
    //   page: purchaseOrderState.page,
    //   pageSize: purchaseOrderState.pageSize,
    //   PoCode: purchaseOrderState.searchData.PoCode.trim(),
    //   DeliveryDate: purchaseOrderState.searchData.DeliveryDate,
    //   DueDate: purchaseOrderState.searchData.DueDate,
    //   isActived: showActivedData,
    // };
    // const res = await purchaseOrderService.get(params);
    // if (res && isRendered)
    //   setPurchaseOrderState({
    //     ...purchaseOrderState,
    //     data: !res.Data ? [] : [...res.Data],
    //     totalRow: res.TotalRow,
    //     isLoading: false,
    //   });
  };

  useEffect(() => {
    if (isRendered) fetchData();

    return () => {
      isRendered = false;
    };
  }, [deliveryOrderState.page, deliveryOrderState.pageSize, showActivedData]);

  useEffect(() => {
    if (!_.isEmpty(newData) && !_.isEqual(newData, DeliveryOrderDto)) {
      const data = [newData, ...deliveryOrderState.data];
      if (data.length > deliveryOrderState.pageSize) {
        data.pop();
      }
      if (isRendered)
        setDeliveryOrderState({
          ...deliveryOrderState,
          data: [...data],
          totalRow: deliveryOrderState.totalRow + 1,
        });
    }
  }, [newData]);

  useEffect(() => {
    if (!_.isEmpty(selectedRow) && !_.isEqual(selectedRow, DeliveryOrderDto)) {
      let newArr = [...deliveryOrderState.data];
      const index = _.findIndex(newArr, function (o) {
        return o.DoId == selectedRow.DoId;
      });
      if (index !== -1) {
        newArr[index] = selectedRow;
      }

      setSupplierState({
        ...deliveryOrderState,
        data: [...newArr],
      });
    }
  }, [selectedRow]);

  const columns = [
    { field: "DoId", headerName: "", hide: true },
    {
      field: "id",
      headerName: "",
      width: 100,
      filterable: false,
      renderCell: (index) =>
        index.api.getRowIndex(index.row.DoId) +
        1 +
        (deliveryOrderState.page - 1) * deliveryOrderState.pageSize,
    },
    {
      field: "action",
      headerName: "",
      width: 80,
      // headerAlign: 'center',
      disableClickEventBubbling: true,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => {
        return (
          <Grid
            container
            spacing={1}
            alignItems="center"
            justifyContent="center"
          >
            <Grid item xs={6}>
              <IconButton
                aria-label="edit"
                color="warning"
                size="small"
                sx={[{ "&:hover": { border: "1px solid orange" } }]}
                onClick={toggleModifyDialog}
              >
                <EditIcon fontSize="inherit" />
              </IconButton>
            </Grid>

            <Grid item xs={6}>
              <IconButton
                aria-label="delete"
                color="error"
                size="small"
                sx={[{ "&:hover": { border: "1px solid red" } }]}
                onClick={() => handleDeletePurchaseOrder(params.row)}
              >
                {showActivedData ? (
                  <DeleteIcon fontSize="inherit" />
                ) : (
                  <UndoIcon fontSize="inherit" />
                )}
              </IconButton>
            </Grid>
          </Grid>
        );
      },
    },
    {
      field: "DoCode",
      headerName: intl.formatMessage({ id: "delivery_order.DoCode" }),
      /*flex: 0.7,*/ width: 200,
    },
    {
      field: "PoCode",
      headerName: intl.formatMessage({ id: "delivery_order.PoCode" }),
      /*flex: 0.7,*/ width: 200,
    },
    {
      field: "MaterialCode",
      headerName: intl.formatMessage({ id: "delivery_order.MaterialCode" }),
      /*flex: 0.7,*/ width: 200,
    },
    {
      field: "OrderQty",
      headerName: intl.formatMessage({ id: "delivery_order.OrderQty" }),
      /*flex: 0.7,*/ width: 200,
    },
    {
      field: "RemainQty",
      headerName: intl.formatMessage({ id: "delivery_order.RemainQty" }),
      /*flex: 0.7,*/ width: 200,
    },
    {
      field: "PackingNote",
      headerName: intl.formatMessage({ id: "delivery_order.PackingNote" }),
      width: 400,
      renderCell: (params) => {
        return (
          <Tooltip
            title={params.row.PackingNote ?? ""}
            className="col-text-elip"
          >
            <Typography sx={{ fontSize: 14, maxWidth: 200 }}>
              {params.row.PackingNote}
            </Typography>
          </Tooltip>
        );
      },
    },
    {
      field: "InvoiceNo",
      headerName: intl.formatMessage({ id: "delivery_order.InvoiceNo" }),
      width: 400,
      renderCell: (params) => {
        return (
          <Tooltip title={params.row.InvoiceNo ?? ""} className="col-text-elip">
            <Typography sx={{ fontSize: 14, maxWidth: 200 }}>
              {params.row.InvoiceNo}
            </Typography>
          </Tooltip>
        );
      },
    },
    {
      field: "Dock",
      headerName: intl.formatMessage({ id: "delivery_order.Dock" }),
      width: 400,
      renderCell: (params) => {
        return (
          <Tooltip title={params.row.Dock ?? ""} className="col-text-elip">
            <Typography sx={{ fontSize: 14, maxWidth: 200 }}>
              {params.row.Dock}
            </Typography>
          </Tooltip>
        );
      },
    },
    {
      field: "ETDLoad",
      headerName: intl.formatMessage({ id: "delivery_order.ETDLoad" }),
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
      field: "DeliveryTime",
      headerName: intl.formatMessage({ id: "delivery_order.DeliveryTime" }),
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
      field: "Remark",
      headerName: intl.formatMessage({ id: "delivery_order.Remark" }),
      width: 400,
      renderCell: (params) => {
        return (
          <Tooltip title={params.row.Remark ?? ""} className="col-text-elip">
            <Typography sx={{ fontSize: 14, maxWidth: 200 }}>
              {params.row.Remark}
            </Typography>
          </Tooltip>
        );
      },
    },
    {
      field: "Truck",
      headerName: intl.formatMessage({ id: "delivery_order.Truck" }),
      width: 400,
      renderCell: (params) => {
        return (
          <Tooltip title={params.row.Truck ?? ""} className="col-text-elip">
            <Typography sx={{ fontSize: 14, maxWidth: 200 }}>
              {params.row.Truck}
            </Typography>
          </Tooltip>
        );
      },
    },

    {
      field: "createdName",
      headerName: intl.formatMessage({ id: "general.createdName" }),
      width: 150,
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
      field: "modifiedName",
      headerName: intl.formatMessage({ id: "general.modifiedName" }),
      width: 150,
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

  return (
    <React.Fragment>
      <Grid
        container
        spacing={2}
        direction="row"
        justifyContent="space-between"
        alignItems="flex-end"
      >
        <Grid item xs={2}>
          <MuiButton
            text="create"
            color="success"
            onClick={toggleCreateDialog}
          />
        </Grid>
        <Grid item xs>
          <MuiSearchField
            label="delivery_order.DoCode"
            name="DoCode"
            onClick={fetchData}
            onChange={(e) => changeSearchData(e, "DoCode")}
          />
        </Grid>

        <Grid item xs>
          <MuiDateTimeField
            disabled={deliveryOrderState.isLoading}
            label={intl.formatMessage({
              id: "delivery_order.ETDLoad",
            })}
            value={deliveryOrderState.searchData.ETDLoad}
            onChange={(e) => {
              changeSearchData;
            }}
            // error={touched.ETADate && Boolean(errors.ETADate)}
            // helperText={touched.ETADate && errors.ETADate}
          />
        </Grid>

        <Grid item xs>
          <MuiDateTimeField
            disabled={deliveryOrderState.isLoading}
            label={intl.formatMessage({
              id: "delivery_order.DeliveryTime",
            })}
            value={deliveryOrderState.searchData.DeliveryTime}
            onChange={(e) => {
              changeSearchData;
            }}
            // error={touched.ETADate && Boolean(errors.ETADate)}
            // helperText={touched.ETADate && errors.ETADate}
          />
        </Grid>

        <Grid item xs sx={{ display: "flex", justifyContent: "right" }}>
          <MuiButton text="search" color="info" onClick={fetchData} />
          <FormControlLabel
            sx={{ mb: 0, ml: "1px" }}
            control={
              <Switch
                defaultChecked={true}
                color="primary"
                onChange={(e) => handleshowActivedData(e)}
              />
            }
            label={showActivedData ? "Actived" : "Deleted"}
          />
        </Grid>
      </Grid>
    </React.Fragment>
  );
};

User_Operations.toString = function () {
  return "User_Operations";
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

export default connect(mapStateToProps, mapDispatchToProps)(DeliveryOrder);
