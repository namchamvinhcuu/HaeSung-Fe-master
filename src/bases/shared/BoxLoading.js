import React from 'react';
import PropTypes from 'prop-types';

import Box from '@mui/material/Box';
import Skeleton from '@mui/material/Skeleton';

//by mrhieu84
export default class BoxLoading extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            
          };
         
    }


  componentWillUnmount() {
   
  }

  renderSkeletons() {
    let arrSkeleton=[]
    for (var i=0 ;i<this.props.number;i++) {
        arrSkeleton.push(<Skeleton key={"ske_" + i} />)
    }

    return arrSkeleton;
  }
 
  render() {
    const {
      show,
      number
    } = this.props;

    return (
               
               <>
               {
                number &&  number <5 && show &&
                <Box sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      p: 1,
                      mt: 10,
                    
                    }}>

                        <Box sx={{width:500}}>
                        {this.renderSkeletons()}
              
                        </Box>
                </Box>

               
               }
               {
                !show && this.props.children
               }
                 
          </>
               
        
    );
  }
}

BoxLoading.propTypes = {

  number: PropTypes.number,
  show: PropTypes.bool
};

