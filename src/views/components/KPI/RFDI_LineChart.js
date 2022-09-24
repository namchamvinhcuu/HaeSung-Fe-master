import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Grid, Box } from '@mui/material';

const RFDI_LineChart = ({ t, data }) => {
  var colorList = ['#46c3f2', '#ff0000', '#38a739', '#F7DC6F', '#8E44AD', '#DC7633', '#7E5109', '#1A5276', '#154360', '#ABEBC6']

  return (
    <>
      <Box sx={{
        height: 299,
        position: 'relative',
        overflow: 'auto',
        paddingRight: '5px',
        marginRight: '-5px'
      }}>
        {data && data.map((item, index) => {
          var widthpercent = 0;
          if (item.total_num != 0)
            widthpercent = (100 / item.total_num) * item.issue_num

          return <Grid  item xs={12} sx={{ mt: 2 }} key={index} >
            <Grid container>
              <Grid item xs={8} >
                <span>{item.location_name}</span>
              </Grid>
              <Grid item xs={4} style={{ textAlign: 'right' }}>
                <span>{item.issue_per_Entrance_label}</span>
              </Grid>
            </Grid>
            <Grid item xs={12} style={style.line}>
              <div style={{ height: '15px', backgroundColor: '#ff0000', width: `${widthpercent}%` }}></div>
            </Grid>
          </Grid>
        })}
      </Box >
      <Grid container>
        <Grid item xs={6} style={{ textAlign: 'center' }}>
          <div style={{ ...style.block, backgroundColor: '#ff0000' }} />
          <span>Issue</span>
        </Grid>
        <Grid item xs={6} style={{ textAlign: 'center' }}>
          <div style={{ ...style.block, backgroundColor: '#28a745' }} />
          <span>Entrance</span>
        </Grid>
      </Grid>
    </>
  );
}

const style = {
  line: { border: '1px #938d8d solid', borderRadius: '3px', backgroundColor: '#28a745' },
  block: { height: '15px', backgroundColor: '#ff0000', display: 'inline-block', width: '50px', border: '1px #938d8d solid', margin: '0px 5px -3px 0px' }
}

export default RFDI_LineChart;
