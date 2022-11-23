import { Store } from '@appstate';
import { User_Operations } from '@appstate/user';
import { CombineDispatchToProps, CombineStateToProps } from '@plugins/helperJS';
import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import { MuiAutocomplete, MuiButton, MuiDataGrid, MuiTextField } from '@controls';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import IconButton from '@mui/material/IconButton';
import { ErrorAlert, isNumber, SuccessAlert } from '@utils';
import _ from 'lodash';
import moment from 'moment';
import { useIntl } from 'react-intl';

import DeleteIcon from '@mui/icons-material/Delete';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';

import axios from 'axios';
import Konva from 'konva';

import { useModal, useModal2 } from '@basesShared';
import { Button, ButtonGroup, Tooltip, Typography } from '@mui/material';
import { locationService, materialPutAwayService, wmsLayoutService, eslService, iqcService } from '@services';
import WMSLayoutPrintBinDialog from './WMSLayoutPrintBinDialog';
import WMSLayoutPrintLotDialog from './WMSLayoutPrintLotDialog';

const SCENE_BASE_WIDTH = 1080;
const SCENE_BASE_HEIGHT = 700;

const Item = styled(Paper)(({ theme }) => ({
  backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
  ...theme.typography.body2,
  padding: theme.spacing(1),
  textAlign: 'center',
  color: theme.palette.text.secondary,
  height: SCENE_BASE_HEIGHT,
  overflow: 'auto',
}));

const WMSLayout = (props) => {
  let isRendered = useRef(true);
  const intl = useIntl();

  const { isShowing, toggle } = useModal();
  const { isShowing2, toggle2 } = useModal2();
  const initLocation = {
    LocationId: 0,
    LocationCode: '',
  };

  const generateShapes = (num) => {
    if (num)
      return [...Array(num)].map((_, i) => ({
        id: i.toString(),
        isDragging: false,
      }));
    else
      return [...Array(4)].map((_, i) => ({
        id: i.toString(),
        isDragging: false,
      }));
  };

  const [wmsLayoutState, setWMSLayoutState] = useState({
    commonDetailId: 0,
    commonDetailName: '',
    Location: {
      ...initLocation,
    },
    ShelfCode: '',
    TotalLevel: 1,
    BinPerLevel: 1,
  });

  const [area, setArea] = useState({
    width: 0,
    height: 0,
  });

  const scale = area.width / SCENE_BASE_WIDTH;
  const [ESLCode, setESLCode] = useState('');
  const [rects, setRects] = useState(generateShapes());
  const [updateData, setUpdateData] = useState({});
  const [selectedShelfId, setSelectedShelfId] = useState(0);
  const eslInputRef = useRef(null);
  const [BinId, setBinId] = useState(0);
  const [binCode, setBinCode] = useState('');
  const [lotState, setLotState] = useState({
    isLoading: false,
    data: [],
    totalRow: 0,
    page: 1,
    pageSize: 7,
  });

  const columns = [
    { field: 'Id', headerName: '', hide: true },
    {
      field: 'id',
      headerName: '',
      width: 80,
      filterable: false,
      renderCell: (index) => index.api.getRowIndex(index.row.Id) + 1 + (lotState.page - 1) * lotState.pageSize,
    },
    { field: 'MaterialCode', headerName: 'Material Code', flex: 0.4 },
    { field: 'LotSerial', headerName: 'LotSerial', flex: 0.3 },
    {
      field: 'Qty',
      headerName: 'Qty',
      flex: 0.3,
      editable: true,
      renderCell: (params) => {
        return (
          <Tooltip title={intl.formatMessage({ id: 'material-so-detail.SOrderQty_tip' })}>
            <Typography sx={{ fontSize: 14, width: '100%' }}>{params.row.Qty}</Typography>
          </Tooltip>
        );
      },
    },
    {
      field: 'IncomingDate',
      headerName: 'Incoming Date',
      flex: 0.5,
      valueFormatter: (params) => {
        if (params.value !== null) return moment(params?.value).add(7, 'hours').format('YYYY-MM-DD HH:mm:ss');
      },
    },

    {
      field: 'action',
      headerName: '',
      width: 80,
      // headerAlign: 'center',
      disableClickEventBubbling: true,
      sortable: false,
      disableColumnMenu: true,
      renderCell: (params) => {
        return (
          <Grid container direction="row" alignItems="center" justifyContent="center">
            <Grid item xs={12} style={{ display: 'flex', justifyContent: 'center' }}>
              <IconButton
                aria-label="delete"
                color="error"
                size="small"
                sx={[{ '&:hover': { border: '1px solid red' } }]}
                onClick={() => handleDeleteLot(params.row)}
              >
                <DeleteIcon fontSize="inherit" />
              </IconButton>
            </Grid>
          </Grid>
        );
      },
    },
  ];

  const handleDeleteLot = async (lot) => {
    if (window.confirm(intl.formatMessage({ id: 'general.confirm_delete' }))) {
      try {
        let res = await materialPutAwayService.handleDelete(lot);
        if (res && res.HttpResponseCode === 200) {
          await getDataLot();
          await eslService.updateESLDataByBinId(lot.BinId);
        } else {
          ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
        }
      } catch (error) {
        console.log(error);
      }
    }
  };

  const fetchData = async (refresh) => {
    if (!refresh) {
      setSelectedShelfId(0);
      setBinId(0);
    }
    await drawingMasterFunc(refresh);
  };

  const getWarehouses = async () => {
    return await locationService.GetArea();
  };

  const getAisles = async () => {
    return await wmsLayoutService.getAisles(wmsLayoutState.commonDetailId);
  };

  const getShelves = async (refresh) => {
    if (!refresh)
      return await wmsLayoutService.getShelves(wmsLayoutState.Location?.LocationId, wmsLayoutState.ShelfCode);

    return await wmsLayoutService.getShelves(wmsLayoutState.Location?.LocationId, '');
  };

  const getBins = async () => {
    return await wmsLayoutService.getBins(selectedShelfId);
  };

  const handleInputChange = (e, inputName) => {
    let newState = { ...wmsLayoutState };

    switch (inputName) {
      case 'commonDetailId':
        newState.Location = {
          ...initLocation,
        };
        newState[inputName] = e;
        break;
      case 'TotalLevel':
      case 'BinPerLevel':
        let num = parseInt(e, 10);
        if (num > 9) num = 9;
        newState[inputName] = num;
        break;
      case 'ShelfCode':
        if (!/^([a-zA-Z]{1,})$/.test(e) && e !== '') newState[inputName] = 'A';
        else newState[inputName] = e;
        break;
      default:
        newState[inputName] = e;
        break;
    }

    setWMSLayoutState({ ...newState });
  };

  const handleCreate = async () => {
    const { Location, ShelfCode, TotalLevel, BinPerLevel } = wmsLayoutState;

    const params = {
      LocationId: Location.LocationId,
      LocationCode: Location.LocationCode,
      ShelfCode: ShelfCode,
      TotalLevel: TotalLevel,
      BinPerLevel: BinPerLevel,
    };

    const res = await wmsLayoutService.createShelf(params);

    if (res !== 'general.success') {
      ErrorAlert(intl.formatMessage({ id: res }));
    } else {
      SuccessAlert(intl.formatMessage({ id: res }));

      await fetchData(true);
    }
  };

  const handleEdit = async (Action) => {
    const params = { ShelfId: selectedShelfId, Action: Action };
    const res = await wmsLayoutService.editShelf(params);
    setBinId(0);

    if (res !== 'general.success') {
      ErrorAlert(intl.formatMessage({ id: res }));
    } else {
      SuccessAlert(intl.formatMessage({ id: res }));
      await fetchData(true);
      await drawingDetailFunc();
    }
  };

  async function getDataLot() {
    setLotState({ ...lotState, isLoading: true });
    const res = await wmsLayoutService.getLotByBinId({
      page: lotState.page,
      pageSize: lotState.pageSize,
      BinId: BinId,
    });
    const singleBin = await wmsLayoutService.getBinById({ BinId: BinId });
    if (singleBin && singleBin.Data) {
      setESLCode(singleBin?.Data?.ESLCode);
    }
    if (res && res.Data) {
      setLotState({
        ...lotState,
        data: res.Data ?? [],
        totalRow: res.TotalRow,
        isLoading: false,
      });
    }
  }

  const handleDragStart = (e) => {
    const id = e.target.id();
    setStars(
      rects.map((rect) => {
        return {
          ...rect,
          isDragging: rect.id === id,
        };
      })
    );
  };
  const handleDragEnd = (e) => {
    setStars(
      rects.map((rect) => {
        return {
          ...rect,
          isDragging: false,
        };
      })
    );
  };

  const getShortBinCode = (str) => {
    let parts = str.split('-');
    let last = parts.pop();
    let preLast = parts.pop();
    return preLast.concat('-', last);
  };

  const getShortAisleCode = (str) => {
    let parts = str.split('-');
    return parts[0].concat('-', parts[1]);
  };

  const drawingMasterFunc = async (refresh) => {
    const res = await getShelves(refresh);

    if (res && res.Data) {
      const masterStage = new Konva.Stage({
        container: 'master-konva',
        width: area.width + 500,
        height: area.height,
        // width: 1500,
        // height: 1500,
      });

      const layer = new Konva.Layer();

      for (let i = 0; i < res.Data.length; i++) {
        let group = new Konva.Group({
          x: 30,
          y: i * 60 + 30,
          id: res.Data[i].ShelfId.toString(),
          name: res.Data[i].ShelfCode,
        });

        group.add(
          new Konva.Text({
            text: `${wmsLayoutState.Location.LocationCode}-${res.Data[i].ShelfCode}`,
            fontSize: 24,
            fontFamily: 'Calibri',
            fill: '#000000',
            width: 130,
            // padding: 5,
            // align: 'center',
            x: 0,
            y: 5,
          })
        );

        for (let j = 0; j < res.Data[i].BinPerLevel; j++) {
          let box = new Konva.Rect({
            x: j * 70 + 130,
            // y: i * 18,
            width: 70,
            height: 30,
            // name: colors[i],
            fill: '#FFA500',
            stroke: '#ffffff',
            strokeWidth: 1,
          });

          group.add(box);
        }

        group.on('click', () => {
          setSelectedShelfId(group.attrs.id);

          // for (let i = 0; i < layer.children.length; i++) {
          //     layer.children[i].attrs.id !== group.attrs.id
          //         ? layer.children[i].stroke(null)
          //         : layer.children[i].stroke('#000000')
          // }
        });
        group.on('mouseenter', function () {
          masterStage.container().style.cursor = 'pointer';
        });

        group.on('mouseleave', function () {
          masterStage.container().style.cursor = 'default';
        });

        layer.add(group);
      }

      masterStage.add(layer);
    } else {
      ErrorAlert(intl.formatMessage({ id: res?.ResponseMessage }));
    }
  };

  const drawingDetailFunc = async () => {
    const detailStage = new Konva.Stage({
      container: 'detail-konva',
      width: area.width + 500,
      height: area.height,
    });

    const layer = new Konva.Layer();

    const res = await getBins();

    // detailStage.clear();

    if (res && res.Data) {
      let bin_per_level = res.Data[0].BinPerLevel;
      let total_level = res.Data[0].TotalLevel;
      let shortAisleCode = getShortAisleCode(res.Data[0].BinCode);

      let text = new Konva.Text({
        x: 10,
        y: 10,
        text: shortAisleCode,
        fontSize: 30,
        fontFamily: 'Calibri',
        fill: 'green',
      });
      layer.add(text);

      for (let i = 0; i < total_level; i++) {
        let group = new Konva.Group({
          x: 50,
          y: i * 40 + 40,
        });

        for (let j = 0; j < bin_per_level; j++) {
          let box = new Konva.Rect({
            x: j * 100,
            // y: i * 18,
            width: 100,
            height: 40,
            // name: colors[i],
            fill: res.Data[i * bin_per_level + j].BinStatus ? 'orange' : '#f0f0f0',
            stroke: '#ffffff',
            strokeWidth: 1,
            name: res.Data[i * bin_per_level + j].BinCode,
            binId: res.Data[i * bin_per_level + j].BinId,
          });

          box.on('click', () => {
            setBinId(box.attrs.binId);
            setBinCode(box.attrs.name);

            let layerChild = layer.children;
            let groupArr = layerChild.slice(1);
            for (let i = 0; i < groupArr.length; i++) {
              let konvaGroup = groupArr[i];
              for (let j = 0; j < konvaGroup.children.length; j++) {
                let boxItem = konvaGroup.children[j];
                if (boxItem.attrs.binId) {
                  boxItem.stroke('#ffffff');
                }
              }
            }
            box.stroke('#FF0000');
          });

          box.on('mouseenter', function () {
            detailStage.container().style.cursor = 'pointer';
          });

          box.on('mouseleave', function () {
            detailStage.container().style.cursor = 'default';
          });

          let binCodeText = new Konva.Text({
            text: getShortBinCode(res.Data[i * bin_per_level + j].BinCode),
            x: j * 100 + 10,
            y: 15,
            // width: 220,
            // fontFamily: 'sans-serif',
            // fontSize: 35,
            fill: '#000',
          });

          group.add(box, binCodeText);
        }

        group.on('click', () => {
          // setSelectedShelfId(group.attrs.id)
        });

        layer.add(group);
      }
    }
    detailStage.add(layer);
  };

  useEffect(() => {
    const container = document.querySelector('#master-konva');
    setArea({
      width: container.offsetWidth - 16,
      height: container.offsetHeight - 80,
    });

    const checkSize = () => {
      setArea({
        width: container.offsetWidth - 16,
        height: container.offsetHeight - 80,
      });
    };

    window.addEventListener('resize', checkSize);

    return () => {
      isRendered = false;
      window.removeEventListener('resize', checkSize);
    };
  }, [area.width]);

  useEffect(() => {
    drawingDetailFunc();
    setBinId(0);
  }, [selectedShelfId]);

  useEffect(() => {
    getDataLot();
  }, [BinId]);

  const handleRowUpdate = async (newRow) => {
    const index = _.findIndex(lotState.data, function (o) {
      return o.Id == newRow.Id;
    });
    var oldRow = lotState.data[index];

    if (newRow.Qty == oldRow.Qty) {
      return oldRow;
    }

    setLotState({ ...lotState, isSubmit: true });
    if (!isNumber(newRow.Qty) || newRow.Qty < 0) {
      ErrorAlert(intl.formatMessage({ id: 'forecast.OrderQty_required_bigger' }));
      return oldRow;
    }

    newRow = { ...newRow, Qty: newRow.Qty };

    const res = await wmsLayoutService.modifyQty({
      ...newRow,
    });
    if (res.HttpResponseCode === 200 && res.Data) {
      SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }));
      setUpdateData(res.Data);
      setLotState({ ...lotState, isSubmit: false });
      await eslService.updateESLDataByBinId(newRow.BinId);

      return res.Data;
    } else {
      ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
      setLotState({ ...lotState, isSubmit: false });
      const index = _.findIndex(lotState.data, function (o) {
        return o.Id == newRow.Id;
      });

      return lotState.data[index];
    }
  };

  useEffect(() => {
    if (!_.isEmpty(updateData) && !_.isEqual(updateData) && isRendered) {
      let newArr = [...lotState.data];
      const index = _.findIndex(newArr, function (o) {
        return o.Id == updateData.Id;
      });
      if (index !== -1) {
        newArr[index] = updateData;
      }
      setLotState({ ...lotState, data: [...newArr] });
    }
  }, [updateData]);

  const handleProcessRowUpdateError = React.useCallback((error) => {
    ErrorAlert(intl.formatMessage({ id: 'general.system_error' }));
  }, []);

  const handleESLInputChange = (e) => {
    eslInputRef.current.value = e.target.value;
  };

  const keyPress = async (e) => {
    if (e.key === 'Enter') {
      await scanBtnClick();
    }
  };

  const scanBtnClick = async () => {
    let inputVal = '';

    if (eslInputRef.current.value) {
      inputVal = eslInputRef.current.value.trim().toUpperCase();
    }
    const singleBinCheck = await wmsLayoutService.getBinById({ BinId: BinId });

    if (inputVal === singleBinCheck?.Data?.ESLCode) {
      return;
    }

    await handleScanESLCode(inputVal);
  };

  const handleScanESLCode = async (inputValue) => {
    let flag = false;
    let articleList = [];

    if (!inputValue || inputValue.length !== 12) {
      ErrorAlert(intl.formatMessage({ id: 'esl.tag_unregistrated' }));
    } else {
      const getRegisteredESLTag = await eslService.getRegisteredESLTagByCode(inputValue);
      console.log(getRegisteredESLTag, 'getRegisteredESLTag');
      if (getRegisteredESLTag.status !== 200) {
        ErrorAlert(intl.formatMessage({ id: 'esl.tag_unregistrated' }));
      } else {
        await wmsLayoutService.unLinkESL({ ESLCode: inputValue });

        // articleList = getRegisteredESLTag.data.labelList;
        // if (articleList.length > 0) {

        //   // await eslService.unLinkESLTagWithBin(inputValue);
        // }
      }

      // Create/Update ESL
      const createResponse = await eslService.createBinOnESLServer(binCode, 'Bin-1');
      console.log('create', createResponse);
      if (createResponse.status === 200) {
        // Link ESL-Bin
        const linkResponse = await eslService.linkESLTagWithBin(binCode, inputValue);
        console.log('link', linkResponse);
        if (linkResponse.status === 200) {
          // Update ESL Data
          await eslService.updateESLDataByBinId(BinId);
          const res = await wmsLayoutService.scanESLCode({ ESLCode: inputValue, BinId: BinId });
          if (res === 'general.success') {
            // setUpdateData(res.Data);
            SuccessAlert(intl.formatMessage({ id: res }));
          } else {
            ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
          }
        }
      }
    }

    // const getRegisteredESLTags = await eslService.getRegisteredESLTags();
    // if (getRegisteredESLTags.status === 200) {
    //   let eslTagArr = getRegisteredESLTags.data.labelList;
    //   for (let i = 0; i < eslTagArr.length; i++) {
    //     if (eslTagArr[i].labelCode === inputValue) {
    //       flag = true;
    //       articleList = [...eslTagArr[i].articleList];
    //       console.log(articleList);
    //       break;
    //     } else {
    //       ErrorAlert(intl.formatMessage({ id: 'esl.tag_unregistrated' }));
    //       return;
    //     }
    //   }
    // } else {
    //   // getRegisteredESLTags() return  error
    //   return;
    // }

    // if (flag) {
    //   if (articleList.length) {
    //     await eslService.unLinkESLTagWithBin(inputValue);
    //     await wmsLayoutService.unLinkESL({ ESLCode: inputValue });
    //     // for (let i = 0; i < articleList.length; i++) {
    //     //   if (articleList[i].articleId === binCode) {
    //     //     console.log('aaaa');

    //     //     break;
    //     //   }
    //     // }
    //   }

    //   const res = await wmsLayoutService.scanESLCode({ ESLCode: inputValue, BinId: BinId });

    //   if (res === 'general.success') {
    //     // setUpdateData(res.Data);
    //     SuccessAlert(intl.formatMessage({ id: res }));

    //     // Create/Update ESL
    //     const createResponse = await eslService.createBinOnESLServer(binCode, 'Bin-1');
    //     if (createResponse.status === 200) {
    //       // Link ESL-Bin
    //       const linkResponse = await eslService.linkESLTagWithBin(binCode, inputValue);
    //       if (linkResponse.status === 200) {
    //         // Update ESL Data
    //         await eslService.updateESLDataByBinId(BinId);
    //       }
    //     }
    //   } else {
    //     ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
    //     return;
    //   }
    // }
  };

  return (
    <React.Fragment>
      <Grid container direction="row" justifyContent="space-between" spacing={2}>
        <Grid item xs>
          <Grid container columnSpacing={2} direction="row" justifyContent="space-between" alignItems="center">
            <Grid item xs>
              <Grid container columnSpacing={2} direction="row" justifyContent="flex-start" alignItems="center">
                <Grid item style={{ width: '20%' }}>
                  <MuiAutocomplete
                    label={intl.formatMessage({ id: 'wms-layout.warehouse' })}
                    fetchDataFunc={getWarehouses}
                    displayLabel="commonDetailName"
                    displayValue="commonDetailId"
                    onChange={(e, item) => {
                      handleInputChange(item ? item.commonDetailId ?? null : null, 'commonDetailId');
                    }}
                    variant="standard"
                  />
                </Grid>

                <Grid item style={{ width: '12%' }}>
                  <MuiAutocomplete
                    label={intl.formatMessage({ id: 'wms-layout.aisle' })}
                    fetchDataFunc={getAisles}
                    displayLabel="LocationCode"
                    displayValue="LocationId"
                    value={!_.isEqual(wmsLayoutState.Location, initLocation) ? wmsLayoutState.Location : null}
                    onChange={(e, item) => {
                      handleInputChange({ LocationId: item.LocationId, LocationCode: item.LocationCode }, 'Location');
                    }}
                    variant="standard"
                  />
                </Grid>

                <Grid item style={{ width: '12%' }}>
                  <MuiTextField
                    label={intl.formatMessage({ id: 'wms-layout.shelf' })}
                    variant="standard"
                    value={wmsLayoutState.ShelfCode}
                    onChange={(e) => {
                      handleInputChange(e.target.value, 'ShelfCode');
                    }}
                    inputProps={{
                      maxLength: 1,
                      pattern: '[a-zA-Z]',
                    }}
                  />
                </Grid>

                <Grid item style={{ width: '12%' }}>
                  <MuiTextField
                    label={intl.formatMessage({ id: 'wms-layout.total_level' })}
                    variant="standard"
                    type="number"
                    value={wmsLayoutState.TotalLevel}
                    onChange={(e) => {
                      handleInputChange(e.target.value, 'TotalLevel');
                    }}
                    inputProps={{
                      min: 1,
                      max: 9,
                      step: 1,
                      inputMode: 'numeric',
                      pattern: '[0-9]*',
                    }}
                  />
                </Grid>

                <Grid item style={{ width: '12%' }}>
                  <MuiTextField
                    label={intl.formatMessage({ id: 'wms-layout.bin_per_level' })}
                    variant="standard"
                    type="number"
                    value={wmsLayoutState.BinPerLevel}
                    onChange={(e) => {
                      handleInputChange(e.target.value, 'BinPerLevel');
                    }}
                    inputProps={{
                      min: 1,
                      max: 9,
                      step: 1,
                      inputMode: 'numeric',
                      pattern: '[0-9]*',
                    }}
                  />
                </Grid>

                <Grid item style={{ width: '12%' }}>
                  <MuiButton text="create" color="success" onClick={handleCreate} />
                </Grid>
              </Grid>
            </Grid>
            <Grid item>
              <MuiButton text="search" color="info" onClick={() => fetchData(false)} />
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      <Box sx={{ flexGrow: 1 }}>
        <Grid container spacing={2}>
          <Grid item xs={5}>
            <h3>Master</h3>
            <Item id="master-konva" />
          </Grid>
          <Grid item xs={7}>
            <h3>Detail</h3>

            <Grid item sx={{ mb: 2 }}>
              <ButtonGroup
                disableElevation
                variant="contained"
                sx={{ mr: 1 }}
                disabled={selectedShelfId ? false : true}
              >
                <Button color="success" onClick={() => handleEdit(1)} startIcon={<AddIcon />}>
                  {intl.formatMessage({ id: 'wms-layout.add_bin_per_level' })}
                </Button>
                <Button color="error" onClick={() => handleEdit(2)} endIcon={<RemoveIcon />}>
                  {intl.formatMessage({ id: 'wms-layout.minus_bin_per_level' })}
                </Button>
              </ButtonGroup>

              <ButtonGroup
                disableElevation
                variant="contained"
                sx={{ ml: 1, mr: 1 }}
                disabled={selectedShelfId ? false : true}
              >
                <Button color="success" onClick={() => handleEdit(3)} startIcon={<AddIcon />}>
                  {intl.formatMessage({ id: 'wms-layout.add_total_level' })}
                </Button>
                <Button color="error" onClick={() => handleEdit(4)} endIcon={<RemoveIcon />}>
                  {intl.formatMessage({ id: 'wms-layout.minus_total_level' })}
                </Button>
              </ButtonGroup>

              <ButtonGroup
                disableElevation
                variant="contained"
                sx={{ ml: 1, float: 'right' }}
                disabled={selectedShelfId ? false : true}
              >
                <MuiButton text="print" onClick={toggle} sx={{ mt: 0 }} />
              </ButtonGroup>
            </Grid>

            <Item id="detail-konva" style={{ maxHeight: '260px' }} />

            <Grid container spacing={2} justifyContent="space-between" alignItems="center">
              <Grid item sx={{ mt: 2, mb: 2, textAlign: 'right', display: 'flex', alignItems: 'center' }} sm={7} md={7}>
                <MuiTextField
                  key={[ESLCode, BinId]}
                  ref={eslInputRef}
                  label="ESLCode"
                  defaultValue={ESLCode}
                  disabled={BinId > 0 ? false : true}
                  // autoFocus={focus}
                  // value={lotInputRef.current.value}
                  onChange={handleESLInputChange}
                  onKeyDown={keyPress}
                  inputProps={{ maxLength: 12 }}
                />
                <MuiButton text="scan" color="success" onClick={scanBtnClick} disabled={BinId > 0 ? false : true} />
              </Grid>
              <Grid item sx={{ mt: 2, mb: 2, textAlign: 'right' }}>
                <MuiButton
                  text="print"
                  sx={{ mt: 0, mb: 0 }}
                  onClick={toggle2}
                  disabled={lotState.data.length > 0 ? false : true}
                />
              </Grid>
            </Grid>
            <Grid item>
              <MuiDataGrid
                processRowUpdate={handleRowUpdate}
                onProcessRowUpdateError={handleProcessRowUpdateError}
                experimentalFeatures={{ newEditingApi: true }}
                showLoading={lotState.isLoading}
                isPagingServer={true}
                headerHeight={45}
                columns={columns}
                rows={lotState.data}
                page={lotState.page - 1}
                pageSize={lotState.pageSize}
                rowCount={lotState.totalRow}
                onPageChange={(newPage) => setLotState({ ...lotState, page: newPage + 1 })}
                onPageSizeChange={(newPageSize) => setLotState({ ...lotState, page: 1, pageSize: newPageSize })}
                getRowId={(rows) => rows.Id}
                // onSelectionModelChange={(newSelectedRowId) => handleRowSelection(newSelectedRowId)}
                //getRowClassName={(params) => { if (_.isEqual(params.row, newData)) return `Mui-created`; }}
                initialState={{ pinnedColumns: { right: ['action'] } }}
              />
            </Grid>
          </Grid>
        </Grid>
      </Box>

      <WMSLayoutPrintBinDialog isOpen={isShowing} onClose={toggle} ShelfId={selectedShelfId} />

      <WMSLayoutPrintLotDialog isOpen={isShowing2} onClose={toggle2} BinId={BinId} />
    </React.Fragment>
  );
};

User_Operations.toString = function () {
  return 'User_Operations';
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

export default connect(mapStateToProps, mapDispatchToProps)(WMSLayout);
