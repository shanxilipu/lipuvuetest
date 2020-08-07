import React, { Component } from 'react';
import { formatMessage } from 'umi/locale';
import { Button, Collapse, Table, Select, Col, Popconfirm, message } from 'antd';
import MyIcon from '@/components/MyIcon';
import WatermarkTemplateModal from './WatermarkTemplateModal';
import QueryConditions from '@/pages/AuditManagement/components/queryConditions';
import {
  getWatermarkTemplates,
  deleteWatermarkTemplate,
  getAllWatermarkFields,
  setDefaultSafeFileWatermarkTemplate,
} from '@/services/sensitiveManagement/waterMarkConfig';
import { defaultHandleResponse, extractSearchParams, checkLanguageIsEnglish } from '@/utils/utils';
import styles from './index.less';

const { Panel } = Collapse;

class ExportWatermarkConfig extends Component {
  constructor(props) {
    super(props);
    this.state = {
      allFields: [], // 全部字段，用于回显"展示字段"，以及新增/编辑模板的字段选项列表
      templatesLoading: false,
      setDefaultTemplateLoading: false,
      allWatermarkTemplates: [], // 用于系统默认水印配置中的下拉选项
      waterMarkTemplates: [], // 用于水印模板设置中的table的datasource，一开始与allWatermarkTemplates一致，搜索后不一致
      waterMarkTemplatesPageInfo: { pageIndex: 1, pageSize: 5, total: 0 }, // waterMarkTemplates表格的分页
      defaultTemplateId: undefined, // 当前下拉选中的模板
      showModal: false,
    };
    this.currentTemplate = {};
    this.searchParams = {};
    this.searchArr = [
      {
        type: 'input',
        name: 'templateCode',
        label: `${formatMessage({
          id: 'ExportWatermarkConfig.TemplateCode',
          defaultMessage: '模板编码',
        })}`,
        colSpan: 6,
      },
      {
        type: 'input',
        name: 'templateName',
        label: `${formatMessage({
          id: 'ExportWatermarkConfig.TemplateName',
          defaultMessage: '模板名称',
        })}`,
        colSpan: 6,
      },
      {
        type: 'button',
        searchBtnClick: this.handleSearch,
        resetBtnClick: () => this.handleSearch({}),
        colSpan: 6,
        left: true,
      },
    ];
    this.waterMarkConfigColumns = [
      {
        title: `${formatMessage({
          id: 'ExportWatermarkConfig.TemplateCode',
          defaultMessage: '模板编码',
        })}`,
        dataIndex: 'templateCode',
        key: 'templateCode',
        width: '25%',
      },
      {
        title: `${formatMessage({
          id: 'ExportWatermarkConfig.TemplateName',
          defaultMessage: '模板名称',
        })}`,
        dataIndex: 'templateName',
        key: 'templateName',
        width: '60%',
      },
      {
        title: `${formatMessage({ id: 'OPERATE', defaultMessage: '操作' })}`,
        dataIndex: 'operation',
        key: 'operation',
        width: '15%',
        render: (text, record) => {
          return (
            <div>
              <MyIcon
                type="iconbianjix"
                title={formatMessage({ id: 'COMMON_EDIT', defaultMessage: '编辑' })}
                className={styles.operaBtn}
                onClick={() => this.handleEditTemplate(record)}
              />
              <Popconfirm
                title={formatMessage({
                  id: 'COMMON_DELETE_TIP',
                  defaultMessage: '您确定要删除吗？',
                })}
                onConfirm={() => this.deleteWatermarkTemplate(record.id)}
                okText={formatMessage({ id: 'COMMON_OK', defaultMessage: '确定' })}
                cancelText={formatMessage({ id: 'COMMON_CANCEL', defaultMessage: '取消' })}
              >
                <MyIcon
                  type="iconshanchubeifenx"
                  title={formatMessage({ id: 'COMMON_DELETE', defaultMessage: '删除' })}
                  className={styles.operaBtn}
                />
              </Popconfirm>
            </div>
          );
        },
      },
    ];
  }

  getTemplateFieldsColumns = () => {
    const { allFields } = this.state;
    return [
      {
        title: formatMessage({ id: 'ExportWatermarkConfig.ShowField', defaultMessage: '展示字段' }),
        dataIndex: 'fieldName',
        width: '40%',
        render: (t, record) => {
          const { fieldId } = record;
          const field = allFields.find(o => `${o.id}` === `${fieldId}`) || {};
          return field[checkLanguageIsEnglish() ? 'enUsNote' : 'zhCnNote'] || '';
        },
      },
      {
        title: formatMessage({ id: 'ExportWatermarkConfig.Value', defaultMessage: '取值' }),
        dataIndex: 'templateName',
        width: '60%',
      },
    ];
  };

  componentDidMount() {
    this.getAllWatermarkTemplates();
    this.getAllWatermarkFields();
  }

  getAllWatermarkTemplates = callback => {
    this.setState({ templatesLoading: true });
    getWatermarkTemplates({ pageIndex: 1, pageSize: 99999999 }).then(response => {
      this.setState({ templatesLoading: false });
      defaultHandleResponse(response, (resultObject = {}) => {
        let defaultTemplateId;
        const { rows = [] } = resultObject;
        for (let i = 0; i < rows.length; i++) {
          const temp = rows[i];
          if (`${temp.defaultState}` === '1') {
            defaultTemplateId = temp.id;
            break;
          }
        }
        this.setState({ defaultTemplateId, allWatermarkTemplates: rows.slice() }, () => {
          if (callback) {
            callback();
          } else {
            this.getShowingWatermarkTemplates();
          }
        });
      });
    });
  };

  getAllWatermarkFields = () => {
    getAllWatermarkFields({}).then(response => {
      defaultHandleResponse(response, (allFields = []) => {
        this.setState({ allFields });
      });
    });
  };

  handleSearch = params => {
    this.searchParams = extractSearchParams(params);
    this.getShowingWatermarkTemplates();
  };

  getShowingWatermarkTemplates = (pageIndex = 1, pageSize = 5) => {
    const { searchParams } = this;
    const { allWatermarkTemplates } = this.state;
    const searchKeys = Object.keys(searchParams);
    let waterMarkTemplates = [...allWatermarkTemplates];
    if (searchKeys.length) {
      waterMarkTemplates = allWatermarkTemplates.filter(temp => {
        let bool = true;
        searchKeys.forEach(k => {
          if (temp[k].toLowerCase().indexOf(searchParams[k].toLowerCase()) === -1) {
            bool = false;
          }
        });
        return bool;
      });
    }
    const waterMarkTemplatesPageInfo = { pageIndex, pageSize, total: waterMarkTemplates.length };
    this.setState({
      waterMarkTemplates,
      waterMarkTemplatesPageInfo,
    });
  };

  getCurrentSelectedTemplateFields = () => {
    const { defaultTemplateId, allWatermarkTemplates } = this.state;
    const temp = allWatermarkTemplates.find(o => o.id === defaultTemplateId);
    if (temp) {
      return temp.fieldList || [];
    }
    return [];
  };

  handleEditTemplate = (template = {}) => {
    this.currentTemplate = template;
    this.setState({ showModal: true });
  };

  deleteWatermarkTemplate = id => {
    this.setState({ templatesLoading: true });
    deleteWatermarkTemplate([id]).then(response => {
      defaultHandleResponse(
        response,
        () => {
          message.success(
            formatMessage({ id: 'COMMON_DELET_SUCCESS', defaultMessage: '删除成功' })
          );
          this.getAllWatermarkTemplates();
        },
        () => {
          this.setState({ templatesLoading: false });
        }
      );
    });
  };

  /**
   * 设置默认水印模板
   */
  setDefaultWatermarkTemplate = () => {
    const { defaultTemplateId } = this.state;
    this.setState({ setDefaultTemplateLoading: true });
    setDefaultSafeFileWatermarkTemplate({ string: true, value: defaultTemplateId }).then(result => {
      this.setState({ setDefaultTemplateLoading: false });
      defaultHandleResponse(result, () => {
        message.success(
          formatMessage({
            id: 'ExportWatermarkConfig.SettingDefaultTemplateSucceeded',
            defaultMessage: '设置默认模板成功',
          })
        );
      });
    });
  };

  addConfigBtn = () => {
    return (
      <Col span={6} key="addConfig">
        <div style={{ float: 'right' }}>
          <Button icon="plus" type="primary" onClick={() => this.handleEditTemplate()}>
            {formatMessage({ id: 'ExportWatermarkConfig.AddTemplate', defaultMessage: '新增模板' })}
          </Button>
        </div>
      </Col>
    );
  };

  handlePageChange = pagination => {
    const { waterMarkTemplatesPageInfo } = this.state;
    const { current, pageSize } = pagination;
    this.setState({
      waterMarkTemplatesPageInfo: { ...waterMarkTemplatesPageInfo, pageSize, pageIndex: current },
    });
  };

  handleSaveTemplateSuccess = () => {
    const { currentTemplate } = this;
    this.getAllWatermarkTemplates(() => {
      const {
        waterMarkTemplatesPageInfo: { pageIndex, pageSize },
      } = this.state;
      this.getShowingWatermarkTemplates(currentTemplate.id ? pageIndex : 1, pageSize);
    });
  };

  render() {
    const {
      showModal,
      allFields,
      allWatermarkTemplates,
      waterMarkTemplates,
      defaultTemplateId,
      templatesLoading,
      setDefaultTemplateLoading,
      waterMarkTemplatesPageInfo,
    } = this.state;
    const { pageIndex, pageSize, total } = waterMarkTemplatesPageInfo;
    const dataSource = waterMarkTemplates.slice((pageIndex - 1) * pageSize, pageSize);
    return (
      <div className={styles.indexCon}>
        <Collapse
          className={styles.collBorder}
          defaultActiveKey={['1', '2']}
          bordered={false}
          expandIconPosition="right"
          expandIcon={({ isActive }) => {
            return (
              <div>
                <span className={styles.collTitle}>
                  {isActive
                    ? `${formatMessage({ id: 'BTN_UNEXPAND', defaultMessage: '收起' })}`
                    : `${formatMessage({ id: 'BTN_EXPAND', defaultMessage: '展开' })}`}
                </span>
                <MyIcon
                  type="iconjiantou1"
                  className={styles.collIcon}
                  rotate={isActive ? 0 : 180}
                />
              </div>
            );
          }}
        >
          <Panel
            header={formatMessage({
              id: 'ExportWatermarkConfig.SystemDefaultWaterMark',
              defaultMessage: '系统默认水印',
            })}
            key="1"
          >
            <div className={styles.exportPanel}>
              <div className={styles.titleCon}>
                <span className={styles.titleFont}>
                  {formatMessage({
                    id: 'ExportWatermarkConfig.WatermarkTemplateShowField',
                    defaultMessage: '水印模板字段',
                  })}
                </span>
                <div className={styles.btnCon}>
                  <label>
                    {formatMessage({
                      id: 'ExportWatermarkConfig.DefaultWatermarkConfig',
                      defaultMessage: '默认水印设置',
                    })}
                    ：
                  </label>
                  <Select
                    style={{ width: '40%' }}
                    value={defaultTemplateId}
                    dropdownMatchSelectWidth={false}
                    onChange={value => this.setState({ defaultTemplateId: value })}
                    placeholder={formatMessage({
                      id: 'COMMON_SELECT_ICON',
                      defaultMessage: '请选择',
                    })}
                  >
                    {allWatermarkTemplates.map(o => (
                      <Select.Option key={o.id} value={o.id}>
                        {o.templateName}
                      </Select.Option>
                    ))}
                  </Select>
                  <Button
                    type="primary"
                    disabled={!defaultTemplateId}
                    loading={setDefaultTemplateLoading}
                    onClick={this.setDefaultWatermarkTemplate}
                  >
                    {formatMessage({ id: 'COMMON_OK', defaultMessage: '确定' })}
                  </Button>
                </div>
              </div>
              <Table
                rowKey="id"
                scroll={{ y: 240 }}
                columns={this.getTemplateFieldsColumns()}
                dataSource={this.getCurrentSelectedTemplateFields()}
              />
            </div>
          </Panel>
        </Collapse>
        <Collapse
          className={styles.alarmSMSCon}
          defaultActiveKey={['1']}
          bordered={false}
          expandIconPosition="right"
          expandIcon={({ isActive }) => {
            return (
              <div>
                <span className={styles.collTitle}>
                  {isActive
                    ? `${formatMessage({ id: 'BTN_UNEXPAND', defaultMessage: '收起' })}`
                    : `${formatMessage({ id: 'BTN_EXPAND', defaultMessage: '展开' })}`}
                </span>
                <MyIcon
                  type="iconjiantou1"
                  className={styles.collIcon}
                  rotate={isActive ? 0 : 180}
                />
              </div>
            );
          }}
        >
          <Panel
            header={formatMessage({
              id: 'ExportWatermarkConfig.WatermarkTemplateConfig',
              defaultMessage: '水印模板配置',
            })}
            key="1"
          >
            <QueryConditions searchArr={this.searchArr} getButtonNode={this.addConfigBtn} />
            <Table
              rowKey="id"
              loading={templatesLoading}
              columns={this.waterMarkConfigColumns}
              dataSource={dataSource}
              className="components-table-demo-nested"
              onChange={this.handlePageChange}
              pagination={{
                total,
                pageSize,
                current: pageIndex,
              }}
              expandedRowRender={record => (
                <Table
                  rowKey="id"
                  dataSource={record.fieldList || []}
                  columns={this.getTemplateFieldsColumns()}
                />
              )}
              // scroll={{ y: 240 }}
            />
          </Panel>
        </Collapse>
        <WatermarkTemplateModal
          visible={showModal}
          allFields={allFields}
          template={{ ...this.currentTemplate }}
          onOk={this.handleSaveTemplateSuccess}
          onCancel={() => this.setState({ showModal: false })}
        />
      </div>
    );
  }
}

export default ExportWatermarkConfig;
