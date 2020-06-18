import React, { PureComponent } from 'react';
import cls from 'classnames';
import { isEmpty, uniq, isEqual } from 'lodash'
import { Collapse, Alert } from 'antd';
import { ExtModal, ScrollBar } from 'suid';
import UserList from './UserList';
import styles from './index.less';

const { Panel } = Collapse;

class BatchModal extends PureComponent {

    static submitData;

    constructor(props) {
        super(props);
        this.submitData = [];
        this.state = {
            canSubmit: false,
        }
    }

    componentDidUpdate(prevProps) {
        const { batchNextNodes } = this.props;
        if (!isEqual(prevProps.batchNextNodes, batchNextNodes)) {
            console.log(111)
            this.initSubmitData();
        }
    }

    initSubmitData = () => {
        const { batchNextNodes } = this.props;
        this.submitData = batchNextNodes.map(node => {
            const isSolidifyFlow = !!node.solidifyFlow;
            const taskIdList = [];
            const flowTaskCompleteList = [];
            node.nodeGroupInfos.forEach(info => {
                taskIdList.push(...info.ids);
                let userIds = null;
                if (info.executorSet && info.executorSet.length === 1) {
                    userIds = info.executorSet[0].id
                }
                flowTaskCompleteList.push({
                    userIds,
                    nodeId: info.nodeId,
                    flowTaskType: info.flowTaskType,
                    userVarName: info.userVarName,
                    callActivityPath: info.callActivityPath,
                    instancyStatus: false,
                    type: info.type,
                })
            });
            return {
                id: node.id,
                taskIdList: uniq(taskIdList),
                solidifyFlow: isSolidifyFlow,
                flowTaskCompleteList,
            }
        })
        const canSubmit = this.checkCanSubmit();
        this.setState({ canSubmit });
    }

    handlerSubmit = () => {
        const { onSubmitBatch } = this.props;
        if (onSubmitBatch) {
            onSubmitBatch(this.submitData);
        }
    }

    handlerCloseModal = () => {
        const { onCloseModal } = this.props;
        if (onCloseModal) {
            onCloseModal();
        }
    };

    handlerUserSelectChange = (id, nodeId, checkedUserList) => {
        const changeNode = this.submitData.filter(node => node.id === id)[0];
        changeNode.flowTaskCompleteList.forEach(task => {
            if (task.nodeId === nodeId) {
                Object.assign(task, { userIds: checkedUserList.toString() })
            }
        });
        const canSubmit = this.checkCanSubmit();
        this.setState({ canSubmit });
    };

    checkCanSubmit = () => {
        let canSubmit = true;
        this.submitData.forEach(node => {
            node.flowTaskCompleteList.forEach(task => {
                if (task.flowTaskType !== 'poolTask') {
                    if (!node.solidifyFlow && (isEmpty(task.userIds) && task.type !== 'EndEvent') && task.type !== 'CounterSignNotEnd') {
                        canSubmit = false;
                    }
                }
            })
        })
        return canSubmit;
    }

    render() {
        const { visible, submitting, batchNextNodes } = this.props;
        const { canSubmit } = this.state;
        const extModalProps = {
            title: '批量处理',
            wrapClassName: cls(styles['batch-modal-box']),
            width: 720,
            bodyStyle: { height: 480, padding: 0 },
            visible,
            destroyOnClose: true,
            maskClosable: false,
            onOk: this.handlerSubmit,
            okButtonProps: {
                disabled: !canSubmit
            },
            confirmLoading: submitting,
            onCancel: this.handlerCloseModal
        };
        return (
            <ExtModal {...extModalProps}>
                <ScrollBar>
                    <Collapse bordered={false} defaultActiveKey={batchNextNodes.map(n => n.id)}>
                        {
                            batchNextNodes.map(node => {
                                const { id, name, solidifyFlow, nodeGroupInfos } = node;
                                return (
                                    <Panel header={name} key={id}>
                                        {
                                            nodeGroupInfos.map(nodeInfo => {
                                                const { name: title, type: infoType, nodeId, flowDefVersionId, executorSet, uiType, flowTaskType } = nodeInfo;
                                                const userListProps = {
                                                    id,
                                                    title,
                                                    nodeId,
                                                    dataSource: executorSet || [],
                                                    uiType,
                                                    solidifyFlow,
                                                    flowTaskType,
                                                    infoType,
                                                    onUserSelectChange: this.handlerUserSelectChange
                                                };
                                                return <UserList key={flowDefVersionId} {...userListProps} />
                                            })
                                        }
                                    </Panel>
                                )
                            })
                        }
                    </Collapse>
                </ScrollBar>
            </ExtModal>
        )
    }
}

export default BatchModal;