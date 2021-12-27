import React, { PureComponent } from 'react';
import { Form, Input, Switch, Row, Col, message } from 'antd';
import { ExtModal } from 'suid';

const { TextArea } = Input;
const FormItem = Form.Item;
const formItemLayout = {
  labelCol: {
    span: 24,
  },
  wrapperCol: {
    span: 24,
  },
};

const formItemOptLayout = {
  labelCol: {
    span: 12,
  },
  wrapperCol: {
    span: 12,
  },
};

@Form.create()
class UrgedForm extends PureComponent {
  handlerFormSubmit = () => {
    const { form, save, flowInstanceId } = this.props;
    form.validateFields((err, formData) => {
      if (err) {
        return;
      }
      const { EMAIL, MESSAGE, urgedInfo } = formData;
      const params = {
        flowInstanceId,
        urgedTypeList: [],
        urgedInfo,
      };
      if (EMAIL) {
        params.urgedTypeList.push('EMAIL');
      }
      if (MESSAGE) {
        params.urgedTypeList.push('MESSAGE');
      }
      if (params.urgedTypeList.length === 0) {
        message.destroy();
        message.error('请选择一个催办选项');
        return;
      }
      save(params);
    });
  };

  render() {
    const { form, closeFormModal, saving, showModal } = this.props;
    const { getFieldDecorator } = form;
    return (
      <ExtModal
        destroyOnClose
        onCancel={closeFormModal}
        visible={showModal}
        maskClosable={false}
        centered
        width={420}
        bodyStyle={{ padding: 0 }}
        confirmLoading={saving}
        title="催办"
        onOk={this.handlerFormSubmit}
      >
        <Form {...formItemLayout} layout="horizontal" style={{ margin: 24 }}>
          <FormItem label="催办选项" required>
            <Row>
              <Col span={8}>
                <FormItem label="邮件" {...formItemOptLayout}>
                  {getFieldDecorator('EMAIL', {
                    valuePropName: 'checked',
                  })(<Switch size="small" />)}
                </FormItem>
              </Col>
              <Col span={8}>
                <FormItem label="站内信" {...formItemOptLayout}>
                  {getFieldDecorator('MESSAGE', {
                    valuePropName: 'checked',
                  })(<Switch size="small" />)}
                </FormItem>
              </Col>
            </Row>
          </FormItem>
          <FormItem label="催办内容">
            {getFieldDecorator('urgedInfo', {
              rules: [
                {
                  required: true,
                  message: '催办内容不能为空',
                },
              ],
            })(<TextArea style={{ resize: 'none' }} autoSize={false} rows={4} />)}
          </FormItem>
        </Form>
      </ExtModal>
    );
  }
}

export default UrgedForm;
