import React, { Component, useState, useEffect, useMemo } from "react";
import { ContentBox } from "@components";

/// by mrhieu84 22-7-2022  ///

// function  isReactComponent(Component) {

//     const prototype = Component.prototype;
//   return !!(prototype && prototype.isReactComponent);
//   }

const TabPanel = ({ index, ...other }) => {
  const { children } = other;

  return (
    <>

      <div
        role="tabpanel"
        hidden={false}
        id={`tabpanel-${index}`}
      // aria-labelledby={`simple-tab-${index}`}

      >

        {children}

      </div>
    </>
  );
}

const TabPanelMemo = React.memo(
  ({ name, title, code, breadcrumb_array, ChildComponent, index, index_tab_active, refChild, setRefChild, ...other }) => {
    const myRef = React.useRef();

    useEffect(() => {
      // console.log(index + " created");

      setRefChild(myRef.current)
      //   var funcTabChange=  myRef.current?.componentTabChange;
      //   funcTabChange &&  funcTabChange(1,1,null,null);
      $(window).scrollTop(0);
      $(`#tabpanel-${index}`).attr("hidden", false);

      // return () => {



      //     funcTabChange &&  funcTabChange(null,null,null,1);

      // }
    }, [index]);

    return (

      <TabPanel index={index} {...other}>
        <ContentBox
          title={title}
          // title="{title}"
          code={code}
          breadcrumb={breadcrumb_array}
        >
          {/* {ChildComponent && (isReactComponent(ChildComponent) 
         ?  <ChildComponent ref={myRef} />
        :  <ChildComponent  />)} */}
          {ChildComponent && <ChildComponent ref={myRef} />}
        </ContentBox>

      </TabPanel>
    );
  },
  (preProps, nextProps) => {

    var isEq = preProps.index === nextProps.index;
    if (isEq) {
      if (nextProps.index_tab_active == nextProps.index) {
        // console.log("tab " + nextProps.index + " selected")

        $(window).scrollTop(0);
        $(`#tabpanel-${nextProps.index}`).attr("hidden", false);// anti flicking, hacked by mrhieu84
        if (nextProps.refChild) {
          var funcTabChange = nextProps.refChild?.componentTabChange;
          funcTabChange && funcTabChange(1, null);
        }

        // else {
        //        var funcTabChange=nextProps.ChildComponent.componentTabChange
        // console.log(funcTabChange)
        //         funcTabChange && funcTabChange(0);
        //     }

      } else if (preProps.index_tab_active == nextProps.index) {
        // console.log("tab " + nextProps.index + " deselected")

        $(`#tabpanel-${nextProps.index}`).attr("hidden", true);// anti flicking, hacked by mrhieu84
        if (nextProps.refChild) {
          var funcTabChange = nextProps.refChild?.componentTabChange;
          funcTabChange && funcTabChange(null, 1);
        }

      }
    }

    // console.log(`check areEqual ${preProps.index} === ${nextProps.index}`);

    return isEq;
  }
);

class TabListContent extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  render() {
    const { HistoryElementTabs, index_tab_active } = this.props;
    // console.log(HistoryElementTabs, 'tab')

    return (
      HistoryElementTabs.length ?
        HistoryElementTabs.map((ele, index) => {

          return <TabPanelMemo
            name={ele.name}
            code={ele.code}
            key={ele.code}
            title={ele.title}
            breadcrumb_array={ele.breadcrumb_array}
            ChildComponent={ele.ChildComponent}
            index={ele.index}
            setRefChild={r => ele.ref = r}
            refChild={ele.ref}
            index_tab_active={index_tab_active}
          />
        }
        ) : <ContentBox title={""} breadcrumb={[]}></ContentBox>)
  }
}

export default TabListContent;
