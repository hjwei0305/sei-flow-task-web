import React, { PureComponent } from 'react';
import cls from 'classnames';
import { connect } from 'dva';
import { get, isEmpty } from 'lodash';
import moment from 'moment';
import withRouter from 'umi/withRouter';
import { FormattedMessage } from 'umi-plugin-react/locale';
import { Button, Tag, Drawer } from 'antd';
import { ExtTable, utils, ExtIcon } from 'suid';
import { constants, formartUrl, taskColor } from '@/utils';
import ExtAction from './components/ExtAction';
import WorkView from './components/WorkView';
import BatchModal from './components/BatchModal';
import FilterView from './components/FilterView';
import styles from './index.less';

const { eventBus } = utils;

const { SERVER_PATH, TASK_WORK_ACTION } = constants;

const filterOperation = {
  startDate: { fieldName: 'startDate', operation: 'GE', dataType: 'Date' },
  endDate: { fieldName: 'endDate', operation: 'LE', dataType: 'Date' },
  businessCode: { fieldName: 'flowInstance.businessCode', operation: 'LK', dataType: 'String' },
  businessModelRemark: {
    fieldName: 'flowInstance.businessModelRemark',
    opoperationer: 'LK',
    dataType: 'String',
  },
};

@withRouter
@connect(({ taskWorkTodo, loading }) => ({ taskWorkTodo, loading }))
class WorkTodo extends PureComponent {
  static tableRef;

  constructor(props) {
    super(props);
    this.state = {
      checkedKeys: [],
      isBatch: false,
    };
  }

  handlerViewOrder = doneItem => {
    const lookUrl =
      get(doneItem, 'flowInstance.flowDefVersion.flowDefination.flowType.lookUrl') ||
      get(doneItem, 'flowInstance.flowDefVersion.flowDefination.flowType.businessModel.lookUrl');
    let url = formartUrl(doneItem.webBaseAddressAbsolute, lookUrl);
    const flowInstanceBusinessId = get(doneItem, 'flowInstance.businessId', null);
    const flowInstanceBusinessCode = get(doneItem, 'flowInstance.businessCode', null);
    if (url.indexOf('?') === -1) {
      url = `${url}?id=${flowInstanceBusinessId}`;
    } else {
      url = `${url}&id=${flowInstanceBusinessId}`;
    }
    this.tabOpen({
      id: flowInstanceBusinessId,
      title: `单据详情-${flowInstanceBusinessCode}`,
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

  handlerApproveOrder = item => {
    let url = '';
    const flowInstanceId = get(item, 'flowInstance.id', null);
    const flowInstanceBusinessId = get(item, 'flowInstance.businessId', null);
    if (item.taskFormUrl.includes('?')) {
      url = `${item.taskFormUrl}&taskId=${item.id}&instanceId=${flowInstanceId}&id=${flowInstanceBusinessId}`;
    } else {
      url = `${item.taskFormUrl}?taskId=${item.id}&instanceId=${flowInstanceId}&id=${flowInstanceBusinessId}`;
    }
    this.tabOpen({
      id: item.id,
      title: `${item.taskName}-${get(item, 'flowInstance.BusinessCode', null)}`,
      url,
    });
  };

  handlerAction = (key, record) => {
    switch (key) {
      case TASK_WORK_ACTION.VIEW_ORDER:
        this.handlerViewOrder(record);
        break;
      case TASK_WORK_ACTION.TODO:
        this.handlerApproveOrder(record);
        break;
      default:
    }
  };

  handlerViewTypeChange = currentViewType => {
    const { dispatch } = this.props;
    dispatch({
      type: 'taskWorkTodo/updateState',
      payload: {
        currentViewType,
      },
    });
  };

  handlerBatch = () => {
    this.setState(state => {
      const isBatch = !state.isBatch;
      const { dispatch } = this.props;
      dispatch({
        type: 'taskWorkTodo/getWorkTodoViewTypeList',
        payload: {
          batchApproval: isBatch,
        },
      });
      this.handlerRefreshData();
      return {
        isBatch,
      };
    });
  };

  handlerRefreshData = () => {
    if (this.tableRef) {
      this.tableRef.remoteDataRefresh();
    }
  };

  handlerCancelBatchApprove = () => {
    this.setState(
      {
        checkedKeys: [],
      },
      this.tableRef.manualSelectedRows,
    );
  };

  handlerBatchApprove = () => {
    const { dispatch } = this.props;
    const { checkedKeys } = this.state;
    dispatch({
      type: 'taskWorkTodo/getBatchNextNodeList',
      payload: checkedKeys,
    });
  };

  handlerCloseBatchModal = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'taskWorkTodo/updateState',
      payload: {
        showBatchModal: false,
        batchNextNodes: [],
      },
    });
  };

  handlerSubmitBatch = data => {
    const { dispatch } = this.props;
    dispatch({
      type: 'taskWorkTodo/submitBatch',
      payload: data,
      callback: res => {
        if (res.success) {
          this.setState({ checkedKeys: [] }, this.handlerRefreshData);
        }
      },
    });
  };

  handlerFilterSubmit = filterData => {
    const { dispatch } = this.props;
    dispatch({
      type: 'taskWorkTodo/updateState',
      payload: {
        showFilter: false,
        filterData,
      },
    });
  };

  handlerShowFilter = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'taskWorkTodo/updateState',
      payload: {
        showFilter: true,
      },
    });
  };

  handlerCloseFilter = () => {
    const { dispatch } = this.props;
    dispatch({
      type: 'taskWorkTodo/updateState',
      payload: {
        showFilter: false,
      },
    });
  };

  getFilters = () => {
    const { taskWorkTodo } = this.props;
    const { filterData } = taskWorkTodo;
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
    const { isBatch, checkedKeys } = this.state;
    const { taskWorkTodo, loading, location } = this.props;
    const {
      currentViewType,
      viewTypeData,
      showBatchModal,
      batchNextNodes,
      showFilter,
      filterData,
    } = taskWorkTodo;
    const hasSelected = checkedKeys.length > 0;
    const filters = this.getFilters();
    const columns = [
      {
        title: '单据编号',
        dataIndex: 'flowInstance.businessCode',
        width: 160,
        render: (text, record) => {
          if (record && !isBatch) {
            const num = get(record, 'flowInstance.businessCode', '');
            return (
              <span title={num}>
                <Button
                  type="link"
                  style={{ padding: 0 }}
                  onClick={() => this.handlerApproveOrder(record)}
                >
                  {num}
                </Button>
              </span>
            );
          }
          return text;
        },
      },
      {
        title: '流程名称',
        dataIndex: 'flowName',
        width: 180,
        render: flowName => {
          return <span title={flowName}>{flowName}</span>;
        },
      },
      {
        title: '单据说明',
        dataIndex: 'flowInstance.businessModelRemark',
        width: 480,
        render: (_text, record) => {
          if (record) {
            const res = get(record, 'flowInstance.businessModelRemark', '');
            return <span title={res}>{res}</span>;
          }
          return null;
        },
      },
      {
        title: '创建者',
        dataIndex: 'flowInstance.creatorAccount',
        width: 200,
        render: (_text, record) => {
          if (record) {
            const creatorName = get(record, 'flowInstance.creatorName', '');
            const creatorAccount = get(record, 'flowInstance.creatorAccount', '');
            return <span title={creatorAccount}>{creatorName}</span>;
          }
          return null;
        },
      },
      {
        title: '事项到达',
        dataIndex: 'createdDate',
        width: 100,
        render: (_text, record) => {
          if (record) {
            return (
              <Tag color={taskColor(record.createdDate)}>
                <span title={moment(record.createdDate).format('YYYY-MM-DD HH:mm:ss')}>
                  {moment(record.createdDate).fromNow()}
                </span>
              </Tag>
            );
          }
          return null;
        },
      },
    ];
    if (!isBatch) {
      columns.unshift({
        key: 'operation',
        width: 50,
        align: 'center',
        dataIndex: 'id',
        title: '操作',
        className: 'action',
        required: true,
        render: (id, record) => {
          return (
            <span className={cls('action-box')}>
              <ExtAction key={id} onAction={this.handlerAction} item={record} />
            </span>
          );
        },
      });
    }
    const toolBarProps = {
      layout: { leftSpan: 14, rightSpan: 10 },
      left: (
        <>
          <WorkView
            currentViewType={currentViewType}
            viewTypeData={viewTypeData}
            onAction={this.handlerViewTypeChange}
          />
          <Button
            type={isBatch ? 'danger' : 'default'}
            onClick={this.handlerBatch}
            loading={loading.effects['taskWorkTodo/getWorkTodoViewTypeList']}
            className="btn-item"
          >
            {isBatch ? '退出批量处理' : '我要批量处理'}
          </Button>
          <Button onClick={this.handlerRefreshData} className="btn-item">
            <FormattedMessage id="global.refresh" defaultMessage="刷新" />
          </Button>
          <Drawer
            placement="top"
            closable={false}
            mask={false}
            height={44}
            getContainer={false}
            style={{ position: 'absolute' }}
            visible={hasSelected}
          >
            <span className={cls('select')}>{`已选择 ${checkedKeys.length} 项`}</span>
            <Button
              className="btn-item"
              type="danger"
              onClick={this.handlerCancelBatchApprove}
              disabled={loading.effects['taskWorkTodo/removeAssignedFeatureItem']}
            >
              取消
            </Button>
            <Button
              className="btn-item"
              type="primary"
              onClick={this.handlerBatchApprove}
              loading={loading.effects['taskWorkTodo/getBatchNextNodeList']}
            >
              批量处理
            </Button>
          </Drawer>
        </>
      ),
      extra: (
        <>
          <span
            className={cls('filter-btn', 'icon-btn-item', { 'has-filter': filters.hasFilter })}
            onClick={this.handlerShowFilter}
          >
            <ExtIcon type="filter" style={{ fontSize: 16 }} />
            <span className="lable">过滤</span>
          </span>
        </>
      ),
    };
    const extTableProps = {
      toolBar: toolBarProps,
      columns,
      checkbox: isBatch,
      searchWidth: 280,
      searchPlaceHolder: '输入单据编号、说明关键字查询',
      searchProperties: ['flowInstance.businessCode', 'flowInstance.businessModelRemark'],
      remotePaging: true,
      cascadeParams: {
        modelId: get(
          currentViewType,
          'businessModeId',
          get(location, 'query.currentViewTypeId', null),
        ),
        filters: filters.filter,
      },
      onSelectRow: keys => {
        if (isBatch) {
          this.setState({
            checkedKeys: keys,
          });
        }
      },
      store: {
        type: 'POST',
        url: `${SERVER_PATH}/flow-service/flowTask/queryCurrentUserFlowTask`,
        params: { canBatch: isBatch },
      },
      onTableRef: ref => (this.tableRef = ref),
      sort: {
        field: {
          createdDate: 'asc',
          flowName: null,
          'flowInstance.creatorAccount': null,
          'flowInstance.businessCode': null,
          'flowInstance.businessModelRemark': null,
        },
      },
    };
    const batchModalProps = {
      visible: showBatchModal,
      batchNextNodes,
      submitting: loading.effects['taskWorkTodo/submitBatch'],
      onCloseModal: this.handlerCloseBatchModal,
      onSubmitBatch: this.handlerSubmitBatch,
    };
    const filterViewProps = {
      showFilter,
      filterData,
      onFilterSubmit: this.handlerFilterSubmit,
      onCloseFilter: this.handlerCloseFilter,
    };
    return (
      <div className={cls(styles['container-box'])}>
        <ExtTable {...extTableProps} />
        <BatchModal {...batchModalProps} />
        <FilterView {...filterViewProps} />
      </div>
    );
  }
}

export default WorkTodo;
