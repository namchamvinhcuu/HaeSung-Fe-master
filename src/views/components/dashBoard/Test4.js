
import React, { Component } from 'react';
class Test4 extends Component {
    constructor(props){
        super(props);
        this.state={tab:{selected:null,deselected:null},idrefresh:null}
    }
    componentDidMount(){
       
    }
    componentDidUpdate(prevProps){
        

        if (  this.state.tab.deselected != prevProps._systab.deselected ) {
            if (this.state.tab.deselected) {
                //alert("deselected")
            }
        }

        if ( this.state.tab.selected != prevProps._systab.selected ) {
            if (this.state.tab.selected) {
                //alert("selected")
            }
        }

    }

    static getDerivedStateFromProps(nextProps, prevState) {
       // if (nextProps.hasOwnProperty('_systab'))
            if (nextProps?._systab.selected != prevState.tab.selected || nextProps?._systab.deselected != prevState.tab.deselected ) {
                    return {tab:nextProps._systab};
            }

            if (nextProps?._sysrefresh != prevState.idrefresh) {
             //   alert("refresh")
                return {idrefresh:nextProps.idrefresh};
            }
            return null;
      }
     
    xxx(){
        alert($('#test4').val())
    }
    render() { 
       
        return (   <button onClick={this.xxx}>{this.state.tab.selected==1?'jj':'mm'}</button>
);
    }
}
 
export default Test4 ;