import React, { Component } from 'react';
import { Badge } from 'antd'
import Table from '@/components/Table';
import Modal from '@/components/Modal/index.js';
import styles from './index.less';

class ReportProgress extends Component {
  constructor(props) {
      super(props);
      this.searchParams = {};
      this.state = {
            myKey: '',
      };
  }

  getReportColumns = () => {
   return [
     {
      dataIndex: 'flowName',
      title: '审批环节',
     },
     {
      dataIndex: 'approvalUserName',
      title: '审批人',
     },
     {
      dataIndex: 'orderStatus',
      title: '审批结果',
        render: c => {
          return (
            <div>
              <Badge status={c === 0 ? 'success' : 'error'} text={c === 0 ? '通过' : '未通过'} />
            </div>
        );
       },
     },
     {
       dataIndex: 'orderTime',
       title: '审批时间',
     },
     {
       dataIndex: 'orderDesc',
       title: '审批意见',
     },
    ];
  };

  render() {
    const { myKey } = this.state
    const { reportList, showProgModal, progModal,loading } = this.props
    return (
      <Modal
        key={myKey}
        showOkButton={false}
        bodyStyle={{ padding: 0 }}
        width={560}
        title="报备进度"
        visible={showProgModal}
        onCancel={() => progModal(false)}
      >
        <div className={styles.modalHeight}>
          <Table
            rowKey="k"
            loading={loading}
            showFoot={false}
            dataSource={reportList}
            columns={this.getReportColumns()}
          />
        </div>
      </Modal>
        );
    }
}

export default ReportProgress;
