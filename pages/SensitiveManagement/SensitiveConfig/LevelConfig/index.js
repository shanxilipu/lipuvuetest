import React, { Component } from 'react';
import { Button, Pagination, Checkbox, Spin, Popconfirm, Form, message } from 'antd';
import { formatMessage } from 'umi/locale';
import QueryConditions from '@/pages/AuditManagement/components/queryConditions';
import { getListLayoutByDivSizeNoScroll } from '@/utils/layoutUtils';
import ListItem from '@/pages/AuditManagement/components/listItem';
import MyIcon from '@/components/MyIcon';
import {
  listSafeSensitiveLevel,
  deleteSafeSensitiveLevel,
  multiDeleteSafeSensitiveLevel,
} from '@/services/sensitiveManagement/levelConfig';
import AddOrEditLevel from './AddOrEditLevel';
import styles from './index.less';

// eslint-disable-next-line react/prefer-stateless-function
@Form.create()
class LevelConfig extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: false,
      currentPage: 1,
      numberOfRecords: 6,
      pageSize: 5,
      marginBottom: 30,
      tasks: [],
      indexesOfSelectedControl: [], // 是否选中
      visible: false,
      taskItem: {},
      isAddItem: false,
    };
    this.searchArr = [
      {
        type: 'input',
        name: 'levelCode',
        label: `${formatMessage({ id: 'LevelConfig.LevelCode', defaultMessage: '级别编码' })}`,
        colSpan: 6,
      },

      {
        type: 'input',
        name: 'levelName',
        label: `${formatMessage({ id: 'LevelConfig.LevelName', defaultMessage: '级别名称' })}`,
        colSpan: 6,
      },
      {
        type: 'button',
        searchBtnClick: this.searchBtnClick,
        colSpan: 6,
        left: true,
      },
    ];
    this.column = [
      { title: 'checkbox', dataIndex: 'checkbox', colSpan: 1 },
      {
        title: `${formatMessage({ id: 'LevelConfig.LevelCode', defaultMessage: '级别编码' })}`,
        dataIndex: 'levelCode',
        colSpan: 3,
      },
      {
        title: `${formatMessage({ id: 'LevelConfig.LevelName', defaultMessage: '级别名称' })}`,
        dataIndex: 'levelName',
        colSpan: 3,
      },
      {
        title: `${formatMessage({
          id: 'LevelConfig.LevelDescription',
          defaultMessage: '级别说明',
        })}`,
        dataIndex: 'levelDescribe',
        colSpan: 14,
      },
      { title: 'btnCon', dataIndex: 'btn', colSpan: 3 },
    ];
    this.params = {
      pageIndex: 1,
      pageSize: 5,
      levelCode: '',
      levelName: '',
    };
  }

  componentDidMount() {
    this.resize();
    window.onresize = this.resize;
  }

  componentWillUnmount() {
    window.onresize = null;
  }

  resize = () => {
    const { currentPage } = this.state;
    const listWith = this.pageList.innerWidth || this.pageList.clientWidth;
    const listHeight = window.innerHeight || document.body.clientHeight;
    const listParam = {
      w: listWith,
      h: listHeight - 160 - 50,
      lw: listWith,
      lh: 88,
    };
    const { count, rowMargin } = getListLayoutByDivSizeNoScroll(listParam);
    this.setState(
      {
        pageSize: count,
        marginBottom: rowMargin,
      },
      () => {
        this.getPageList(currentPage);
      }
    );
  };

  searchBtnClick = val => {
    this.params.levelCode = val.levelCode;
    this.params.levelName = val.levelName;
    this.setState(
      {
        currentPage: 1,
      },
      () => {
        this.getPageList(1);
      }
    );
  };

  addBtn = () => {
    return (
      <Button icon="plus" type="primary" onClick={this.addConfig}>
        {formatMessage({ id: 'LevelConfig.AddConfig', defaultMessage: '新增配置' })}
      </Button>
    );
  };

  addConfig = () => {
    this.setState({
      taskItem: {},
      visible: true,
      isAddItem: true,
    });
  };

  showModelFlag = flag => {
    this.setState({
      visible: flag,
      isAddItem: false,
    });
  };

  getPageList = currentPage => {
    const { pageSize } = this.state;
    const param = {
      pageIndex: currentPage,
      pageSize,
      levelCode: this.params.levelCode,
      levelName: this.params.levelName,
    };
    this.setState({
      loading: true,
    });
    listSafeSensitiveLevel(param).then(result => {
      this.setState({
        loading: false,
      });
      if (!result) return;
      const { resultCode, resultMsg } = result;
      if (resultCode !== '0') {
        message.error(resultMsg);
      } else {
        const { resultObject } = result;
        this.setState({
          currentPage: resultObject.pageIndex,
          tasks: resultObject.rows,
          numberOfRecords: resultObject.records,
        });
      }
    });
  };

  handlePageChange = number => {
    this.setState(
      {
        currentPage: number,
      },
      () => {
        this.getPageList(number);
      }
    );
  };

  hasSelectedTasks = () => {
    const { indexesOfSelectedControl } = this.state;
    return indexesOfSelectedControl.indexOf(true) >= 0;
  };

  getOperatBtn = val => {
    return (
      <div className={styles.actionCon} onClick={this.stopExpandColumn}>
        <MyIcon
          type="iconbianjix"
          title={formatMessage({ id: 'LevelConfig.EditLevel', defaultMessage: '编辑级别' })}
          onClick={this.goToDetail.bind(this, val)}
          className={styles.operaBtn}
        />
        <Popconfirm
          title={formatMessage({ id: 'COMMON_DELETE_TIP', defaultMessage: '您确定要删除吗？' })}
          onConfirm={() => this.deleteLevel(val)}
          okText={formatMessage({ id: 'COMMON_OK', defaultMessage: '确定' })}
          cancelText={formatMessage({ id: 'COMMON_CANCEL', defaultMessage: '取消' })}
        >
          <MyIcon
            type="iconshanchubeifenx"
            title={formatMessage({ id: 'LevelConfig.DeleteLevel', defaultMessage: '删除级别' })}
            className={styles.operaBtn}
          />
        </Popconfirm>
      </div>
    );
  };

  goToDetail = taskItem => {
    this.setState({
      taskItem,
      visible: true,
    });
  };

  deleteLevel = taskItem => {
    const param = {
      id: taskItem.id ? taskItem.id : '',
    };
    this.setState({
      loading: true,
    });
    deleteSafeSensitiveLevel(param).then(result => {
      this.setState({
        loading: false,
      });
      if (!result) return;
      const { resultCode, resultMsg } = result;
      if (resultCode !== '0') {
        message.error(resultMsg);
      } else {
        message.success(
          `${formatMessage({ id: 'COMMON_DELET_SUCCESS', defaultMessage: '删除成功' })}`
        );
        this.getPageList(1);
      }
    });
  };

  handleAllItemDelete = () => {
    const { tasks, indexesOfSelectedControl } = this.state;
    const idList = [];
    if (indexesOfSelectedControl && indexesOfSelectedControl.length > 0) {
      for (let k = 0; k < indexesOfSelectedControl.length; k++) {
        if (indexesOfSelectedControl[k]) {
          idList.push({
            id: tasks[k].id,
          });
        }
      }
    }
    this.setState({
      loading: true,
    });
    multiDeleteSafeSensitiveLevel({ idList }).then(result => {
      this.setState({
        loading: false,
      });
      if (!result) return;
      const { resultCode, resultMsg } = result;
      if (resultCode !== '0') {
        message.error(resultMsg);
      } else {
        message.success(
          `${formatMessage({ id: 'COMMON_DELET_SUCCESS', defaultMessage: '删除成功' })}`
        );
        this.getPageList(1);
        this.setState({
          indexesOfSelectedControl: [],
        });
      }
    });
  };

  handleSelectedTask = task => {
    const { tasks, indexesOfSelectedControl } = this.state;
    const index = tasks.indexOf(task);
    indexesOfSelectedControl[index] = !indexesOfSelectedControl[index];
    this.setState({ indexesOfSelectedControl });
  };

  handleSetAllTaskSelected = () => {
    const { tasks } = this.state;
    let { indexesOfSelectedControl } = this.state;
    if (indexesOfSelectedControl && indexesOfSelectedControl.length === 0) {
      if (tasks && tasks.length > 0) {
        tasks.map(() => {
          return indexesOfSelectedControl.push(true);
        });
      }
    } else {
      indexesOfSelectedControl = [];
    }
    this.setState({ indexesOfSelectedControl });
  };

  render() {
    const {
      currentPage,
      numberOfRecords,
      pageSize,
      indexesOfSelectedControl,
      marginBottom,
      loading,
      tasks,
      visible,
      taskItem,
      isAddItem,
    } = this.state;
    const isAllBeenSeleted = indexesOfSelectedControl.filter(e => e).length === tasks.length;
    const hasSelectedTasks = this.hasSelectedTasks();

    const placeholder = (
      <div className={styles.placeholder}>
        <div>
          <div>
            <MyIcon
              type="icon-zanwushuju"
              style={{
                fontSize: 100,
                marginLeft: 20,
                color: '#BFE3EB',
              }}
            />
          </div>
          <div>
            <span className={styles.PStyle}>
              {formatMessage({ id: 'LevelConfig.PleaseClick', defaultMessage: '请点击' })}{' '}
            </span>
            <span onClick={this.addConfig} className={styles.PTextStyle}>
              {formatMessage({ id: 'LevelConfig.AddConfig', defaultMessage: '新增配置' })}
            </span>
          </div>
        </div>
      </div>
    );

    const actions = {
      // handleMark: this.handleMark,
      // handleAduit: this.handleAduit,
      // handleInspector: this.handleInspector,
      // deleteTask: this.handleDeleteTask,
      // publishTask: this.handlePublishTask,
      // showMore: this.handleShowMore,
      // editTaskHandler: this.handleEditTask,
      seletedTaskHandler: this.handleSelectedTask,
      // recallHandler: this.handleRecallTask,
      // handlePreview: this.handlePreview,
      // handleShowAutomarkSettingModal: this.handleShowAutomarkSettingModal,
    };

    return (
      <div className={`${styles.indexCon} smartsafeCon`}>
        {/* <PageHeader titleText="敏感级别配置" getButtonNode={this.addBtn} /> */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: '#fff',
            padding: '0 10px',
          }}
        >
          <QueryConditions
            searchArr={this.searchArr}
            style={{ width: 'calc(100% - 62px)', marginBottom: 0 }}
          />
          {this.addBtn()}
        </div>
        <div style={{ textAlign: 'center' }}>{loading ? <Spin /> : null}</div>
        <div
          className={styles.taskList}
          ref={c => {
            this.pageList = c;
          }}
        >
          {loading
            ? null
            : tasks.length > 0
            ? tasks.map((task, index) => {
                return (
                  <ListItem
                    key={index}
                    index={index}
                    needShowMore={false}
                    selected={indexesOfSelectedControl[index]}
                    task={task}
                    marginBottom={marginBottom}
                    {...actions}
                    column={this.column}
                    btnCon={this.getOperatBtn.bind(this, task)}
                  />
                );
              })
            : placeholder}
        </div>
        <div className={styles.toolBarStyle}>
          <div>
            <Checkbox
              style={{ marginRight: 10 }}
              onChange={this.handleSetAllTaskSelected}
              checked={isAllBeenSeleted}
            />
            <label>
              {formatMessage({
                id: 'LevelConfig.SelectAllAndSelecter',
                defaultMessage: '全选 已选中 ',
              })}
              <span style={{ color: '#01C1DE' }}>
                {`${indexesOfSelectedControl.filter(e => e).length}`}
              </span>
              {`/${tasks.length}${formatMessage({ id: 'ITEMS', defaultMessage: '个' })}`}
            </label>
            <Popconfirm
              title={formatMessage({ id: 'COMMON_DELETE_TIP', defaultMessage: '您确定要删除吗？' })}
              onConfirm={this.handleAllItemDelete}
              onCancel={e => e.stopPropagation()}
            >
              <Button
                style={{ marginLeft: 30 }}
                disabled={!hasSelectedTasks}
                // onClick={this.handleAllItemDelete}
              >
                {formatMessage({ id: 'COMMON_DELETE', defaultMessage: '删除' })}
              </Button>
            </Popconfirm>
            {/* <Button disabled={!selectedCount > 0}>API接口</Button> */}
          </div>
          <AddOrEditLevel
            visible={visible}
            isAddItem={isAddItem}
            taskItem={taskItem}
            showModelFlag={this.showModelFlag}
            getPageList={this.getPageList}
          />
          <div>
            <Pagination
              showQuickJumper={true}
              current={currentPage}
              total={numberOfRecords}
              pageSize={pageSize}
              onChange={this.handlePageChange}
            />
          </div>
        </div>
      </div>
    );
  }
}

export default LevelConfig;
