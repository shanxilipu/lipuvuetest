import request from '@/utils/request';

export default function queryWaterMarksLog(params) {
  const url = 'smartsafe/WatermarkFieldController/listWatermarkLog';
  return request(url, {
    method: 'POST',
    body: {
      ...params,
    },
  });
}
