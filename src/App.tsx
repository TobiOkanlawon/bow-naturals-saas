import { useState, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import { AuthProvider, useAuth } from './context/AuthContext';
import { BrandProvider, useBrand } from './context/BrandContext';
import { CompanyProvider } from './context/CompanyContext';
import Layout, { type Page } from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import StaffDashboard from './pages/StaffDashboard';
import Staff from './pages/Staff';
import Products from './pages/Products';
import Logistics from './pages/Logistics';
import CRM from './pages/CRM';
import Tasks from './pages/Tasks';
import Chat from './pages/Chat';
import Expenses from './pages/Expenses';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';
import FollowUps from './pages/FollowUps';
import SalesTracker from './pages/SalesTracker';
import Integrations from './pages/Integrations';
import Subscription from './pages/Subscription';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

function AppContent() {
  const { user } = useAuth();
  const { brand } = useBrand();
  const isCEO = user?.role === 'ceo';
  const defaultPage: Page = 'dashboard';
  const [page, setPage] = useState<Page>(defaultPage);

  useEffect(() => {
    if (user) {
      // Staff can only access: Dashboard, CRM, Tasks, Chat, Expenses, Follow-ups, Logistics (view-only)
      if (!isCEO && (page === 'products' || page === 'staff' || page === 'analytics' || page === 'settings' || page === 'sales' || page === 'integrations' || page === 'subscription')) {
        setPage('dashboard');
      }
    }
  }, [user, isCEO, page]);

  if (!user) return <Login />;

  const renderPage = () => {
    if (!isCEO) {
      switch (page) {
        case 'dashboard':
          return <StaffDashboard />;
        case 'crm':
          return <CRM />;
        case 'tasks':
          return <Tasks />;
        case 'chat':
          return <Chat />;
        case 'logistics':
          return <Logistics />;
        case 'expenses':
          return <Expenses />;
        case 'followups':
          return <FollowUps />;
        default:
          return <StaffDashboard />;
      }
    }

    switch (page) {
      case 'dashboard':
        return <Dashboard />;
      case 'staff':
        return <Staff />;
      case 'products':
        return <Products />;
      case 'logistics':
        return <Logistics />;
      case 'crm':
        return <CRM />;
      case 'tasks':
        return <Tasks />;
      case 'chat':
        return <Chat />;
      case 'expenses':
        return <Expenses />;
      case 'analytics':
        return <Analytics />;
      case 'sales':
        return <SalesTracker />;
      case 'integrations':
        return <Integrations />;
      case 'subscription':
        return <Subscription />;
      case 'settings':
        return <Settings />;
      case 'followups':
        return <FollowUps />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentPage={page} onPageChange={setPage}>
      {renderPage()}
    </Layout>
  );
}

export default function App() {
  const qc = new QueryClient();
  return (
    <QueryClientProvider client={qc}>
    <AuthProvider>
      <CompanyProvider>
        <BrandProvider>
          <AppContent />
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            pauseOnHover
            theme="colored"
          />
        </BrandProvider>
      </CompanyProvider>
    </AuthProvider>
    </QueryClientProvider>
  );
}