import * as React from 'react';
import Paper from '@mui/material/Paper';
import {
  Chart,
  ArgumentAxis,
  ValueAxis,
  LineSeries,
  Title,
  Legend,
} from '@devexpress/dx-react-chart-material-ui';
import { styled } from '@mui/material/styles';
import { Animation } from '@devexpress/dx-react-chart';

// import { confidence as data } from '../../../demo-data/data-vizualization';

const confidence = [
  {
    year: 1993, tvNews: 19, church: 29, military: 32,
  }, {
    year: 1995, tvNews: 13, church: 32, military: 33,
  }, {
    year: 1997, tvNews: 14, church: 35, military: 30,
  }, {
    year: 1999, tvNews: 13, church: 32, military: 34,
  }, {
    year: 2001, tvNews: 15, church: 28, military: 32,
  }, {
    year: 2003, tvNews: 16, church: 27, military: 48,
  }, {
    year: 2006, tvNews: 12, church: 28, military: 41,
  }, {
    year: 2008, tvNews: 11, church: 26, military: 45,
  }, {
    year: 2010, tvNews: 10, church: 25, military: 44,
  }, {
    year: 2012, tvNews: 11, church: 25, military: 43,
  }, {
    year: 2014, tvNews: 10, church: 25, military: 39,
  }, {
    year: 2016, tvNews: 8, church: 20, military: 41,
  }, {
    year: 2018, tvNews: 10, church: 20, military: 43,
  },
];

const PREFIX = 'Demo';

const classes = {
  chart: `${PREFIX}-chart`,
};

const format = () => tick => tick;

const Root = props => (
  <Legend.Root {...props} sx={{ display: 'flex', margin: 'auto', flexDirection: 'row' }} />
);
const Label = props => (
  <Legend.Label sx={{ pt: 1, whiteSpace: 'nowrap' }} {...props} />
);
const Item = props => (
  <Legend.Item sx={{ flexDirection: 'column' }} {...props} />
);

const ValueLabel = (props) => {
  const { text } = props;
  return (
    <ValueAxis.Label
      {...props}
      text={`${text}%`}
    />
  );
};

const TitleText = props => (
  <Title.Text {...props} sx={{ whiteSpace: 'pre' }} />
);

const StyledChart = styled(Chart)(() => ({
  [`&.${classes.chart}`]: {
    paddingRight: '20px',
  },
}));

const AnalyticsChart = (props) => {


  return (
    <Paper>
      <StyledChart
        data={confidence}
        className={classes.chart}
      >
        <ArgumentAxis tickFormat={format} />
        <ValueAxis
          max={50}
          labelComponent={ValueLabel}
        />

        <LineSeries
          name="TV news"
          valueField="tvNews"
          argumentField="year"
        />
        <LineSeries
          name="Church"
          valueField="church"
          argumentField="year"
        />
        <LineSeries
          name="Military"
          valueField="military"
          argumentField="year"
        />
        {/* <Legend position="bottom" rootComponent={Root} itemComponent={Item} labelComponent={Label} /> */}
        <Title text={`chart`} textComponent={TitleText} />
        <Animation />
      </StyledChart>
    </Paper>
  );
}

export default AnalyticsChart;