import React, { PureComponent } from 'react';
import cls from 'classnames';
import { get, isEqual, findIndex } from 'lodash';
import { Dropdown, Menu } from 'antd';
import { utils, ExtIcon } from 'suid';
import styles from './OrderView.less';

const { getUUID } = utils;
const { Item } = Menu;

class OrderView extends PureComponent {
  constructor(props) {
    super(props);
    const { viewTypeData, currentViewType } = props;
    this.state = {
      menuShow: false,
      selectedKey: findIndex(viewTypeData, currentViewType),
      menusData: viewTypeData,
    };
  }

  componentDidUpdate(prevProps) {
    const { viewTypeData, currentViewType } = this.props;
    if (!isEqual(prevProps.viewTypeData, viewTypeData)) {
      this.setState({
        menusData: viewTypeData,
        selectedKey: findIndex(viewTypeData, currentViewType),
      });
    }
  }

  onActionOperation = e => {
    e.domEvent.stopPropagation();
    this.setState({
      selectedKey: e.key,
      menuShow: false,
    });
    const { onAction } = this.props;
    if (onAction) {
      const { menusData } = this.state;
      const currentViewType = menusData[e.key];
      onAction(currentViewType);
    }
  };

  getMenu = menus => {
    const { selectedKey } = this.state;
    const menuId = getUUID();
    return (
      <Menu
        id={menuId}
        className={cls(styles['action-menu-box'])}
        onClick={e => this.onActionOperation(e)}
        selectedKeys={[`${selectedKey}`]}
      >
        {menus.map((m, index) => {
          return (
            <Item key={index.toString()}>
              {index.toString() === selectedKey.toString() ? (
                <ExtIcon type="check" className="selected" antd />
              ) : null}
              <span className="view-popover-box-trigger">{m.businessModelName}</span>
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
    const { currentViewType } = this.props;
    const { menuShow, menusData } = this.state;
    return (
      <>
        {!menusData || menusData.length === 0 ? (
          <span className={cls(styles['view-box'])}>
            <span className="view-label">
              <ExtIcon type="eye" antd />
              <em>视图</em>
            </span>
            <span className="view-content">{get(currentViewType, 'businessModelName')}</span>
          </span>
        ) : (
          <Dropdown
            trigger={['click']}
            overlay={this.getMenu(menusData)}
            className="action-drop-down"
            placement="bottomLeft"
            visible={menuShow}
            onVisibleChange={this.onVisibleChange}
          >
            <span className={cls(styles['view-box'])}>
              <span className="view-label">
                <ExtIcon type="eye" antd />
                <em>视图</em>
              </span>
              <span className="view-content">{get(currentViewType, 'businessModelName')}</span>
              <ExtIcon type="down" antd />
            </span>
          </Dropdown>
        )}
      </>
    );
  }
}

export default OrderView;
