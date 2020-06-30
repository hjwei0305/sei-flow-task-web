import React, { PureComponent } from 'react';
import cls from 'classnames';
import { get } from 'lodash';
import { Dropdown, Menu } from 'antd';
import { utils, ExtIcon, WorkFlow } from 'suid';
import { constants } from '@/utils';
import styles from './ExtAction.less';

const { getUUID } = utils;
const { TASK_WORK_ACTION } = constants;
const { Item } = Menu;

const { FlowHistoryButton } = WorkFlow;

const menuData = () => [
  {
    title: '审批单据',
    key: TASK_WORK_ACTION.TODO,
    disabled: false,
  },
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
    const menus = menuData();
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
    const { onAction, item } = this.props;
    if (onAction) {
      onAction(e.key, item);
    }
  };

  getMenu = (menus, record) => {
    const { selectedKeys } = this.state;
    const menuId = getUUID();
    return (
      <Menu
        id={menuId}
        className={cls(styles['action-menu-box'])}
        onClick={e => this.onActionOperation(e, record)}
        selectedKeys={[selectedKeys]}
      >
        {menus.map(m => {
          if (m.key === TASK_WORK_ACTION.FLOW_HISTORY) {
            return (
              <Item key={m.key}>
                <FlowHistoryButton businessId={get(record, 'flowInstance.businessId', null)}>
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
    const { item } = this.props;
    const { menuShow, menusData } = this.state;
    return (
      <>
        {menusData.length > 0 ? (
          <Dropdown
            trigger={['click']}
            overlay={this.getMenu(menusData, item)}
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
