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
    path: '/',
    component: '../layouts/AuthLayout',
    routes: [
      {
        path: '/task',
        name: 'task',
        routes: [{ path: '/task/workTodo', component: './Task/WorkTodo' }],
      },
    ],
  },
];
