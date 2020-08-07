import React, { Component } from 'react';
import { formatMessage } from 'umi/locale';
import { Form, Row, Col, Input, DatePicker, Button, Spin, message } from 'antd';
import {
  getDataExportList,
  getSensitiveFieldDetail,
  deleteDataExport,
} from '@/services/DataManagement/dataDownload';
import MyIcon from '@/components/MyIcon';
import Pagination from '@/components/Pagination';
import DataExportFile from './components/DataExportFile';
import { downloadFile, defaultHandleResponse } from '@/utils/utils';
import styles from './DataDownload.less';

const FormItem = Form.Item;
const { RangePicker } = DatePicker;

@Form.create()
class DataDownload extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      activeFileId: null,
      checkedFileIds: [],
      sensitiveFields: null,
      exportFileList: { rows: [], pageInfo: { pageIndex: 1, pageSize: 10, total: 0 } },
    };
    this.searchParams = {};
  }

  handleReset = () => {
    const { form } = this.props;
    form.resetFields();
    this.searchParams = {};
    this.getDataExportList();
  };

  componentDidMount() {
    this.getDataExportList();
  }

  handleSubmitSearch = () => {
    const { form } = this.props;
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const params = { ...values };
        if (params.rangeTimePicker) {
          const { rangeTimePicker } = params;
          for (let i = 0; i < rangeTimePicker.length; i++) {
            const name = i === 0 ? 'requestDatetimeStart' : 'requestDatetimeEnd';
            params[name] = rangeTimePicker[i].format('YYYY-MM-DD HH:mm:ss');
          }
        }
        delete params.rangeTimePicker;
        this.searchParams = params;
        this.getDataExportList();
      }
    });
  };

  getDataExportList = (pageIndex = 1, pageSize = 10) => {
    const params = { pageIndex, pageSize };
    this.setState({
      activeFileId: null,
      checkedFileIds: [],
      loading: true,
      sensitiveFields: null,
    });
    getDataExportList({
      ...params,
      ...this.searchParams,
    }).then(response => {
      this.setState({ loading: false });
      defaultHandleResponse(response, (exportFileList = {}) => {
        this.setState({ exportFileList });
      });
    });
  };

  getSensitiveFieldDetail = dataDownId => {
    this.setState({ loading: true });
    getSensitiveFieldDetail({
      dataDownId,
      pageIndex: 1,
      pageSize: 1000000,
    }).then(result => {
      let sensitiveFields = null;
      if (result) {
        const { resultCode, resultMsg, resultObject } = result;
        if (resultCode === '0') {
          sensitiveFields = resultObject.rows;
        } else {
          message.error(resultMsg);
        }
      }
      this.setState({ sensitiveFields, loading: false });
    });
  };

  handleFileClick = (activeFileId, hasData) => {
    const { activeFileId: oldId } = this.state;
    if (oldId !== activeFileId) {
      if (!hasData) {
        this.getSensitiveFieldDetail(activeFileId);
      }
      this.setState({ activeFileId, sensitiveFields: null });
    }
  };

  handleCheckFile = (id, checked) => {
    const { checkedFileIds } = this.state;
    const ids = checkedFileIds.slice();
    if (checked) {
      if (!ids.includes(id)) {
        ids.push(id);
      }
    } else {
      const index = ids.indexOf(id);
      if (index > -1) {
        ids.splice(index, 1);
      }
    }
    this.setState({ checkedFileIds: ids });
  };

  handleCheckAll = checked => {
    if (!checked) {
      this.setState({ checkedFileIds: [] });
      return false;
    }
    const {
      exportFileList: { rows },
    } = this.state;
    const checkedFileIds = rows.map(row => row.id);
    this.setState({ checkedFileIds });
  };

  deleteFiles = id => {
    let ids = [];
    if (!id) {
      const { checkedFileIds } = this.state;
      if (checkedFileIds.length === 0) {
        return false;
      }
      ids = checkedFileIds.slice();
    } else {
      ids.push(id);
    }
    this.setState({ loading: true });
    deleteDataExport(ids).then(response => {
      this.setState({ loading: false });
      defaultHandleResponse(response, () => {
        message.success(formatMessage({ id: 'REQUEST_204' }));
        const {
          exportFileList: {
            rows,
            pageInfo: { pageIndex, pageSize },
          },
        } = this.state;
        const newPageIndex = rows.length === ids.length ? Math.max(1, pageIndex - 1) : pageIndex;
        this.getDataExportList(newPageIndex, pageSize);
      });
    });
  };

  downloadData = id => {
    downloadFile('smartsafe/SafeDataExportController/downloadDataExportFile', { id }, 'GET');
  };

  render() {
    const {
      form: { getFieldDecorator },
    } = this.props;
    const noLabelProps = { labelCol: { span: 1 }, wrapperCol: { span: 23 } };
    const {
      loading,
      activeFileId,
      checkedFileIds,
      sensitiveFields,
      exportFileList: {
        rows,
        pageInfo: { total, pageIndex, pageSize },
      },
    } = this.state;
    const pagination = {
      total,
      pageSize,
      current: pageIndex,
      onChange: this.getDataExportList,
      onShowSizeChange: this.getDataExportList,
    };
    const exportFileList = rows || [];
    return (
      <Spin spinning={loading} wrapperClassName="full-height-spin">
        <Row className={styles.exportFileSearchBar}>
          {/* <Col xs={24} sm={4}> */}
          {/*  <span style={{ lineHeight: '40px', fontSize: 16, fontWeight: 'bold' }}> */}
          {/*    {formatMessage({ id: 'DATA_DOWNLOAD' })} */}
          {/*  </span> */}
          {/* </Col> */}
          <Col xs={24} sm={20}>
            <Form>
              <Row>
                <Col xs={24} sm={12} md={8}>
                  <FormItem
                    label={formatMessage({ id: 'DATA_FILE_NAME' })}
                    labelCol={{ span: 10 }}
                    wrapperCol={{ span: 14 }}
                  >
                    {getFieldDecorator('fileName')(
                      <Input placeholder={formatMessage({ id: 'DATA_FILE_NAME' })} />
                    )}
                  </FormItem>
                </Col>
                <Col xs={24} sm={12} md={10}>
                  <FormItem
                    label={formatMessage({ id: 'REQUEST_DATE' })}
                    labelCol={{ span: 8 }}
                    wrapperCol={{ span: 16 }}
                  >
                    {getFieldDecorator('rangeTimePicker')(
                      <RangePicker
                        showTime={true}
                        format="YYYY-MM-DD HH:mm:ss"
                        style={{ width: '100%' }}
                        suffixIcon={<MyIcon type="iconriqix" />}
                      />
                    )}
                  </FormItem>
                </Col>
                <Col xs={24} sm={12} md={6} style={{ textAlign: 'right' }}>
                  <FormItem {...noLabelProps}>
                    <Button
                      type="primary"
                      style={{ padding: '0 30px' }}
                      onClick={this.handleSubmitSearch}
                    >
                      {formatMessage({ id: 'BTN_SEARCH' })}
                    </Button>
                    <Button
                      style={{ padding: '0 30px', marginLeft: 10 }}
                      onClick={this.handleReset}
                    >
                      {formatMessage({ id: 'BTN_RESET' })}
                    </Button>
                  </FormItem>
                </Col>
              </Row>
            </Form>
          </Col>
        </Row>
        <div className={styles.filesCon}>
          {exportFileList.map(file => (
            <DataExportFile
              handleClick={this.handleFileClick}
              file={file}
              activeFileId={activeFileId}
              checkedFileIds={checkedFileIds}
              handleCheckFile={this.handleCheckFile}
              sensitiveFields={file.id === activeFileId ? sensitiveFields : null}
              handleDeleteFile={this.deleteFiles}
              handleDownloadFile={this.downloadData}
            />
          ))}
        </div>
        <Pagination
          className={styles.bottomPagination}
          pageAllCount={exportFileList.length}
          pagination={pagination}
          selectKeysList={checkedFileIds}
          selectAllChange={e => this.handleCheckAll(e.target.checked)}
          multiBtnList={[
            {
              text: formatMessage({ id: 'COMMON_DELETE', defaultMessage: '删除' }),
              confirmText: formatMessage({ id: 'CONFIRM_DELETION', defaultMessage: '确认删除' }),
              onClick: () => this.deleteFiles(),
            },
          ]}
        />
      </Spin>
    );
  }
}
export default DataDownload;
