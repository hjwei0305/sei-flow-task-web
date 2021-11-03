import { utils, message } from 'suid';
import { formatMessage } from 'umi-plugin-react/locale';
import { getMyOrderViewTypeList, flowEndSubmit } from './service';

const { pathMatchRegexp, dvaModel } = utils;
const { modelExtend, model } = dvaModel;

const blankViewType = {
  businessModeId: null,
  businessModelName: formatMessage({ id: 'flowtask_000051', defaultMessage: '暂无可显示的单据' }),
  count: 0,
};

export default modelExtend(model, {
  namespace: 'taskMyOrder',

  state: {
    viewTypeData: [],
    currentViewType: null,
    showFilter: false,
    filterData: {},
  },
  subscriptions: {
    setup({ dispatch, history }) {
      history.listen(location => {
        if (pathMatchRegexp('/task/myOrder', location.pathname)) {
          dispatch({
            type: 'getMyOrderViewTypeList',
          });
        }
      });
    },
  },
  effects: {
    *getMyOrderViewTypeList(_, { call, put }) {
      const re = yield call(getMyOrderViewTypeList);
      if (re.success) {
        const viewTypeData = [...re.data];
        let count = 0;
        viewTypeData.forEach(m => (count += m.count));
        if (viewTypeData.length > 1) {
          viewTypeData.unshift({
            businessModeId: null,
            businessModelName: formatMessage({ id: 'flowtask_000052', defaultMessage: '全部单据' }),
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
    *flowEndSubmit({ payload, callback }, { call }) {
      const re = yield call(flowEndSubmit, payload);
      message.destroy();
      if (re.success) {
        message.success(formatMessage({ id: 'flowtask_000013', defaultMessage: '处理成功' }));
      } else {
        message.error(re.message);
      }
      if (callback && callback instanceof Function) {
        callback(re);
      }
    },
  },
});
