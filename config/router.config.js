export default [
  {
    path: '/user',
    component: '../layouts/LoginLayout',
    routes: [
      { path: '/user', redirect: '/user/login' },
      { path: '/user/login', component: './Login' },
    ],
  },
  {
    path: '/test',
    component: './Test',
  },
  {
    path: '/',
    component: '../layouts/AuthLayout',
    routes: [
      {
        path: '/task',
        name: 'task',
        routes: [
          { path: '/task/workTodo', component: './Task/WorkTodo' },
          { path: '/task/workDone', component: './Task/WorkDone' },
          { path: '/task/myOrder', component: './Task/MyOrder' },
        ],
      },
    ],
  },
];
