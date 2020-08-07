import React, { PureComponent } from 'react';
import { Modal, Table, Button, message } from 'antd';
import { formatMessage } from 'umi/locale';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { getTableInfo, getDbFields } from '../services';
import { getFieldColumnsBySchemaType } from '../constant';
import { isMysqlOrOracleTable } from '../tools/utils';
import { defaultHandleResponse } from '@/utils/utils';

class PropertyModal extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      fields: [],
      selectedFields: [],
    };
  }

  componentDidUpdate(prevProps) {
    const { visible } = this.props;
    if (visible && !prevProps.visible) {
      this.getFields();
    }
    if (!visible && prevProps.visible) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ loading: false, fields: [], selectedFields: [] });
    }
  }

  handleResult = (result, objName) => {
    defaultHandleResponse(result, (resultObject = {}) => {
      this.setState({ fields: resultObject[objName] });
    });
  };

  getFields = () => {
    const { tableId, schemaType } = this.props;
    const payload = { schemaType, tableId };
    this.setState({ loading: true });
    if (isMysqlOrOracleTable(schemaType)) {
      getDbFields({ ...payload, getAllData: true }).then(result => {
        this.setState({ loading: false });
        this.handleResult(result, 'rows');
      });
    } else {
      getTableInfo(payload).then(result => {
        this.setState({ loading: false });
        this.handleResult(result, 'columnList');
      });
    }
  };

  render() {
    const { selectedFields, loading, fields } = this.state;
    const { onCancel, schemaType, visible, columns } = this.props;
    let rowKey = 'id';
    let fieldCodeKey = 'code';
    if (!isMysqlOrOracleTable(schemaType)) {
      rowKey = 'columnId';
      fieldCodeKey = 'columnCode';
    }
    const selectedFieldCodes = selectedFields.map(field => field[fieldCodeKey]).join(', ');
    const _columns = columns.slice();
    getFieldColumnsBySchemaType(_columns, schemaType);
    return (
      <Modal
        destroyOnClose
        visible={visible}
        width={Math.floor(window.innerWidth * 0.8)}
        title={formatMessage({ id: 'FIELD_INFORMATION' })}
        footer={null}
        onCancel={onCancel}
      >
        <Table
          loading={loading}
          rowKey={rowKey}
          columns={_columns}
          dataSource={fields}
          pagination={false}
          rowSelection={{
            onChange: (selectedRowKeys, selectedRows) => {
              this.setState({ selectedFields: selectedRows });
            },
          }}
        />
        <div style={{ marginTop: 10, textAlign: 'center' }}>
          <CopyToClipboard
            text={selectedFieldCodes}
            onCopy={() => {
              message.success(formatMessage({ id: 'COPY_SUCCESSFULLY' }));
            }}
          >
            <Button disabled={selectedFields.length === 0}>
              {formatMessage({ id: 'COPY_FIELD_CODES' })}
            </Button>
          </CopyToClipboard>
        </div>
      </Modal>
    );
  }
}
export default PropertyModal;
