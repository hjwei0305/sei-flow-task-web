import { utils } from 'suid';
import { constants } from '../../../utils';

const { request } = utils;

const { SERVER_PATH } = constants;

/** 
 * 获取待办事项视图列表
 */
export async function getWorkTodoViewTypeList() {
    const url = `${SERVER_PATH}/flow-service/flowTask/listFlowTaskHeader`;
    return request({
        url,
        method: "POST",
    });
}

/** 
 * 获取可以批量处理的待办事项视图列表
 */
export async function getBatchWorkTodoViewTypeList(params) {
    const url = `${SERVER_PATH}/flow-service/flowTask/findCommonTaskSumHeader`;
    return request({
        url,
        params,
    });
}
