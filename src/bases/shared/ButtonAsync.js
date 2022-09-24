import React from 'react';
import PropTypes from 'prop-types';
import LoadingButton from '@mui/lab/LoadingButton';
import SaveIcon from '@mui/icons-material/Save';
import SendIcon from '@mui/icons-material/Send';
import SearchIcon from '@mui/icons-material/Search';
import UploadIcon from '@mui/icons-material/Upload';
import DownloadIcon from '@mui/icons-material/Download';
import ClearIcon from '@mui/icons-material/Clear';
import PrintIcon from '@mui/icons-material/Print';
import CenterFocusWeakIcon from '@mui/icons-material/CenterFocusWeak';
import AddCircleIcon from '@mui/icons-material/AddCircle';

//by mrhieu84
export default class ButtonAsync extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            asyncState: null,
          };
         

        
         // this.newProps=newProps;
    }
 componentWillUnmount() {
    this.isUnmounted = true;
  }

  resetState=()=> {
    this.setState({
      asyncState: null,
    });
  }

  handleClick =(args)=> {
    const clickHandler = this.props.onClick;
    
    if (typeof clickHandler === 'function') {
      this.setState({
        asyncState: 'pending',
      });

      const returnFn = clickHandler.apply(null, args);
      if (returnFn && typeof returnFn.then === 'function') {
        returnFn
          .then(() => {
            if (this.isUnmounted) {
              return;
            }
            this.props.onCompleteStateChange && this.props.onCompleteStateChange('resolved');
            this.setState({
              asyncState: 'resolved',
            });
          })
          .catch(error => {
            if (this.isUnmounted) {
              return;
            }
            this.props.onCompleteStateChange && this.props.onCompleteStateChange('rejected');
            this.setState({
              asyncState: 'rejected',
            })

          });
      } else {
        this.props.onCompleteStateChange && this.props.onCompleteStateChange(null);
        this.resetState();
      }
    }
  }

  renderIcon(icon) {
    switch(icon) {
      case 'save':
        return <SaveIcon />;
        case 'search':
        return <SearchIcon />
        case 'send':
            return <SendIcon />
        case 'upload':
            return <UploadIcon />
        case 'download':
          return  <DownloadIcon />
          case 'print':
         return   <PrintIcon />
      case 'clear':
        return <ClearIcon />
        case 'centerfocus':
          return <CenterFocusWeakIcon />
          case 'add':
          return <AddCircleIcon />
        
      default:
        return '';
    }
  }

  // componentDidUpdate(prevState) {
  //   const { asyncState } = this.state;
  //   if (prevState.asyncState !== asyncState && asyncState !== null && asyncState !== 'pending') {
  //     //nếu đang pending sau đó chuyển qua resolve hoă6c rejected
  //      this.props.onCompleteStateChange && this.props.onCompleteStateChange(asyncState);
     
  //   }
  // }

  
  render() {
    const {
      icon,
      text,
      onCompleteStateChange,
      ...newProps
    } = this.props;

    const { asyncState } = this.state;
    const isPending = asyncState === 'pending';
    const isResolved = asyncState === 'resolved';
    const isRejected = asyncState === 'rejected';
    
    return (
               
                icon ? <LoadingButton
                loading={isPending}
                startIcon={ this.renderIcon(icon) }
           
                loadingPosition="start"
                variant="contained"
                color={icon=="clear"?'error':'primary'}
                {...newProps}
                onClick={this.handleClick}
                >
                {text}
                </LoadingButton>
                : <LoadingButton
                loading={isPending}
              
                variant="contained"
                {...newProps}
                onClick={this.handleClick}
                >
                {text}
                </LoadingButton>
    );
  }
}

ButtonAsync.propTypes = {
  text: PropTypes.string,
  onClick: PropTypes.func,
};

