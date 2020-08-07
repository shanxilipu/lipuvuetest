import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { Modal as AntdModal, Button } from 'antd';
import { formatMessage } from 'umi/locale';
import styles from './index.less';

const Modal = (props = {}) => {
  const {
    onOk = () => {},
    onCancel = () => {},
    footer = true, // false 时不渲染footer
    okText = formatMessage({ id: 'COMMON_OK', defaultMessage: '确定' }),
    cancelText = formatMessage({ id: 'COMMON_CANCEL', defaultMessage: '取消' }),
    okButtonProps = {},
    centerFooter,
    confirmLoading,
    children,
    bodyStyle = {},
    height,
    showOkButton = true,
    showCancelButton = true,
    noCancelConfirmLoading,
    ...restProps
  } = props;
  const handleCancel = () => {
    if (noCancelConfirmLoading && confirmLoading) {
      return false;
    }
    onCancel();
  };
  let bodyHeight = 'auto';
  const showFooter = !!footer;
  if (height) {
    bodyHeight = Math.max(50, height - 55 - (showFooter ? 48 : 0));
  }
  bodyStyle.height = bodyHeight;
  const defaultFooter = (
    <React.Fragment>
      {showOkButton && (
        <Button type="primary" onClick={onOk} {...okButtonProps} loading={confirmLoading}>
          {okText}
        </Button>
      )}
      {showCancelButton && <Button onClick={handleCancel}>{cancelText}</Button>}
    </React.Fragment>
  );
  const displayFooter = typeof footer === 'boolean' ? defaultFooter : footer;
  return (
    <AntdModal
      centered
      destroyOnClose
      {...restProps}
      footer={null}
      onCancel={handleCancel}
      bodyStyle={{ padding: 0 }}
    >
      <div className={styles.modal}>
        <div className={styles.body} style={bodyStyle}>
          {children}
        </div>
        {showFooter && (
          <div
            className={classNames(styles.footer, {
              [styles.centerFooter]: centerFooter,
            })}
          >
            {displayFooter}
          </div>
        )}
      </div>
    </AntdModal>
  );
};
const { info, confirm, success, error, warning } = AntdModal;
Modal.info = info;
Modal.success = success;
Modal.error = error;
Modal.warning = warning;
Modal.confirm = function _confirm(params = {}) {
  const okText = formatMessage({ id: 'COMMON_OK', defaultMessage: '确定' });
  const cancelText = formatMessage({ id: 'COMMON_CANCEL', defaultMessage: '取消' });
  confirm({ okText, cancelText, ...params });
};
Modal.propTypes = {
  afterClose: PropTypes.func,
  bodyStyle: PropTypes.object,
  cancelText: PropTypes.string,
  centered: PropTypes.bool,
  centerFooter: PropTypes.bool,
  confirmLoading: PropTypes.bool,
  destroyOnClose: PropTypes.bool,
  footer: PropTypes.oneOfType([PropTypes.node, PropTypes.bool]),
  height: PropTypes.number,
  maskClosable: PropTypes.bool,
  noCancelConfirmLoading: PropTypes.bool,
  okButtonProps: PropTypes.object,
  okText: PropTypes.string,
  onCancel: PropTypes.func,
  onOk: PropTypes.func,
  showCancelButton: PropTypes.bool,
  showOkButton: PropTypes.bool,
  title: PropTypes.oneOfType([PropTypes.node, PropTypes.string]),
  visible: PropTypes.bool,
  wrapClassName: PropTypes.string,
  width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};
export default Modal;
