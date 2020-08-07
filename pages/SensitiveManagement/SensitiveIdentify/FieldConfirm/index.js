import React, { Component, Fragment } from 'react';
import { connect } from 'dva';
import { formatMessage } from 'umi/locale';
import { Select, message, Popconfirm, Divider, Tooltip } from 'antd';
import { debounce } from 'lodash-decorators';
import moment from 'moment';
import MyIcon from '@/components/MyIcon';
import QueryConditions from '@/pages/AuditManagement/components/queryConditions';
import getLayoutPageSize from '@/utils/layoutUtils';
import SelTable from '@/pages/AuditManagement/components/SelTable';
import styles from './index.less';
import { checkLanguageIsEnglish } from '@/utils/utils';

@connect(({ fieldConfirm, loading }) => ({
  pageSize: fieldConfirm.pageSize,
  pageIndex: fieldConfirm.pageIndex,
  rows: fieldConfirm.rows,
  total: fieldConfirm.total,
  senseLevels: fieldConfirm.senseLevels,
  senseMeasures: fieldConfirm.senseMeasures,
  loading: !!loading.models.fieldConfirm,
}))
class FieldConfirm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedRowKeys: [],
      selectedRows: [],
      editRecord: {},
    };
    const { dispatch } = props;
    dispatch({
      type: 'fieldConfirm/qryDictionary',
    });
  }

  componentDidMount() {
    window.onresize = this.handleResize;
    const pageSize = this.getPageSize();
    this.getComponentList({ pageSize });
  }

  componentWillUnmount() {
    const { dispatch } = this.props;
    window.onresize = null;
    dispatch({
      type: 'fieldConfirm/clearState',
    });
  }

  @debounce(100)
  handleResize = () => {
    const { pageSize } = this.props;
    const nextSize = this.getPageSize();
    if (pageSize === nextSize) return;
    this.getComponentList({ pageSize: nextSize, pageIndex: 1 });
  };

  // 获取当前页面的列表条数
  getPageSize = () => {
    const conHeight = this.tableList.clientHeight;
    const params = {
      height: conHeight - 10 - 37 - 25 - 30,
      itemHeight: 43,
      minPageSize: 2,
      maxRowMargin: 0,
    };
    const { count } = getLayoutPageSize(params);
    return count || 2;
  };

  // 获取列表
  getComponentList = (payload = {}) => {
    const { dispatch } = this.props;
    dispatch({
      type: 'fieldConfirm/qrySensitiveField',
      payload,
    });
  };

  // 查询
  searchBtnClick = (val = {}) => {
    const {
      otherFilter = [],
      desensitizeIds,
      levelIds,
      fieldCode,
      fieldName,
      itemName,
      tableCode,
    } = val;
    const payload = {
      otherFilter,
      desensitizeIds,
      levelIds,
      fieldCode,
      fieldName,
      itemName,
      tableCode,
      pageIndex: 1,
    };
    this.getComponentList(payload);
  };

  // 重置
  resetBtnClick = () => {
    const payload = {
      otherFilter: [],
      desensitizeIds: '',
      levelIds: '',
      fieldCode: '',
      fieldName: '',
      itemName: '',
      tableCode: '',
      pageIndex: 1,
    };
    this.getComponentList(payload);
  };

  // 分页查询
  handleTableChange = (pageIndex, pageSize) => {
    const { pageSize: prePageSize } = this.props;
    const param = {
      pageIndex,
      pageSize,
    };
    if (prePageSize !== pageSize) {
      param.pageIndex = 1;
    }
    this.getComponentList(param);
  };

  getSel = (selectedRowKeys, selectedRows) => {
    this.setState({
      selectedRowKeys,
      selectedRows,
    });
  };

  deleteItem = record => {
    const { dispatch } = this.props;
    dispatch({
      type: 'fieldConfirm/deleteUnConfirmSensitiveField',
      payload: [{ id: record.id }],
    }).then((res = {}) => {
      const { resultCode } = res;
      if (resultCode === '0') {
        message.success(
          `${formatMessage({ id: 'COMMON_DELET_SUCCESS', defaultMessage: '删除成功！' })}`
        );
        this.getComponentList();
      }
    });
  };

  handleTableCellEdit = (record, key, val) => {
    const { editRecord } = this.state;
    editRecord[key] = val;
    this.setState({ editRecord });
  };

  handleTableRowSave = () => {
    const { editRecord } = this.state;
    const { dispatch } = this.props;
    const {
      datasourceId,
      dataobjectId,
      objectFieldId,
      levelId,
      desensitizeId,
      isCovert,
      defineType = '2',
      id,
      state,
    } = editRecord;
    dispatch({
      type: 'fieldConfirm/saveUnConfirmSensitiveField',
      payload: [
        {
          datasourceId,
          dataobjectId,
          objectFieldId,
          id,
          levelId,
          desensitizeId,
          isCovert,
          defineType,
          state,
        },
      ],
    }).then(res => {
      const { resultCode } = res;
      if (resultCode === '0') {
        this.setState({ editRecord: {} });
        this.getComponentList();
      }
    });
  };

  handleBacthDelete = () => {
    const { selectedRowKeys } = this.state;
    const { dispatch } = this.props;
    if (selectedRowKeys.length === 0) {
      message.info(
        `${formatMessage({ id: 'FieldConfirm.selectLineTip', defaultMessage: '请先选择行!' })}`
      );
      return;
    }
    dispatch({
      type: 'fieldConfirm/deleteUnConfirmSensitiveField',
      payload: selectedRowKeys.map(key => {
        return { id: key };
      }),
    }).then((res = {}) => {
      const { resultCode } = res;
      if (resultCode === '0') {
        message.success(
          `${formatMessage({ id: 'COMMON_DELET_SUCCESS', defaultMessage: '删除成功！' })}`
        );
        this.setState({
          selectedRowKeys: [],
          selectedRows: [],
        });
        this.getComponentList();
      }
    });
  };

  handleBactHandel = () => {
    const { selectedRows } = this.state;
    const { dispatch } = this.props;
    if (selectedRows.length === 0) {
      message.info(
        `${formatMessage({ id: 'FieldConfirm.selectLineTip', defaultMessage: '请先选择行!' })}`
      );
      return;
    }
    const params = selectedRows.map(item => {
      const {
        datasourceId,
        dataobjectId,
        objectFieldId,
        levelId,
        desensitizeId,
        isCovert,
        defineType = '2',
        id,
        state,
      } = item;
      return {
        datasourceId,
        dataobjectId,
        objectFieldId,
        levelId,
        desensitizeId,
        isCovert,
        defineType,
        id,
        state,
      };
    });

    dispatch({
      type: 'fieldConfirm/saveUnConfirmSensitiveField',
      payload: params,
    }).then(res => {
      const { resultCode } = res;
      if (resultCode === '0') {
        message.success(
          `${formatMessage({ id: 'FieldConfirm.ConfirmSuccess', defaultMessage: '确认成功！' })}`
        );
        this.setState({
          selectedRowKeys: [],
          selectedRows: [],
        });
        this.getComponentList();
      }
    });
  };

  config = () => {
    const { senseLevels, senseMeasures } = this.props;

    return [
      {
        title: formatMessage({ id: 'FieldInquire.FieldCode', defaultMessage: '字段编码' }),
        dataIndex: 'fieldCode',
        key: 'fieldCode',
        width: 150,
        className: 'model_table_ellipsis',
        sorter: (a, b) => a - b,
      },
      {
        title: `${formatMessage({ id: 'FieldInquire.FieldName', defaultMessage: '字段名称' })}`,
        dataIndex: 'fieldName',
        key: 'fieldName',
        width: 150,
        className: 'model_table_ellipsis',
      },
      {
        title: formatMessage({ id: 'FieldConfirm.SensitiveField', defaultMessage: '敏感字段' }),
        dataIndex: 'isSensitive',
        key: 'isSensitive',
        width: 120,
        className: 'model_table_ellipsis',
        render: val => {
          const text =
            val === '1'
              ? `${formatMessage({ id: 'COMMON_YES', defaultMessage: '是' })}`
              : val === '2'
              ? `${formatMessage({ id: 'COMMON_NO', defaultMessage: '否' })}`
              : '';
          return text;
        },
      },
      {
        title: `${formatMessage({
          id: 'FieldInquire.BelongDatabase',
          defaultMessage: '所属数据库',
        })}`,
        dataIndex: 'datasourceName',
        key: 'datasourceName',
        width: 150,
        className: 'model_table_ellipsis',
      },
      {
        title: `${formatMessage({ id: 'FieldConfirm.TableCode', defaultMessage: '表编码' })}`,
        dataIndex: 'objectCode',
        key: 'objectCode',
        width: 150,
        className: 'model_table_ellipsis',
      },
      {
        title: `${formatMessage({ id: 'FieldConfirm.EntryName', defaultMessage: '条目名称' })}`,
        dataIndex: 'itemName',
        key: 'itemName',
        width: 180,
        className: 'model_table_ellipsis',
      },
      {
        title: `${formatMessage({ id: 'FieldConfirm.ScanTime', defaultMessage: '扫描时间' })}`,
        dataIndex: 'createDatetime',
        key: 'createDatetime',
        width: 150,
        className: 'model_table_ellipsis',
        sorter: ({ createDatetime: a }, { createDatetime: b }) => a - b,
        // render: v => {
        //   return <div>{moment(new Date(v)).format('YYYY-MM-DD HH:mm:ss')}</div>;
        // },
        render: v => {
          return v ? moment(new Date(v)).format('YYYY-MM-DD HH:mm:ss') : '';
        },
      },
      {
        title: `${formatMessage({
          id: 'FieldInquire.SensitivityLevel',
          defaultMessage: '敏感级别',
        })}`,
        dataIndex: 'levelId',
        key: 'levelId',
        width: checkLanguageIsEnglish() ? 140 : 120,
        className: 'model_table_ellipsis',
        filters: senseLevels.map(({ name, id }) => {
          return { text: name, value: id };
        }),
        onFilter: (value, record) => record.levelName === value,
        render: (val, record) => {
          const { editRecord } = this.state;
          if (record.id === editRecord.id) {
            return (
              <Select
                value={editRecord.levelId}
                onChange={v => {
                  this.handleTableCellEdit(record, 'levelId', v);
                }}
                style={{ width: '100%' }}
              >
                {senseLevels.map(obj => {
                  return <Select.Option value={obj.id}>{obj.name}</Select.Option>;
                })}
              </Select>
            );
          }
          return (senseLevels.filter(o => o.id === val)[0] || {}).name || '';
        },
      },
      {
        title: `${formatMessage({
          id: 'FieldInquire.DesensitizationMeasures',
          defaultMessage: '脱敏措施',
        })}`,
        dataIndex: 'desensitizeId',
        key: 'desensitizeId',
        width: checkLanguageIsEnglish() ? 200 : 150,
        className: 'model_table_ellipsis',
        filters: senseMeasures.map(({ name, id }) => {
          return { text: name, value: id };
        }),
        onFilter: (value, record) => record.desensitizeId === value,
        render: (val, record) => {
          const { editRecord } = this.state;
          if (record.id === editRecord.id) {
            return (
              <Select
                value={editRecord.desensitizeId}
                onChange={v => {
                  this.handleTableCellEdit(record, 'desensitizeId', v);
                }}
                style={{ width: '100%' }}
              >
                {senseMeasures.map(obj => {
                  return <Select.Option value={obj.id}>{obj.name}</Select.Option>;
                })}
              </Select>
            );
          }
          return (senseMeasures.filter(o => o.id === val)[0] || {}).name || '';
        },
      },
      {
        title: `${formatMessage({ id: 'FieldConfirm.Cover', defaultMessage: '覆盖' })}`,
        dataIndex: 'isCovert',
        key: 'isCovert',
        width: 90,
        className: 'model_table_ellipsis',
        filters: [
          {
            text: `${formatMessage({ id: 'COMMON_YES', defaultMessage: '是' })}`,
            value: '1',
          },
          {
            text: `${formatMessage({ id: 'COMMON_NO', defaultMessage: '否' })}`,
            value: '2',
          },
        ],
        onFilter: (value, record) => record.name === value,
        render: (val, record) => {
          const { editRecord } = this.state;
          if (record.id === editRecord.id) {
            return (
              <Select
                value={editRecord.isCovert}
                onChange={v => {
                  this.handleTableCellEdit(record, 'isCovert', v);
                }}
                style={{ width: '100%' }}
              >
                <Select.Option value="1">
                  {formatMessage({ id: 'COMMON_YES', defaultMessage: '是' })}
                </Select.Option>
                <Select.Option value="2">
                  {formatMessage({ id: 'COMMON_NO', defaultMessage: '否' })}
                </Select.Option>
              </Select>
            );
          }
          // return <div>{val === '1' ? '是' : val === '2' ? '否' : ''}</div>;
          const text =
            val === '1'
              ? `${formatMessage({ id: 'COMMON_YES', defaultMessage: '是' })}`
              : val === '2'
              ? `${formatMessage({ id: 'COMMON_NO', defaultMessage: '否' })}`
              : '';
          return text;
        },
      },
      {
        title: `${formatMessage({ id: 'OPERATE', defaultMessage: '操作' })}`,
        key: 'operator',
        width: 150,
        fixed: 'right',
        render: record => {
          const { editRecord } = this.state;
          const isEditing = record.id === editRecord.id;
          return (
            <div>
              {isEditing ? (
                <Fragment>
                  <Tooltip title={formatMessage({ id: 'COMMON_CONFIRM', defaultMessage: '确认' })}>
                    <MyIcon
                      type="iconqueren"
                      style={{ marginRight: '5px' }}
                      className={styles.iconStyle}
                      onClick={() => {
                        this.handleTableRowSave();
                      }}
                    />
                  </Tooltip>
                  <Divider type="vertical" />
                  <Tooltip title={formatMessage({ id: 'COMMON_CANCEL', defaultMessage: '取消' })}>
                    <MyIcon
                      type="iconclose-circle"
                      style={{ marginLeft: '5px' }}
                      className={styles.iconStyle}
                      onClick={() => {
                        this.setState({
                          editRecord: {},
                        });
                      }}
                    />
                  </Tooltip>
                </Fragment>
              ) : (
                <Fragment>
                  <Tooltip title={formatMessage({ id: 'COMMON_EDIT', defaultMessage: '编辑' })}>
                    <MyIcon
                      type="iconbianji"
                      style={{ marginRight: '5px' }}
                      className={styles.iconStyle}
                      onClick={() => {
                        this.setState({
                          editRecord: { ...record },
                        });
                      }}
                    />
                  </Tooltip>
                  <Divider type="vertical" />
                  <Popconfirm
                    title={formatMessage({
                      id: 'COMMON_DELETE_TIP',
                      defaultMessage: '您确定要删除吗？',
                    })}
                    onConfirm={() => {
                      this.deleteItem(record);
                    }}
                  >
                    <Tooltip title={formatMessage({ id: 'COMMON_DELETE', defaultMessage: '删除' })}>
                      <MyIcon
                        type="iconshanchubeifenx"
                        style={{ marginLeft: '5px' }}
                        className={styles.iconStyle}
                      />
                    </Tooltip>
                  </Popconfirm>
                </Fragment>
              )}
            </div>
          );
        },
      },
    ];
  };

  render() {
    const { rows, total, pageIndex, pageSize, senseLevels, senseMeasures, loading } = this.props;
    const { selectedRows } = this.state;
    const data = {
      list: rows,
      pagination: {
        current: pageIndex,
        total,
        pageSize,
      },
    };

    const searchArr = [
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
        type: 'input',
        name: 'itemName',
        label: `${formatMessage({ id: 'FieldConfirm.EntryName', defaultMessage: '条目名称' })}`,
        colSpan: 6,
      },
      {
        type: 'input',
        name: 'tableCode',
        label: `${formatMessage({ id: 'FieldConfirm.TableCode', defaultMessage: '表编码' })}`,
        colSpan: 6,
      },
      {
        type: 'select',
        name: 'levelIds',
        label: `${formatMessage({
          id: 'FieldInquire.SensitivityLevel',
          defaultMessage: '敏感级别',
        })}`,
        colSpan: 6,
        selArr: senseLevels,
      },
      {
        type: 'select',
        name: 'desensitizeIds',
        label: `${formatMessage({
          id: 'FieldInquire.DesensitizationMeasures',
          defaultMessage: '脱敏措施',
        })}`,
        colSpan: 6,
        selArr: senseMeasures,
      },
      {
        type: 'select',
        name: 'otherFilter',
        label: `${formatMessage({
          id: 'FieldConfirm.CommonFiltering',
          defaultMessage: '常用过滤',
        })}`,
        colSpan: 6,
        defaultProps: { mode: 'multiple' },
        defaultValue: [],
        selArr: [
          {
            id: 'isNewest',
            name: `${formatMessage({
              id: 'FieldConfirm.ShowMostRecent',
              defaultMessage: '仅显示时间最近',
            })}`,
          },
          {
            id: 'isSensitive',
            name: `${formatMessage({
              id: 'FieldConfirm.LatestRecognition',
              defaultMessage: '仅显示最新识别',
            })}`,
          },
          {
            id: 'isCovert',
            name: `${formatMessage({
              id: 'FieldConfirm.OriginalSettings',
              defaultMessage: '仅显示不覆盖原设置',
            })}`,
          },
        ],
      },
      {
        type: 'button',
        searchBtnClick: this.searchBtnClick,
        resetBtnClick: this.resetBtnClick,
        colSpan: 6,
        isExpand: false,
        // handleResize: this.handleResize,
      },
    ];

    const btnArr = [
      {
        name: `${formatMessage({ id: 'COMMON_DELETE', defaultMessage: '删除' })}`,
        methed: this.handleBacthDelete,
      },
      {
        name: `${formatMessage({ id: 'COMMON_CONFIRM', defaultMessage: '确认' })}`,
        methed: this.handleBactHandel,
      },
    ];

    return (
      <div className={`${styles.indexCon} smartsafeCon`}>
        <QueryConditions engEnvMinusColumn searchArr={searchArr} />
        <div
          className={styles.tableCon}
          ref={c => {
            this.tableList = c;
          }}
        >
          <SelTable
            scrollX
            tooltipTitle
            tooltipCell
            data={data}
            primaryKey="id"
            onChange={this.handleTableChange}
            onGetSel={this.getSel}
            columns={this.config()}
            initVlaue={selectedRows}
            btnArr={btnArr}
            isLoading={loading}
          />
        </div>
      </div>
    );
  }
}

export default FieldConfirm;
