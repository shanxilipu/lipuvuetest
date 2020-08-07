import React, { Component } from 'react';
import { formatMessage } from 'umi/locale';
import { connect } from 'dva';
import { Table, message } from 'antd';
import Pagination from '@/components/Pagination';
import QueryConditions from '@/pages/AuditManagement/components/queryConditions';
import { extractSearchParams } from '@/utils/utils';

@connect(({ applySysAuthorize }) => ({ applySysAuthorize }))
class FieldModal extends Component {
  constructor(props) {
    super(props);
    this.searchParams = {};
    this.state = {
      loading: false,
      dataSource: [],
      pagination: {
        pageIndex: 1,
        pageSize: 5,
        total: 0,
      },
    };
    this.columns = [
      {
        title: `${formatMessage({
          id: 'ApplySysAuthorize.FieldCode',
          defaultMessage: '字段编码',
        })}`,
        dataIndex: 'fieldCode',
        key: 'fieldCode',
      },
      {
        title: `${formatMessage({
          id: 'ApplySysAuthorize.FieldName',
          defaultMessage: '字段名称',
        })}`,
        dataIndex: 'fieldName',
        key: 'fieldName',
      },
      {
        title: `${formatMessage({
          id: 'ApplySysAuthorize.DesensitizationState',
          defaultMessage: '脱敏状态',
        })}`,
        dataIndex: 'state',
        key: 'state',
        render: o => {
          switch (o) {
            case '1':
              return `${formatMessage({
                id: 'ApplySysAuthorize.NeedDesensitization',
                defaultMessage: '需要脱敏',
              })}`;
            case '2':
              return `${formatMessage({
                id: 'ApplySysAuthorize.NoDesensitizationRequired',
                defaultMessage: '不需要脱敏',
              })}`;
            default:
              return '';
          }
        },
      },
      {
        title: `${formatMessage({
          id: 'ApplySysAuthorize.SensitivityLevel',
          defaultMessage: '敏感级别',
        })}`,
        dataIndex: 'levelName',
        key: 'levelName',
      },
      {
        title: `${formatMessage({
          id: 'ApplySysAuthorize.DesensitizationMeasures',
          defaultMessage: '脱敏措施',
        })}`,
        dataIndex: 'desensitizeName',
        key: 'desensitizeName',
      },
    ];
    const { dispatch } = props;
    // 获取敏感级别,脱敏措施
    dispatch({
      type: 'applySysAuthorize/qrySpecialDictionary',
    });
  }

  componentDidMount() {
    const { selectedUserId } = this.props;
    if (selectedUserId) {
      this.getData();
    }
  }

  getData = (pageIndex = 1, pageSize = 5) => {
    const { dispatch, nodeRow, selectedUserId } = this.props;
    this.setState({ loading: true });
    dispatch({
      type: 'applySysAuthorize/queryAuthFields',
      payload: {
        appUserId: selectedUserId,
        dataobjectId: nodeRow.dataobjectId,
        pageIndex,
        pageSize,
        ...extractSearchParams(this.searchParams),
      },
    }).then(re => {
      this.setState({ loading: false });
      if (re && re.resultCode === '0') {
        this.setState({
          dataSource: re.resultObject.rows,
          pagination: re.resultObject.pageInfo,
        });
      } else {
        message.error(re.resultMsg);
      }
    });
  };

  // 表格分页
  onChange = pagination => {
    const { current, pageSize } = pagination;
    this.getData(current, pageSize);
  };

  search = fieldsValueObj => {
    this.searchParams = fieldsValueObj;
    this.getData();
  };

  // 关闭弹窗
  handleCancel = () => {
    const { handleCancel } = this.props;
    handleCancel();
  };

  searchArr = () => {
    const {
      applySysAuthorize: { senseLevels, senseMeasures },
    } = this.props;
    return [
      {
        type: 'input',
        name: 'fieldCode',
        label: `${formatMessage({
          id: 'ApplySysAuthorize.FieldCode',
          defaultMessage: '字段编码',
        })}`,
        colSpan: 8,
      },
      {
        type: 'select',
        name: 'state',
        label: `${formatMessage({
          id: 'ApplySysAuthorize.DesensitizationState',
          defaultMessage: '脱敏状态',
        })}`,
        colSpan: 8,
        selArr: [
          {
            id: '1',
            name: `${formatMessage({
              id: 'ApplySysAuthorize.NeedDesensitization',
              defaultMessage: '需要脱敏',
            })}`,
          },
          {
            id: '2',
            name: `${formatMessage({
              id: 'ApplySysAuthorize.NoDesensitizationRequired',
              defaultMessage: '不需要脱敏',
            })}`,
          },
        ],
      },
      {
        type: 'select',
        name: 'levelId',
        label: `${formatMessage({
          id: 'ApplySysAuthorize.SensitivityLevel',
          defaultMessage: '敏感级别',
        })}`,
        colSpan: 8,
        selArr: senseLevels,
      },
      {
        type: 'select',
        name: 'desensitizeId',
        label: `${formatMessage({
          id: 'ApplySysAuthorize.DesensitizationMeasures',
          defaultMessage: '脱敏措施',
        })}`,
        colSpan: 8,
        selArr: senseMeasures,
      },
      {
        type: 'button',
        searchBtnClick: this.search,
        colSpan: 16,
      },
    ];
  };

  render() {
    const {
      loading,
      dataSource,
      pagination: { pageIndex, pageSize, total },
    } = this.state;
    return (
      <div>
        <QueryConditions searchArr={this.searchArr()} loading={false} />
        <Table
          loading={loading}
          dataSource={dataSource}
          columns={this.columns}
          pagination={false}
          rowKey="LABEL_ID"
        />
        <Pagination
          pagination={{
            pageSize,
            total,
            current: pageIndex,
            onChange: this.getData,
            onShowSizeChange: this.getData,
          }}
        />
      </div>
    );
  }
}

export default FieldModal;
