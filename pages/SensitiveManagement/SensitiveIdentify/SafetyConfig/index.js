import React, { PureComponent } from 'react';
import { formatMessage } from 'umi/locale';
import { Button, Spin, message } from 'antd';
import styles from './index.less';
// import PageHeader from '../Components/PageHeader';
import SafetyItemList from './SafetyItemList';
import SafetyItemConfig from './SafetyItemConfig';
import {
  getSafeItem,
  insertSafeItem,
  updateSafeItem,
  getSafetyItemList,
} from '@/services/sensitiveManagement/SafeItemService';
import {
  SCAN_RULE_SCAN_TYPE,
  SCAN_RULE_OPERATION_TYPE,
  SCAN_RULE_MATCH_TYPE,
} from '@/common/const';

class SafetyConfig extends PureComponent {
  constructor(props) {
    super(props);
    this.subviews = [];
    this.pageSize = 5;
    this.state = {
      loading: false,
      isEditorEditable: false,
      editedItem: {},
      isAddItem: false,
    };
    this.editor = React.createRef();
  }

  componentDidMount() {
    this.getDefaultSafetyItem();
  }

  getDefaultSafetyItem = pageIndex => {
    this.setState({ loading: true });
    const params = {
      pageIndex: pageIndex || 1,
      pageSize: this.pageSize,
    };
    getSafetyItemList(params).then(resp => {
      this.setState({ loading: false });
      const {
        resultCode,
        resultMsg,
        resultObject: { rows },
      } = resp;
      if (resultCode === '0') {
        if (rows && rows[0] && rows[0].id) {
          this.handleCheckSafetyItem(rows[0].id);
        }
      } else {
        message.error(resultMsg);
      }
    });
  };

  handleViewDidMount = (viewName, view) => {
    this.subviews.push(view);
  };

  newSafetyItem = (isAddItem = false) => {
    this.resetSafetyItemConfigContent();
    this.setState({
      isEditorEditable: true,
      editedItem: {},
      isAddItem,
    });
  };

  findKey = (obj, value, compare = (a, b) => a === b) => {
    return Object.keys(obj).find(k => compare(obj[k], value));
  };

  removeBatchItems = () => {
    const view = this.subviews[0];
    if (view && view.removeSelectedItems) {
      view.removeSelectedItems();
    }
  };

  getSafetyItemConfigDatas = () => {
    const { subViewMap } = this.subviews[1];
    const subViewObject = {};
    if (
      subViewMap.get('BaseInfo').isFieldsValid() &&
      subViewMap.get('SensitiveRule').isFieldsValid()
    ) {
      subViewObject.baseInfo = subViewMap.get('BaseInfo').getValue();
      subViewObject.sensitiveRule = subViewMap.get('SensitiveRule').getValue();
      subViewObject.scanObjects = subViewMap.get('ScanObjects').getSelectedRowKeys();
      subViewObject.scanRules = subViewMap.get('ScanRules').getSelectedRowKeys();
      subViewObject.relationalRules = subViewMap.get('RelationalRules').getSelectedRowKeys();
      return subViewObject;
    }
  };

  saveSafetyItem = () => {
    const { editedItem, isAddItem } = this.state;
    const subViewObject = this.getSafetyItemConfigDatas();
    if (!subViewObject) {
      message.error(
        `${formatMessage({ id: 'SafetyConfig.RequiredFieldsTip', defaultMessage: '请填必填项' })}`
      );
      return;
    }
    const saveSafetyItemObject = {};
    const id = !isAddItem && editedItem && editedItem.id ? editedItem.id : '';
    saveSafetyItemObject.id = id;
    // 必填的sensitiveRule
    saveSafetyItemObject.desensitizeId = subViewObject.sensitiveRule.desensitizeId;
    saveSafetyItemObject.isCovert = subViewObject.sensitiveRule.isCovert;
    saveSafetyItemObject.levelId = subViewObject.sensitiveRule.levelId;

    // 必填的baseInfo
    saveSafetyItemObject.itemCode = subViewObject.baseInfo.itemCode;
    saveSafetyItemObject.itemName = subViewObject.baseInfo.itemName;
    saveSafetyItemObject.scheduleTime = subViewObject.baseInfo.scheduleTime
      ? subViewObject.baseInfo.scheduleTime.format('YYYY-MM-DD HH:mm:ss')
      : '';
    saveSafetyItemObject.scheduleType = subViewObject.baseInfo.scheduleType;

    // scanObjects
    const safeItemObjectList = [];
    if (subViewObject.scanObjects && subViewObject.scanObjects.dataSource.length > 0) {
      for (let i = 0; i < subViewObject.scanObjects.dataSource.length; i++) {
        const newScanObject = {
          datasourceId: parseInt(subViewObject.scanObjects.dataSource[i].key, 10),
          datasourceName: subViewObject.scanObjects.dataSource[i].datasourceName,
          datasourceType: subViewObject.scanObjects.dataSource[i].datasourceType,
        };
        safeItemObjectList.push(newScanObject);
      }
    }
    saveSafetyItemObject.safeItemObjectList = safeItemObjectList;

    // scanRules
    const safeItemScanRuleDtoList = [];
    if (subViewObject.scanRules && subViewObject.scanRules.dataSource.length > 0) {
      for (let i = 0; i < subViewObject.scanRules.dataSource.length; i++) {
        const newScanRule = {
          matchRate: subViewObject.scanRules.dataSource[i].matchRate,
          matchType: this.findKey(
            SCAN_RULE_MATCH_TYPE,
            subViewObject.scanRules.dataSource[i].matchType
          ),
          matchValue: subViewObject.scanRules.dataSource[i].matchValue,
          operationType: this.findKey(
            SCAN_RULE_OPERATION_TYPE,
            subViewObject.scanRules.dataSource[i].operationType
          ),
          scanRate: subViewObject.scanRules.dataSource[i].scanRate,
          scanType: this.findKey(
            SCAN_RULE_SCAN_TYPE,
            subViewObject.scanRules.dataSource[i].scanType
          ),
        };
        safeItemScanRuleDtoList.push(newScanRule);
      }
    }
    saveSafetyItemObject.safeItemScanRuleDtoList = safeItemScanRuleDtoList;
    saveSafetyItemObject.ruleRelation = subViewObject.scanRules.scanRulesVal;

    const safeItemLinkageRuleList = [];
    if (subViewObject.relationalRules && subViewObject.relationalRules.dataSource.length > 0) {
      for (let i = 0; i < subViewObject.relationalRules.dataSource.length; i++) {
        const newLinkageRule = {
          eliminateFunction: subViewObject.relationalRules.dataSource[i].functionName,
          functionDescribe: subViewObject.relationalRules.dataSource[i].functionDescribe,
        };
        safeItemLinkageRuleList.push(newLinkageRule);
      }
    }
    saveSafetyItemObject.safeItemLinkageRuleList = safeItemLinkageRuleList;
    saveSafetyItemObject.isLinkage = subViewObject.relationalRules.linkageRecognizeVal;

    console.info(saveSafetyItemObject);

    const func = id ? updateSafeItem(saveSafetyItemObject) : insertSafeItem(saveSafetyItemObject);
    func.then(result => {
      const { resultCode, resultMsg } = result;
      if (resultCode === '0') {
        this.subviews[0].reload();
        this.resetSafetyItemConfigContent();
        this.setState({
          isEditorEditable: false,
          isAddItem: false,
        });
        if (id) {
          this.handleCheckSafetyItem(id);
        }
        message.success(
          `${formatMessage({
            id: 'SafetyConfig.AddedOrModifiedSuccessfully',
            defaultMessage: '新增/修改成功',
          })}`
        );
      } else {
        message.error(resultMsg);
      }
    });
  };

  cancelEditSafetyItem = () => {
    this.resetSafetyItemConfigContent();
    this.setState({ isEditorEditable: false, isAddItem: false });
  };

  resetSafetyItemConfigContent = () => {
    const { subViewMap } = this.subviews[1];
    if (subViewMap.has('BaseInfo')) {
      subViewMap.get('BaseInfo').resetModel();
    }
    if (subViewMap.has('ScanObjects')) {
      subViewMap.get('ScanObjects').resetModel();
    }
    if (subViewMap.has('ScanRules')) {
      subViewMap.get('ScanRules').resetModel();
    }
    if (subViewMap.has('RelationalRules')) {
      subViewMap.get('RelationalRules').resetModel();
    }
    if (subViewMap.has('SensitiveRule')) {
      subViewMap.get('SensitiveRule').resetModel();
    }
  };

  handleEditSafetyItem = itemId => {
    this.setState({ isEditorEditable: true });
    // 先初始化Callapse里的内容
    this.resetSafetyItemConfigContent();
    // 获得详情信息
    this.getSaftyItemDetails(itemId);
  };

  handleCheckSafetyItem = itemId => {
    this.setState({ isEditorEditable: false });
    // 先初始化Callapse里的内容
    this.resetSafetyItemConfigContent();
    // 获得详情信息
    this.getSaftyItemDetails(itemId);
  };

  getSaftyItemDetails = itemId => {
    const param = {
      id: itemId,
    };
    this.setState({
      loading: true,
    });
    getSafeItem(param).then(result => {
      this.setState({
        loading: false,
      });
      if (!result) return;
      const { resultCode, resultMsg, resultObject } = result;
      if (resultCode !== '0') {
        message.error(resultMsg);
      } else {
        console.info(resultObject);
        this.setState({
          editedItem: resultObject,
        });
      }
    });
  };

  render() {
    const { isEditorEditable, editedItem, loading } = this.state;

    return (
      <div className={`${styles.indexCon}`}>
        {/* <PageHeader title="安全条目"> */}

        {/* </PageHeader> */}
        <div>
          <SafetyItemList
            handleEditSafetyItem={this.handleEditSafetyItem}
            handleCheckSafetyItem={this.handleCheckSafetyItem}
            viewDidMountHandler={this.handleViewDidMount}
            newSafetyItem={() => this.newSafetyItem(true)}
            removeBatchItems={this.removeBatchItems}
          />
        </div>
        <Spin spinning={loading}>
          <div style={{ paddingTop: 20 }}>
            <SafetyItemConfig
              editable={isEditorEditable}
              editedItem={editedItem}
              ref={this.editor}
              viewDidMountHandler={this.handleViewDidMount}
            />
          </div>
        </Spin>
        <div className={styles.footerCon} hidden={!isEditorEditable}>
          <Button type="primary" onClick={this.saveSafetyItem}>
            {formatMessage({ id: 'COMMON_OK', defaultMessage: '确定' })}
          </Button>
          <Button
            // icon="delete"
            type="default"
            className={styles.ml10}
            onClick={this.cancelEditSafetyItem}
          >
            {formatMessage({ id: 'COMMON_CANCEL', defaultMessage: '取消' })}
          </Button>
        </div>
      </div>
    );
  }
}
export default SafetyConfig;
