import React from 'react';
import styles from './index.less';

const IndicatorRow = ({ title }) => {
  return (
    <div className={styles.indicatorRow}>
      <div className={styles.indicator} />
      <span>{title}</span>
    </div>
  );
};
export default IndicatorRow;
