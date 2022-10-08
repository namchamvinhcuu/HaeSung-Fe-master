import React, { useState, useEffect, useMemo, useLayoutEffect } from "react";
import { BrowserRouter as Router, Route, Switch, Link } from "react-router-dom";
import * as ConfigConstants from "@constants/ConfigConstants";
import * as AllComponents from "@components";
import * as AllContainers from "@containers";
import store from "@states/store";
import { createTab } from '@plugins/Tabplugin'
import { ContentBox } from "@components";
import { FormattedMessage, useIntl } from 'react-intl'

// const listToTree = (list, tree, parentId) => {
//   list.forEach((item) => {
//     // Determine if it is the parent menu
//     if (item.pid == parentId) {
//       const child = {
//         ...item,
//         key: item.key || item.name,
//         children: [],
//       };
//       //Iterate the list to find all submenus that match the current menu
//       listToTree(list, child.children, item.id);
//       // Delete properties with no children value
//       if (child.children.length <= 0) {
//         delete child.children;
//       }
//       // join the tree
//       tree.push(child);
//     }
//   });
// };

// const intl = useIntl()

function ComponentWrapper(name, code, component, router, title, InputComponent, breadcrumb_array) {

  return class extends React.Component {

    constructor(props) {
      super(props);
      this.state = { tabRender: null }
    }

    UNSAFE_componentWillMount() {
      var res = createTab({
        is_reload_component: this.props.location.is_reload_component
        , component: component
        , title: title
        , name: String(name).toUpperCase()
        , code: code
        , router, breadcrumb_array
        , ChildComponent: InputComponent
      });
      this.setState({ tabRender: res })

    }

    render() {
      return (this.state.tabRender
        ? null
        : <ContentBox title={title} code={code} breadcrumb={breadcrumb_array}>
          {InputComponent && <InputComponent />}
        </ContentBox>)
    }
  };

  // return function (props) {

  //   const [tabRender, setTabRender] = useState(null);

  //   useLayoutEffect(() => {
  //     // componentWillMount events
  //     const res = createTab({ is_reload_component: props.location.is_reload_component, component: component, title: title, name: String(name).toUpperCase(), code: code, router, breadcrumb_array, ChildComponent: InputComponent });
  //     setTabRender(res)
  //   }, []);

  //   return (

  //     tabRender
  //       ? null
  //       : <ContentBox title={title} code={code} breadcrumb={breadcrumb_array}>
  //         {InputComponent && <InputComponent />}
  //       </ContentBox>

  //   );
  // }
}

const buildTreeMenu = (
  level,
  list,
  tree,
  parentId,
  breadcrumb_array,
  data,
  routers,
  Component_Show_Default
) => {

  let html_child = "";
  list.forEach((item) => {
    if (item.parentId === parentId) {
      const child = {
        ...item,
        key: item.menuId,

        children: [],
      };

      if (!parentId) {
        // console.log(item.name,item.visiable)
        // if (item.visiable === true) {
        //   breadcrumb_array = [item.menuName];

        // } else {

        //   breadcrumb_array = [];
        // }
        // breadcrumb_array = [item.menuName];
        breadcrumb_array = [<FormattedMessage id={item.languageKey} />]
      }
      else {

        // breadcrumb_array.push(item.menuName);
        breadcrumb_array.push(<FormattedMessage id={item.languageKey} />);
      }

      // breadcrumb_array.push(<FormattedMessage id={item.languageKey} />);

      //Iterate the list to find all submenus that match the current menu
      let res_html = buildTreeMenu(
        level + 1,
        list,
        child.children,
        item.menuId,
        breadcrumb_array,
        data,
        routers,
        Component_Show_Default
      );

      // Delete properties with no children value
      var hasSub = false;
      if (child.children.length <= 0) {
        delete child.children;

        if (item.menuComponent && item.navigateUrl) {
          routers.push(
            <Route
              key={item.menuId}
              path={item.navigateUrl}

              component={
                ComponentWrapper(
                  item.menuComponent,//name
                  item.menuComponent,//code
                  item.menuComponent,//component
                  item.navigateUrl,//router
                  item.menuComponent,//title
                  AllContainers[item.menuComponent] || AllComponents[item.menuComponent],//InputComponent
                  [...breadcrumb_array]
                )
              }
            />
          );

          // console.log('routers', routers)

          if (item.isShowDefault === true && !Component_Show_Default.cmp) {
            Component_Show_Default.cmp = ComponentWrapper(
              item.menuComponent,
              item.menuComponent,
              item.menuId,
              item.menuComponent,
              item.navigateUrl,
              item.menuComponent,
              AllContainers[item.menuComponent] || AllComponents[item.menuComponent],
              [...breadcrumb_array]
            );
          }

          breadcrumb_array.pop();

          // if (item.visiable === true) {
          html_child += `<li class="nav-item">
            <a href="#" router="${item.navigateUrl ?? ""}"  class="nav-link">
            <i class=" ${item.menuIcon} nav-icon"></i>
            <p>${item.menuName}</p> </a></li>
             `;
          // }
        }
      }
      else {
        if (child.visiable !== true) { breadcrumb_array.pop(); }

        hasSub = true;
        res_html =
          '<ul class="nav nav-treeview sub-lever1">' + res_html + "</ul>";
      }
      // join the tree fa-tachometer-alt
      // console.log('child', child)
      tree.push(child);
      // if (item.visiable === true) {
      if (!parentId) {
        data.html +=
          ` <li class="nav-item ${item.iconOpened ? "menu-is-opening menu-open" : ""}">
              <a href="#" router="${hasSub ? "" : item.navigateUrl
          }" class="nav-link" >
              <i class="nav-icon  ${item.menuIcon}"></i>
              <p>
                  ${item.menuName}
              ` +
          (hasSub ? '<i class="right fas fa-angle-left"></i>' : "") +
          `</p>
              </a> ` +
          res_html +
          "</li>";
      } else if (hasSub) {

        html_child += `<li class="nav-item">
              <a href="#" router=""  class="nav-link">
              <i class=" ${item.menuIcon} nav-icon"></i>
              <p>
                ${item.menuName}
                <i class="right fas fa-angle-left" style="margin-right:${level * 15}px;"></i>
              </p>
              </a>${res_html}</li>
               `;
      }
      // }
    }
  });
  return html_child;
};

const GetMenus_LoginUser = () => {
  let user = JSON.parse(localStorage.getItem(ConfigConstants.CURRENT_USER));

  const menuNav = [];
  const routers = [];
  const data = { html: "" };
  const Component_Show_Default = { cmp: null };

  if (user) {
    store.dispatch({ type: "Dashboard/USER_LOGIN" });

    // HistoryElementTabs.splice(0,HistoryElementTabs.length)
    const menus = user.Menus;
    // Backend data
    buildTreeMenu(
      0,//level
      menus,//list
      menuNav,//tree
      null,//parentId
      [],//breadcrumb_array
      data,//data
      routers,//routers
      Component_Show_Default//Component_Show_Default
    );
  }

  if (!Component_Show_Default.cmp) {
    Component_Show_Default.cmp = ComponentWrapper("", "", null, "", null, null, []);
  }
  return [menuNav, data.html, routers, user.userName, Component_Show_Default.cmp];
};

export { GetMenus_LoginUser };
