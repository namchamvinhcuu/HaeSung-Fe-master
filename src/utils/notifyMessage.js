import { toast } from 'react-toastify';

 const AlertSuccess = (message)=>{
    toast.success(message, { position: "bottom-right", autoClose: 5000,});
}

const ErrorAlert = (message)=>{
    toast.error( message , {
        position: "bottom-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        });
}

export {
    AlertSuccess,
    ErrorAlert
}