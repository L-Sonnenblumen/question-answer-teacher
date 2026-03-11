// 这个默认路由是左边tab页显示用的

const DefaultRouter = [
  {
    title: '📊 总览',
    icon: 'overview',
    component: '/manage/overview',
    path: 'overview',
    menuPath: '/manage/overview',
    hidden: '0',
    children: [],
  },
  {
    title: '🏛️ 班级管理',
    icon: 'class',
    component: '/manage/class',
    path: 'class',
    menuPath: '/manage/class',
    hidden: '0',
    children: [],
  },
  {
    title: '📝 习题管理',
    icon: 'exercise',
    component: '/manage/exercise',
    path: 'exercise',
    menuPath: '/manage/exercise',
    hidden: '0',
    children: [],
  },
  {
    title: '🎯 测验管理',
    icon: 'quiz',
    component: '/manage/quiz',
    path: 'quiz',
    menuPath: '/manage/quiz',
    hidden: '0',
    children: [],
  },
  {
    title: '📈 测验分析',
    icon: 'quiz-analysis',
    component: '/manage/quiz-analysis',
    path: 'quiz-analysis',
    menuPath: '/manage/quiz-analysis',
    hidden: '0',
    children: [],
  },
];

export default DefaultRouter;
