import React, { PureComponent } from 'react';
import cls from 'classnames';
import { connect } from 'dva';
import { get } from 'lodash';
import moment from 'moment';
import { FormattedMessage } from 'umi-plugin-react/locale';
import { Button, Tag, Modal } from 'antd';
import { ExtTable, utils, ExtIcon } from 'suid';
import { constants, formartUrl } from '@/utils';
import ExtAction from './components/ExtAction';
import OrderView from './components/OrderView';
import styles from './index.less';

const { eventBus } = utils;

const { SERVER_PATH, TASK_WORK_ACTION } = constants;

@connect(({ taskMyOrder, loading }) => ({ taskMyOrder, loading }))
class MyOrder extends PureComponent {
  static tableRef;

  static confirmModal;

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

  handlerAction = (key, record) => {
    switch (key) {
      case TASK_WORK_ACTION.VIEW_ORDER:
        this.handlerViewOrder(record);
        break;
      case TASK_WORK_ACTION.FLOW_END:
        this.flowEndConfirm(record);
        break;
      default:
    }
  };

  renderflowRevokeConfirmContent = doneItem => {
    return (
      <>
        确定要终止单号为
        <span style={{ color: 'rgba(0,0,0,0.65)', margin: '0 8px', fontWeight: 700 }}>
          {doneItem.businessCode}
        </span>
        的单据吗?
      </>
    );
  };

  flowEndConfirm = doneItem => {
    this.confirmModal = Modal.confirm({
      title: '终止审批确认',
      content: this.renderflowRevokeConfirmContent(doneItem),
      icon: <ExtIcon type="exclamation-circle" antd />,
      okText: '确定',
      cancelText: '取消',
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

  render() {
    const { taskMyOrder } = this.props;
    const { currentViewType, viewTypeData } = taskMyOrder;
    const columns = [
      {
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
              <ExtAction key={id} onAction={this.handlerAction} doneItem={record} />
            </span>
          );
        },
      },
      {
        title: '单据编号',
        dataIndex: 'businessCode',
        width: 160,
      },
      {
        title: '单据状态',
        dataIndex: 'flowStatus',
        width: 140,
        render: (_, record) => {
          if (get(record, 'ended') === true) {
            return <Tag color="blue">审批完成</Tag>;
          }
          if (get(record, 'manuallyEnd') === true) {
            return <Tag color="magenta">异常结束</Tag>;
          }
          return <Tag color="green">审批中</Tag>;
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
        title: '提交时间',
        dataIndex: 'createdDate',
        width: 100,
        render: (_text, record) => {
          if (record) {
            return (
              <span title={moment(record.createdDate).format('YYYY-MM-DD HH:mm:ss')}>
                <Tag>{moment(record.createdDate).fromNow()}</Tag>
              </span>
            );
          }
          return null;
        },
      },
      {
        title: '审批完成时间',
        dataIndex: 'endDate',
        width: 160,
        render: (_text, record) => {
          if (record) {
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
    };
    const extTableProps = {
      toolBar: toolBarProps,
      columns,
      rowKey: 'businessId',
      searchWidth: 280,
      searchPlaceHolder: '输入单据编号、说明关键字查询',
      searchProperties: ['businessCode', 'businessModelRemark'],
      remotePaging: true,
      cascadeParams: {
        modelId: get(currentViewType, 'businessModeId', null),
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
    return (
      <div className={cls(styles['container-box'])}>
        <ExtTable {...extTableProps} />
      </div>
    );
  }
}

export default MyOrder;
