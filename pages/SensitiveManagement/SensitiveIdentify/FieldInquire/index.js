import React, { Component } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { Form, Table } from 'antd';
import { debounce } from 'lodash-decorators';
import moment from 'moment';
import QueryConditions from '@/pages/AuditManagement/components/queryConditions';
import { getToolTipColumns, getPageSize } from '@/utils/tableUtil';
import { checkLanguageIsEnglish } from '@/utils/utils';
import styles from './index.less';

@connect(({ fieldInquire, loading }) => ({ fieldInquire, loading: loading.models.fieldInquire }))
class FieldInquire extends Component {
  constructor(props) {
    super(props);
    this.state = {
      pageIndex: 1,
      pageSize: 10,
    };

    // 绑定this
    Object.keys(this.handles).forEach(fun => {
      this.handles[fun] = this.handles[fun].bind(this);
    }, this);

    const { dispatch } = props;
    dispatch({
      type: 'fieldInquire/qryDictionary',
    });
  }

  componentDidMount() {
    window.onresize = this.handleResize;
    this.handleResize();
  }

  componentWillUnmount() {
    window.onresize = null;
  }

  handles = {
    handleSubmit: (fieldsValue = {}) => {
      const { pageIndex, pageSize } = this.state;
      const { dispatch } = this.props;
      const { createDatetime, updateDatetime } = fieldsValue;
      if (createDatetime && createDatetime.length > 0) {
        fieldsValue.startCreateDatetime = createDatetime[0]
          ? createDatetime[0].format('YYYY-MM-DD HH:mm:ss')
          : '';
        fieldsValue.endCreateDatetime = createDatetime[1]
          ? createDatetime[1].format('YYYY-MM-DD HH:mm:ss')
          : '';
        delete fieldsValue.createDatetime;
      }
      if (updateDatetime && updateDatetime.length > 0) {
        fieldsValue.startUpdateDatetime = updateDatetime[0]
          ? updateDatetime[0].format('YYYY-MM-DD HH:mm:ss')
          : '';
        fieldsValue.endUpdateDatetime = updateDatetime[1]
          ? updateDatetime[1].format('YYYY-MM-DD HH:mm:ss')
          : '';
        delete fieldsValue.updateDatetime;
      }
      dispatch({
        type: 'fieldInquire/qrySensitiveField',
        payload: {
          ...fieldsValue,
          pageSize,
          pageIndex,
        },
      });
    },
    tableOnchangge: pagination => {
      const { current } = pagination;
      this.setState({ pageIndex: current }, () => {
        this.queryConditionsRef.searchBtnClick(this.handles.handleSubmit);
        // this.handles.handleSubmit();
      });
    },
  };

  searchBtnClick = () => {
    this.setState({ pageIndex: 1 }, () => {
      this.queryConditionsRef.searchBtnClick(this.handles.handleSubmit);
    });
  };

  resetBtnClick = () => {
    this.setState({ pageIndex: 1 }, () => {
      this.handles.handleSubmit();
      // this.handles.handleSubmit();
    });
  };

  config = () => {
    const {
      fieldInquire: { senseLevels, senseMeasures },
    } = this.props;
    return {
      searchArr: [
        {
          type: 'input',
          name: 'datasourceName',
          label: `${formatMessage({
            id: 'FieldInquire.BelongDatabase',
            defaultMessage: '所属数据库',
          })}`,
          colSpan: 6,
        },

        {
          type: 'input',
          name: 'objectName',
          label: `${formatMessage({ id: 'FieldInquire.BelongTable', defaultMessage: '所属表' })}`,
          colSpan: 6,
        },
        {
          type: 'input',
          name: 'fieldCode',
          label: `${formatMessage({ id: 'FieldInquire.FieldCode', defaultMessage: '字段编码' })}`,
          colSpan: 6,
        },

        {
          type: 'input',
          name: 'fieldName',
          label: `${formatMessage({ id: 'FieldInquire.FieldName', defaultMessage: '字段名称' })}`,
          colSpan: 6,
        },
        {
          type: 'select',
          name: 'defineType',
          label: `${formatMessage({
            id: 'FieldInquire.RecognitionMethods',
            defaultMessage: '识别方法',
          })}`,
          colSpan: 6,
          selArr: [
            {
              id: '1',
              name: `${formatMessage({
                id: 'FieldInquire.DefineManually',
                defaultMessage: '手动定义',
              })}`,
            },
            {
              id: '2',
              name: `${formatMessage({
                id: 'FieldInquire.AutomaticIdentification',
                defaultMessage: '自动识别',
              })}`,
            },
          ],
        },
        {
          type: 'select',
          name: 'state',
          label: `${formatMessage({
            id: 'FieldInquire.DesensitizationState',
            defaultMessage: '脱敏状态',
          })}`,
          colSpan: 6,
          selArr: [
            {
              id: '1',
              name: `${formatMessage({
                id: 'FieldInquire.NeedDesensitization',
                defaultMessage: '需要脱敏',
              })}`,
            },
            {
              id: '2',
              name: `${formatMessage({
                id: 'FieldInquire.NoDesensitizationRequired',
                defaultMessage: '不需要脱敏',
              })}`,
            },
          ],
        },
        {
          type: 'select',
          name: 'levelId',
          label: `${formatMessage({
            id: 'FieldInquire.SensitivityLevel',
            defaultMessage: '敏感级别',
          })}`,
          colSpan: 6,
          selArr: senseLevels,
        },
        {
          type: 'select',
          name: 'desensitizeId',
          label: `${formatMessage({
            id: 'FieldInquire.DesensitizationMeasures',
            defaultMessage: '脱敏措施',
          })}`,
          colSpan: 6,
          selArr: senseMeasures,
        },
        {
          type: 'rangePicker',
          name: 'createDatetime',
          label: `${formatMessage({ id: 'FieldInquire.CreateTime', defaultMessage: '创建时间' })}`,
          colSpan: 6,
        },
        {
          type: 'rangePicker',
          name: 'updateDatetime',
          label: `${formatMessage({ id: 'FieldInquire.UpdateTime', defaultMessage: '更新时间' })}`,
          colSpan: 6,
        },
        {
          type: 'button',
          // searchBtnClick: this.handles.handleSubmit,
          searchBtnClick: this.searchBtnClick,
          resetBtnClick: this.resetBtnClick,
          isExpand: true,
          colSpan: 12,
          handleResize: this.handleResize,
        },
      ],

      columns: [
        {
          title: `${formatMessage({
            id: 'FieldInquire.RecognitionMethods',
            defaultMessage: '识别方法',
          })}`,
          dataIndex: 'defineType',
          key: 'defineType',
          width: 200,
          render: v => {
            return v === '1'
              ? `${formatMessage({
                  id: 'FieldInquire.DefineManually',
                  defaultMessage: '手动定义',
                })}`
              : `${formatMessage({
                  id: 'FieldInquire.AutomaticIdentification',
                  defaultMessage: '自动识别',
                })}`;
          },
          sorter: ({ defineType: a }, { defineType: b }) => {
            return a - b;
          },
        },
        {
          title: `${formatMessage({
            id: 'FieldInquire.DesensitizationState',
            defaultMessage: '脱敏状态',
          })}`,
          dataIndex: 'state',
          key: 'state',
          width: 200,
          filters: [
            {
              text: `${formatMessage({
                id: 'FieldInquire.NeedDesensitization',
                defaultMessage: '需要脱敏',
              })}`,
              value: '1',
            },
            {
              text: `${formatMessage({
                id: 'FieldInquire.NoDesensitizationRequired',
                defaultMessage: '不需要脱敏',
              })}`,
              value: '2',
            },
          ],
          onFilter: (value, record) => record.state === value,
          render: v => {
            return v === '1'
              ? `${formatMessage({
                  id: 'FieldInquire.NeedDesensitization',
                  defaultMessage: '需要脱敏',
                })}`
              : v === '2'
              ? `${formatMessage({
                  id: 'FieldInquire.NoDesensitizationRequired',
                  defaultMessage: '不需要脱敏',
                })}`
              : '';
          },
        },
        {
          title: `${formatMessage({
            id: 'FieldInquire.ConfirmUserCode',
            defaultMessage: '确认用户编码',
          })}`,
          width: checkLanguageIsEnglish() ? 150 : 120,
          dataIndex: 'sysUserCode',
          key: 'sysUserCode',
        },
        {
          title: `${formatMessage({ id: 'FieldInquire.FieldCode', defaultMessage: '字段编码' })}`,
          width: 150,
          dataIndex: 'fieldCode',
          key: 'fieldCode',
        },
        {
          title: `${formatMessage({ id: 'FieldInquire.FieldName', defaultMessage: '字段名称' })}`,
          width: 150,
          dataIndex: 'fieldName',
          key: 'fieldName',
        },
        {
          title: `${formatMessage({
            id: 'FieldInquire.BelongDatabase',
            defaultMessage: '所属数据库',
          })}`,
          width: 150,
          dataIndex: 'datasourceName',
          key: 'datasourceName',
        },
        {
          title: `${formatMessage({ id: 'FieldInquire.BelongTable', defaultMessage: '所属表' })}`,
          width: 150,
          dataIndex: 'objectName',
          key: 'objectName',
        },
        {
          title: `${formatMessage({
            id: 'FieldInquire.SensitivityLevel',
            defaultMessage: '敏感级别',
          })}`,
          width: checkLanguageIsEnglish() ? 140 : 120,
          dataIndex: 'levelName',
          key: 'levelName',
          filters: senseLevels.map(({ name }) => {
            return { text: name, value: name };
          }),
          onFilter: (value, record) => record.levelName === value,
        },
        {
          title: `${formatMessage({
            id: 'FieldInquire.DesensitizationMeasures',
            defaultMessage: '脱敏措施',
          })}`,
          width: checkLanguageIsEnglish() ? 200 : 150,
          dataIndex: 'desensitizeName',
          key: 'desensitizeName',
          filters: senseMeasures.map(({ name }) => {
            return { text: name, value: name };
          }),
          onFilter: (value, record) => record.desensitizeName === value,
        },
        {
          title: `${formatMessage({ id: 'FieldInquire.CreateTime', defaultMessage: '创建时间' })}`,
          width: 150,
          dataIndex: 'createDatetime',
          key: 'createDatetime',
          sorter: ({ createDatetime: a }, { createDatetime: b }) => a - b,
          render: v => {
            return v ? moment(v).format('YYYY-MM-DD HH:mm:ss') : '';
          },
        },
        {
          title: `${formatMessage({ id: 'FieldInquire.UpdateTime', defaultMessage: '更新时间' })}`,
          width: 150,
          dataIndex: 'updateDatetime',
          key: 'updateDatetime',
          sorter: ({ updateDatetime: a }, { updateDatetime: b }) => a - b,
          render: v => {
            return v ? moment(v).format('YYYY-MM-DD HH:mm:ss') : '';
          },
        },
      ],
    };
  };

  @debounce(500)
  handleResize = () => {
    const {
      fieldInquire: { pageInfo },
    } = this.props;
    const { pageIndex = 1, total = 0 } = pageInfo;
    const pageSize = getPageSize(styles.tableWrapper);
    let newPageIndex = pageIndex;
    if (total) {
      const newPageCount = Math.floor((total - 1) / pageSize) + 1;
      if (newPageCount < newPageIndex) {
        newPageIndex = newPageCount;
      }
    }
    this.setState({ pageSize, pageIndex: newPageIndex }, () => {
      this.handles.handleSubmit();
    });
  };

  render() {
    const {
      fieldInquire: { lists, pageInfo },
      loading,
    } = this.props;
    const config = this.config();
    const { pageSize } = this.state;
    const pagination = { ...pageInfo, current: pageInfo.pageIndex };
    const _columns = getToolTipColumns(config.columns);
    let scrollY = pageSize * 54;
    if (this.tableWrapper) {
      scrollY = Math.max(250, this.tableWrapper.clientHeight - 51 - 64);
    }
    return (
      <div className={`${styles.view}`}>
        {/* <PageHeader */}
        {/*  titleText="敏感字段查询" */}
        {/*  getButtonNode={this.addBtn} */}
        {/*  style={{ margin: '0 16px' }} */}
        {/* /> */}
        <div className={styles.content}>
          <div className={styles.header}>
            <QueryConditions
              engEnvMinusColumn
              searchArr={config.searchArr}
              Ref={ref => {
                this.queryConditionsRef = ref;
              }}
            />
          </div>
          <div className={styles.center}>
            <div
              className={styles.tableWrapper}
              ref={ref => {
                this.tableWrapper = ref;
              }}
            >
              <Table
                dataSource={lists}
                pagination={{ ...pagination, disabled: loading }}
                columns={_columns}
                onChange={this.handles.tableOnchangge}
                scroll={{ x: '100%', y: scrollY, scrollToFirstRowOnChange: true }}
                className="ellipsis-table scroll-x-table"
                loading={loading}
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default Form.create()(FieldInquire);
