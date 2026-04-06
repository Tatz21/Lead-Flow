/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.tsx';
import { ThemeProvider } from './context/ThemeContext.tsx';
import { ProtectedRoute } from './components/ProtectedRoute.tsx';
import Landing from './pages/Landing.tsx';
import DashboardLayout from './components/DashboardLayout.tsx';
import DashboardOverview from './pages/Dashboard.tsx';
import LeadsTable from './pages/LeadsTable.tsx';
import Analytics from './pages/Analytics.tsx';
import CampaignManager from './pages/CampaignManager.tsx';
import Settings from './pages/Settings.tsx';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route 
              path="/dashboard/*" 
              element={
                <ProtectedRoute>
                  <DashboardLayout>
                    <Routes>
                      <Route index element={<DashboardOverview />} />
                      <Route path="leads" element={<LeadsTable />} />
                      <Route path="analytics" element={<Analytics />} />
                      <Route path="campaigns" element={<CampaignManager />} />
                      <Route path="settings" element={<Settings />} />
                    </Routes>
                  </DashboardLayout>
                </ProtectedRoute>
              } 
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}




