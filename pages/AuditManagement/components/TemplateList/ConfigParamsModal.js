import React from 'react';
import { Modal, Button, Table, Input, Icon, Popconfirm, Divider, message, Form } from 'antd';
import { formatMessage } from 'umi/locale';
import Pagination from '@/components/Pagination';
import MyIcon from '@/components/MyIcon';
import { randomWord } from '@/utils/utils';
import styles from './index.less';

@Form.create()
class ConfigParamsModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      paramsList: [],
      selectedRowKeys: [],
      previewResult: '',
    };
  }

  componentDidUpdate(prevProps) {
    const {
      visible,
      form: { setFieldsValue },
    } = this.props;
    if (visible && !prevProps.visible) {
      const { templateData } = this.props;
      const { templateParams = '', templateParamsSep = '' } = templateData;
      let list = [];
      if (templateParams && templateParamsSep) {
        list = templateParams.split(templateParamsSep);
      }
      const paramsList = list.map(value => ({
        value,
        id: randomWord(false, 8),
      }));
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ paramsList, previewResult: '' });
      setFieldsValue({ separator: templateParamsSep });
    }
  }

  handleParamValueChange = (value, id) => {
    const { paramsList } = this.state;
    const _paramsList = paramsList.map(o => {
      if (o.id === id) {
        return { ...o, value };
      }
      return { ...o };
    });
    this.setState({ paramsList: _paramsList });
  };

  getColumns = () => {
    const { paramsList } = this.state;
    return [
      {
        dataIndex: 'index',
        width: '33%',
        title: formatMessage({ id: 'riskConfig.parameterOrder', defaultMessage: '参数顺序' }),
        render: val => val + 1,
      },
      {
        dataIndex: 'value',
        width: '33%',
        title: formatMessage({ id: 'riskConfig.parameterValue', defaultMessage: '参数取值' }),
        render: (val, record) => {
          const { id } = record;
          return (
            <Input
              value={val || ''}
              className={styles.configParamsModalInput}
              onChange={e => this.handleParamValueChange(e.target.value, id)}
              placeholder={formatMessage({
                id: 'riskConfig.parameterValue',
                defaultMessage: '参数取值',
              })}
            />
          );
        },
      },
      {
        dataIndex: 'action',
        width: '33%',
        title: formatMessage({ id: 'OPERATE', defaultMessage: '操作' }),
        render: (t, record) => {
          const { index, id } = record;
          const hasEnoughData = paramsList.length > 1;
          return (
            <div className={styles.buttonsGroup}>
              {!hasEnoughData || index !== paramsList.length - 1 ? (
                <Icon
                  type="down-circle"
                  className={!hasEnoughData ? styles.disabled : ''}
                  onClick={() => this.handleSort(record, true)}
                />
              ) : (
                <Icon
                  type="up-circle"
                  className={!hasEnoughData ? styles.disabled : ''}
                  onClick={() => this.handleSort(record, false)}
                />
              )}
              {index !== 0 ? (
                <Icon
                  type="up-circle"
                  className={!hasEnoughData ? styles.disabled : ''}
                  onClick={() => this.handleSort(record, false)}
                />
              ) : (
                <Icon
                  type="down-circle"
                  className={!hasEnoughData ? styles.disabled : ''}
                  onClick={() => this.handleSort(record, true)}
                />
              )}
              <Popconfirm
                title={formatMessage({ id: 'CONFIRM_DELETION', defaultMessage: '确认删除?' })}
                onConfirm={() => this.handleDeleteParams([id])}
              >
                <MyIcon type="iconshanchu" />
              </Popconfirm>
            </div>
          );
        },
      },
    ];
  };

  handleAllChange = e => {
    const {
      target: { checked },
    } = e;
    const { paramsList } = this.state;
    this.setState({ selectedRowKeys: checked ? paramsList.map(o => o.id) : [] });
  };

  handleAddParameter = () => {
    const { paramsList } = this.state;
    const _paramsList = [...paramsList];
    _paramsList.push({
      value: '',
      id: randomWord(false, 8),
    });
    this.setState({ paramsList: _paramsList });
  };

  handleDeleteParams = (ids, batch) => {
    const { paramsList } = this.state;
    this.setState({ paramsList: paramsList.filter(o => !ids.includes(o.id)) });
    if (batch) {
      this.setState({ selectedRowKeys: [] });
    }
  };

  handleSort = (record, down) => {
    const { paramsList } = this.state;
    if (paramsList.length === 1) {
      return false;
    }
    const { id } = record;
    const index = paramsList.findIndex(o => o.id === id);
    const _paramsList = paramsList.filter(o => o.id !== id);
    const newIndex = down ? index + 1 : index - 1;
    _paramsList.splice(newIndex, 0, { ...record });
    this.setState({ paramsList: _paramsList });
  };

  checkFormValues = () => {
    const {
      form: { validateFields },
    } = this.props;
    let res = null;
    validateFields((err, values) => {
      if (err) {
        return false;
      }
      const { separator } = values;
      res = separator;
    });
    return res;
  };

  handlePreview = () => {
    const separator = this.checkFormValues();
    if (!separator) {
      return false;
    }
    const { paramsList } = this.state;
    if (!paramsList.length) {
      message.warning(
        formatMessage({ id: 'riskConfig.noParamsWarning', defaultMessage: '请添加模板参数!' })
      );
      return false;
    }
    this.setState({ previewResult: paramsList.map(o => o.value).join(separator) });
  };

  checkSeparator = (rule, value, callback) => {
    if (!value) {
      callback();
      return false;
    }
    const { paramsList } = this.state;
    const allValues = paramsList.map(o => o.value).join('');
    if (!allValues) {
      callback();
      return false;
    }
    const arr = value.split('');
    let flag = true;
    arr.forEach(o => {
      if (allValues.indexOf(o) > -1) {
        flag = false;
      }
    });
    if (!flag) {
      callback(
        formatMessage({
          id: 'riskConfig.separatorValueError',
          defaultMessage: '参数分隔符不允许出现模板参数取值中已有的字符',
        })
      );
      return false;
    }
    callback();
  };

  handleSubmit = () => {
    const { paramsList } = this.state;
    const separator = this.checkFormValues();
    if (!paramsList.length) {
      message.warning(
        formatMessage({ id: 'riskConfig.noParamsWarning', defaultMessage: '请添加模板参数!' })
      );
      return false;
    }
    if (!separator) {
      return false;
    }
    const emptyList = paramsList.filter(o => !o.value);
    if (emptyList.length) {
      message.warning(
        formatMessage({
          id: 'riskConfig.emptyParamValueWarning',
          defaultMessage: '请填写完整模板参数取值',
        })
      );
      return false;
    }
    const { onOk, onCancel, templateData } = this.props;
    const templateParams = paramsList.map(o => o.value).join(separator);
    onOk({ ...templateData, templateParams, templateParamsSep: separator });
    onCancel();
  };

  render() {
    const {
      visible,
      onCancel,
      templateData,
      form: { getFieldDecorator },
    } = this.props;
    const { loading, paramsList, selectedRowKeys, previewResult } = this.state;
    const dataSource = paramsList.map((o, i) => ({
      ...o,
      index: i,
    }));
    return (
      <Modal
        destroyOnClose
        visible={visible}
        onCancel={onCancel}
        width={1000}
        onOk={this.handleSubmit}
        title={formatMessage({
          id: 'riskConfig.saveTemplateParams',
          defaultMessage: '模板参数录入',
        })}
      >
        <div>
          <Button
            ghost
            type="primary"
            style={{ margin: '0 0 24px 24px' }}
            onClick={this.handleAddParameter}
          >
            {formatMessage({ id: 'riskConfig.addParameter', defaultMessage: '新增参数' })}
          </Button>
          <Table
            rowKey="id"
            loading={loading}
            columns={this.getColumns()}
            dataSource={dataSource}
            pagination={false}
            rowSelection={{
              selectedRowKeys,
              onChange: keys => this.setState({ selectedRowKeys: keys }),
            }}
          />
          <Pagination
            showPagination={false}
            selectAllChange={this.handleAllChange}
            pageAllCount={dataSource.length}
            selectKeysList={selectedRowKeys}
            multiBtnList={[
              {
                text: formatMessage({ id: 'COMMON_DELETE', defaultMessage: '删除' }),
                loading,
                confirmText: formatMessage({ id: 'CONFIRM_DELETION', defaultMessage: '确认删除?' }),
                onClick: keys => this.handleDeleteParams(keys, true),
              },
            ]}
            PaginationComponent={
              <div className={styles.configParamsModalExplain}>
                {formatMessage({ id: 'riskConfig.parameterValueTip' })}
              </div>
            }
          />
          <Divider />
          <Form className={styles.configParamsModalBottomPart}>
            <div className={styles.left}>
              <span style={{ marginRight: 5 }}>
                {formatMessage({ id: 'riskConfig.paramSeparator', defaultMessage: '参数分隔符' })}
              </span>
              <Form.Item labelCol={{ span: 0 }} className={styles.formItem}>
                {getFieldDecorator('separator', {
                  rules: [
                    {
                      required: true,
                      message: formatMessage({
                        id: 'riskConfig.noSeparatorWarning',
                        defaultMessage: '请填写参数分隔符!',
                      }),
                    },
                    {
                      validator: this.checkSeparator,
                    },
                  ],
                  initialValue: templateData.templateParamsSep,
                })(
                  <Input
                    placeholder={formatMessage({
                      id: 'riskConfig.paramSeparator',
                      defaultMessage: '参数分隔符',
                    })}
                  />
                )}
              </Form.Item>
              <Button ghost type="primary" style={{ marginLeft: 5 }} onClick={this.handlePreview}>
                {formatMessage({ id: 'riskConfig.preview', defaultMessage: '预览' })}
              </Button>
            </div>
            <Input
              readOnly
              value={previewResult}
              className={styles.configParamsModalPreviewResult}
              placeholder={formatMessage({
                id: 'riskConfig.previewResult',
                defaultMessage: '预览信息',
              })}
            />
          </Form>
        </div>
      </Modal>
    );
  }
}
export default ConfigParamsModal;
