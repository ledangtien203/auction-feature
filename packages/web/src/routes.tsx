import { createBrowserRouter, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { AdminLayout } from './components/AdminLayout';
import { AdminGuard } from './components/AdminGuard';
import { AuthGuard } from './components/AuthGuard';
import { Home } from './pages/Home';
import { Auctions } from './pages/Auctions';
import { AuctionDetail } from './pages/AuctionDetail';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { UserDashboardLayout } from './components/UserDashboardLayout';
import { UserDashboardContent } from './components/UserDashboardContent';
import { UserBidsContent } from './components/UserBidsContent';
import { UserWonContent } from './components/UserWonContent';
import { UserWatchlistContent } from './components/UserWatchlistContent';
import { UserAuctionsContent } from './components/UserAuctionsContent';
import { UserSettingsContent } from './components/UserSettingsContent';
import { Dashboard } from './pages/admin/Dashboard';
import { AdminAuctions } from './pages/admin/AdminAuctions';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminTransactions } from './pages/admin/AdminTransactions';
import { AdminReports } from './pages/admin/AdminReports';
import { AdminSettings } from './pages/admin/AdminSettings';

export const router = createBrowserRouter([
  // Public routes
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: 'auctions', Component: Auctions },
      { path: 'auctions/:id', Component: AuctionDetail },
      { path: 'login', Component: Login },
      { path: 'register', Component: Register },
    ],
  },

  // User Dashboard routes (with sidebar layout)
  {
    path: '/user',
    element: <AuthGuard><UserDashboardLayout /></AuthGuard>,
    children: [
      { index: true, element: <Navigate to="/user/dashboard" replace /> },
      { path: 'dashboard', Component: UserDashboardContent },
      { path: 'bids', Component: UserBidsContent },
      { path: 'auctions', Component: UserAuctionsContent },
      { path: 'won', Component: UserWonContent },
      { path: 'watchlist', Component: UserWatchlistContent },
      { path: 'settings', Component: UserSettingsContent },
    ],
  },

  // Admin routes
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
      { path: 'products', Component: AdminProducts },
      { path: 'users', Component: AdminUsers },
      { path: 'transactions', Component: AdminTransactions },
      { path: 'reports', Component: AdminReports },
      { path: 'settings', Component: AdminSettings },
    ],
  },
]);
