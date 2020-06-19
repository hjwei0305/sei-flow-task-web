import { utils } from 'suid';
import { constants } from '../../../utils';

const { request } = utils;

const { SERVER_PATH } = constants;

/**
 * 获取已办事项视图列表
 */
export async function getWorkDoneViewTypeList() {
  const url = `${SERVER_PATH}/flow-service/flowHistory/listValidFlowHistoryHeader`;
  return request({
    url,
  });
}

/**
 * 撤销已办事项
 */
export async function flowRevokeSubmit() {
  const url = `${SERVER_PATH}/flow-service/flowTask/rollBackToHis`;
  return request({
    url,
    method: 'POST',
  });
}
