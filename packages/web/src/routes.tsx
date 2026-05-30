import { createBrowserRouter } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AdminLayout } from './components/AdminLayout';
import { AdminGuard } from './components/AdminGuard';
import { AuthGuard } from './components/AuthGuard';
import { Home } from './pages/Home';
import { Auctions } from './pages/Auctions';
import { AuctionDetail } from './pages/AuctionDetail';
import { MyBids } from './pages/MyBids';
import { WonAuctions } from './pages/WonAuctions';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { UserDashboard } from './pages/user/UserDashboard';
import { Dashboard } from './pages/admin/Dashboard';
import { AdminAuctions } from './pages/admin/AdminAuctions';
import { AdminCategories } from './pages/admin/AdminCategories';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminTransactions } from './pages/admin/AdminTransactions';
import { AdminReports } from './pages/admin/AdminReports';
import { AdminTheme } from './pages/admin/AdminTheme';
import { AdminSettings } from './pages/admin/AdminSettings';
import { Settings } from './pages/Settings';
import { MyAuctions } from './pages/MyAuctions';
import { About } from './pages/About';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: 'auctions', Component: Auctions },
      { path: 'about', Component: About },
      { path: 'auctions/:id', Component: AuctionDetail },
      { path: 'my-bids', Component: MyBids },
      { path: 'won-auctions', Component: WonAuctions },
      { path: 'settings', element: <AuthGuard><Settings /></AuthGuard> },
      { path: 'my-auctions', element: <AuthGuard><MyAuctions /></AuthGuard> },
      { path: 'user/dashboard', element: <AuthGuard><UserDashboard /></AuthGuard> },
    ],
  },
  {
    path: '/login',
    Component: Login,
  },
  {
    path: '/register',
    Component: Register,
  },
  {
    path: '/admin',
    element: (
      <AdminGuard>
        <AdminLayout />
      </AdminGuard>
    ),
    children: [
      { index: true, Component: Dashboard },
      { path: 'auctions', Component: AdminAuctions },
      { path: 'categories', Component: AdminCategories },
      { path: 'users', Component: AdminUsers },
      { path: 'transactions', Component: AdminTransactions },
      { path: 'reports', Component: AdminReports },
      { path: 'theme', Component: AdminTheme },
      { path: 'settings', Component: AdminSettings },
    ],
  },
]);
