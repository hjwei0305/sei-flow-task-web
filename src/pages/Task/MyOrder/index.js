import React from 'react';
import { ExtTable } from 'suid';

const tableProps = {
  fixedHeader: false,
  columns: [
    {
      title: '姓名',
      dataIndex: 'name',
      width: 120,
      required: true,
    },
    {
      title: '电子邮箱',
      dataIndex: 'email',
      width: 220,
    },
    {
      title: '年龄',
      dataIndex: 'age',
      width: 60,
    },
    {
      title: '地址',
      dataIndex: 'address',
      width: 260,
    },
    {
      title: 'a',
      dataIndex: 'a',
      width: 260,
    },
    {
      title: 'b',
      dataIndex: 'b',
      width: 260,
    },
    {
      title: 'c',
      dataIndex: 'c',
      width: 260,
    },
    {
      title: 'd',
      dataIndex: 'd',
      width: 260,
    },
    {
      title: 'e',
      dataIndex: 'e',
      width: 260,
    },
    {
      title: 'f',
      dataIndex: 'f',
      width: 260,
    },
    {
      title: 'g',
      dataIndex: 'g',
      width: 260,
    },
    {
      title: 'h',
      dataIndex: 'h',
      width: 260,
    },
  ],
  store: {
    url: 'http://10.4.32.53:7300/mock/5dd5efbdc239b926aeb04627/seid.api/user/userList',
  },
};

const Demo = () => <ExtTable {...tableProps} />;

export default Demo;
