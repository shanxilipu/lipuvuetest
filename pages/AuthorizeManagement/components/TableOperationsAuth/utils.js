import { defaultHandleResponse } from '@/utils/utils';
import { listAllSafeDatabaseOperation } from '@/services/authorizeManagement/applySysAuthorize';

// eslint-disable-next-line import/prefer-default-export
export function getAllSafeDatabaseOperation(datasourceType) {
  return new Promise(resolve => {
    listAllSafeDatabaseOperation(datasourceType).then(response => {
      defaultHandleResponse(
        response,
        resultObject => {
          const list = resultObject || [];
          const dataTypeList = {};
          list.forEach(o => {
            const { executeType } = o;
            if (!dataTypeList[executeType]) {
              dataTypeList[executeType] = [];
            }
            dataTypeList[executeType].push(o);
          });
          // const dataTypeList = {
          //   DDL: list.filter(obj => {
          //     return obj.executeType === '1';
          //   }),
          //   DML: list.filter(obj => {
          //     return obj.executeType === '2';
          //   }),
          //   DCL: list.filter(obj => {
          //     return obj.executeType === '3';
          //   }),
          // };
          resolve(dataTypeList);
        },
        () => resolve({})
      );
    });
  });
}
