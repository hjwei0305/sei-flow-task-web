import React, { PureComponent } from 'react';
import cls from 'classnames';
import { connect } from 'dva';
import { get } from 'lodash';
import moment from 'moment';
import { FormattedMessage } from 'umi-plugin-react/locale';
import { Button, Tag } from 'antd';
import { ExtTable, utils, ExtIcon } from 'suid';
import { constants, formartUrl,taskColor } from '@/utils';
import ExtAction from './components/ExtAction';
import FilterView from './components/FilterView';
import styles from './index.less';

const { eventBus } = utils;

const { SERVER_PATH, TASK_WORK_ACTION } = constants;


@connect(({ taskWorkTodo, loading }) => ({ taskWorkTodo, loading }))
class WorkTodo extends PureComponent {

    static tableRef;

    constructor(props) {
        super(props);
        this.state = {
            isBatch: false,
        }
    }

    handlerViewOrder = doneItem => {
        let url = formartUrl(doneItem.webBaseAddressAbsolute, doneItem.flowInstanceLookUrl);
        if (url.indexOf('?') === -1) {
            url = `${url}?id=${doneItem.flowInstanceBusinessId}`;
        } else {
            url = `${url}&id=${doneItem.flowInstanceBusinessId}`;
        }
        this.tabOpen({
            id: doneItem.flowInstanceBusinessId,
            title: `单据详情-${doneItem.flowInstanceBusinessCode}`,
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

    handlerApproveOrder = (item) => {
        let url = '';
        const flowInstanceId = get(item, 'flowInstance.id', null);
        const flowInstanceBusinessId = get(item, 'flowInstance.BusinessId', null);
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

    handlerViewTypeChange = (currentViewType) => {
        const { dispatch } = this.props;
        dispatch({
            type: 'taskWorkTodo/updateState',
            payload: {
                currentViewType
            }
        });
    };

    handlerBatch = () => {
        this.setState((state) => {
            const isBatch = !state.isBatch;
            const { dispatch } = this.props;
            dispatch({
                type: 'taskWorkTodo/getWorkTodoViewTypeList',
                payload: {
                    batchApproval: isBatch,
                }
            });
            return ({
                isBatch
            });
        });
    };

    handlerRefreshData = () => {
        if (this.tableRef) {
            this.tableRef.remoteDataRefresh();
        }
    }

    render() {
        const { isBatch } = this.state;
        const { taskWorkTodo } = this.props;
        const { currentViewType, viewTypeData } = taskWorkTodo;
        const columns = [{
            title: '单据编号',
            dataIndex: 'flowInstance.businessCode',
            width: 160,
            render: (_text, record) => {
                if (record) {
                    const num = get(record, 'flowInstance.businessCode', '');
                    return (
                        <span title={num}>
                            <Button type="link" style={{ padding: 0 }} onClick={() => this.handlerApproveOrder(record)}>{num}</Button>
                        </span>
                    );
                }
                return null;
            }
        }, {
            title: '流程名称',
            dataIndex: 'flowName',
            width: 180,
            render: (flowName) => {
                return (
                    <span title={flowName}>
                        {flowName}
                    </span>
                );
            }
        }, {
            title: '单据说明',
            dataIndex: 'flowInstance.businessModelRemark',
            width: 480,
            render: (_text, record) => {
                if (record) {
                    const res = get(record, 'flowInstance.businessModelRemark', '');
                    return <span title={res}>{res}</span>;
                }
                return null;
            }
        }, {
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
            }
        }, {
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
            }
        }];
        if (!isBatch) {
            columns.unshift({
                key: 'operation',
                width: 50,
                align: 'center',
                dataIndex: 'id',
                className: 'action',
                required: true,
                render: (id, record) => {
                    return (
                        <span className={cls('action-box')}>
                            <ExtAction key={id} onAction={this.handlerAction} item={record} />
                        </span>
                    )
                }
            });
        }
        const toolBarProps = {
            left: (
                <>
                    <FilterView
                        currentViewType={currentViewType}
                        viewTypeData={viewTypeData}
                        onAction={this.handlerViewTypeChange}
                    />
                    <Button type={isBatch ? 'danger' : 'default'} onClick={this.handlerBatch} className="btn-item">
                        {
                            isBatch
                                ? '退出批量处理'
                                : '批量处理'
                        }
                    </Button>
                    <Button onClick={this.handlerRefreshData} className="btn-item">
                        <FormattedMessage id="global.refresh" defaultMessage="刷新" />
                    </Button>
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
                modelId: get(currentViewType, 'businessModeId', null),
            },
            store: {
                type: 'POST',
                url: `${SERVER_PATH}/flow-service/flowTask/queryCurrentUserFlowTask`,
                params: { canBatch: isBatch }
            },
            onTableRef: ref => this.tableRef = ref,
            sort: {
                field: { 'createdDate': 'asc', 'flowName': null, 'flowInstance.creatorAccount': null, 'flowInstance.businessCode': null, 'flowInstance.businessModelRemark': null }
            }
        };
        return (
            <div className={cls(styles['container-box'])}>
                <ExtTable {...extTableProps} />
            </div>
        )
    }
}

export default WorkTodo;
