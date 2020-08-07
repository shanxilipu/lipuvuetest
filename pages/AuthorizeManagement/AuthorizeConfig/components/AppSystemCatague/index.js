import React, { Component } from 'react';
import { formatMessage } from 'umi/locale';
import { Input, message, Tree, Dropdown, Menu, Modal } from 'antd';
import _ from 'lodash';
import MyIcon from '@/components/MyIcon';
import {
  listAllSafeAppsysCatalog,
  deleteSafeAppsysCatalog,
  lowerSafeAppsysCatalog,
  upperSafeAppsysCatalog,
  upperLevelSafeAppsysCatalog,
  lowerLevelSafeAppsysCatalog,
} from '@/services/authorizeManagement/applySysUserManagement';
import AddCatlog from './AddCatalogue';
import styles from '../../ApplySysUserManagement/index.less';

const { Search } = Input;
const { TreeNode, DirectoryTree } = Tree;
const { confirm } = Modal;

class AppSystemCatague extends Component {
  constructor(props) {
    super(props);
    this.state = {
      treeData: [],
      showModel: false,
      itemCatlog: {},
    };
    this.defaultExpandedKeys = []; // 默认展开的
  }

  componentWillMount() {
    this.listAllSafeAppsysCatalog('', true);
  }

  listAllSafeAppsysCatalog = (catalogName, type) => {
    const param = {};
    if (catalogName) {
      param.catalogName = catalogName;
    }
    listAllSafeAppsysCatalog(param).then(result => {
      if (!result) return;
      const { resultCode, resultMsg } = result;
      if (resultCode !== '0') {
        message.error(resultMsg);
      } else {
        const { resultObject = [] } = result;
        const treeData = this.initTreeData(resultObject, type);
        this.setState({
          treeData,
        });
      }
    });
  };

  initTreeData = (arr, type) => {
    const result = arr.reduce((prev, item) => {
      if (item.parentCatalogId === -1) {
        this.defaultExpandedKeys = [`${item.catalogId}`];
      }
      // eslint-disable-next-line no-unused-expressions
      prev[item.parentCatalogId]
        ? prev[item.parentCatalogId].push(item)
        : (prev[item.parentCatalogId] = [item]);
      return prev;
    }, {});

    /* eslint-disable */
    const keyArr = [];
    for (let prop in result) {
      keyArr.push(prop);
      result[prop].forEach((item, i) => {
        result[item.catalogId] ? (item.children = result[item.catalogId]) : '';
      });
    }
    for (let prop in result) {
      result[prop].forEach((item, i) => {
        if (keyArr.includes(`${item.catalogId}`)) {
          keyArr.splice(keyArr.findIndex(key => key === `${item.catalogId}`), 1);
        }
      });
    }
    let nodeArr = [];
    keyArr.forEach(item => {
      nodeArr = [...nodeArr, ...result[item]];
    });
    nodeArr = this.setDep(nodeArr, 0);
    if (type && nodeArr && nodeArr[0] && nodeArr[0].children && nodeArr[0].children[0]) {
      // 默认选中子级第一个
      const { isPopUps, setSelectedItem } = this.props;
      if (!isPopUps) {
        setSelectedItem(nodeArr[0].children[0]);
      }
    }
    return nodeArr;
  };

  setDep = (arr, num) => {
    return arr.map(item => {
      if (item.children && item.children.length > 0) {
        this.setDep(item.children, num + 1);
      }
      item.deep = num;
      return item;
    });
  };

  setSelectedItem = (item, e) => {
    if (e) {
      e.stopPropagation();
    }
    if (item.parentCatalogId === -1) {
      return false;
    }
    const { isPopUps, setItem, setSelectedItem } = this.props;
    if (isPopUps) {
      if (setItem) {
        setItem(item);
      }
      return false;
    }
    setSelectedItem(item);
  };

  showModelFlag = (flag, refresh) => {
    this.setState({
      showModel: flag,
      searchValue: '',
    });
    if (refresh) {
      this.listAllSafeAppsysCatalog();
    }
  };

  operationCatalog = (data, type) => {
    data.type = type;
    this.setState({
      showModel: true,
      itemCatlog: data,
    });
  };

  moveCatalog = (data, type) => {
    const params = {};
    let fun = '';
    if (type === 'moveUp') {
      fun = upperSafeAppsysCatalog;
      params.currentCatalogId = data.catalogId;
    } else if (type === 'moveDown') {
      fun = lowerSafeAppsysCatalog;
      params.currentCatalogId = data.catalogId;
    } else if (type === 'upGrade') {
      fun = upperLevelSafeAppsysCatalog;
      params.currentCatalogId = data.catalogId;
    } else if (type === 'downGrade') {
      fun = lowerLevelSafeAppsysCatalog;
      params.currentCatalogId = data.catalogId;
    }
    fun(params).then(result => {
      if (!result) return;
      const { resultCode, resultMsg } = result;
      if (resultCode !== '0') {
        message.error(resultMsg);
      } else {
        this.listAllSafeAppsysCatalog();
      }
    });
  };

  removeCatalog = data => {
    const _this = this;
    confirm({
      title: `${formatMessage({ id: 'applySysUserManagement.ConfirmationOperate' })}`,
      content: <div>{formatMessage({ id: 'applySysUserManagement.deleteDirectoryTip' })}</div>,
      okText: `${formatMessage({ id: 'applySysUserManagement.determine' })}`,
      cancelText: `${formatMessage({ id: 'applySysUserManagement.cancel' })}`,
      onOk() {
        _this.removeCatalogConfirm(data);
      },
      onCancel() {
        return false;
      },
    });
  };

  removeCatalogConfirm = item => {
    deleteSafeAppsysCatalog({ catalogId: item.catalogId }).then(result => {
      if (!result) return;
      const { resultCode, resultMsg } = result;
      if (resultCode !== '0') {
        message.error(resultMsg);
      } else {
        message.success(formatMessage({ id: 'COMMON_DELET_SUCCESS', defaultMessage: '删除成功' }));
        this.listAllSafeAppsysCatalog('', true);
      }
    });
  };

  refresh = () => {
    this.listAllSafeAppsysCatalog();
    const { $setSysChild, $setUserChild } = this.props;
    if ($setSysChild && $setSysChild.getListSafeAppSystem) {
      $setSysChild.getListSafeAppSystem();
    }
  };

  renderTreeNodes = nodeArr => {
    const { isPopUps } = this.props;
    const isDown = nodeArr.length > 1;
    return nodeArr.map((item, index) => {
      return (
        <TreeNode
          title={
            <div
              className={styles.directoryTitleCon}
              onClick={this.setSelectedItem.bind(this, item)}
            >
              <span className={styles.directoryTitleName} title={item.catalogName}>
                {item.catalogName}
              </span>
              {isPopUps ? (
                ''
              ) : (
                <i className={styles.more}>
                  <Dropdown
                    overlay={
                      <Menu>
                        <Menu.Item
                          key="addSubdirectory"
                          onClick={() => {
                            this.operationCatalog(item, 'addSubdirectory');
                          }}
                        >
                          {formatMessage({ id: 'applySysUserManagement.CreateSubdirectory' })}
                        </Menu.Item>
                        {item.deep <= 0 ? (
                          ''
                        ) : (
                          <Menu.Item
                            key="aboveAddCatlog"
                            onClick={() => {
                              this.operationCatalog(item, 'aboveAddCatlog');
                            }}
                          >
                            {formatMessage({ id: 'applySysUserManagement.CreateDirectoryAbove' })}
                          </Menu.Item>
                        )}
                        {item.deep <= 0 ? (
                          ''
                        ) : (
                          <Menu.Item
                            key="belowAddCatlog"
                            onClick={() => {
                              this.operationCatalog(item, 'belowAddCatlog');
                            }}
                          >
                            {formatMessage({ id: 'applySysUserManagement.CreateDirectoryBelow' })}
                          </Menu.Item>
                        )}
                        {item.deep <= 0 || index === 0 ? (
                          ''
                        ) : (
                          <Menu.Item
                            key="moveUp"
                            onClick={() => {
                              this.moveCatalog(item, 'moveUp');
                            }}
                          >
                            {formatMessage({ id: 'applySysUserManagement.MoveUp' })}
                          </Menu.Item>
                        )}
                        {item.deep <= 0 || index === nodeArr.length - 1 ? (
                          ''
                        ) : (
                          <Menu.Item
                            key="moveDown"
                            onClick={() => {
                              this.moveCatalog(item, 'moveDown');
                            }}
                          >
                            {formatMessage({ id: 'applySysUserManagement.MoveDown' })}
                          </Menu.Item>
                        )}
                        {item.deep <= 1 ? (
                          ''
                        ) : (
                          <Menu.Item
                            key="upGrade"
                            onClick={() => {
                              this.moveCatalog(item, 'upGrade');
                            }}
                          >
                            {formatMessage({ id: 'applySysUserManagement.Upgrade' })}
                          </Menu.Item>
                        )}
                        {item.deep <= 0 || !isDown ? (
                          ''
                        ) : (
                          <Menu.Item
                            key="downGrade"
                            onClick={() => {
                              this.moveCatalog(item, 'downGrade');
                            }}
                          >
                            {formatMessage({ id: 'applySysUserManagement.Downgrade' })}
                          </Menu.Item>
                        )}
                        {item.deep <= 0 ? (
                          ''
                        ) : (
                          <Menu.Item
                            key="edit"
                            onClick={() => {
                              this.operationCatalog(item, 'edit');
                            }}
                          >
                            {formatMessage({ id: 'applySysUserManagement.Edit' })}
                          </Menu.Item>
                        )}
                        {item.deep <= 0 ? (
                          ''
                        ) : (
                          <Menu.Item
                            key="remove"
                            onClick={() => {
                              this.removeCatalog(item, 'remove');
                            }}
                          >
                            {formatMessage({ id: 'applySysUserManagement.Delete' })}
                          </Menu.Item>
                        )}
                        <Menu.Item
                          key="refresh"
                          onClick={() => {
                            this.refresh(item, 'refresh');
                          }}
                        >
                          {formatMessage({ id: 'applySysUserManagement.Refresh' })}
                        </Menu.Item>
                      </Menu>
                    }
                  >
                    <MyIcon type="icongengduo" />
                  </Dropdown>
                </i>
              )}
            </div>
          }
          key={`${item.catalogId}`}
          item={item}
        >
          {item.children && item.children.length > 0 ? this.renderTreeNodes(item.children) : ''}
        </TreeNode>
      );
    });
  };

  render() {
    const { treeData, showModel, itemCatlog } = this.state;
    const { selectedCatalogue, isPopUps, actItem } = this.props;
    let newItemCatlog = JSON.stringify(itemCatlog);
    newItemCatlog = JSON.parse(newItemCatlog);
    let selectedKeys = [];
    if (isPopUps) {
      if (!_.isEmpty(actItem)) {
        selectedKeys.push(`${actItem.catalogId}`);
      }
    } else if (!_.isEmpty(selectedCatalogue)) {
      selectedKeys.push(`${selectedCatalogue.catalogId}`);
    }
    return (
      <div className={styles.leftCon}>
        <p className={styles.treeTitle}>
          {formatMessage({ id: 'applySysUserManagement.ApplicationSysDirectory' })}
        </p>
        <div style={{ padding: '0 4px', background: '#fff' }}>
          <div className={styles.searchCon}>
            <Search
              placeholder={formatMessage({ id: 'applySysUserManagement.inputTip' })}
              onSearch={value => {
                this.listAllSafeAppsysCatalog(value);
              }}
            />
          </div>
        </div>
        <div className={styles.treeOutCon}>
          <div className={styles.treeCon}>
            {treeData && treeData.length > 0 ? (
              <DirectoryTree
                defaultExpandedKeys={this.defaultExpandedKeys}
                className={styles.commonTreeCon}
                selectedKeys={selectedKeys}
                showIcon={false}
              >
                {this.renderTreeNodes(treeData)}
              </DirectoryTree>
            ) : (
              ''
            )}
          </div>
        </div>
        <AddCatlog
          showModel={showModel}
          itemCatlog={newItemCatlog}
          treeData={treeData}
          showModelFlag={this.showModelFlag}
        />
      </div>
    );
  }
}

export default AppSystemCatague;
