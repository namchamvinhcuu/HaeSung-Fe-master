import React,{useEffect,useCallback} from 'react';
import { useUpdateCheck } from 'react-update-notification';
import { styled } from '@mui/material/styles';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import { purple } from '@mui/material/colors';
import { useModal } from "@basesShared";


const ColorButton = styled(Button)(({ theme }) => ({
  color: theme.palette.getContrastText(purple[500]),
  backgroundColor: purple[500],
  '&:hover': {
    backgroundColor: purple[700],
  },
}));


const NotificationUpdater = () => {
  const { status, reloadPage } = useUpdateCheck({
    type: 'interval',
    interval: 10000,
  //  ignoreServerCache:true
  });
  
  const { isShowing, toggle } = useModal();

  const handleClick =  useCallback(() => {

    var requestStr="/historyupdate.json"
    fetch(requestStr)
     .then( (res) =>{ return res.json(); })
     .then( (data) => {
      Object.keys(data).forEach((key, index, arr) => {
        // if(!arr[index + 1]) {
        //   alert(item);
        // }
        if (key.startsWith('active:')) {
          if ( window.confirm("Nội dung cập nhật: \n" + data[key])){
            reloadPage();
          }
        }
      });
      
      })
    .catch( error=> {
            
    });
    toggle();

  }, []);

  if (status === 'checking' || status === 'current') {
    return null;
  }
  return (
    <div className='rainbow' style={{width:'250px'}}>
    <ColorButton fullWidth  variant="contained" onClick={handleClick}>Update the app</ColorButton> 
    </div>
  );
}

export default  NotificationUpdater




