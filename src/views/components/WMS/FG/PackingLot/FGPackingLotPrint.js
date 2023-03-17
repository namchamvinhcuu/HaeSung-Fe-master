import moment from 'moment';
import React from 'react';
import QRCode from 'react-qr-code';

const FGPackingLotPrint = ({ listData }) => {
  const style = {
    styleBorderAndCenter: {
      borderRight: '1px solid black',
      textAlign: 'center',
      fontSize: '22px',
    },
    borderBot: {
      borderBottom: '1px solid black',
      padding: '10px',
    },
  };

  return (
    <React.Fragment>
      {listData?.map((dataPrint, index) => {
        return (
          dataPrint != null && (
            <div
              style={{ border: '1px solid black', marginBottom: '30px', pageBreakAfter: 'always', width: '100%' }}
              key={`IQCQRCODE_${index}`}
            >
              <table style={{ borderCollapse: 'collapse', textAlign: 'center', width: '100%' }}>
                <tbody>
                  <tr>
                    <td style={{ ...style.styleBorderAndCenter, ...style.borderBot }}>CODE</td>
                    <td
                      colSpan={2}
                      style={{ ...style.styleBorderAndCenter, ...style.borderBot, padding: '0px 3px !important' }}
                    >
                      <b style={{ fontSize: '22px' }}>{dataPrint?.MaterialCode}</b>
                    </td>
                    <td rowSpan={2} style={{ ...style.borderBot, extAlign: 'center' }}>
                      <QRCode value={`${dataPrint?.PackingLabelId}`} size={80} />
                    </td>
                  </tr>

                  <tr>
                    <td colSpan={3} style={{ ...style.styleBorderAndCenter, fontSize: '18px', ...style.borderBot }}>
                      {dataPrint?.MaterialDescription}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ ...style.styleBorderAndCenter, ...style.borderBot }}>QTY</td>
                    <td style={{ ...style.styleBorderAndCenter, ...style.borderBot, padding: '0px 3px !important' }}>
                      <b style={{ fontSize: '22px' }}>{dataPrint?.Qty + ' ' + dataPrint?.UnitName} </b>
                    </td>
                    <td style={{ ...style.styleBorderAndCenter, ...style.borderBot }}>VENDOR</td>
                    <td style={{ ...style.borderBot, textAlign: 'center', padding: '5px !important' }}>HANLIM</td>
                  </tr>
                  <tr>
                    <td style={{ ...style.styleBorderAndCenter, ...style.borderBot }}>Packing #</td>
                    <td colSpan={2} style={{ ...style.styleBorderAndCenter, ...style.borderBot }}>
                      {dataPrint?.PackingLabelId}
                    </td>
                    <td style={{ ...style.borderBot, textAlign: 'center' }}>{dataPrint?.QCResult ? 'OK' : 'NG'}</td>
                  </tr>
                  <tr>
                    <td style={{ ...style.styleBorderAndCenter, ...style.borderBot, padding: 5, whiteSpace: 'nowrap' }}>
                      <p style={{ margin: 0 }}>{moment(dataPrint?.PackingDate).add(7, 'hours').format('YYYY-MM-DD')}</p>
                      {moment(dataPrint?.PackingDate).add(7, 'hours').format('HH:mm:ss')}
                    </td>
                    <td colSpan={3} style={{ ...style.borderBot, textAlign: 'center' }}>
                      <b style={{ fontSize: '22px' }}>{dataPrint?.PackingSerial}</b>
                    </td>
                  </tr>
                  <tr>
                    <td style={{ ...style.styleBorderAndCenter, padding: '10px' }}>
                      {`W${moment(dataPrint?.QCDate).week()} / T${moment(dataPrint?.QCDate).format('MM')}`}
                    </td>
                    <td colSpan={3} style={{ textAlign: 'center' }}>
                      <b style={{ fontSize: '22px' }}>{dataPrint?.SamsungLabelCode}</b>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          )
        );
      })}
    </React.Fragment>
  );
};

export default FGPackingLotPrint;
