import moment from 'moment';
import React from 'react';
import QRCode from 'react-qr-code';

const FGPackingLotPrint = ({ listData }) => {
  const style = {
    styleBorderAndCenter: {
      borderRight: '1px solid black',
      textAlign: 'center',
      fontSize: '18px',
    },
    borderBot: {
      borderBottom: '1px solid black',
      // padding: '10px',
    },
  };

  return (
    <React.Fragment>
      {listData?.map((item, index) => {
        return (
          item != null && (
            <div
              style={{ border: '1px solid black', marginBottom: '30px', pageBreakAfter: 'always', width: '100%' }}
              key={`IQCQRCODE_${index}`}
            >

              <table style={{ borderCollapse: 'collapse', textAlign: 'center', width: '100%' }}>
                <tbody>
                  <tr>
                    <td style={{ ...style.styleBorderAndCenter, ...style.borderBot }}>
                      {`W${moment(item?.QCDate).week()} / T${moment(item?.QCDate).format('MM')}`}
                    </td>
                    <td
                      colSpan={2}
                      style={{ ...style.styleBorderAndCenter, ...style.borderBot, padding: '1px !important' }}
                    >
                      <b style={{ fontSize: '15px' }}>{item?.MaterialCode}</b>
                    </td>
                    <td rowSpan={2} style={{ ...style.borderBot, textAlign: 'center' }}>
                      <QRCode value={`${item?.MaterialCode}`} size={60} />
                    </td>
                  </tr>
                  <tr>
                    <td style={{ ...style.styleBorderAndCenter, ...style.borderBot, whiteSpace: 'nowrap' }}>
                      {moment(item?.createdDate).add(7, 'hours').format('YYYY-MM-DD')}
                      <span style={{ display: 'block' }}>
                        {moment(item?.createdDate).add(7, 'hours').format('HH:mm:ss')}
                      </span>
                    </td>
                    <td colSpan={2} style={{ ...style.styleBorderAndCenter, fontSize: '12px', ...style.borderBot }}>
                      {item?.MaterialDescription}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ ...style.styleBorderAndCenter, ...style.borderBot, width: '25%' }}>QTY</td>
                    <td
                      style={{
                        ...style.styleBorderAndCenter,
                        ...style.borderBot,
                        width: '25%',
                        padding: '0px 3px !important',
                      }}
                    >
                      <b style={{ fontSize: '15px' }}>{`${item?.Qty} ${item?.UnitName}`} </b>
                    </td>
                    <td style={{ ...style.styleBorderAndCenter, ...style.borderBot, width: '25%' }}>VENDOR</td>
                    <td style={{ ...style.borderBot, textAlign: 'center', padding: '1px !important', width: '25%' }}>
                      HANLIM
                    </td>
                  </tr>
                  <tr>
                    <td style={{ ...style.styleBorderAndCenter, ...style.borderBot }}>Packing #</td>
                    <td colSpan={2} style={{ ...style.styleBorderAndCenter, ...style.borderBot }}>
                      {item?.PackingLabelId}
                    </td>
                    <td style={{ ...style.borderBot, textAlign: 'center' }}>OK</td>
                  </tr>
                  <tr>
                    <td style={{ ...style.styleBorderAndCenter, textAlign: 'center' }}>
                      <QRCode value={`${item?.PackingLabelId}`} size={60} />
                    </td>
                    <td colSpan={2} style={{ ...style.styleBorderAndCenter, textAlign: 'center' }}>
                      <b style={{ fontSize: '15px' }}>{item?.PackingSerial}</b>
                    </td>
                    <td style={{ ...style.styleBorderAndCenter, display: 'flex', alignItems: 'end', border: 'none' }}>
                      <b style={{ fontSize: '15px' }}>Name</b>
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
