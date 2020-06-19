import { utils } from 'suid';
import { constants } from '../../../utils';

const { request } = utils;

const { SERVER_PATH } = constants;

/**
 * 获取我的单据视图列表
 */
export async function getMyOrderViewTypeList() {
  const url = `${SERVER_PATH}/flow-service/flowInstance/listAllMyBillsHeader`;
  return request({
    url,
  });
}

/**
 * 终止审批
 */
export async function flowEndSubmit(params) {
  const url = `${SERVER_PATH}/flow-service/flowInstance/end/${params.instanceId}`;
  return request({
    url,
    method: 'POST',
  });
}
