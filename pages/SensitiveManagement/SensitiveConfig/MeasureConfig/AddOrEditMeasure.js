import React, { Component } from 'react';
import { formatMessage } from 'umi/locale';
// import { Modal, Form, Input, Spin, message } from 'antd';
import { Row, Col, Tree, Card, Modal, Form, Input, Spin, message, Select, InputNumber } from 'antd';
import {
  insertSafeDesensitizeType,
  updateSafeDesensitizeType,
} from '@/services/sensitiveManagement/measureConfig';
import { getUserByComAcctId } from '@/services/authorizeManagement/userCodeLinkConfig';
import MyIcon from '@/components/MyIcon';
import styles from './index.less';

const { Option } = Select;
const { Search } = Input;
const { TreeNode } = Tree;

const formItemLayout = {
  labelCol: {
    sm: { span: 7 },
  },
  wrapperCol: {
    sm: { span: 16 },
  },
};
const msgMaskPosition = `${formatMessage({
  id: 'MeasureConfig.msgMaskPosition',
  defaultMessage: '请录入一个英文字母或英文符号(不允许/与\\)',
})}`;
const codeValidator = (rule, value, callback) => {
  const reg = /^[^\u4e00-\u9fa5]+$/g;
  if (value && !reg.test(value) === true) {
    callback(
      `${formatMessage({ id: 'LevelConfig.DoNotEnterChinese', defaultMessage: '请勿输入中文' })}`
    );
  } else {
    callback();
  }
};

@Form.create()
class AddOrEditMeasure extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedOperators: [],
      treeArr: [],
      userModalVisible: false,
      loading: false,
      taskItem: {},
      desensitizeType: props.desensitizeType,
      maskPosition: -1,
      maskCount: -1,
      kpPosition: -1,
      kpCount: -1,
      decryptAlgorithm: undefined,
      smsUserName: undefined,
      maskSymbol: undefined,
      showMsg: false,
    };
  }

  componentWillMount() {
    this.getCatalogue();
  }

  componentWillReceiveProps(nextProps) {
    const { taskItem, form, visible } = this.props;
    if (nextProps.isAddItem && !visible && nextProps.visible) {
      const data = {
        desensitizeName: '',
        desensitizeCode: '',
        desensitizeType: '',
      };
      this.setState({
        taskItem: {},
        desensitizeType: '',
        maskPosition: -1,
        maskCount: -1,
        kpPosition: -1,
        kpCount: -1,
        maskSymbol: undefined,
        decryptAlgorithm: undefined,
        smsUserName: undefined,
        showMsg: false,
      });
      form.setFieldsValue(data);
    }
    if (JSON.stringify(nextProps.taskItem) !== JSON.stringify(taskItem)) {
      this.setState({
        taskItem: nextProps.taskItem,
        desensitizeType: '',
        maskPosition: -1,
        maskCount: -1,
        kpPosition: -1,
        kpCount: -1,
        maskSymbol: undefined,
        decryptAlgorithm: undefined,
        smsUserName: undefined,
        showMsg: false,
      });
      const data = {
        desensitizeName: nextProps.taskItem.desensitizeName,
        desensitizeCode: nextProps.taskItem.desensitizeCode,
        desensitizeType: nextProps.taskItem.desensitizeType,
      };
      form.setFieldsValue(data);
    }
  }

  hideModal = () => {
    const { showModelFlag } = this.props;
    showModelFlag(false);
  };

  showUserModal = userModalVisible => {
    this.setState({
      userModalVisible,
    });
  };

  handleTreeSelect = (keys, e) => {
    this.setState({
      selectedOperators: keys,
      smsUserName: e.node.props.dataRef.userCode,
    });
  };

  getPageList = val => {
    const { getPageList } = this.props;
    getPageList(val);
  };

  handleOk = () => {
    const { taskItem, form, isAddItem } = this.props;
    const {
      maskPosition,
      maskCount,
      kpPosition,
      kpCount,
      maskSymbol,
      decryptAlgorithm,
      smsUserName,
    } = this.state;

    const id = !isAddItem && taskItem.id ? taskItem.id : '';
    const list = taskItem && taskItem.safeDesensitizeTypeParamList;
    const obj = this.getSafeDesensitizeTypeObj(list);
    const mposition = maskPosition !== -1 ? maskPosition : obj.position;
    const mcount = maskCount !== -1 ? maskCount : obj.mcount;
    // const decryptCode = decryptAlgorithm || obj.decryptCode;
    // const userName = smsUserName || obj.userName;
    const keepPosition = kpPosition !== -1 ? kpPosition : obj.keepPosition;
    const keepCount = kpCount !== -1 ? kpCount : obj.keepCount;
    // const symbol = maskSymbol || obj.msymbol;
    const decryptCode = decryptAlgorithm !== undefined ? decryptAlgorithm : obj.decryptCode;
    const userName = smsUserName !== undefined ? smsUserName : obj.userName;
    const symbol = maskSymbol !== undefined ? maskSymbol : obj.msymbol;
    const self = this;
    form.validateFields((err, values) => {
      if (!err) {
        self.setState({
          loading: false,
        });
        let formData = {};
        formData.id = id;
        formData.desensitizeCode = values.desensitizeCode;
        formData.desensitizeName = values.desensitizeName;
        formData.desensitizeType = values.desensitizeType;
        if (!this.validateRules(values.desensitizeType, userName, symbol)) {
          return;
        }
        const safeDesensitizeTypeParamList = [];
        if (values.desensitizeType === '2') {
          safeDesensitizeTypeParamList.push({
            paramCode: 'MASK_POSITION',
            paramValue: mposition === -1 ? 1 : mposition,
          });
          safeDesensitizeTypeParamList.push({
            paramCode: 'MASK_COUNT',
            paramValue: mcount === -1 ? 1 : mcount,
          });
          safeDesensitizeTypeParamList.push({
            paramCode: 'MASK_SYMBOL',
            paramValue: symbol,
          });
        } else if (values.desensitizeType === '3') {
          safeDesensitizeTypeParamList.push({
            paramCode: 'DECRYPT_ALGORITHM',
            paramValue: decryptCode || '1',
          });
        } else if (values.desensitizeType === '4') {
          safeDesensitizeTypeParamList.push({
            paramCode: 'SMS_USER_CODE',
            paramValue: userName,
          });
        } else if (values.desensitizeType === '1') {
          safeDesensitizeTypeParamList.push({
            paramCode: 'FULL_SYMBOL',
            paramValue: symbol,
          });
        } else if (values.desensitizeType === '6') {
          safeDesensitizeTypeParamList.push({
            paramCode: 'KEEP_POSITION',
            paramValue: keepPosition === -1 ? 1 : keepPosition,
          });
          safeDesensitizeTypeParamList.push({
            paramCode: 'KEEP_COUNT',
            paramValue: keepCount === -1 ? 1 : keepCount,
          });
        }
        formData.safeDesensitizeTypeParamList = safeDesensitizeTypeParamList;
        self.setState({
          loading: true,
        });
        const func = id ? updateSafeDesensitizeType : insertSafeDesensitizeType;
        func(formData).then(result => {
          this.setState({
            loading: false,
          });
          if (!result) return;
          const { resultCode, resultMsg } = result;
          if (resultCode !== '0') {
            message.error(resultMsg);
          } else {
            self.hideModal();
            message.success(
              `${formatMessage({
                id: 'LevelConfig.AddedOrModifiedSuccessfully',
                defaultMessage: '添加/修改成功',
              })}`
            );
            self.getPageList(1); // 跳转到第一页
          }
        });
        formData = null;
      }
    });
  };

  desensitizeTypeChange = desensitizeType => {
    this.setState({
      showMsg: false,
      desensitizeType,
    });
  };

  getCatalogue = queryCode => {
    const param = {};
    if (queryCode) {
      param.queryCode = queryCode;
    }
    getUserByComAcctId(queryCode).then(result => {
      if (!result) return;
      const { resultCode, resultMsg } = result;
      if (resultCode !== '0') {
        message.error(resultMsg);
      } else {
        const { resultObject = [] } = result;
        const treeArr = [];
        // 获取顶级父元素集合
        if (resultObject.data === null) {
          this.setState({
            treeArr: [],
          });
          return;
        }
        const roots = resultObject.data.filter(elemt => elemt.parentId === -1);
        treeArr.push(...roots);
        this.setState({
          treeArr,
        });
      }
    });
  };

  renderTree = jsonTree =>
    jsonTree.map(item => {
      if (item.children) {
        return (
          <TreeNode
            title={
              <div>
                <span>{item.userName}</span>
              </div>
            }
            key={item.userId}
            dataRef={item}
          >
            {/* 对children中的每个元素进行递归 */}
            {this.renderTree(item.children)}
          </TreeNode>
        );
      }
      return item;
    });

  onMaskPositionChange = maskPosition => {
    this.setState({
      maskPosition,
    });
  };

  onMaskCountChange = maskCount => {
    this.setState({
      maskCount,
    });
  };

  onMaskSymbolChange = e => {
    const maskSymbol = e.target.value ? e.target.value : '';
    const numReg = /^[1-9]\d*|0$/g;
    const exp = new RegExp('[\\\\/]');
    if (
      exp.test(maskSymbol) === true ||
      numReg.test(maskSymbol) === true ||
      escape(maskSymbol).indexOf('%u') !== -1 ||
      maskSymbol.length >= 2
    ) {
      this.setState({
        maskSymbol,
        showMsg: true,
      });
      return;
    }
    this.setState({
      maskSymbol,
      showMsg: false,
    });
  };

  encodeWayChange = decryptAlgorithm => {
    this.setState({
      decryptAlgorithm,
    });
  };

  onUserNameChange = e => {
    const smsUserName = e.target.value ? e.target.value : '';
    if (!smsUserName) {
      this.setState({
        smsUserName,
        showMsg: true,
      });
      return;
    }
    this.setState({
      smsUserName,
      showMsg: false,
    });
  };

  validateRules = (desensitizeType, smsUserName, maskSymbol) => {
    const { showMsg } = this.state;
    if (
      ((desensitizeType === '1' || desensitizeType === '2') && !maskSymbol) ||
      showMsg ||
      ((desensitizeType === '4' && showMsg && !smsUserName) || showMsg)
    ) {
      this.setState({ showMsg: true });
      return false;
    }
    this.setState({ showMsg: false });
    return true;
  };

  keepPosionChange = kpPosition => {
    this.setState({
      kpPosition,
    });
  };

  onKeepCountChange = kpCount => {
    this.setState({
      kpCount,
    });
  };

  getSafeDesensitizeTypeObj = safeDesensitizeTypeParamList => {
    let [position, keepPosition, mcount, keepCount, decryptCode, userName, msymbol] = [
      -1,
      -1,
      -1,
      -1,
      undefined,
      undefined,
      undefined,
    ];
    if (safeDesensitizeTypeParamList && safeDesensitizeTypeParamList.length > 0) {
      safeDesensitizeTypeParamList.forEach(item => {
        if (item.paramCode === 'MASK_POSITION') {
          position = parseInt(item.paramValue, 10);
        }
        if (item.paramCode === 'KEEP_POSITION') {
          keepPosition = parseInt(item.paramValue, 10);
        }
        if (item.paramCode === 'MASK_COUNT') {
          mcount = parseInt(item.paramValue, 10);
        }
        if (item.paramCode === 'KEEP_COUNT') {
          keepCount = parseInt(item.paramValue, 10);
        }
        if (item.paramCode === 'MASK_SYMBOL' || item.paramCode === 'FULL_SYMBOL') {
          msymbol = item.paramValue;
        }
        if (item.paramCode === 'DECRYPT_ALGORITHM') {
          decryptCode = item.paramValue;
        }
        if (item.paramCode === 'SMS_USER_CODE') {
          userName = item.paramValue;
        }
      });
    }
    return {
      position,
      keepPosition,
      mcount,
      keepCount,
      decryptCode,
      userName,
      msymbol,
    };
  };

  render() {
    const {
      selectedOperators,
      treeArr,
      userModalVisible,
      loading,
      taskItem,
      desensitizeType,
      maskPosition,
      maskCount,
      decryptAlgorithm,
      smsUserName,
      maskSymbol,
      kpPosition,
      kpCount,
      showMsg,
    } = this.state;

    const type = desensitizeType || taskItem.desensitizeType;
    const safeDesensitizeTypeParamList = taskItem && taskItem.safeDesensitizeTypeParamList;
    const obj = this.getSafeDesensitizeTypeObj(safeDesensitizeTypeParamList);
    const position = maskPosition !== -1 ? maskPosition : obj.position;
    const mcount = maskCount !== -1 ? maskCount : obj.mcount;
    const decryptCode = decryptAlgorithm !== undefined ? decryptAlgorithm : obj.decryptCode;
    const userName = smsUserName !== undefined ? smsUserName : obj.userName;
    const symbol = maskSymbol !== undefined ? maskSymbol : obj.msymbol;
    const keepPosition = String(kpPosition !== -1 ? kpPosition : obj.keepPosition);
    const keepCount = kpCount !== -1 ? kpCount : obj.keepCount;

    const {
      form: { getFieldDecorator },
      visible,
    } = this.props;
    return (
      <div>
        <Modal
          width={800}
          title={formatMessage({ id: 'LevelConfig.EntryInformation', defaultMessage: '信息录入' })}
          visible={visible}
          onOk={this.handleOk}
          onCancel={this.hideModal}
          destroyOnClose={true}
        >
          <Spin spinning={loading}>
            <Form>
              <Form.Item
                colon={false}
                {...formItemLayout}
                label={formatMessage({
                  id: 'MeasureConfig.MeasureCode',
                  defaultMessage: '措施编码',
                })}
              >
                {getFieldDecorator('desensitizeCode', {
                  rules: [
                    {
                      required: true,
                      message: `${formatMessage({
                        id: 'COMMON_ENTER_TIP',
                        defaultMessage: '请输入',
                      })}`,
                    },
                    {
                      validator: codeValidator,
                    },
                  ],
                  initialValue: taskItem.desensitizeCode,
                })(
                  <Input
                    style={{ width: '88%' }}
                    placeholder={formatMessage({
                      id: 'COMMON_ENTER_TIP',
                      defaultMessage: '请输入',
                    })}
                  />
                )}
              </Form.Item>
              <Form.Item
                colon={false}
                {...formItemLayout}
                label={formatMessage({
                  id: 'MeasureConfig.MeasureName',
                  defaultMessage: '措施名称',
                })}
              >
                {getFieldDecorator('desensitizeName', {
                  rules: [
                    {
                      required: true,
                      message: `${formatMessage({
                        id: 'COMMON_ENTER_TIP',
                        defaultMessage: '请输入',
                      })}`,
                    },
                  ],
                  initialValue: taskItem.desensitizeName,
                })(
                  <Input
                    style={{ width: '88%' }}
                    placeholder={formatMessage({
                      id: 'COMMON_ENTER_TIP',
                      defaultMessage: '请输入',
                    })}
                  />
                )}
              </Form.Item>
              <Form.Item
                colon={false}
                {...formItemLayout}
                label={formatMessage({
                  id: 'MeasureConfig.MeasureType',
                  defaultMessage: '措施类型',
                })}
              >
                {getFieldDecorator('desensitizeType', {
                  rules: [
                    {
                      required: true,
                      message: `${formatMessage({
                        id: 'COMMON_SELECT_ICON',
                        defaultMessage: '请选择',
                      })}`,
                    },
                  ],
                  initialValue: taskItem.desensitizeType,
                })(
                  <Select
                    style={{ width: '88%' }}
                    placeholder={formatMessage({
                      id: 'COMMON_SELECT_ICON',
                      defaultMessage: '请选择',
                    })}
                    onChange={this.desensitizeTypeChange}
                  >
                    <Option key={1} value="1">
                      {formatMessage({ id: 'MeasureConfig.CoverAll', defaultMessage: '全部遮盖' })}
                    </Option>
                    <Option key={2} value="2">
                      {formatMessage({
                        id: 'MeasureConfig.PartiallyCovered',
                        defaultMessage: '部分遮盖',
                      })}
                    </Option>
                    <Option key={3} value="3">
                      {formatMessage({ id: 'MeasureConfig.Encrypt', defaultMessage: '加密' })}
                    </Option>
                    <Option key={4} value="4">
                      {formatMessage({ id: 'MeasureConfig.Treasury', defaultMessage: '金库' })}
                    </Option>
                    <Option key={5} value="5">
                      {formatMessage({ id: 'MeasureConfig.Block', defaultMessage: '阻断' })}
                    </Option>
                    <Option key={6} value="6">
                      {formatMessage({ id: 'MeasureConfig.CutOff', defaultMessage: '截断' })}
                    </Option>
                    {/* <Option key={5} value='5'>金库-高级筛选</Option> */}
                  </Select>
                )}
              </Form.Item>
              <Form.Item
                required
                colon={false}
                {...formItemLayout}
                label={formatMessage({
                  id: 'MeasureConfig.DesensitizationRule',
                  defaultMessage: '脱敏规则',
                })}
              >
                {type === '5' ? (
                  <label>
                    {formatMessage({
                      id: 'MeasureConfig.DesensitizationRule1',
                      defaultMessage: '默认设置，无须手动设置',
                    })}
                  </label>
                ) : type === '2' ? (
                  <div>
                    <label>
                      {formatMessage({
                        id: 'MeasureConfig.DesensitizationRule2',
                        defaultMessage: '用',
                      })}{' '}
                      <Input
                        style={{ width: '10%' }}
                        value={symbol}
                        onChange={this.onMaskSymbolChange}
                      />{' '}
                      {formatMessage({
                        id: 'MeasureConfig.DesensitizationRule3',
                        defaultMessage: '从第',
                      })}{' '}
                      <InputNumber
                        style={{ width: '10%' }}
                        min={1}
                        max={9999}
                        value={position}
                        onChange={this.onMaskPositionChange}
                      />{' '}
                      {formatMessage({
                        id: 'MeasureConfig.DesensitizationRule4',
                        defaultMessage: '个字符开始遮盖',
                      })}{' '}
                      <InputNumber
                        style={{ width: '10%' }}
                        min={1}
                        max={9999}
                        value={mcount}
                        onChange={this.onMaskCountChange}
                      />{' '}
                      {formatMessage({
                        id: 'MeasureConfig.DesensitizationRule5',
                        defaultMessage: '个字符',
                      })}
                    </label>
                    <p style={showMsg ? { display: 'block', color: 'red' } : { display: 'none' }}>
                      {msgMaskPosition}
                    </p>
                  </div>
                ) : type === '3' ? (
                  <label>
                    {formatMessage({
                      id: 'MeasureConfig.DesensitizationRule6',
                      defaultMessage: '数据加密算法',
                    })}
                    ：
                    <Select
                      style={{ width: '68%' }}
                      placeholder={formatMessage({
                        id: 'COMMON_SELECT_ICON',
                        defaultMessage: '请选择',
                      })}
                      value={decryptCode || '1'}
                      onChange={this.encodeWayChange}
                    >
                      <Option key={1} value="1">
                        MD5
                      </Option>
                      <Option key={2} value="2">
                        RSA/ASE
                      </Option>
                    </Select>
                  </label>
                ) : type === '4' ? (
                  <div>
                    {formatMessage({
                      id: 'MeasureConfig.DesensitizationRule7',
                      defaultMessage: '审批账号',
                    })}
                    ：
                    <Input
                      readOnly
                      style={{ width: '70%' }}
                      value={userName}
                      onChange={this.onUserNameChange}
                    />{' '}
                    <MyIcon type="icon-yonghuzhongxin" onClick={() => this.showUserModal(true)} />
                    <p
                      style={
                        showMsg && !userName
                          ? { display: 'block', color: 'red' }
                          : { display: 'none' }
                      }
                    >
                      {formatMessage({ id: 'COMMON_REQUIRED', defaultMessage: '必填' })}
                    </p>
                  </div>
                ) : type === '1' ? (
                  <div>
                    <label>
                      {formatMessage({
                        id: 'MeasureConfig.DesensitizationRule2',
                        defaultMessage: '用',
                      })}{' '}
                      <Input
                        style={{ width: '10%' }}
                        value={symbol}
                        onChange={this.onMaskSymbolChange}
                      />{' '}
                      {formatMessage({
                        id: 'MeasureConfig.DesensitizationRule8',
                        defaultMessage: '遮盖',
                      })}
                    </label>
                    <p style={showMsg ? { display: 'block', color: 'red' } : { display: 'none' }}>
                      {msgMaskPosition}
                    </p>
                  </div>
                ) : type === '6' ? (
                  <label>
                    {formatMessage({
                      id: 'MeasureConfig.DesensitizationRule9',
                      defaultMessage: '保留',
                    })}
                    <Select
                      style={{ width: '15%' }}
                      placeholder="请选择"
                      value={keepPosition === '-1' ? '1' : keepPosition}
                      onChange={this.keepPosionChange}
                    >
                      <Option key={1} value="1">
                        {formatMessage({
                          id: 'MeasureConfig.DesensitizationRule10',
                          defaultMessage: '前面',
                        })}
                      </Option>
                      <Option key={2} value="2">
                        {formatMessage({
                          id: 'MeasureConfig.DesensitizationRule11',
                          defaultMessage: '后面',
                        })}
                      </Option>
                    </Select>{' '}
                    {formatMessage({
                      id: 'MeasureConfig.DesensitizationRule12',
                      defaultMessage: '第',
                    })}{' '}
                    <InputNumber
                      min={1}
                      max={9999}
                      value={keepCount}
                      onChange={this.onKeepCountChange}
                    />{' '}
                    {formatMessage({
                      id: 'MeasureConfig.DesensitizationRule5',
                      defaultMessage: '个字符',
                    })}
                  </label>
                ) : null}
              </Form.Item>
            </Form>
          </Spin>
        </Modal>
        <Modal
          width={500}
          title={formatMessage({ id: 'LevelConfig.EntryInformation', defaultMessage: '信息录入' })}
          visible={userModalVisible}
          onOk={() => this.showUserModal(false)}
          onCancel={() => this.showUserModal(false)}
        >
          <div>
            <Row gutter={32}>
              <Col span={24}>
                <Card
                  size="small"
                  title={
                    <span className={styles.require}>
                      {formatMessage({
                        id: 'MeasureConfig.DesensitizationRule7',
                        defaultMessage: '审批账号',
                      })}
                    </span>
                  }
                >
                  <Search
                    placeholder={formatMessage({
                      id: 'COMMON_ENTER_TIP',
                      defaultMessage: '请输入',
                    })}
                    onSearch={value => {
                      this.getCatalogue(value);
                    }}
                    enterButton
                  />
                  <Tree
                    className={styles.tree}
                    selectedKeys={selectedOperators}
                    onSelect={(keys, e) => this.handleTreeSelect(keys, e)}
                  >
                    {this.renderTree(treeArr)}
                  </Tree>
                </Card>
              </Col>
            </Row>
          </div>
        </Modal>
      </div>
    );
  }
}

export default AddOrEditMeasure;
