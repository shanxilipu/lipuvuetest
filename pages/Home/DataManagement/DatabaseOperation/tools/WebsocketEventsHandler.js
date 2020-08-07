import { message } from 'antd';
import { formatMessage } from 'umi/locale';

const acceptMessages = [
  'PARAGRAPH',
  'NEW_NOTE',
  'DOWNLOAD_ALL_DATA_RETURN',
  'DOWNLOAD_BIGTABLE_ALL_DATA_RETURN',
  'DOWNLOAD_ALL_DATA_ERROR',
];

class WebsocketEventsHandler {
  constructor(props) {
    this.dispatchSocketMessage = props.dispatchSocketMessage;
  }

  onMessage = event => {
    if (event.data) {
      const payload = JSON.parse(event.data);
      const { data, op } = payload;
      if (acceptMessages.includes(op)) {
        // payload.TIME_MARK = new Date().getTime().toString();
        this.dispatchSocketMessage(payload);
      } else if (['ERROR_INFO', 'SYSTEM_REQUEST_ERROR'].includes(op)) {
        const name = {
          ERROR_INFO: 'info',
          SYSTEM_REQUEST_ERROR: 'errorMsg',
        }[op];
        let msg = data[name];
        if (!msg) {
          return false;
        }
        msg = msg.toString();
        if (msg === '$loginerr') {
          msg = formatMessage({ id: 'LOG_LOGOUT_TIMEOUT' });
        }
        message.error(msg);
      }
    }
  };
}
export default WebsocketEventsHandler;
