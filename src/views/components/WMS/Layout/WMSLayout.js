import { Store } from '@appstate';
import { User_Operations } from '@appstate/user';
import { CombineDispatchToProps, CombineStateToProps } from '@plugins/helperJS';
import React, { useEffect, useRef, useState } from "react";
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import {
    MuiButton,
    MuiTextField,
    MuiAutocomplete
} from "@controls";
import IconButton from "@mui/material/IconButton";
import { ErrorAlert, SuccessAlert } from "@utils";
import moment from "moment";
import { useIntl } from "react-intl";
import _ from 'lodash'

import Grid from "@mui/material/Grid";
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import { styled } from '@mui/material/styles';

import Konva from 'konva';
import { Stage, Layer, Text, Rect, Group } from 'react-konva';

import { locationService, wmsLayoutService } from "@services";

const SCENE_BASE_WIDTH = 1080;
const SCENE_BASE_HEIGHT = 700;

const Item = styled(Paper)(({ theme }) => ({
    backgroundColor: theme.palette.mode === 'dark' ? '#1A2027' : '#fff',
    ...theme.typography.body2,
    padding: theme.spacing(1),
    textAlign: 'center',
    color: theme.palette.text.secondary,
    height: SCENE_BASE_HEIGHT
}));



const WMSLayout = (props) => {

    let isRendered = useRef(true);
    const intl = useIntl();

    const initLocation = {
        LocationId: 0,
        LocationCode: ""
    }

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
    }

    const [wmsLayoutState, setWMSLayoutState] = useState({
        commonDetailId: 0,
        commonDetailName: "",
        Location: {
            ...initLocation
        },
        ShelfCode: "",
        TotalLevel: 1,
        BinPerLevel: 1,
    });

    const [area, setArea] = useState({
        width: 0,
        height: 0
    });

    const scale = area.width / SCENE_BASE_WIDTH;

    const [rects, setRects] = useState(generateShapes());

    const [selectedShelfId, setSelectedShelfId] = useState(0);

    const handleDelete = async (lot) => {

    };

    const fetchData = async () => {
        await drawingMasterFunc()
    };

    const getWarehouses = async () => {
        return await locationService.GetArea();
    }

    const getAisles = async () => {
        return await wmsLayoutService.getAisles(wmsLayoutState.commonDetailId);
    }

    const getShelves = async () => {
        return await wmsLayoutService.getShelves(wmsLayoutState.Location?.LocationId, wmsLayoutState.ShelfCode);
    }

    const getBins = async () => {
        return await wmsLayoutService.getBins(selectedShelfId);
    }

    const handleInputChange = (e, inputName) => {
        let newState = { ...wmsLayoutState };
        newState[inputName] = e;
        if (inputName === "commonDetailId") {
            newState.Location = {
                ...initLocation
            };
        }

        setWMSLayoutState({ ...newState });
    };

    const handleCreate = async () => {
        // const removeProp = 'Location';
        // const { [removeProp]: remove, ...rest } = wmsLayoutState;

        const {
            Location,
            ShelfCode,
            TotalLevel,
            BinPerLevel
        } = wmsLayoutState;

        const params = {
            LocationId: Location.LocationId,
            LocationCode: Location.LocationCode,
            ShelfCode: ShelfCode,
            TotalLevel: TotalLevel,
            BinPerLevel: BinPerLevel,
        }

        const res = await wmsLayoutService.createShelf(params);

        console.log(res, '[response]')
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

    const drawingMasterFunc = async () => {
        const stage = new Konva.Stage({
            container: 'master-konva',
            width: area.width,
            height: area.height,
        });
        const layer = new Konva.Layer();

        const res = await getShelves();

        if (res && res.Data) {
            for (let i = 0; i < res.Data.length; i++) {
                let group = new Konva.Group({
                    x: 20,
                    y: i * 40 + 20,
                    id: res.Data[i].ShelfId.toString(),
                    name: res.Data[i].ShelfCode
                });

                for (let j = 0; j < res.Data[i].BinPerLevel; j++) {
                    let box = new Konva.Rect({
                        x: j * 100,
                        // y: i * 18,
                        width: 100,
                        height: 20,
                        // name: colors[i],
                        fill: 'orange',
                        stroke: 'black',
                        strokeWidth: 1,

                    });

                    group.add(box);
                }

                group.add(new Konva.Text({
                    text: res.Data[i].ShelfCode,
                    fontSize: 18,
                    fontFamily: 'Calibri',
                    fill: '#000',
                    width: 130,
                    padding: 5,
                    align: 'center'
                }));

                group.on('click', () => {
                    setSelectedShelfId(group.attrs.id);

                });

                layer.add(group);
            }
        }
        stage.add(layer);
    }

    const drawingDetailFunc = async () => {
        const stage = new Konva.Stage({
            container: 'detail-konva',
            width: area.width,
            height: area.height,
        });
        const layer = new Konva.Layer();

        const res = await getBins();

        if (res && res.Data) {

            let bin_per_level = res.Data[0].BinPerLevel;
            let total_level = res.Data[0].TotalLevel;

            for (let i = 0; i < total_level; i++) {
                let group = new Konva.Group({
                    x: 50,
                    y: i * 50 + 50,
                });

                for (let j = 0; j < bin_per_level; j++) {
                    let box = new Konva.Rect({
                        x: j * 100,
                        // y: i * 18,
                        width: 100,
                        height: 50,
                        // name: colors[i],
                        fill: 'lightblue',
                        stroke: 'black',
                        strokeWidth: 1,
                        name: res.Data[(i * bin_per_level) + j].BinCode
                    });

                    box.on('click', () => {
                        alert(box.attrs.name)
                    })

                    group.add(box);
                }

                group.on('click', () => {
                    // setSelectedShelfId(group.attrs.id)
                });

                layer.add(group);
            }
        }
        stage.add(layer);
    }

    useEffect(() => {
        const container = document.querySelector('#master-konva');
        setArea({
            width: container.offsetWidth - 16,
            height: container.offsetHeight - 80
        });

        const checkSize = () => {
            setArea({
                width: container.offsetWidth - 16,
                height: container.offsetHeight - 80
            });
        };

        window.addEventListener("resize", checkSize);

        return () => {
            isRendered = false;
            window.removeEventListener("resize", checkSize);
        };
    }, [area.width]);

    useEffect(() => {
        drawingDetailFunc();
    }, [selectedShelfId]);

    return (
        <React.Fragment>
            <Grid
                container
                direction="row"
                justifyContent="space-between"
                spacing={2}
            >

                <Grid item xs>
                    <Grid
                        container
                        columnSpacing={2}
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                    >
                        <Grid item xs>
                            <Grid container
                                columnSpacing={2}
                                direction="row"
                                justifyContent="flex-start"
                                alignItems="center"
                            >
                                <Grid item style={{ width: "20%" }}>
                                    <MuiAutocomplete
                                        label={intl.formatMessage({ id: "wms-layout.warehouse" })}
                                        fetchDataFunc={getWarehouses}
                                        displayLabel="commonDetailName"
                                        displayValue="commonDetailId"
                                        onChange={(e, item) => {
                                            handleInputChange(
                                                item ? item.commonDetailId ?? null : null,
                                                "commonDetailId"
                                            );
                                        }}
                                        variant="standard"
                                    />

                                </Grid>

                                <Grid item style={{ width: "12%" }}>
                                    <MuiAutocomplete
                                        label={intl.formatMessage({ id: "wms-layout.aisle" })}
                                        fetchDataFunc={getAisles}
                                        displayLabel="LocationCode"
                                        displayValue="LocationId"
                                        value={
                                            !_.isEqual(wmsLayoutState.Location, initLocation)
                                                ? wmsLayoutState.Location
                                                : initLocation
                                        }
                                        onChange={(e, item) => {
                                            handleInputChange({ LocationId: item.LocationId, LocationCode: item.LocationCode }, "Location"
                                            );

                                        }}
                                        variant="standard"
                                    />
                                </Grid>

                                <Grid item style={{ width: "12%" }}>
                                    <MuiTextField
                                        label={intl.formatMessage({ id: "wms-layout.shelf" })}
                                        variant="standard"
                                        value={wmsLayoutState.ShelfCode}
                                        onChange={(e) => { handleInputChange(e.target.value, "ShelfCode") }}
                                    />
                                </Grid>

                                <Grid item style={{ width: "12%" }}>
                                    <MuiTextField
                                        label={intl.formatMessage({ id: "wms-layout.total_level" })}
                                        variant="standard"
                                        type="number"
                                        value={wmsLayoutState.TotalLevel}
                                        onChange={(e) => { handleInputChange(e.target.value, "TotalLevel") }}
                                    />
                                </Grid>

                                <Grid item style={{ width: "12%" }}>
                                    <MuiTextField
                                        label={intl.formatMessage({ id: "wms-layout.bin_per_level" })}
                                        variant="standard"
                                        type="number"
                                        value={wmsLayoutState.BinPerLevel}
                                        onChange={(e) => { handleInputChange(e.target.value, "BinPerLevel") }}
                                    />
                                </Grid>

                                <Grid item style={{ width: "12%" }}>
                                    <MuiButton
                                        text="create"
                                        color="success"
                                        onClick={handleCreate}
                                    />
                                </Grid>
                            </Grid>
                        </Grid>
                        <Grid item>
                            <MuiButton
                                text="search"
                                color="info"
                                onClick={fetchData}
                            />
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>

            <Box sx={{ flexGrow: 1 }}>
                <Grid container spacing={2}>
                    <Grid item xs={6}>
                        <h3>Master</h3>
                        <Item id='master-konva' />
                    </Grid>
                    <Grid item xs={6}>
                        <h3>Detail</h3>
                        <Item id='detail-konva' />
                    </Grid>

                </Grid>
            </Box>
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

export default connect(mapStateToProps, mapDispatchToProps)(WMSLayout);