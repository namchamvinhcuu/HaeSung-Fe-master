import { MuiDialog, MuiTextField, MuiButton, MuiSubmitButton } from '@controls';
import { Box, Button, Grid, Typography } from '@mui/material';
import React, { useEffect, useRef, useState } from 'react';
import { memo } from 'react';
import { actualService } from '@services';
import { ErrorAlert, SuccessAlert } from '@utils';
import { useIntl } from 'react-intl';
import moment from 'moment';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';

const PopupActualScanLots = memo(({ isShowing, hide, woIdProps, fetchDataParent, setDisabledBtnParent }) => {
  const intl = useIntl();
  const lotInputRef = useRef();
  const [listLot, setListLot] = useState([]);
  const handleLotInputChange = (e) => {
    lotInputRef.current.value = e.target.value;
  };

  let timer;

  const [inputRef, setInputRef] = useState(null);

  const scanBtnClick = async () => {
    scanLot();
    lotInputRef.current.value = '';
    lotInputRef.current.focus();
  };
  const scanLot = async () => {
    const lot = lotInputRef.current.value.trim();

    const res = await actualService.scanLots({ woId: woIdProps, lotId: lot });
    if (res) {
      if (res.HttpResponseCode === 200 && res.Data) {
        await fetchData();
        await fetchDataParent();
        SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }));
      } else {
        ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
      }
    } else {
      ErrorAlert(intl.formatMessage({ id: 'general.system_error' }));
    }
  };
  const keyPress = async (e) => {
    if (e.key === 'Enter') {
      await scanBtnClick();
    }
  };
  useEffect(() => {
    lotInputRef.current = inputRef;

    if (inputRef) {
      timer = setTimeout(() => lotInputRef.current.focus(), 500);
    }

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [inputRef]);

  const fetchData = async () => {
    const res = await actualService.getListLot({ woId: woIdProps });
    setListLot(res.Data);
  };

  useEffect(async () => {
    fetchData();
  }, [woIdProps]);

  const handleDelete = async (item) => {
    if (
      window.confirm(
        intl.formatMessage({
          id: 'general.confirm_redo_deleted',
        })
      )
    ) {
      try {
        let res = await actualService.handleDeleteLot({
          woId: woIdProps,
          Id: item?.Id,
        });
        if (res) {
          if (res && res.HttpResponseCode === 200) {
            await fetchData();
            await fetchDataParent();
            setDisabledBtnParent(true);
            SuccessAlert(intl.formatMessage({ id: res.ResponseMessage }));
          } else {
            ErrorAlert(intl.formatMessage({ id: res.ResponseMessage }));
          }
        } else {
          ErrorAlert(intl.formatMessage({ id: 'general.system_error' }));
        }
      } catch (error) {
        console.log(error);
      }
    }
  };
  return (
    <MuiDialog maxWidth="md" title="Scan Lots" isOpen={isShowing} disable_animate={300} onClose={() => hide()}>
      <Box className="d-flex align-items-center my-3">
        <MuiTextField
          ref={(ele) => {
            setInputRef(ele);
          }}
          label="Lot"
          onChange={handleLotInputChange}
          onKeyDown={keyPress}
        />
        <MuiButton text="scan" color="success" onClick={scanBtnClick} sx={{ whiteSpace: 'nowrap' }} />
      </Box>
      <Grid item xs={12}>
        {listLot?.length > 0 && (
          <table className="table table-striped">
            <thead>
              <tr>
                <th scope="col">STT</th>
                <th scope="col">Material Code</th>
                <th scope="col">Lot Serial</th>
                <th scope="col">Qty</th>
                <th scope="col">QC Date</th>
                <th scope="col">QC Result</th>
                <th scope="col"></th>
              </tr>
            </thead>
            <tbody>
              {listLot?.map((item, index) => {
                return (
                  <tr key={`LISTLOT${index}`}>
                    <th scope="row">{index + 1}</th>
                    <td>{item?.MaterialCode}</td>
                    <td>{item?.LotSerial}</td>
                    <td>{item?.Qty}</td>
                    <td>{moment(item?.QCDate).add(7, 'hours').format('YYYY-MM-DD hh:mm:ss')}</td>
                    <td>
                      {item?.QCResult ? (
                        <span className="font-weight-bold" style={{ color: 'green' }}>
                          OK
                        </span>
                      ) : (
                        <span className="font-weight-bold" style={{ color: 'red' }}>
                          NG
                        </span>
                      )}
                    </td>
                    <td>
                      <IconButton aria-label="delete" color="error" size="small" onClick={() => handleDelete(item)}>
                        <DeleteIcon fontSize="inherit" />
                      </IconButton>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </Grid>
    </MuiDialog>
  );
});
export default PopupActualScanLots;
