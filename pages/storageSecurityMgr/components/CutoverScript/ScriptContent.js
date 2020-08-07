import React from 'react';
import { Spin } from 'antd';
import styles from './index.less';

const ScriptContent = ({ script, loading = false }) => {
  const arr = script ? script.split('\n') : [];
  return (
    <Spin wrapperClassName="full-height-spin" spinning={loading}>
      <div className={styles.content}>
        {arr.map((o, i) => (
          <div key={i}>{o}</div>
        ))}
      </div>
    </Spin>
  );
};
export default ScriptContent;
