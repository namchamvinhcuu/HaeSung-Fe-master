import React from 'react';
import QRCode from 'react-qr-code';

const WMSLayoutPrintBin = ({ item }) => {
  const style = {
    table: {
      width: '100%',
      marginTop: '5px',
      marginTop: '5px',
      textAlign: 'center',
      fontSize: '20px',
      // pageBreakAfter: 'always',
      border: 'black solid 2px',
    },
    cell: {
      padding: '5px 10px',
      textAlign: 'left',
    },
  };

  console.log(item);
  return (
    <React.Fragment>
      <div
        style={{ border: '1px solid black', marginBottom: '30px', pageBreakAfter: 'always', width: '100%' }}
        className="print-hidden"
      >
        <table style={style.table}>
          <tbody>
            <tr>
              <td style={style.cell} rowSpan="3">
                <QRCode value={`${item.BinCode}`} size={100} />
              </td>
              <td style={{ ...style.cell }}>Bin code: {item.BinCode}</td>
            </tr>
            <tr>
              <td style={{ ...style.cell }}>Level: {item.BinLevel}</td>
            </tr>
            <tr>
              <td style={{ ...style.cell }}>Index: {item.BinIndex}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </React.Fragment>
  );
};

export default WMSLayoutPrintBin;
