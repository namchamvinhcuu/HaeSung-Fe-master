// import React from 'react';
// import Dialog from '@material-ui/core/Dialog';
// import DialogActions from '@material-ui/core/DialogActions';
// import DialogContent from '@material-ui/core/DialogContent';
// import DialogContentText from '@material-ui/core/DialogContentText';
// import DialogTitle from '@material-ui/core/DialogTitle';
// import Paper from '@material-ui/core/Paper';
// import Draggable from 'react-draggable';
// import { makeStyles } from "@material-ui/core/styles";
// import ButtonAsync from './ButtonAsync'
// import CloseIcon from '@mui/icons-material/Close';

// import ShortUniqueId from "short-unique-id";
// import Zoom from '@mui/material/Zoom';
// import Fade from '@mui/material/Fade';
// import Grow from '@mui/material/Grow';
// import Slide from '@mui/material/Slide';
// import Button from '@mui/material/Button';

//  import IconButton from '@mui/material/IconButton';
// // const Transition = React.forwardRef(function Transition(props, ref) {
// //   return <Slide direction="up" ref={ref} {...props} />;
// // });

// const Transition_Zoom = React.forwardRef(function Transition(props, ref) {
//   return <Zoom   ref={ref} {...props} />;
// });

// const Transition_Fade = React.forwardRef(function Transition(props, ref) {
//   return <Fade   ref={ref} {...props} />;
// });

// const Transition_Grow = React.forwardRef(function Transition(props, ref) {
//   return <Grow   ref={ref} {...props} />;
// });
// const Transition_Slide_Down = React.forwardRef(function Transition(props, ref) {
//   return <Slide   ref={ref} {...props} />;
// });

// const uid = new ShortUniqueId();


// const useStyles = makeStyles(theme => ({
//   paper: {
//     overflowY: 'unset',
//   },
  
// }));

// export default function DraggableDialog({animate,isShowing,hide,onSave,onClear,title,disable_animate,...others}) {
//   const classes = useStyles();

//   const [id_dialog, _] = React.useState(uid());
//   const [_info,setInfo ] = React.useState({});


//   React.useEffect(() => {
    
//     return (()=>{

//       setInfo({})
      
//     })


//   },[isShowing]);

//   const PaperComponent =  React.useCallback((props) => {
//     return (
//       <Draggable  handle={"#draggable-dialog" + id_dialog } cancel={'[class*="MuiDialogContent-root"]'}>
//         <Paper {...props} />
//       </Draggable>
//     );

//   }, []);

//   const handleClose = () => {

//     hide();
//   };

//   return (
    
//   <Dialog
//           TransitionComponent={animate=="fade"? Transition_Fade:animate=="grow"?Transition_Grow:animate=="slide_down"?Transition_Slide_Down:Transition_Zoom }
//           transitionDuration={disable_animate || _info[id_dialog]?.disable_animate===true ?0:250}
//         open={isShowing}
//       //  onClose={handleClose}
//         PaperComponent={PaperComponent}
//         classes={{paper: classes.paper}}
//         {...others}
//       >
      
     
//  <DialogTitle style={{ marginTop:'-6px', height:'55px', cursor: 'move' }} id={"draggable-dialog" + id_dialog}>
//             {title}
//             <IconButton sx={{
//                top: '-12px',
//                right: '-12px',
//                 color: 'cornflowerblue',
//                 borderRadius:'50%',
//               position: 'absolute',
//              backgroundColor: 'white',
//              width: '35px',
//              height: '35px',
//              '&:hover': {
//               backgroundColor: 'aliceblue',
//             },
//             '&:disabled': {
//               backgroundColor: 'aliceblue',
//             },
//           }} disabled={_info[id_dialog]?.loading}   onClick={handleClose} color="primary" >
//             <CloseIcon />
//           </IconButton>
//         </DialogTitle>
      

//         <DialogContent >
//          {others.children }
//         </DialogContent>
//         <DialogActions>
        
        

//         {onSave &&  <ButtonAsync 

//         onCompleteStateChange={state=> {
        
//           setInfo({[id_dialog]:{loading:false}})
//         }}

//         onClick={(e) =>  {
//             setInfo({[id_dialog]:{disable_animate:true, loading:true}})
//             return  onSave(e);

//         }} icon="save" text="Save" />}

//         {onClear &&  <ButtonAsync 

//         onCompleteStateChange={state=> {

//           setInfo({[id_dialog]:{loading:false}})
//         }}

//         onClick={(e) =>  {
//             setInfo({[id_dialog]:{disable_animate:true, loading:true}})
//             return  onClear(e);

//         }} icon="clear" text="Clear" />}

//           <Button disabled={_info[id_dialog]?.loading}  variant="outlined" color="primary" onClick={handleClose} >Cancel</Button>
//         </DialogActions>
    
        
//       </Dialog>  
   
  
   
//   );
// }

