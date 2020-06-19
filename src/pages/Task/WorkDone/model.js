import { message } from 'antd';
import { utils } from 'suid';
import { getWorkDoneViewTypeList, flowRevokeSubmit } from './service';

const { pathMatchRegexp, dvaModel } = utils;
const { modelExtend, model } = dvaModel;

const blankViewType = {
  businessModeId: null,
  businessModelName: '暂无已办事项',
  count: 0,
};

export default modelExtend(model, {
  namespace: 'taskWorkDone',

  state: {
    viewTypeData: [],
    currentViewType: null,
  },
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(location => {
        if (pathMatchRegexp('/task/workDone', location.pathname)) {
          dispatch({
            type: 'getWorkDoneViewTypeList',
          });
        }
      });
    },
  },
  effects: {
    *getWorkDoneViewTypeList(_, { call, put }) {
      const re = yield call(getWorkDoneViewTypeList);
      if (re.success) {
        const viewTypeData = [...re.data];
        let count = 0;
        viewTypeData.forEach(m => (count += m.count));
        if (viewTypeData.length > 1) {
          viewTypeData.unshift({
            businessModeId: null,
            businessModelName: '全部已办事项',
            count,
          });
        }
        yield put({
          type: 'updateState',
          payload: {
            viewTypeData,
            currentViewType: viewTypeData.length > 0 ? viewTypeData[0] : blankViewType,
          },
        });
      } else {
        message.destroy();
        message.error(re.message);
      }
    },
    *flowRevokeSubmit({ payload, callback }, { call }) {
      const re = yield call(flowRevokeSubmit, payload);
      message.destroy();
      if (re.success) {
        message.success('处理成功');
      } else {
        message.error(re.message);
      }
      if (callback && callback instanceof Function) {
        callback(re);
      }
    },
  },
});
