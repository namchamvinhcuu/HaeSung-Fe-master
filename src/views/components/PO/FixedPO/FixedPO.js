import React, { useEffect, useState, useRef } from "react";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { CombineStateToProps, CombineDispatchToProps } from "@plugins/helperJS";
import { User_Operations } from "@appstate/user";
import { Store } from "@appstate";

import {
  MuiButton,
  MuiDataGrid,
  MuiSearchField,
  MuiDateField,
} from "@controls";
import EditIcon from "@mui/icons-material/Edit";
import UndoIcon from "@mui/icons-material/Undo";
import { FormControlLabel, Switch } from "@mui/material";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import _ from "lodash";
import moment from "moment";
import { useIntl } from "react-intl";

import { PurchaseOrderDto } from "@models";
import { purchaseOrderService } from "@services";
import { ErrorAlert, SuccessAlert } from "@utils";

const FixedPO = (props) => {
  const currentDate = new Date();
  let isRendered = useRef(true);
  const intl = useIntl();

  const [purchaseOrderState, setPurchaseOrderState] = useState({
    isLoading: false,
    data: [],
    totalRow: 0,
    page: 1,
    pageSize: 20,
    searchData: {
      PoCode: "",
      DeliveryDate: currentDate,
      DueDate: new Date().setDate(currentDate.getDate() + 30),
    },
  });

  const [isOpenCreateDialog, setIsOpenCreateDialog] = useState(false);
  const [isOpenModifyDialog, setIsOpenModifyDialog] = useState(false);
  const [showActivedData, setShowActivedData] = useState(true);

  const [selectedRow, setSelectedRow] = useState({
    ...PurchaseOrderDto,
  });

  const [newData, setNewData] = useState({ ...PurchaseOrderDto });

  const toggleCreateDialog = () => {
    setIsOpenCreateDialog(!isOpenCreateDialog);
  };

  const toggleModifyDialog = () => {
    setIsOpenModifyDialog(!isOpenModifyDialog);
  };

  const handleRowSelection = (arrIds) => {
    const rowSelected = purchaseOrderState.data.filter(function (item) {
      return item.PoId === arrIds[0];
    });

    if (rowSelected && rowSelected.length > 0) {
      setSelectedRow({ ...rowSelected[0] });
    } else {
      setSelectedRow({ ...PurchaseOrderDto });
    }
  };

  const changeSearchData = (e, inputName) => {
    let newSearchData = { ...purchaseOrderState.searchData };
    newSearchData[inputName] = e.target.value;

    setSupplierState({
      ...purchaseOrderState,
      searchData: { ...newSearchData },
    });
  };

  const handleChangeSearchDate = (e, date) => {
    let x = new Date(e);
    let y = new Date();

    if (date === "deliveryDate") {
      y = new Date(purchaseOrderState.searchData.DueDate);
      if (+x >= +y) {
        e = purchaseOrderState.searchData.DueDate;
      }

      setPurchaseOrderState({
        ...purchaseOrderState,
        searchData: {
          ...purchaseOrderState.searchData,
          DeliveryDate: e,
        },
      });
    } else {
      y = new Date(purchaseOrderState.searchData.DeliveryDate);
      if (+x < +y) {
        e = purchaseOrderState.searchData.DeliveryDate;
      }

      setPurchaseOrderState({
        ...purchaseOrderState,
        searchData: {
          ...purchaseOrderState.searchData,
          DueDate: e,
        },
      });
    }
  };

  const fetchData = async () => {
    setPurchaseOrderState({
      ...purchaseOrderState,
      isLoading: true,
    });
    const params = {
      page: purchaseOrderState.page,
      pageSize: purchaseOrderState.pageSize,
      PoCode: purchaseOrderState.searchData.PoCode.trim(),
      DeliveryDate: purchaseOrderState.searchData.DeliveryDate,
      DueDate: purchaseOrderState.searchData.DueDate,
      isActived: showActivedData,
    };
    const res = await purchaseOrderService.get(params);

    if (res && isRendered)
      setPurchaseOrderState({
        ...purchaseOrderState,
        data: !res.Data ? [] : [...res.Data],
        totalRow: res.TotalRow,
        isLoading: false,
      });
  };

  useEffect(() => {
    if (isRendered) fetchData();

    return () => {
      isRendered = false;
    };
  }, [purchaseOrderState.page, purchaseOrderState.pageSize, showActivedData]);

  useEffect(() => {
    if (!_.isEmpty(newData) && !_.isEqual(newData, PurchaseOrderDto)) {
      const data = [newData, ...purchaseOrderState.data];
      if (data.length > purchaseOrderState.pageSize) {
        data.pop();
      }
      setSupplierState({
        ...supplierState,
        data: [...data],
        totalRow: supplierState.totalRow + 1,
      });
    }
  }, [newData]);

  useEffect(() => {
    if (!_.isEmpty(selectedRow) && !_.isEqual(selectedRow, PurchaseOrderDto)) {
      let newArr = [...purchaseOrderState.data];
      const index = _.findIndex(newArr, function (o) {
        return o.PoId == selectedRow.PoId;
      });
      if (index !== -1) {
        newArr[index] = selectedRow;
      }

      setSupplierState({
        ...purchaseOrderState,
        data: [...newArr],
      });
    }
  }, [selectedRow]);

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
            label="general.code"
            name="SupplierCode"
            onClick={fetchData}
            onChange={(e) => changeSearchData(e, "SupplierCode")}
          />
        </Grid>

        <Grid item xs>
          <MuiDateField
            disabled={purchaseOrderState.isLoading}
            label={intl.formatMessage({ id: "purchase_order.DeliveryDate" })}
            value={purchaseOrderState.searchData.DeliveryDate}
            onChange={(e) => {
              handleChangeSearchDate(e, "deliveryDate");
            }}
            // error={touched.ETADate && Boolean(errors.ETADate)}
            // helperText={touched.ETADate && errors.ETADate}
          />
        </Grid>

        <Grid item xs>
          <MuiDateField
            disabled={purchaseOrderState.isLoading}
            label={intl.formatMessage({ id: "purchase_order.DueDate" })}
            value={purchaseOrderState.searchData.DueDate}
            onChange={(e) => {
              handleChangeSearchDate(e, "dueDate");
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

export default connect(mapStateToProps, mapDispatchToProps)(FixedPO);
