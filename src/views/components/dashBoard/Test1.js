
import React, { Component,useState, useEffect,useMemo } from "react";
import {useTranslation} from "react-i18next";

const Test1 =  ({_systab,_sysrefresh})=> {
     const { t, i18n } = useTranslation();
    useEffect(() => {

       return(()=>{

       })
      }, [_systab]);

      useEffect(() => {
        if (_sysrefresh) {
            alert(_sysrefresh)
        }
    
       }, [_sysrefresh]);

    return (
        <>
       <p>{t("helpText")}</p>
      <input></input>
       </>
      
    );
  }
 
export default Test1 ;