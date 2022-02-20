import React from 'react';
import Dashboard from './pages/Dashboard';
import Home from './pages/Home';
import withPageTitle from './components/PageTitle';

interface RouteType {
  path: string;
  page: string;
  title: string;
  component: any;
}

const routes: RouteType[] = [
  {
    path: '/',
    page: 'home',
    title: '',
    component: Home,
  },
  {
    path: '/sell',
    page: 'dashboard',
    title: 'Sell LKMEX',
    component: Dashboard,
  },
  {
    path: '/buy',
    page: 'dashboard',
    title: 'Buy LKMEX',
    component: Dashboard,
  }
];

const wrappedRoutes = () => {
  return routes.map(route => {
    const title = route.title ? `${route.title} • Houdinex` : 'Houdinex';
    return {
      path: route.path,
      page: route.page,
      component: (withPageTitle(title, route.component) as any) as React.ComponentClass<{}, any>,
    };
  });
};

export default wrappedRoutes();
