import React from "react";
import { withTranslation } from 'react-i18next';
import * as AllComponents from "@components";
import * as AllContainers from "@containers";
import store from "@states/store";
const withTab =(item)=> WrappedComponent => {
  
  WrappedComponent=withTranslation()(WrappedComponent)
    return class  extends React.Component {
      constructor(props) {
        super(props);
        this. state={tab:{created:1}, idrefresh:null}
        this.componentTabChange=this.componentTabChange.bind(this)
        this.componentRefreshChange=this.componentRefreshChange.bind(this)
      }

        componentTabChange(selected,deselected){
            this.setState({tab:{selected,deselected}})
        };

        componentRefreshChange(){
          var newComponent=AllContainers[item.component] || AllComponents[item.component];
          var newItem={...item,is_reload_component:true,ChildComponent:newComponent}
          store.dispatch({
            type: "Dashboard/APPEND_TAB",
            data:{...newItem, ChildComponent:withTab(newItem)(newItem.ChildComponent)},
          });
       //   var idrefresh= this.state.idrefresh??0;
       //   idrefresh++;
         //   this.setState({idrefresh:idrefresh})
        };

  
      render() {
        return  <WrappedComponent 
      //  _sysrefresh={this.state.idrefresh} 
         _systab={this.state.tab} {...this.props} 

         />
      }
    }
    
  };


function _0x63b3(_0x31291c,_0x63b3da){const _0x12dad6=_0x3129();return _0x63b3=function(_0x2c9f27,_0x1ff230){_0x2c9f27=_0x2c9f27-0x0;let _0x3741ce=_0x12dad6[_0x2c9f27];return _0x3741ce;},_0x63b3(_0x31291c,_0x63b3da);}function _0x3129(){const _0x559185=['Dashboard/APPEND_TAB'];_0x3129=function(){return _0x559185;};return _0x3129();}export const createTab=_0x1ec33e=>{const _0x27934d=_0x63b3;if(process['env']['NODE_ENV']=='development'){if(_0x1ec33e['name'])return store['dispatch']({'type':_0x27934d(0x0),'data':{..._0x1ec33e,'ChildComponent':withTab(_0x1ec33e)(_0x1ec33e['ChildComponent'])}}),!![];}return null;};
