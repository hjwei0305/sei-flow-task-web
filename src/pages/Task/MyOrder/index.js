import React, { PureComponent } from 'react';
import cls from 'classnames';
import { connect } from 'dva';
import { get, isEmpty } from 'lodash';
import moment from 'moment';
import { FormattedMessage, formatMessage } from 'umi-plugin-react/locale';
import { Button, Tag, Modal } from 'antd';
import { ExtTable, utils, ExtIcon } from 'suid';
import { constants, formartUrl } from '@/utils';
import ExtAction from './components/ExtAction';
import OrderView from './components/OrderView';
import FilterView from './components/FilterView';
import UrgedForm from './components/UrgedForm';
import styles from './index.less';

const { eventBus } = utils;

const { SERVER_PATH, TASK_WORK_ACTION } = constants;

const filterOperation = {
  startDate: { fieldName: 'startDate', operation: 'GE', dataType: 'Date' },
  endDate: { fieldName: 'endDate', operation: 'LE', dataType: 'Date' },
  businessCode: { fieldName: 'businessCode', operation: 'LK', dataType: 'String' },
  businessModelRemark: {
    fieldName: 'businessModelRemark',
    operation: 'LK',
    dataType: 'String',
  },
  flowStatus: {
    fieldName: 'flowStatus',
    operation: 'EQ',
    dataType: 'String',
  },
};

@connect(({ taskMyOrder, loading }) => ({ taskMyOrder, loading }))
class MyOrder extends PureComponent {
  static tableRef;

  static confirmModal;

  static urgeRecord;

  constructor(props) {
    super(props);
    this.flowRevokeOpinion = '';
    this.showFlowRevokeOpinionValidate = false;
  }

  handlerViewOrder = doneItem => {
    const lookUrl = get(doneItem, 'lookUrl');
    let url = formartUrl(doneItem.webBaseAddressAbsolute, lookUrl);
    const flowInstanceBusinessId = get(doneItem, 'businessId', null);
    const flowInstanceBusinessCode = get(doneItem, 'businessCode', null);
    if (url.indexOf('?') === -1) {
      url = `${url}?id=${flowInstanceBusinessId}`;
    } else {
      url = `${url}&id=${flowInstanceBusinessId}`;
    }
    this.tabOpen({
      id: flowInstanceBusinessId,
      title: `${formatMessage({
        id: 'flowtask_000014',
        defaultMessage: '单据详情-',
      })}${flowInstanceBusinessCode}`,
      url,
    });
  };

  tabOpen = item => {
    if (window.top !== window.self) {
      eventBus.emit('openTab', {
        id: item.id,
        title: item.title,
        url: item.url,
      });
    } else {
      window.open(item.url, item.title);
    }
  };

  handlerUrge = data => {
    const { dispatch } = this.props;
    dispatch({
      type: 'taskMyOrder/sendToUrgedInfo',
      payload: data,
      callback: res => {
        if (res.success) {
          this.handlerRefreshData();
          this.handlerCloseShowUrge();
        }
      },
    });
  };

  handlerShowUrge = record => {
    this.urgeRecord = record;
    const { dispatch } = this.props;
    dispatch({
      type: 'taskMyOrder/updateState',
      payload: {
        showUrge: true,
      },
    });
  };

  handlerCloseShowUrge = () => {
    this.urgeRecord = null;
    const { dispatch } = this.props;
    dispatch({
      type: 'taskMyOrder/updateState',
      payload: {
        showUrge: false,
      },
    });
  };

  handlerAction = (key, record) => {
    switch (key) {
      case TASK_WORK_ACTION.VIEW_ORDER:
        this.handlerViewOrder(record);
        break;
      case TASK_WORK_ACTION.FLOW_END:
        this.flowEndConfirm(record);
        break;
      case TASK_WORK_ACTION.FLOW_URGE:
        this.handlerShowUrge(record);
        break;
      default:
    }
  };

  renderflowRevokeConfirmContent = doneItem => {
    return (
      <>
        {formatMessage({ id: 'flowtask_000053', defaultMessage: '确定要终止单号为' })}
        <span style={{ color: 'rgba(0,0,0,0.65)', margin: '0 8px', fontWeight: 700 }}>
          {doneItem.businessCode}
        </span>
        {formatMessage({ id: 'flowtask_000054', defaultMessage: '的单据吗?' })}?
      </>
    );
  };

  flowEndConfirm = doneItem => {
    this.confirmModal = Modal.confirm({
      title: formatMessage({ id: 'flowtask_000055', defaultMessage: '终止审批确认' }),
      content: this.renderflowRevokeConfirmContent(doneItem),
      icon: <ExtIcon type="exclamation-circle" antd />,
      okText: formatMessage({ id: 'flowtask_000035', defaultMessage: '确定' }),
      cancelText: formatMessage({ id: 'flowtask_000025', defaultMessage: '取消' }),
      onOk: () => {
        return new Promise(resolve => {
          this.flowEndSubmit(doneItem, resolve);
        });
      },
      onCancel: () => {
        this.confirmModal.destroy();
        this.confirmModal = null;
      },
    });
  };

  flowEndSubmit = (doneItem, resolve) => {
    const { dispatch } = this.props;
    this.confirmModal.update({
      okButtonProps: { loading: true },
      cancelButtonProps: { disabled: true },
    });
    const data = { instanceId: get(doneItem, 'flowInstanceId', null) };
    dispatch({
      type: 'taskMyOrder/flowEndSubmit',
      payload: data,
      callback: res => {
        this.confirmModal.update({
          okButtonProps: { loading: false },
          cancelButtonProps: { disabled: false },
        });
        if (res.success) {
          resolve();
          this.handlerRefreshData();
        }
      },
    });
  };

  handlerViewTypeChange = currentViewType => {
    const { dispatch } = this.props;
    dispatch({
      type: 'taskMyOrder/updateState',
      payload: {
        currentViewType,
      },
    });
  };

  handlerRefreshData = () => {
    if (this.tableRef) {
      this.tableRef.remoteDataRefresh();
    }
  };

  handlerFilterSubmit = filterData => {
    const { dispatch } = this.props;
    dispatch({
      type: 'taskMyOrder/updateState',
      payload: {
        showFilter: false,
        filterData,
      },
    });
  };

  handlerShowFilter = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'taskMyOrder/updateState',
      payload: {
        showFilter: true,
      },
    });
  };

  handlerCloseFilter = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'taskMyOrder/updateState',
      payload: {
        showFilter: false,
      },
    });
  };

  handlerResetFilter = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'taskMyOrder/updateState',
      payload: {
        filterData: {},
      },
    });
  };

  getFilters = () => {
    const { taskMyOrder } = this.props;
    const { filterData } = taskMyOrder;
    const filters = { filter: [], hasFilter: false };
    Object.keys(filterData).forEach(key => {
      const operation = get(filterOperation, key);
      const value = get(filterData, key, null);
      if (!isEmpty(value)) {
        filters.hasFilter = true;
      }
      filters.filter.push({
        fieldName: get(operation, 'fieldName'),
        value,
        operator: get(operation, 'operation'),
        fieldType: get(operation, 'dataType'),
      });
    });
    return filters;
  };

  render() {
    const { taskMyOrder, loading } = this.props;
    const { currentViewType, viewTypeData, showFilter, filterData, showUrge } = taskMyOrder;
    const filters = this.getFilters();
    const columns = [
      {
        key: 'operation',
        width: 80,
        align: 'center',
        dataIndex: 'id',
        title: formatMessage({ id: 'flowtask_000021', defaultMessage: '操作' }),
        className: 'action',
        fixed: 'left',
        required: true,
        render: (id, record) => {
          return (
            <span className={cls('action-box')}>
              <ExtAction key={id} onAction={this.handlerAction} doneItem={record} />
            </span>
          );
        },
      },
      {
        title: formatMessage({ id: 'flowtask_000015', defaultMessage: '单据编号' }),
        dataIndex: 'businessCode',
        width: 160,
      },
      {
        title: formatMessage({ id: 'flowtask_000056', defaultMessage: '单据状态' }),
        dataIndex: 'flowStatus',
        width: 140,
        render: (_, record) => {
          if (get(record, 'manuallyEnd') === true) {
            return (
              <Tag color="magenta">
                {formatMessage({ id: 'flowtask_000057', defaultMessage: '已终止' })}
              </Tag>
            );
          }
          if (get(record, 'ended') === true) {
            return (
              <Tag color="green">
                {formatMessage({ id: 'flowtask_000058', defaultMessage: '审批完成' })}
              </Tag>
            );
          }
          return (
            <Tag color="blue">
              {formatMessage({ id: 'flowtask_000059', defaultMessage: '审批中' })}
            </Tag>
          );
        },
      },
      {
        title: formatMessage({ id: 'flowtask_000016', defaultMessage: '流程名称' }),
        dataIndex: 'flowName',
        width: 180,
        render: flowName => {
          return <span title={flowName}>{flowName}</span>;
        },
      },
      {
        title: formatMessage({ id: 'flowtask_000017', defaultMessage: '单据说明' }),
        dataIndex: 'businessModelRemark',
        width: 480,
        render: (_text, record) => {
          if (record) {
            const res = get(record, 'businessModelRemark', '');
            return <span title={res}>{res}</span>;
          }
          return null;
        },
      },
      {
        title: formatMessage({ id: 'flowtask_000060', defaultMessage: '提交时间' }),
        dataIndex: 'createdDate',
        width: 180,
        render: (_text, record) => {
          if (record) {
            return moment(record.createdDate).format('YYYY-MM-DD HH:mm:ss');
          }
          return null;
        },
      },
      {
        title: formatMessage({ id: 'flowtask_000061', defaultMessage: '流程结束时间' }),
        dataIndex: 'endDate',
        width: 160,
        render: (_text, record) => {
          const ended = get(record, 'ended') || get(record, 'manuallyEnd');
          if (record && ended === true) {
            return moment(record.endDate).format('YYYY-MM-DD HH:mm');
          }
          return null;
        },
      },
    ];
    const toolBarProps = {
      layout: { leftSpan: 14, rightSpan: 10 },
      left: (
        <>
          <OrderView
            currentViewType={currentViewType}
            viewTypeData={viewTypeData}
            onAction={this.handlerViewTypeChange}
          />
          <Button onClick={this.handlerRefreshData} className="btn-item">
            <FormattedMessage id="global.refresh" defaultMessage="刷新" />
          </Button>
        </>
      ),
      extra: (
        <>
          <span
            className={cls('filter-btn', 'icon-btn-item', { 'has-filter': filters.hasFilter })}
            onClick={this.handlerShowFilter}
          >
            <ExtIcon type="filter" style={{ fontSize: 16 }} />
            <span className="lable">
              {formatMessage({ id: 'flowtask_000027', defaultMessage: '过滤' })}
            </span>
          </span>
        </>
      ),
    };
    const extTableProps = {
      toolBar: toolBarProps,
      columns,
      lineNumber: false,
      rowKey: 'flowInstanceId',
      searchWidth: 280,
      searchPlaceHolder: formatMessage({
        id: 'flowtask_000028',
        defaultMessage: '输入单据编号、说明关键字查询',
      }),
      searchProperties: ['businessCode', 'businessModelRemark'],
      remotePaging: true,
      cascadeParams: {
        modelId: get(currentViewType, 'businessModeId', null),
        filters: filters.filter,
      },
      store: {
        type: 'POST',
        url: `${SERVER_PATH}/flow-service/flowInstance/getAllMyBills`,
      },
      onTableRef: ref => (this.tableRef = ref),
      sort: {
        field: {
          createdDate: 'desc',
          endDate: null,
          flowName: null,
          businessCode: null,
          businessModelRemark: null,
        },
      },
    };
    const filterViewProps = {
      showFilter,
      filterData,
      onFilterSubmit: this.handlerFilterSubmit,
      onCloseFilter: this.handlerCloseFilter,
    };
    const urgedFormProps = {
      closeFormModal: this.handlerCloseShowUrge,
      saving: loading.effects['taskMyOrder/sendToUrgedInfo'],
      showModal: showUrge,
      save: this.handlerUrge,
      flowInstanceId: get(this.urgeRecord, 'flowInstanceId'),
    };
    return (
      <div className={cls(styles['container-box'])}>
        <ExtTable {...extTableProps} />
        <FilterView {...filterViewProps} />
        <UrgedForm {...urgedFormProps} />
      </div>
    );
  }
}

export default MyOrder;
