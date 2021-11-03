import React, { PureComponent } from 'react';
import cls from 'classnames';
import PropTypes from 'prop-types';
import { get, omit, isEqual } from 'lodash';
import { Drawer, Form, Button, Input } from 'antd';
import { ScrollBar, ScopeDatePicker, ComboList } from 'suid';
import { formatMessage } from 'umi-plugin-react/locale';
import styles from './index.less';

const FormItem = Form.Item;

const formItemLayout = {
  labelCol: {
    span: 24,
  },
  wrapperCol: {
    span: 24,
  },
};

const flowStatusData = {
  ended: {
    name: formatMessage({ id: 'flowtask_000058', defaultMessage: '审批完成' }),
    code: 'ended',
  },
  inflow: {
    name: formatMessage({ id: 'flowtask_000059', defaultMessage: '审批中' }),
    code: 'inflow',
  },
  abnormalEnd: {
    name: formatMessage({ id: 'flowtask_000057', defaultMessage: '异常结束' }),
    code: 'abnormalEnd',
  },
};

const getFlowStatusData = () => {
  return Object.keys(flowStatusData).map(key => flowStatusData[key]);
};

@Form.create()
class FilterView extends PureComponent {
  static propTypes = {
    showFilter: PropTypes.bool,
    filterData: PropTypes.object,
    onFilterSubmit: PropTypes.func,
    onCloseFilter: PropTypes.func,
    onResetFilter: PropTypes.func,
  };

  static defaultProps = {
    showFilter: false,
  };

  constructor(props) {
    super(props);
    const { filterData } = props;
    this.state = {
      filterData,
    };
  }

  componentDidUpdate(preProps) {
    const { filterData } = this.props;
    if (!isEqual(preProps.filterData, filterData)) {
      this.setState({
        filterData,
      });
    }
  }

  handlerFilter = e => {
    e && e.preventDefault();
    const { filterData } = this.state;
    const { form, onFilterSubmit } = this.props;
    form.validateFields((err, formData) => {
      if (err) {
        return;
      }
      Object.assign(filterData, omit(formData, ['createdDate', 'flowStatusName']));
      const [startDate, endDate] = formData.createdDate;
      filterData.startDate = startDate;
      filterData.endDate = endDate;
      onFilterSubmit(filterData);
    });
  };

  handlerReset = () => {
    this.setState({
      filterData: {},
    });
  };

  handlerClose = () => {
    const { onCloseFilter } = this.props;
    if (onCloseFilter) {
      onCloseFilter();
    }
  };

  getFields() {
    const { filterData } = this.state;
    const { form } = this.props;
    const { getFieldDecorator } = form;
    const scopeDatePickerProps = {
      format: 'YYYY-MM-DD',
    };
    getFieldDecorator('flowStatus', {
      initialValue: get(filterData, 'flowStatus', null),
    });
    const comboListProps = {
      form,
      placeholder: formatMessage({ id: 'flowtask_000062', defaultMessage: '全部状态' }),
      allowClear: true,
      showSearch: false,
      dataSource: getFlowStatusData(),
      name: 'flowStatusName',
      field: ['flowStatus'],
      reader: {
        name: 'name',
        field: ['code'],
      },
    };
    const flowStatus = get(filterData, 'flowStatus');
    return (
      <>
        <FormItem label={formatMessage({ id: 'flowtask_000015', defaultMessage: '单据编号' })}>
          {getFieldDecorator('businessCode', {
            initialValue: get(filterData, 'businessCode', null),
          })(
            <Input
              allowClear
              placeholder={formatMessage({
                id: 'flowtask_000030',
                defaultMessage: '单据编号关键字',
              })}
            />,
          )}
        </FormItem>
        <FormItem label={formatMessage({ id: 'flowtask_000017', defaultMessage: '单据说明' })}>
          {getFieldDecorator('businessModelRemark', {
            initialValue: get(filterData, 'businessModelRemark', null),
          })(
            <Input
              allowClear
              placeholder={formatMessage({
                id: 'flowtask_000031',
                defaultMessage: '单据说明关键字',
              })}
            />,
          )}
        </FormItem>
        <FormItem label={formatMessage({ id: 'flowtask_000060', defaultMessage: '提交时间' })}>
          {getFieldDecorator('createdDate', {
            initialValue: [get(filterData, 'startDate'), get(filterData, 'endDate')],
          })(<ScopeDatePicker {...scopeDatePickerProps} />)}
        </FormItem>
        <FormItem label={formatMessage({ id: 'flowtask_000056', defaultMessage: '单据状态' })}>
          {getFieldDecorator('flowStatusName', {
            initialValue: get(flowStatusData, `${flowStatus}.name`, ''),
          })(<ComboList {...comboListProps} />)}
        </FormItem>
      </>
    );
  }

  render() {
    const { showFilter } = this.props;
    return (
      <Drawer
        width={320}
        destroyOnClose
        getContainer={false}
        placement="right"
        visible={showFilter}
        title={formatMessage({ id: 'flowtask_000027', defaultMessage: '过滤' })}
        className={cls(styles['filter-box'])}
        onClose={this.handlerClose}
        style={{ position: 'absolute' }}
      >
        <ScrollBar>
          <div className={cls('content')}>
            <Form {...formItemLayout} layout="vertical">
              {this.getFields()}
            </Form>
          </div>
        </ScrollBar>
        <div className="footer">
          <Button onClick={this.handlerReset}>
            {formatMessage({ id: 'flowtask_000034', defaultMessage: '重置' })}
          </Button>
          <Button type="primary" onClick={e => this.handlerFilter(e)}>
            {formatMessage({ id: 'flowtask_000035', defaultMessage: '确定' })}
          </Button>
        </div>
      </Drawer>
    );
  }
}

export default FilterView;
