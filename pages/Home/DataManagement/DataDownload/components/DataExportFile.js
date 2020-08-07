import React, { PureComponent } from 'react';
import moment from 'moment';
import { Checkbox, Button, Icon, Popconfirm } from 'antd';
import { formatMessage } from 'umi/locale';
import MyIcon from '@/components/MyIcon';
import styles from '../DataDownload.less';

const FILE_STATUS = {
  '1': (
    <div className={styles.fileState} style={{ color: '#00C1DE' }}>
      <Icon type="loading" />
      <span>{formatMessage({ id: 'IS_GENERATING' })}</span>
    </div>
  ),
  '2': (
    <div className={styles.fileState} style={{ color: '#F5222D' }}>
      <Icon type="info-circle" />
      <span>{formatMessage({ id: 'GENERATED_FAILED' })}</span>
    </div>
  ),
  '3': (
    <div className={styles.fileState} style={{ color: '#FAAD14' }}>
      <Icon type="clock-circle" />
      <span>{formatMessage({ id: 'WAIT_FOR_DOWNLOADING' })}</span>
    </div>
  ),
  '4': (
    <div className={styles.fileState} style={{ color: '#52C41A' }}>
      <Icon type="check-circle" />
      <span>{formatMessage({ id: 'ALREADY_DOWNLOADED' })}</span>
    </div>
  ),
  '5': (
    <div className={styles.fileState} style={{ color: 'rgba(0,0,0,0.45)' }}>
      <Icon type="close-circle" />
      <span>{formatMessage({ id: 'FILE_INVALID' })}</span>
    </div>
  ),
};

const getFormatDate = date => {
  if (!date) {
    return '';
  }
  return moment(date).format('YYYY-MM-DD HH:mm:ss');
};

class DataExportFile extends PureComponent {
  constructor(props) {
    super(props);
    const {
      file: { id },
    } = props;
    this.sensitiveFields = null;
    this.fileId = id;
  }

  handleClickFile = e => {
    let {
      target: { tagName },
    } = e;
    tagName = tagName.toLowerCase();
    if (!['input', 'button'].includes(tagName)) {
      const { file, handleClick } = this.props;
      handleClick(file.id, !!this.sensitiveFields);
    }
  };

  render() {
    const {
      file,
      activeFileId,
      checkedFileIds,
      handleCheckFile,
      sensitiveFields,
      handleDeleteFile,
      handleDownloadFile,
    } = this.props;
    if (!this.sensitiveFields && sensitiveFields && file.id === this.fileId) {
      this.sensitiveFields = sensitiveFields;
    }
    let dbs = [];
    let tables = [];
    let fields = [];
    if (file.id === activeFileId && this.sensitiveFields) {
      dbs = this.sensitiveFields.map((detail, index) => (
        <div>
          <span>{`${index + 1}`}</span>
          <span className={styles.exportFileDetailTitle} style={{ paddingLeft: 15 }}>
            {formatMessage({ id: 'DATABASE_BELONGS' })}
          </span>
          <span>{detail.databaseBelong}</span>
        </div>
      ));
      tables = this.sensitiveFields.map(detail => (
        <div>
          <span className={styles.exportFileDetailTitle}>
            {formatMessage({ id: 'TABLE_BELONGS' })}
          </span>
          <span>{detail.tablesBelong}</span>
        </div>
      ));
      fields = this.sensitiveFields.map(detail => (
        <div>
          <span className={styles.exportFileDetailTitle}>
            {formatMessage({ id: 'SENSITIVE_COLUMNS' })}
          </span>
          <span>{detail.sensitiveFields}</span>
        </div>
      ));
    }
    return (
      <div
        className={`${styles.exportFile} ${activeFileId === file.id ? styles.active : ''}`}
        onClick={e => {
          this.handleClickFile(e);
        }}
      >
        <div className={styles.exportFileRow}>
          {file.state !== '1' ? (
            <Checkbox
              style={{ flex: 2, textAlign: 'center' }}
              checked={checkedFileIds.includes(file.id)}
              onChange={e => {
                handleCheckFile(file.id, e.target.checked);
              }}
            />
          ) : (
            <div style={{ flex: 2 }} />
          )}
          <div className={styles.exportFileColumn} style={{ flex: 6 }}>
            <div className={styles.exportFileColumnTitle}>
              {formatMessage({ id: 'DATA_FILE_NAME' })}
            </div>
            <div className={styles.exportFileColumnValue} title={file.fileName}>
              {file.fileName}
            </div>
          </div>
          <div className={styles.exportFileColumn} style={{ flex: 3 }}>
            <div className={styles.exportFileColumnTitle}>
              {formatMessage({ id: 'SENSITIVE_COLUMNS_NUM' })}
            </div>
            <div className={styles.exportFileColumnValue}>{file.fieldCount}</div>
          </div>
          <div className={styles.exportFileColumn} style={{ flex: 5 }}>
            <div className={styles.exportFileColumnTitle}>
              {formatMessage({ id: 'REQUEST_DATE' })}
            </div>
            <div className={styles.exportFileColumnValue}>
              {getFormatDate(file.requestDatetime)}
            </div>
          </div>
          <div className={styles.exportFileColumn} style={{ flex: 3 }}>
            <div className={styles.exportFileColumnTitle}>
              {formatMessage({ id: 'COMMON_STATE' })}
            </div>
            <div className={styles.exportFileColumnValue}>{FILE_STATUS[file.state]}</div>
          </div>
          <div className={styles.exportFileColumn} style={{ flex: 5 }}>
            <div className={styles.exportFileColumnTitle}>
              {formatMessage({ id: 'DOWNLOAD_DATE' })}
            </div>
            <div className={styles.exportFileColumnValue}>
              {getFormatDate(file.downloadDatetime)}
            </div>
          </div>
          <div className={styles.btnsGroup} style={{ flex: 5, justifyContent: 'flex-end' }}>
            {(file.state === '3' || file.state === '4') && (
              <Button
                onClick={e => {
                  e.stopPropagation();
                  handleDownloadFile(file.id);
                }}
              >
                <MyIcon type="iconxiazai" />
              </Button>
            )}
            {file.state !== '1' && (
              <Popconfirm
                placement="bottom"
                title={formatMessage({ id: 'CONFIRM_DELETION', defaultMessage: '确认删除' })}
                onConfirm={() => {
                  handleDeleteFile(file.id);
                }}
              >
                <Button
                  onClick={e => {
                    e.stopPropagation();
                  }}
                >
                  <MyIcon type="iconshanchubeifenx" />
                </Button>
              </Popconfirm>
            )}
          </div>
        </div>
        {activeFileId === file.id && (
          <div className={styles.exportFileDetail}>
            <div style={{ flex: 2 }} />
            <div style={{ flex: 9, display: 'flex' }}>
              <div>{`${formatMessage({ id: 'SENSITIVE_COLUMNS' })}: `}</div>
              <div className={styles.exportFileDetailColumn} style={{ paddingLeft: 10 }}>
                {dbs.map(db => db)}
              </div>
            </div>
            <div style={{ flex: 8 }} className={styles.exportFileDetailColumn}>
              {tables.map(table => table)}
            </div>
            <div style={{ flex: 10 }} className={styles.exportFileDetailColumn}>
              {fields.map(field => field)}
            </div>
          </div>
        )}
      </div>
    );
  }
}
export default DataExportFile;
