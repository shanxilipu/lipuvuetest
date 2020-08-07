import React from 'react';
import { Alert, message } from 'antd';
import { formatMessage } from 'umi/locale';
import DetailList from '../DetailList';
import Modal from '@/components/Modal';
import SetInitialTime from './SetInitialTime';
import { randomWord, defaultHandleResponse } from '@/utils/utils';
import {
  checkTaskFinish,
  submitInitialTask,
  finishInitialTask,
} from '@/pages/storageSecurityMgr/services/encryptionStrategy';

const _initialState = {
  refreshMark: null,
  scrollYMark: null,
  finishEnabled: false,
  confirmLoading: false,
  detailListLoading: false,
  showSetInitialTimeModal: false,
};

class EditStrategyModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = { ..._initialState };
    this.currentRows = [];
  }

  componentDidUpdate(prevProps) {
    const {
      visible,
      item: { storeFieldId },
    } = this.props;
    if (visible && !prevProps.visible) {
      this.checkCanFinish(storeFieldId);
    }
    if (!visible && prevProps.visible) {
      // eslint-disable-next-line react/no-did-update-set-state
      this.setState({ ..._initialState });
      this.currentRows = [];
    }
  }

  checkCanFinish = storeFieldId => {
    this.setState({ confirmLoading: true, refreshMark: randomWord(false, 8) });
    checkTaskFinish(storeFieldId).then(response => {
      this.setState({ confirmLoading: false });
      defaultHandleResponse(response, resultObject => {
        this.setState({ finishEnabled: !!resultObject });
      });
    });
  };

  handleSubmitInitTask = rows => {
    this.currentRows = rows;
    this.setState({ showSetInitialTimeModal: true });
  };

  confirmSubmitInitTask = initDatetime => {
    const {
      item: { storeFieldId },
    } = this.props;
    const payload = this.currentRows.map(o => ({ ...o, initDatetime }));
    this.setState({ showSetInitialTimeModal: false, detailListLoading: true });
    submitInitialTask(payload).then(response => {
      this.setState({ detailListLoading: false });
      defaultHandleResponse(response, () => {
        message.success(
          formatMessage({ id: 'COMMON_COMMAND_SUCCESS', defaultMessage: '操作成功' })
        );
        // 刷新列表
        this.setState({ refreshMark: randomWord(false, 8) });
        this.checkCanFinish(storeFieldId);
      });
    });
  };

  finishTask = () => {
    const {
      item: { storeFieldId },
      onCancel,
      onOk,
    } = this.props;
    this.setState({ confirmLoading: true });
    finishInitialTask(storeFieldId).then(response => {
      this.setState({ confirmLoading: false });
      defaultHandleResponse(response, () => {
        message.success(
          formatMessage({ id: 'COMMON_COMMAND_SUCCESS', defaultMessage: '操作成功' })
        );
        onOk();
        onCancel();
      });
    });
  };

  render() {
    const {
      visible,
      onCancel,
      item: { storeFieldId },
    } = this.props;
    const {
      refreshMark,
      scrollYMark,
      finishEnabled,
      confirmLoading,
      detailListLoading,
      showSetInitialTimeModal,
    } = this.state;
    return (
      <Modal
        visible={visible}
        onCancel={onCancel}
        noCancelConfirmLoading
        onOk={this.finishTask}
        bodyStyle={{ paddingTop: 0 }}
        confirmLoading={confirmLoading}
        okButtonProps={{ disabled: !finishEnabled }}
        height={Math.max(window.innerHeight * 0.8, 500)}
        width={Math.max(window.innerWidth * 0.85, 800)}
        title={formatMessage({
          id: 'storage.strategy.checkTitle',
          defaultMessage: '查看加密存储策略',
        })}
        okText={formatMessage({
          id: 'storage.strategy.finishInitialization',
          defaultMessage: '完成初始化',
        })}
      >
        <div className="fullHeight ub ub-ver">
          <div className="ub ub-pc">
            <Alert
              type="info"
              closable
              message={formatMessage({ id: 'storage.strategy.tips2' })}
              afterClose={() => this.setState({ scrollYMark: randomWord(false, 8) })}
            />
          </div>
          <DetailList
            mode="detail"
            refreshMark={refreshMark}
            scrollYMark={scrollYMark}
            storeFieldId={storeFieldId}
            loading={detailListLoading}
            className="ub-flex-1 over-flow-hidden"
            handleSubmitInitTask={this.handleSubmitInitTask}
          />
        </div>
        <SetInitialTime
          onOk={this.confirmSubmitInitTask}
          visible={showSetInitialTimeModal}
          onCancel={() => this.setState({ showSetInitialTimeModal: false })}
        />
      </Modal>
    );
  }
}
export default EditStrategyModal;
