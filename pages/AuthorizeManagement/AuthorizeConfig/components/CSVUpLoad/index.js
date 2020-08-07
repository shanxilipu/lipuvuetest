import React, { Component } from 'react';
import { formatMessage } from 'umi/locale';
import { Button, Modal, Table, message, Icon } from 'antd';
import { importCsvFile } from '@/services/authorizeManagement/applySysUserManagement';
import styles from './index.less';

class CSVUpLoad extends Component {
  constructor(props) {
    super(props);
    this.state = {
      showModel: false,
      dataSource: [],
    };
  }

  updateFileBefore = () => {
    this.setState(
      {
        dataSource: [],
      },
      () => {
        this.catlogUrl.click();
      }
    );
  };

  catlogChange = () => {
    if (!this.catlogUrl.files || this.catlogUrl.files.length <= 0) {
      return false;
    }
    const file = this.catlogUrl.files[0];
    this.catlogUrl.value = '';
    const { name } = file;
    const nameArr = name.split('.');
    if (nameArr[nameArr.length - 1] !== 'csv') {
      message.error(`${formatMessage({ id: 'applySysUserManagement.UpFileTypeFalseTip' })}`);
      return false;
    }
    this.upLoadFile(file);
  };

  upLoadFile = file => {
    const { type, selectedSys, selectedCatalogue, showModelFlag } = this.props;
    const parms = new FormData();
    parms.append('file', file);
    if (type === 'userInfo') {
      parms.append('importType', 2);
      parms.append('appId', selectedSys.id);
    } else {
      parms.append('importType', 1);
      parms.append('sysCatalogId', selectedCatalogue.catalogId);
    }
    importCsvFile(parms).then(result => {
      const { resultCode, resultMsg } = result; // resultObject
      if (resultCode !== '0') {
        message.error(resultMsg);
        return false;
      }
      if (showModelFlag) {
        showModelFlag(false, true, true);
      }
      // const { getDataSource } = this.props;
      // const getresultObject = resultObject || [];
      // const dataSource = getresultObject.map(item => {
      //   const itemArr = item.split(',');
      //   return getDataSource(itemArr);
      // });
      // this.setState({
      //   dataSource,
      //   showModel: true,
      // });
    });
    return false;
  };

  hideModal = () => {
    this.setState({
      showModel: false,
    });
  };

  showModel = () => {
    this.setState({
      showModel: true,
    });
  };

  handleOk = () => {
    const { dataSource } = this.state;
    const { handleOk } = this.props;
    if (handleOk) {
      handleOk(dataSource, this.hideModal);
    }
  };

  render() {
    const { showModel, loading, dataSource } = this.state;
    const { upFileColumns, modelTitle, disabled } = this.props;

    return (
      <div className={styles.fileInputCon}>
        <Button
          disabled={disabled}
          onClick={() => {
            this.updateFileBefore();
          }}
        >
          <Icon type="upload" /> {formatMessage({ id: 'applySysUserManagement.ImportFiles' })}
        </Button>
        <input
          className={styles.inputFile}
          type="file"
          id="catlog"
          ref={c => {
            this.catlogUrl = c;
          }}
          onChange={this.catlogChange}
        />
        <Modal
          title={modelTitle}
          visible={showModel}
          onOk={this.handleOk}
          onCancel={() => {
            this.hideModal(false);
          }}
          width="850px"
        >
          <Table
            size="small"
            columns={upFileColumns}
            dataSource={dataSource}
            pagination={this.pagination}
            rowKey="id"
            childrenColumnName={['none']}
            loading={loading}
          />
        </Modal>
      </div>
    );
  }
}

export default CSVUpLoad;
