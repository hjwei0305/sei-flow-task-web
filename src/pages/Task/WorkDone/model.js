import { utils, message } from 'suid';
import { getWorkDoneViewTypeList, flowRevokeSubmit } from './service';

const { pathMatchRegexp, dvaModel, storage, constants } = utils;
const { modelExtend, model } = dvaModel;

const blankViewType = {
  businessModeId: null,
  businessModelName: formatMessage({id: 'flowtask_000044', defaultMessage: '暂无已办事项'}),
  count: 0,
};

export default modelExtend(model, {
  namespace: 'taskWorkDone',

  state: {
    viewTypeData: [],
    currentViewType: null,
    showFilter: false,
    filterData: {},
  },
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(location => {
        const match = pathMatchRegexp('/task/workDone', location.pathname);
        if (match) {
          dispatch({
            type: 'getWorkDoneViewTypeList',
            payload: {
              businessCode: '',
            },
          });
        }
      });
    },
    setupQuickLook({ dispatch, history }) {
      history.listen(location => {
        const match = pathMatchRegexp('/task/workDone/:code', location.pathname);
        const { sessionId = '' } = location.query;
        if (match) {
          sessionId && storage.sessionStorage.set(constants.CONST_GLOBAL.TOKEN_KEY, sessionId);
          dispatch({
            type: 'getWorkDoneViewTypeList',
            payload: {
              businessCode: match[1],
            },
          });
        }
      });
    },
  },
  effects: {
    *getWorkDoneViewTypeList({ payload }, { call, put }) {
      const { businessCode } = payload;
      const re = yield call(getWorkDoneViewTypeList);
      if (re.success) {
        const viewTypeData = [...re.data];
        let count = 0;
        viewTypeData.forEach(m => (count += m.count));
        if (viewTypeData.length > 1) {
          viewTypeData.unshift({
            businessModeId: null,
            businessModelName: formatMessage({id: 'flowtask_000045', defaultMessage: '全部已办事项'}),
            count,
          });
        }
        const payloadData = {
          viewTypeData,
          currentViewType: viewTypeData.length > 0 ? viewTypeData[0] : blankViewType,
        };
        if (businessCode) {
          Object.assign(payloadData, { filterData: { businessCode } });
        }
        yield put({
          type: 'updateState',
          payload: {
            ...payloadData,
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
        message.success(formatMessage({id: 'flowtask_000013', defaultMessage: '处理成功'}));
      } else {
        message.error(re.message);
      }
      if (callback && callback instanceof Function) {
        callback(re);
      }
    },
  },
});
