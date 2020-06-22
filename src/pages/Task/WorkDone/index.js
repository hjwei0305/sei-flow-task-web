import React, { PureComponent } from 'react';
import cls from 'classnames';
import { connect } from 'dva';
import { get, trim } from 'lodash';
import moment from 'moment';
import { FormattedMessage } from 'umi-plugin-react/locale';
import { Button, Tag, Input, Alert, Modal } from 'antd';
import { ExtTable, utils, ExtIcon, Animate } from 'suid';
import { constants, formartUrl } from '@/utils';
import ExtAction from './components/ExtAction';
import WorkView from './components/WorkView';
import styles from './index.less';

const { eventBus } = utils;

const { SERVER_PATH, TASK_WORK_ACTION } = constants;

const { TextArea } = Input;

@connect(({ taskWorkDone, loading }) => ({ taskWorkDone, loading }))
class WorkDone extends PureComponent {
  static tableRef;

  static flowRevokeOpinion;

  static showFlowRevokeOpinionValidate;

  static confirmModal;

  constructor(props) {
    super(props);
    this.flowRevokeOpinion = '';
    this.showFlowRevokeOpinionValidate = false;
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

  handlerAction = (key, record) => {
    switch (key) {
      case TASK_WORK_ACTION.VIEW_ORDER:
        this.handlerViewOrder(record);
        break;
      case TASK_WORK_ACTION.FLOW_REVOKE:
        this.flowRevokeConfirm(record);
        break;
      default:
    }
  };

  handlerOpinionChange = e => {
    this.flowRevokeOpinion = trim(e.target.value);
    if (this.flowRevokeOpinion) {
      this.showFlowRevokeOpinionValidate = false;
    } else {
      this.showFlowRevokeOpinionValidate = true;
    }
  };

  renderflowRevokeConfirmContent = () => {
    const confirmOpin = (
      <TextArea
        style={{ resize: 'none' }}
        autoSize={false}
        rows={4}
        placeholder="请填写撤回的原因"
        onChange={this.handlerOpinionChange}
      />
    );
    let tip = null;
    if (this.showFlowRevokeOpinionValidate === true) {
      tip = (
        <Animate type="shake">
          <Alert type="error" message="请填写你想要撤回的原因" style={{ marginBottom: 8 }} banner />
        </Animate>
      );
    }
    return (
      <>
        {tip}
        {confirmOpin}
      </>
    );
  };

  flowRevokeConfirm = doneItem => {
    this.confirmModal = Modal.confirm({
      title: '我要撤销',
      content: this.renderflowRevokeConfirmContent(),
      icon: <ExtIcon type="exclamation-circle" antd />,
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        return new Promise(resolve => {
          if (!this.flowRevokeOpinion) {
            this.showFlowRevokeOpinionValidate = true;
            this.confirmModal.update({
              okButtonProps: { loading: false },
              content: this.renderflowRevokeConfirmContent(),
            });
          } else {
            this.flowRevokeSubmit(doneItem, resolve);
          }
        });
      },
      onCancel: () => {
        this.showFlowRevokeOpinionValidate = false;
        this.confirmModal.destroy();
        this.confirmModal = null;
        this.flowRevokeOpinion = '';
      },
    });
  };

  flowRevokeSubmit = (doneItem, resolve) => {
    const { dispatch } = this.props;
    this.showFlowRevokeOpinionValidate = false;
    this.confirmModal.update({
      okButtonProps: { loading: true },
      cancelButtonProps: { disabled: true },
      content: this.renderflowRevokeConfirmContent(),
    });
    const data = { id: doneItem.id, opinion: this.flowRevokeOpinion };
    dispatch({
      type: 'taskWorkDone/flowRevokeSubmit',
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
      type: 'taskWorkDone/updateState',
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
    const { taskWorkDone } = this.props;
    const { currentViewType, viewTypeData } = taskWorkDone;
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
        dataIndex: 'flowInstance.businessCode',
        width: 160,
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
        title: '办理时间',
        dataIndex: 'actEndTime',
        width: 100,
        render: (_text, record) => {
          if (record) {
            return (
              <span title={moment(record.actEndTime).format('YYYY-MM-DD HH:mm:ss')}>
                <Tag>{moment(record.actEndTime).fromNow()}</Tag>
              </span>
            );
          }
          return null;
        },
      },
    ];
    const toolBarProps = {
      layout: { leftSpan: 14, rightSpan: 10 },
      left: (
        <>
          <WorkView
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
      searchWidth: 280,
      searchPlaceHolder: '输入单据编号、说明关键字查询',
      searchProperties: ['flowInstance.businessCode', 'flowInstance.businessModelRemark'],
      remotePaging: true,
      cascadeParams: {
        modelId: get(currentViewType, 'businessModeId', null),
      },
      store: {
        type: 'POST',
        url: `${SERVER_PATH}/flow-service/flowHistory/listValidFlowHistory`,
      },
      onTableRef: ref => (this.tableRef = ref),
      sort: {
        field: {
          actEndTime: 'desc',
          flowName: null,
          'flowInstance.creatorAccount': null,
          'flowInstance.businessCode': null,
          'flowInstance.businessModelRemark': null,
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

export default WorkDone;
