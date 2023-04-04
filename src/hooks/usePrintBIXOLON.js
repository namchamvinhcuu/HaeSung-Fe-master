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

  const handlePrint = async ({ detail }) => {
    setLabelId(issueID.current);
    clearBuffer();
    directDrawText('SM0,0');
    directDrawText('STd');
    directDrawText('SF1');
    directDrawText('SA0');
    directDrawText('TA0');
    directDrawText('SL400,24,G');
    directDrawText('SOT');
    directDrawText('SW799');
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

  const PrintLabel = ({
    MATERIAL_NUMBER,
    DESCRIPTION_LOC,
    TOTAL_QTY,
    BP_NM,
    ORIGIN_CODE,
    PLANT_CODE,
    SL_CD,
    ITEM_ACCT,
    LOT_CD,
    createdDate,
    MFG_DT,
  }) => {
    const len = DESCRIPTION_LOC.length;
    const halfLen = Math.floor(len / 2);
    const arrPartName = [DESCRIPTION_LOC.substr(0, halfLen), DESCRIPTION_LOC.substr(halfLen)];

    directDrawText(`V19,38,U,23,23,0,N,N,N,0,L,0,'Part No'`);
    directDrawText(`B1161,25,1,2,6,46,0,0,'${MATERIAL_NUMBER}'`);
    directDrawText(`V173,4,U,23,23,0,N,N,N,0,L,0,'${MATERIAL_NUMBER}'`);
    directDrawText(`V19,89,U,23,23,0,N,N,N,0,L,0,'Part name'`);
    directDrawText(`V161,80,U,23,23,0,N,N,N,0,L,0,'${arrPartName[0]}'`);
    directDrawText(`V161,103,U,23,23,0,N,N,N,0,L,0,'${arrPartName[1]}'`);
    directDrawText(`V19,137,U,23,23,0,N,N,N,0,L,0,'Qty'`);
    directDrawText(`V161,140,U,23,23,0,N,N,N,0,L,0,'${TOTAL_QTY}'`);
    directDrawText(`V19,180,U,23,23,0,N,N,N,0,L,0,'Lot Code'`);
    directDrawText(`V161,180,U,23,23,0,N,N,N,0,L,0,'${LOT_CD}'`);
    directDrawText(`V73,220,U,23,23,0,N,N,N,0,C,0,'Receiving'`);
    directDrawText(`V73,243,U,23,23,0,N,N,N,0,C,0,' Date'`);
    directDrawText(`V161,230,U,23,23,0,N,N,N,0,L,0,'${createdDate}'`);
    directDrawText(`V19,279,U,23,23,0,N,N,N,0,L,0,'VENDOR'`);
    directDrawText(`V161,279,U,23,23,0,N,N,N,0,L,0,'${BP_NM}'`);
    directDrawText(`V19,319,U,23,23,0,N,N,N,0,L,0,'MFG Date'`);
    directDrawText(`V161,319,U,23,23,0,N,N,N,0,L,0,'${MFG_DT}'`);
    directDrawText(`V19,359,U,23,23,0,N,N,N,0,L,0,'Original'`);
    directDrawText(`V161,357,U,23,23,0,N,N,N,0,L,0,'${ORIGIN_CODE}'`);
    directDrawText(`B2622,230,Q,2,M,5,0,'${LOT_CD}'`);
    directDrawText(`V588,23,U,23,23,0,N,N,N,0,L,0,'Solumn Vina'`);
    directDrawText(`V569,57,U,23,23,0,N,N,N,0,L,0,'PLAN'`);
    directDrawText(`V694,59,U,23,23,0,N,N,N,0,L,0,'${PLANT_CODE}'`);
    directDrawText(`V569,97,U,23,23,0,N,N,N,0,L,0,'Location'`);
    directDrawText(`V694,97,U,23,23,0,N,N,N,0,L,0,'${SL_CD}'`);
    directDrawText(`V634,140,U,23,23,0,N,N,N,0,L,0,'${ITEM_ACCT}'`);
  };

  useEffect(() => {
    window.addEventListener('printBIXILON', handlePrint);

    return () => {
      window.removeEventListener('printBIXILON', handlePrint);
    };
  }, []);

  return null;
};
export default usePrintBIXOLON;
