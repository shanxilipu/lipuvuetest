import React, { Component } from 'react';
import { Modal, Spin, message, Form, Row, Col, Input, Button } from 'antd';
import { formatMessage } from 'umi/locale';
import EditableFormTable from '../EditableFormTable';
import { getAllEntities } from '../services';

const formItemLayout = {
  labelCol: {
    xs: { span: 24 },
    sm: { span: 8 },
  },
  wrapperCol: {
    xs: { span: 24 },
    sm: { span: 16 },
  },
};

@Form.create()
class EntitiesModal extends Component {
  searchParams = {};

  state = {
    loading: false,
    pageIndex: 1,
    dataSource: {},
    selectedRow: null,
  };

  columns = [
    {
      title: formatMessage({ id: 'COMMON_NAME' }),
      key: 'wordCnName',
      dataIndex: 'wordCnName',
      editable: true,
    },
    {
      title: formatMessage({ id: 'COMMON_CODE' }),
      key: 'wordEnName',
      dataIndex: 'wordEnName',
      editable: true,
    },
    {
      title: formatMessage({ id: 'BUSINESS_PRIMARY_KEY' }),
      key: 'columnName',
      dataIndex: 'columnName',
    },
  ];

  componentDidMount() {
    this.getAllEntities();
  }

  getAllEntities = pageIndex => {
    if (!pageIndex) {
      ({ pageIndex } = this.state);
    }
    const payload = {
      ...this.searchParams,
      pageIndex,
      pageSize: 5,
    };
    this.setState({ loading: true });
    getAllEntities(payload).then(result => {
      const { resultCode, resultMsg, resultObject } = result;
      if (resultCode === '0') {
        this.setState({ dataSource: resultObject, loading: false, pageIndex });
      } else {
        this.setState({ loading: false });
        message.error(resultMsg);
      }
    });
  };

  handleSubmitSearch = () => {
    const { form } = this.props;
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        this.searchParams = { ...values };
        this.getAllEntities(1);
      }
    });
  };

  onSelectEntity = (selectedRowKeys, selectedRows) => {
    this.setState({ selectedRow: selectedRows[0] });
  };

  handleOk = () => {
    const { selectedRow } = this.state;
    if (!selectedRow) {
      return false;
    }
    const { onConfirm } = this.props;
    onConfirm(selectedRow);
  };

  render() {
    const { loading, dataSource, pageIndex, selectedRow } = this.state;
    const { rows: data = [], pageInfo: { total } = {} } = dataSource;
    const tableProps = {
      columns: this.columns,
      data,
      pagination: {
        current: pageIndex,
        onChange: this.getAllEntities,
        total,
        pageSize: 5,
      },
      rowKey: 'businessId',
      rowSelection: {
        type: 'radio',
        onChange: this.onSelectEntity,
      },
    };
    const {
      form: { getFieldDecorator },
      ...modalProps
    } = this.props;
    return (
      <Modal
        {...modalProps}
        onOk={this.handleOk}
        width={1000}
        title={formatMessage({ id: 'SELECT_ENTITY' })}
        okButtonProps={{ disabled: !selectedRow }}
      >
        <Spin spinning={loading}>
          <Form {...formItemLayout}>
            <Row>
              <Col xs={12} md={8}>
                <Form.Item label={formatMessage({ id: 'COMMON_NAME' })}>
                  {getFieldDecorator('wordCnName')(
                    <Input placeholder={formatMessage({ id: 'COMMON_NAME' })} />
                  )}
                </Form.Item>
              </Col>
              <Col xs={12} md={8}>
                <Form.Item label={formatMessage({ id: 'COMMON_CODE' })}>
                  {getFieldDecorator('wordEnName')(
                    <Input placeholder={formatMessage({ id: 'COMMON_CODE' })} />
                  )}
                </Form.Item>
              </Col>
              <Col xs={24} md={8} style={{ textAlign: 'right' }}>
                <Button
                  type="primary"
                  style={{ padding: '0 8px' }}
                  onClick={this.handleSubmitSearch}
                >
                  {formatMessage({ id: 'BTN_SEARCH' })}
                </Button>
                {/* <Button type="primary" style={{ padding: '0 8px', marginLeft: 5 }}> */}
                {/*  {formatMessage({ id: 'BUTTON_ADD' })} */}
                {/* </Button> */}
              </Col>
            </Row>
          </Form>
          <EditableFormTable {...tableProps} />
        </Spin>
      </Modal>
    );
  }
}
export default EntitiesModal;
