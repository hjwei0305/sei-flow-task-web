import { message } from 'antd';
import { utils } from 'suid';
import { getWorkTodoViewTypeList, getBatchWorkTodoViewTypeList } from './service';

const { pathMatchRegexp, dvaModel } = utils;
const { modelExtend, model } = dvaModel;

export default modelExtend(model, {
    namespace: 'taskWorkTodo',

    state: {
        viewTypeData: [],
        currentViewType: null,
    },
    subscriptions: {
        setup({ dispatch, history }) {
            history.listen(location => {
                if (pathMatchRegexp('/task/workTodo', location.pathname)) {
                    dispatch({
                        type: 'getWorkTodoViewTypeList',
                        payload: {
                            batchApproval: false,
                        }
                    });
                }
            });
        },
    },
    effects: {
        *getWorkTodoViewTypeList({ payload }, { call, put }) {
            const { batchApproval } = payload;
            let re;
            if (batchApproval) {
                re = yield call(getBatchWorkTodoViewTypeList, { batchApproval });
            }
            else {
                re = yield call(getWorkTodoViewTypeList);
            }
            if (re.success) {
                const viewTypeData = [...re.data];
                let count = 0;
                viewTypeData.forEach(m => count += m.count);
                if (viewTypeData.length > 1) {
                    viewTypeData.unshift({
                        businessModeId: null,
                        businessModelName: '全部待办事项',
                        count,
                    });
                }
                yield put({
                    type: 'updateState',
                    payload: {
                        viewTypeData,
                        currentViewType: viewTypeData.length > 0 ? viewTypeData[0] : null,
                    },
                });
            } else {
                message.error(re.message);
            }
        },
    },
});
