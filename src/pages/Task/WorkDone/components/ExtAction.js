/*
 * @Author: Eason
 * @Date: 2020-06-19 10:27:48
 * @Last Modified by: Eason
 * @Last Modified time: 2020-06-29 09:28:16
 */
import React, { PureComponent } from 'react';
import cls from 'classnames';
import { get } from 'lodash';
import { Dropdown, Menu } from 'antd';
import { utils, ExtIcon, WorkFlow } from 'suid';
import { constants } from '@/utils';
import styles from './ExtAction.less';

const { getUUID } = utils;
const { TASK_WORK_ACTION, FLOW_STATUS } = constants;
const { Item } = Menu;

const { FlowHistoryButton } = WorkFlow;

const menuData = () => [
  {
    title: '查看单据',
    key: TASK_WORK_ACTION.VIEW_ORDER,
    disabled: false,
  },
  {
    title: '审批历史',
    key: TASK_WORK_ACTION.FLOW_HISTORY,
    disabled: false,
  },
  {
    title: '我要撤回',
    key: TASK_WORK_ACTION.FLOW_REVOKE,
    disabled: true,
  },
];

class ExtAction extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      menuShow: false,
      selectedKeys: '',
      menusData: [],
    };
  }

  componentDidMount() {
    this.initActionMenus();
  }

  initActionMenus = () => {
    const { doneItem } = this.props;
    const menus = menuData();
    const flowInstanceEnded = get(doneItem, 'flowInstance.ended');
    if (
      doneItem.taskStatus === FLOW_STATUS.COMPLETED &&
      doneItem.canCancel === true &&
      flowInstanceEnded === false
    ) {
      menus.forEach(m => {
        if (m.key === TASK_WORK_ACTION.FLOW_REVOKE) {
          Object.assign(m, { disabled: false });
        }
      });
    }
    const mData = menus.filter(m => !m.disabled);
    this.setState({
      menusData: mData,
    });
  };

  onActionOperation = e => {
    e.domEvent.stopPropagation();
    this.setState({
      selectedKeys: '',
      menuShow: false,
    });
    const { onAction, doneItem } = this.props;
    if (onAction) {
      onAction(e.key, doneItem);
    }
  };

  getMenu = (menus, record) => {
    const { selectedKeys } = this.state;
    const menuId = getUUID();
    const flowInstanceBusinessId = get(record, 'flowInstance.businessId', null);
    return (
      <Menu
        id={menuId}
        className={cls(styles['action-menu-box'])}
        onClick={e => this.onActionOperation(e, record)}
        selectedKeys={[selectedKeys]}
      >
        {menus.map(m => {
          if (m.key === TASK_WORK_ACTION.FLOW_REVOKE) {
            return (
              <Item key={m.key} className={cls('warning')}>
                <span className="view-popover-box-trigger">{m.title}</span>
              </Item>
            );
          }
          if (m.key === TASK_WORK_ACTION.FLOW_HISTORY) {
            return (
              <Item key={m.key}>
                <FlowHistoryButton businessId={flowInstanceBusinessId}>
                  <span className="view-popover-box-trigger">{m.title}</span>
                </FlowHistoryButton>
              </Item>
            );
          }
          return (
            <Item key={m.key}>
              <span className="view-popover-box-trigger">{m.title}</span>
            </Item>
          );
        })}
      </Menu>
    );
  };

  onVisibleChange = v => {
    const { selectedKeys } = this.state;
    this.setState({
      menuShow: v,
      selectedKeys: !v ? '' : selectedKeys,
    });
  };

  render() {
    const { doneItem } = this.props;
    const { menuShow, menusData } = this.state;
    return (
      <>
        {menusData.length > 0 ? (
          <Dropdown
            trigger={['hover', 'click']}
            overlay={this.getMenu(menusData, doneItem)}
            className="action-drop-down"
            placement="bottomLeft"
            visible={menuShow}
            onVisibleChange={this.onVisibleChange}
          >
            <ExtIcon className={cls('action-item')} type="more" antd />
          </Dropdown>
        ) : null}
      </>
    );
  }
}

export default ExtAction;
