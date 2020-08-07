import React from 'react';
import { List, Divider } from 'antd';
import {
  ROOT_NAME,
  TABLES_ROOT_NAME,
  VIEWS_ROOT_NAME,
  FUNCTIONS_ROOT_NAME,
  RIGHT_CLICK_MENUS,
  MENU_CHECK,
  MENU_DELETE,
  MENU_EDIT,
  MENU_NEW,
  MENU_PROPERTIES,
  MENU_QUERY,
  MENU_REFRESH,
  MENU_RENAME,
  MENU_NEW_WINDOW,
  TREE_NODE_TYPE_DATASOURCE,
  TREE_NODE_TYPE_TABLE,
  TREE_NODE_TYPE_VIEW,
  TREE_NODE_TYPE_FUNCTION,
} from '../constant';

import styles from '../DatabaseOperation.less';

const simpleFolderMenus = [MENU_NEW, MENU_REFRESH, MENU_QUERY];
const simpleInstanceMenus = [MENU_NEW, MENU_EDIT, MENU_CHECK, MENU_DELETE];
const EFFECTED_MENUS = {
  [ROOT_NAME]: [MENU_REFRESH],
  [TABLES_ROOT_NAME]: simpleFolderMenus,
  [VIEWS_ROOT_NAME]: simpleFolderMenus,
  [FUNCTIONS_ROOT_NAME]: simpleFolderMenus,
  [TREE_NODE_TYPE_DATASOURCE]: [MENU_NEW_WINDOW],
  [TREE_NODE_TYPE_TABLE]: simpleInstanceMenus.concat([MENU_RENAME, MENU_QUERY, MENU_PROPERTIES]),
  [TREE_NODE_TYPE_VIEW]: simpleInstanceMenus.concat([MENU_QUERY, MENU_PROPERTIES]),
  [TREE_NODE_TYPE_FUNCTION]: simpleInstanceMenus.concat([MENU_QUERY]),
};

class RightClickMenus extends React.PureComponent {
  render() {
    const { treeNode, onMenuClick, x, y } = this.props;
    const {
      props: { dataRef },
    } = treeNode;
    const { treeNodeType } = dataRef;
    const effectedMenus = EFFECTED_MENUS[treeNodeType];
    if (!effectedMenus) {
      return <div />;
    }
    // 菜单分组
    const menusObj = {};
    for (let i = 0; i < effectedMenus.length; i++) {
      const actionName = effectedMenus[i];
      for (let j = 0; j < RIGHT_CLICK_MENUS.length; j++) {
        const menu = RIGHT_CLICK_MENUS[j];
        if (menu.key === actionName) {
          const { group } = menu;
          const groupName = `${group}_group`;
          if (!menusObj[groupName]) {
            menusObj[groupName] = [];
          }
          menusObj[groupName].push(menu);
          break;
        }
      }
    }
    const lists = [];
    const groupNames = Object.keys(menusObj);
    for (let i = 0; i < groupNames.length; i++) {
      lists.push(menusObj[groupNames[i]]);
    }
    const menusHeight = effectedMenus.length * 40 + (groupNames.length - 1) * 11;
    const top = y + menusHeight > window.innerHeight ? window.innerHeight - menusHeight : y;
    return (
      <div className={styles.rightMenus} style={{ left: x, top }}>
        {lists.map((list, index) => (
          <div key={index}>
            {index > 0 && <Divider style={{ margin: '10px 0' }} />}
            <List
              size="small"
              dataSource={list}
              renderItem={item => (
                <List.Item
                  key={item.key}
                  onClick={() => {
                    onMenuClick(treeNode, item.key);
                  }}
                  className={styles.menusItem}
                >
                  {item.title}
                </List.Item>
              )}
              split={false}
            />
          </div>
        ))}
      </div>
    );
  }
}
export default RightClickMenus;
