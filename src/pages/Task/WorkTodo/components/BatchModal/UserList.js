/*
 * @Author: Eason
 * @Date: 2020-02-14 19:17:59
 * @Last Modified by: Eason
 * @Last Modified time: 2021-05-24 16:03:23
 */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Alert, Radio, Card } from 'antd';
import { ListCard } from 'suid';

class UserSelect extends PureComponent {
  static propTypes = {
    title: PropTypes.string,
    id: PropTypes.string,
    nodeId: PropTypes.string,
    dataSource: PropTypes.array,
    infoType: PropTypes.string,
    uiType: PropTypes.string,
    flowTaskType: PropTypes.string,
    solidifyFlow: PropTypes.bool,
    onUserSelectChange: PropTypes.func,
  };

  static defaultProps = {
    dataSource: [],
    flowTaskType: '',
  };

  handlerUserSelectChange = checkedUserList => {
    const { id, onUserSelectChange, nodeId } = this.props;
    if (onUserSelectChange) {
      onUserSelectChange(id, nodeId, checkedUserList);
    }
  };

  renderSingleAvatar = ({ keyValue, checkedList }) => {
    return <Radio checked={!!checkedList[keyValue]} />;
  };

  renderUserList = () => {
    const { flowTaskType = '', uiType, dataSource, title, solidifyFlow, infoType } = this.props;
    if (flowTaskType && flowTaskType.toLowerCase() === 'pooltask') {
      return (
        <Card title={title} bordered={false} size="small">
          <Alert
            message="同意"
            description="工作池任务,不用选择办理人"
            type="info"
            showIcon
            banner
          />
        </Card>
      );
    }
    if (solidifyFlow) {
      return (
        <Card title={title} bordered={false} size="small">
          <Alert message="同意" description="固化流程,不需要选办理人" type="info" showIcon banner />
        </Card>
      );
    }
    if (infoType === 'CounterSignNotEnd') {
      return (
        <Card title={title} bordered={false} size="small">
          <Alert
            message="同意"
            description="会签未结束,不需要选办理人"
            type="info"
            showIcon
            banner
          />
        </Card>
      );
    }
    if (infoType === 'EndEvent') {
      return (
        <Card title={title} bordered={false} size="small">
          <Alert
            message="同意"
            description="流程下一步即将结束,不需要选办理人"
            type="info"
            showIcon
            banner
          />
        </Card>
      );
    }
    let selectedKeys = [];
    if (dataSource && dataSource.length === 1) {
      selectedKeys = [dataSource[0].id];
    }
    const listCardProps = {
      className: 'common-user-box',
      bordered: false,
      pagination: false,
      showSearch: false,
      dataSource,
      selectedKeys,
      title,
      checkbox: solidifyFlow ? false : uiType === 'checkbox',
      itemField: {
        avatar: uiType === 'checkbox' || solidifyFlow ? undefined : this.renderSingleAvatar,
        title: item => (
          <>
            {item.name}
            <span style={{ fontSize: 12, marginLeft: 8, color: '#999' }}>{`(${item.code})`}</span>
          </>
        ),
        description: item =>
          item.organizationName ? (
            <span style={{ fontSize: 12 }}>{item.organizationName}</span>
          ) : (
            ''
          ),
        extra: item => <span style={{ fontSize: 12, marginRight: 8 }}>{item.positionName}</span>,
      },
      showArrow: false,
      onSelectChange: this.handlerUserSelectChange,
    };
    return <ListCard {...listCardProps} />;
  };

  render() {
    return <div className="user-list">{this.renderUserList()}</div>;
  }
}

export default UserSelect;
