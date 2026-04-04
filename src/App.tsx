/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Landing from './pages/Landing.tsx';
import DashboardLayout from './components/DashboardLayout.tsx';
import DashboardOverview from './pages/Dashboard.tsx';
import LeadsTable from './pages/LeadsTable.tsx';
import Analytics from './pages/Analytics.tsx';
import CampaignManager from './pages/CampaignManager.tsx';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/dashboard" element={<DashboardLayout><DashboardOverview /></DashboardLayout>} />
        <Route path="/dashboard/leads" element={<DashboardLayout><LeadsTable /></DashboardLayout>} />
        <Route path="/dashboard/analytics" element={<DashboardLayout><Analytics /></DashboardLayout>} />
        <Route path="/dashboard/campaigns" element={<DashboardLayout><CampaignManager /></DashboardLayout>} />
        <Route path="/dashboard/settings" element={<DashboardLayout><div className="p-8 neumorph rounded-[2.5rem]">Settings Coming Soon</div></DashboardLayout>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}


