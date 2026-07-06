import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SupabaseProvider } from './contexts/SupabaseContext';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout/Layout';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import AnunciosPage from './pages/AnunciosPage';
import BosquejosPage from './pages/BosquejosPage';
import InformesPage from './pages/InformesPage';
import OrganigramaPage from './pages/OrganigramaPage';
import PerfilPage from './pages/PerfilPage';
import ProtectedRoute from './components/Auth/ProtectedRoute';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutos
      retry: 2,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <SupabaseProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route element={<ProtectedRoute allowedRoles={['superadmin', 'admin', 'secretaria', 'contabilidad', 'soporte', 'pastor']} />}>
                <Route element={<Layout />}>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<DashboardPage />} />
                  <Route path="/anuncios" element={<AnunciosPage />} />
                  <Route path="/bosquejos" element={<BosquejosPage />} />
                  <Route path="/informes" element={<InformesPage />} />
                  <Route path="/organigrama" element={<OrganigramaPage />} />
                  <Route path="/perfil" element={<PerfilPage />} />
                </Route>
              </Route>
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </SupabaseProvider>
    </QueryClientProvider>
  );
}

export default App;
