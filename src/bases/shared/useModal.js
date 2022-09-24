import { useState } from 'react';

 const useModal = () => {
    const [isShowing, setIsShowing] = useState(false);
  
    function toggle() {
      setIsShowing(!isShowing);
    }
  
    return {
      isShowing,
      toggle,
    }
  };

  const useModal2 = () => {
    const [isShowing2, setIsShowing2] = useState(false);
  
    function toggle2() {
      setIsShowing2(!isShowing2);
    }
  
    return {
      isShowing2,
      toggle2,
    }
  };

  const useModal3 = () => {
    const [isShowing3, setIsShowing3] = useState(false);
  
    function toggle3() {
      setIsShowing3(!isShowing3);
    }
  
    return {
      isShowing3,
      toggle3,
    }
  };



  export {

    useModal,useModal2,useModal3
    
  } 