import React from 'react';
import { formatMessage } from 'umi/locale';
import { Button } from 'antd';
import Modal from '@/components/Modal';
import ScriptContent from './ScriptContent';
import styles from './index.less';

const CutoverScript = (props = {}) => {
  const { script = '', visible, onCancel, fileName, suffix = 'txt' } = props;
  const handleSaveScript = () => {
    const filename = `${fileName}.${suffix}`;
    let fileContent = 'data:text/csv;charset=utf-8,\ufeff'; // \ufeff去除中文数据乱码;
    if (window.navigator.msSaveOrOpenBlob) {
      fileContent = '\ufeff';
    }
    fileContent += script;
    if (window.navigator.msSaveOrOpenBlob) {
      // IE
      const blob = new Blob([decodeURIComponent(encodeURI(fileContent))], {
        type: 'text/plain;charset=utf-8;',
      });
      window.navigator.msSaveBlob(blob, filename); // filename文件名包括扩展名
    } else {
      const encodedUri = encodeURI(fileContent); // encodeURI识别转义符
      const a = document.createElement('a');
      a.setAttribute('href', encodedUri);
      a.setAttribute('download', filename);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };
  return (
    <Modal
      visible={visible}
      onCancel={onCancel}
      footer={
        <div className="buttons-group">
          <Button onClick={onCancel}>
            {formatMessage({ id: 'COMMON_CANCEL', defaultMessage: '取消' })}
          </Button>
          <Button type="primary" disabled={!script} onClick={handleSaveScript}>
            {formatMessage({
              id: 'storage.encrypt.cutoverScript.save',
              defaultMessage: '保存割接脚本',
            })}
          </Button>
        </div>
      }
      title={formatMessage({ id: 'storage.encrypt.cutoverScript', defaultMessage: '割接脚本' })}
    >
      <div className={styles.modalBox}>
        <ScriptContent script={script} />
      </div>
    </Modal>
  );
};
export default CutoverScript;
