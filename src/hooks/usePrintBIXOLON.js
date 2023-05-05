import React from 'react';
import { useState, useEffect } from 'react';
import { requestPrint } from '@static/js/bxlcommon.js';
import { useRef } from 'react';
import { SuccessAlert, ErrorAlert } from '@utils';
//{ partNo, partName, lotCode, receivingDate, vendor, mfgDate, original }
const usePrintBIXOLON = () => {
  const issueID = useRef(0);
  const label_data = useRef({ id: 0, functions: {} });
  const label_func = useRef({});
  const incLabelNum = useRef(0);

  const setLabelId = (setId) => {
    label_data.current.id = setId;
  };

  const clearBuffer = () => {
    const _a = { clearBuffer: [] };
    label_func.current['func' + incLabelNum.current] = _a;
    incLabelNum.current++;
  };

  const directDrawText = (text) => {
    const _a = { directDrawText: [text] };
    label_func.current['func' + incLabelNum.current] = _a;
    incLabelNum.current++;
  };

  const printBuffer = () => {
    const _a = { printBuffer: [] };
    label_func.current['func' + incLabelNum.current] = _a;
    incLabelNum.current++;
  };

  const getLabelData = () => {
    label_data.current.functions = label_func.current;
    label_func.current = {};
    incLabelNum.current = 0;

    return JSON.stringify(label_data.current);
  };

  const handlePrint = async (detail) => {
    setLabelId(issueID.current);
    clearBuffer();
    directDrawText('SM0,0');
    directDrawText('STd');
    directDrawText('SF1');
    directDrawText('SA0');
    directDrawText('TA0');
    directDrawText('SL64,24,G');
    directDrawText('SOT');
    directDrawText('SW400');
    directDrawText('CUTn');
    for (let i = 0; i < detail.length; i++) {
      PrintLabel(detail[i]);
      if (i < detail.length - 1) {
        directDrawText('P1,1');
      }
    }
    directDrawText('TE');
    printBuffer();
    const strSubmit = getLabelData();

    issueID.current++;

    requestPrint('Printer1', strSubmit, (result) => {
      let success = result.split(':')[1];
      if (success == 'success') SuccessAlert('Success');
      if (result == 'No printers' || result == 'Cannot connect to server') ErrorAlert(result);
    });
  };

  const PrintLabel = ({ MaterialCode }) => {
    directDrawText(`B182,4,1,1,3,35,0,0,'>A${MaterialCode}'`);
    directDrawText(`V68,40,U,23,23,0,N,N,N,0,L,0,'${MaterialCode}'`);
  };

  return { printBIXILON: handlePrint };
};
export default usePrintBIXOLON;
