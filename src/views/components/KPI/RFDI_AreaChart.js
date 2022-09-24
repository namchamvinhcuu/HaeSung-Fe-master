import React, { Component } from 'react'  
import Chart from 'chart.js/auto';
import ChartDataLabels from 'chartjs-plugin-datalabels';
import {  api_get,api_post,  AlertSuccess } from '@utils';

class RFDI_AreaChart extends Component {  
    constructor(props) {  
            super(props);  
            this.state = {  };  
            this.chartRef = React.createRef();  

            this.listcolor=['rgba(245, 40, 145, 0.2)', 'rgba(33, 145, 81, 0.4)', 'rgba(7, 15, 171, 0.4)','rgba(61,53,127,0.44)','rgba(20,67,188,0.44)','rgba(10,246,188,0.44)','rgba(237,171,38,0.44)','rgba(96,94,38,0.44)']
    }  

    componentDidMount() {  

      const{ x_title}=this.props;
      if (this.barChart) this.barChart.destroy();
      api_get("RFDIDashboardApi/Get-data-area-chart").then(res=>{
          

              console.log(res)
            const ctx = this.chartRef.current.getContext("2d");
            let arrLabels=[]
          
          
           // var data={
            //     fill: true,
            //     borderColor: '#2196f3',
            //     backgroundColor: 'lightgrey', 
            //     borderWidth: 1
            // }
            let dict={};
            res.forEach(item => {
               
                var arr= item.info.split('|')
              
                arr.forEach(item2=> {
                        var arr2=item2.split(':')
                        if (dict[arr2[0]] === undefined) {
                            dict[arr2[0]]={[item.date_Created_Str]: arr2[2] }
                        } else {
                            dict[arr2[0]][item.date_Created_Str] =arr2[2];
                        }
                });

                arrLabels.push(item.date_Created_Str);
            });

            // dict['Road 1']['2022-09-10']=34;
            // dict['Road 1']['2022-09-12']=166;

            let arrDataChart=[]
            let _index=0;
            for (const [key, value] of Object.entries(dict)) {
               let arrData=[]
               arrLabels.forEach(datestr => {
                arrData.push(value[datestr]??0);
            });
            arrDataChart.push({
                label: key, 
                data:arrData, 
                fill: true,
                borderColor: '#2196f3', 
                backgroundColor: this.listcolor[_index], 
                borderWidth: 1 
              });

              _index++;

           }

        
            new Chart(ctx, {
                type: 'line',
                data: {
                    labels: arrLabels,
                    datasets: arrDataChart
                },
                options: {
                  responsive: true, // Instruct chart js to respond nicely.
                  maintainAspectRatio: false, // Add to prevent default behaviour of full-width/height 
                }
            });




     });
    
    }  
  

    
    render() {  
            return (  
                <div style={{height:'350px'}}>
                <canvas
           
                    ref={this.chartRef}
                />
                </div>    
            )  
    }  
}  


export default RFDI_AreaChart