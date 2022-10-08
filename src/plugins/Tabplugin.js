import React from "react";
import { withTranslation } from 'react-i18next';
import * as AllComponents from "@components";
import * as AllContainers from "@containers";
import store from "@states/store";
const withTab = (item) => WrappedComponent => {

  WrappedComponent = withTranslation()(WrappedComponent)
  return class extends React.Component {
    constructor(props) {
      super(props);
      this.state = { tab: { created: 0 }, idrefresh: null }
      this.componentTabChange = this.componentTabChange.bind(this)
      this.componentRefreshChange = this.componentRefreshChange.bind(this)
    }

    componentTabChange(selected, deselected) {
      this.setState({ tab: { selected, deselected } })
    };

    componentRefreshChange() {
      var newComponent = AllContainers[item.component] || AllComponents[item.component];
      var newItem = { ...item, is_reload_component: true, ChildComponent: newComponent }
      store.dispatch({
        type: "Dashboard/APPEND_TAB",
        data: { ...newItem, ChildComponent: withTab(newItem)(newItem.ChildComponent) },
      });
      //   var idrefresh= this.state.idrefresh??0;
      //   idrefresh++;
      //   this.setState({idrefresh:idrefresh})
    };


    render() {
      return <WrappedComponent
        //  _sysrefresh={this.state.idrefresh} 
        _systab={this.state.tab} {...this.props}

      />
    }
  }

};

export const createTab = t => t.name ? (store.dispatch({ type: "Dashboard/APPEND_TAB", data: { ...t, ChildComponent: withTab(t)(t.ChildComponent) } }), !0) : null;