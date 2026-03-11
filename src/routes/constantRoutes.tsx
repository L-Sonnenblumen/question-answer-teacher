import { Navigate } from 'react-router-dom';

import Layout from '@/components/Layout';
import FindPassword from '@/pages/FindPassword';
import BackendLogin from '@/pages/Login';
import NotFound from '@/pages/NotFound';

import AuthGuard from '../components/AuthGuard';
import ClassManage from '../pages/ClassManage';
import Exercise from '../pages/Exercise';
import OverView from '../pages/OverView';
import Quiz from '../pages/Quiz';
import QuizAnalysis from '../pages/QuizAnalysis';

const constantRoutes = [
  {
    path: '/',
    title: '登录界面',
    hidden: true,
    element: <BackendLogin />,
    children: [
      {
        index: true,
        element: (
          <Navigate
            to="/scholar-guard"
            replace
          />
        ),
      },
      {
        path: 'scholar-guard',
        title: '登录界面',
        element: <BackendLogin />,
        hidden: false,
      },
    ],
  },
  {
    path: 'findPassword',
    title: '找回密码',
    element: <FindPassword />,
  },
  {
    path: 'manage',
    title: '管理端',
    element: (
      <AuthGuard>
        <Layout />
      </AuthGuard>
    ),
    hidden: true,
    children: [
      // { index: true, element: <Navigate to={"/manage/home"} replace /> },
      { path: 'overview', title: '总览', element: <OverView />, hidden: false },
      { path: 'class', title: '班级管理', element: <ClassManage />, hidden: false },
      { path: 'exercise', title: '习题分析', element: <Exercise />, hidden: false },
      { path: 'quiz', title: '测验管理', element: <Quiz />, hidden: false },
      { path: 'quiz-analysis', title: '测验分析', element: <QuizAnalysis />, hidden: false },
    ],
  },
  { path: '*', title: '404页面', element: <NotFound /> },
];
export default constantRoutes;
