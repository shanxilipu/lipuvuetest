import request from '@/utils/request';

export default function queryCollectionList(params) {
  const url = 'smartsafe/SafeDatcollogController/list';
  return request(url, {
    method: 'POST',
    body: {
      ...params,
    },
  });
}
