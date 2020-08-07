import React, { Component } from 'react';
import { Input, Tree } from 'antd';
import { formatMessage } from 'umi/locale';
import classnames from 'classnames';
import styles from './index.less';

const { Search } = Input;
const { TreeNode, DirectoryTree } = Tree;

class SysCatlog extends Component {
  getTreeArr = (resultObject = []) => {
    const sysArr = resultObject.map(item => {
      const { safeAppsysCatalog = {}, safeAppSystem = [] } = item;
      return { ...safeAppsysCatalog, isCatlog: true, children: safeAppSystem };
    });
    return sysArr;
  };

  initTreeData = arr => {
    const result = arr.reduce((prev, item) => {
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
    return nodeArr;
  };

  renderTreeNodes = nodeArr => {
    return nodeArr.map(item => {
      const itemKey = item.isCatlog ? item.catalogId : item.id;
      const itemName = item.isCatlog ? item.catalogName : item.appsysName;
      return (
        <TreeNode title={itemName} key={`${itemKey}`} item={item} isLeaf={!item.isCatlog}>
          {item.children && item.children.length > 0 ? this.renderTreeNodes(item.children) : ''}
        </TreeNode>
      );
    });
  };

  render() {
    const {
      data = [],
      selectedKeys = [],
      title = '',
      onSelect = () => {},
      searchFun,
      checkable,
      onCheck,
      renderTree,
    } = this.props;
    let getTreeArr = [];
    let treeData = [];
    if (!renderTree) {
      getTreeArr = this.getTreeArr(data);
      treeData = this.initTreeData(getTreeArr) || [];
    }

    return (
      <div className={styles.leftCon}>
        {title && (
          <p className={classnames(styles.treeTitle, 'ellipsis')} title={title}>
            {title}
          </p>
        )}
        <div style={{ padding: '0 4px', background: '#fff' }}>
          <div className={styles.searchCon}>
            <Search
              placeholder={formatMessage({ id: 'applySysUserManagement.inputTip' })}
              onSearch={value => {
                if (searchFun) {
                  searchFun(value);
                }
              }}
            />
          </div>
        </div>
        <div className={styles.treeOutCon}>
          <div className={styles.treeCon}>
            {renderTree ? (
              renderTree()
            ) : treeData && treeData.length > 0 ? (
              <DirectoryTree
                className={styles.commonTreeCon}
                selectedKeys={selectedKeys}
                onSelect={onSelect}
                checkable={checkable}
                onCheck={onCheck}
              >
                {this.renderTreeNodes(treeData)}
              </DirectoryTree>
            ) : (
              ''
            )}
          </div>
        </div>
      </div>
    );
  }
}

export default SysCatlog;
