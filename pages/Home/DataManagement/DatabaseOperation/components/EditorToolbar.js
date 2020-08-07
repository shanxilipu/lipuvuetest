import React, { PureComponent } from 'react';
import { formatMessage } from 'umi/locale';
import { Button, Icon, Input, Dropdown, Checkbox, Tooltip, List, Upload, Select } from 'antd';
import MyIcon from '@/components/MyIcon';
import styles from '../DatabaseOperation.less';
import { PROGRAM_WINDOW_KEY } from '../constant';

const { Search } = Input;

class EditorToolbar extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      occurrencesCount: -1,
      currentOccurrence: 0,
    };
  }

  caseSensitive = false;

  regSensitive = false;

  keyword = '';

  markAllOccurrences = keyword => {
    const { onAdvancedSearch } = this.props;
    const word = keyword === undefined ? this.keyword : keyword;
    onAdvancedSearch({
      type: 'markAllOccurrences',
      params: {
        keyword: word,
        caseSensitive: this.caseSensitive,
        regSensitive: this.regSensitive,
      },
    });
  };

  showNextOrPrev = isNext => {
    const { onAdvancedSearch } = this.props;
    onAdvancedSearch({
      type: isNext ? 'nextOccurrence' : 'prevOccurrence',
      params: {},
    });
  };

  onSearchWordChange = e => {
    this.keyword = e.currentTarget.value;
    this.markAllOccurrences();
  };

  onReplaceWordChange = e => {
    this.replaceWord = e.currentTarget.value;
  };

  onCheckboxChange = (e, name) => {
    const {
      target: { checked },
    } = e;
    this[name] = checked;
    this.markAllOccurrences();
  };

  onOccurrencesChange = ({ occurrencesCount, currentOccurrence }) => {
    this.setState({ occurrencesCount, currentOccurrence });
  };

  replace = isAll => {
    const { onAdvancedSearch } = this.props;
    onAdvancedSearch({
      type: isAll ? 'replaceAll' : 'replace',
      params: {
        from: this.keyword,
        to: this.replaceWord,
      },
    });
  };

  getAdvancedSearch = () => {
    const { occurrencesCount: count, currentOccurrence } = this.state;
    const occurrencesCount = count > 0 ? count : 0;
    return (
      <div className={styles.advancedSearchBox}>
        <div className={styles.searchRow}>
          <span className={styles.searchRowTitle}>{formatMessage({ id: 'BTN_SEARCH' })}</span>
          <Input
            placeholder={formatMessage({ id: 'app.analysis.table.search-keyword' })}
            onChange={this.onSearchWordChange}
            className={`${occurrencesCount === 0 && count !== -1 ? styles.noMatches : ''}`}
          />
          <span style={{ minWidth: 80, width: 80, textAlign: 'center' }}>
            {`${currentOccurrence} of ${occurrencesCount}`}
          </span>
          <Button
            onClick={() => {
              this.showNextOrPrev(false);
            }}
            className={`${styles.actionBarBtns} ${styles.advancedSearchBtns}`}
          >
            <Icon type="up" />
          </Button>
          <Button
            onClick={() => {
              this.showNextOrPrev(true);
            }}
            className={`${styles.actionBarBtns} ${styles.advancedSearchBtns}`}
          >
            <Icon type="down" />
          </Button>
        </div>
        <div className={styles.searchRow}>
          <span className={styles.searchRowTitle}>{formatMessage({ id: 'BTN_OPTIONS' })}</span>
          <Checkbox
            className={styles.ml10}
            onChange={e => {
              this.onCheckboxChange(e, 'caseSensitive');
            }}
          >
            {formatMessage({ id: 'CASE_SENSITIVE' })}
          </Checkbox>
          <Checkbox
            className={styles.ml10}
            onChange={e => {
              this.onCheckboxChange(e, 'regSensitive');
            }}
          >
            {formatMessage({ id: 'REGULAR_EXPRESSION' })}
          </Checkbox>
        </div>
        <div className={styles.searchRow}>
          <span className={styles.searchRowTitle}>{formatMessage({ id: 'BTN_REPLACE' })}</span>
          <Input placeholder="" onChange={this.onReplaceWordChange} />
          <Button
            onClick={() => {
              this.replace(false);
            }}
            className={`${styles.actionBarBtns} ${styles.advancedSearchBtns}`}
          >
            {formatMessage({ id: 'BTN_REPLACE' })}
          </Button>
          <Button
            onClick={() => {
              this.replace(true);
            }}
            className={`${styles.actionBarBtns} ${styles.advancedSearchBtns}`}
          >
            {formatMessage({ id: 'BTN_REPLACE_ALL' })}
          </Button>
        </div>
      </div>
    );
  };

  toggleAdvSearch = visible => {
    const { toggleAdvSearch } = this.props;
    toggleAdvSearch(visible);
  };

  render() {
    const {
      windowKey,
      showAdvancedSearch,
      handleRun,
      handleStop,
      handleDownload,
      isRunning,
      beautifySQL,
      handleOpenFile,
      beforeUpload,
      openFileLoading,
      databases = [],
      programWindowComponentId,
      onProgramWindowComponentChange,
    } = this.props;
    return (
      <div className={styles.editorToolbar}>
        <div className={styles.btnsGroup}>
          {windowKey === PROGRAM_WINDOW_KEY && (
            <Select
              value={programWindowComponentId}
              onChange={onProgramWindowComponentChange}
              style={{ width: 150 }}
            >
              {databases.map(o => (
                <Select.Option key={o.datasourceId} value={o.datasourceId} title={o.datasourceName}>
                  <Icon type="database" style={{ color: '#52C41A' }} />
                  <span>{o.datasourceName}</span>
                </Select.Option>
              ))}
            </Select>
          )}
          {windowKey === PROGRAM_WINDOW_KEY && (
            <Upload
              name="zdevscriptUpload"
              action={`${ROUTER_BASE}modelweb/zdmetadata/FileImportController/importFile`}
              headers={{ 'signature-sessionId': window.name }}
              accept=".sql,.txt"
              showUploadList={false}
              onChange={handleOpenFile}
              beforeUpload={beforeUpload}
            >
              <Button
                icon="folder"
                disabled={isRunning || openFileLoading}
                loading={openFileLoading}
              >
                {formatMessage({ id: 'OPEN_FILE' })}
              </Button>
            </Upload>
          )}
          <Tooltip title={`${formatMessage({ id: 'COMMON_RUN' })}(Shift+Enter)`}>
            <Button className={styles.actionBarBtns} onClick={handleRun} disabled={isRunning}>
              <MyIcon type="iconplaycircle" />
            </Button>
          </Tooltip>
          <Tooltip title={`${formatMessage({ id: 'COMMON_STOP' })}(Alt+C)`}>
            <Button className={styles.actionBarBtns} disabled={!isRunning} onClick={handleStop}>
              <MyIcon type="iconstop" />
            </Button>
          </Tooltip>
          <Dropdown
            trigger={['click']}
            size="small"
            overlay={
              <List
                itemLayout="vertical"
                className={styles.dropdownList}
                bordered
                dataSource={[
                  { label: formatMessage({ id: 'SAVE_AS_SQL_FILE' }), value: 'sql' },
                  { label: formatMessage({ id: 'SAVE_AS_TXT_FILE' }), value: 'txt' },
                ]}
                renderItem={item => (
                  <List.Item
                    onClick={() => {
                      handleDownload(item.value);
                    }}
                    className={styles.dropdownListItem}
                  >
                    {item.label}
                  </List.Item>
                )}
              />
            }
          >
            <Tooltip title={formatMessage({ id: 'form.save' })}>
              <Button className={styles.actionBarBtns}>
                <MyIcon type="iconsave" />
              </Button>
            </Tooltip>
          </Dropdown>
          <Tooltip title={formatMessage({ id: 'BEAUTIFY_SQL' })}>
            <Button className={styles.actionBarBtns} onClick={beautifySQL}>
              <MyIcon type="iconziyuan" />
            </Button>
          </Tooltip>
        </div>
        <div className={styles.flex}>
          <Search
            placeholder={formatMessage({ id: 'app.analysis.table.search-keyword' })}
            onSearch={value => {
              this.markAllOccurrences(value);
            }}
            style={{ width: 200 }}
          />
          <Dropdown
            trigger={['click']}
            visible={showAdvancedSearch}
            overlay={this.getAdvancedSearch()}
            onVisibleChange={visible => {
              this.toggleAdvSearch(visible);
            }}
            onClick={() => {
              this.toggleAdvSearch(true);
            }}
          >
            <a className={`${styles.ml10} ant-dropdown-link`} href="#">
              {formatMessage({ id: 'ADVANCED_SEARCH' })}
            </a>
          </Dropdown>
        </div>
      </div>
    );
  }
}
export default EditorToolbar;
