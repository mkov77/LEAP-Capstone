// index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { createTheme, MantineProvider } from '@mantine/core';
import '@mantine/core/styles.css';
import LandingPage from './pages/landingPage';
import StudentPage from './pages/studentPage';
import AdminPage from './pages/adminPage';
import ObserverPage from './pages/observerPage';
import SectionControls from './pages/sectionControls';
import BattlePage from './pages/battlePage';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserRoleProvider } from './context/UserContext';
import { UnitProvider } from './context/UnitContext';
import AAR from './pages/afterActionReportStorage';
const theme = createTheme({
  /** Put your mantine theme override here */
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <MantineProvider theme={theme} defaultColorScheme='dark'>
    <React.StrictMode>
      <UserRoleProvider>
        <UnitProvider>
          <Router>
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/studentPage/:sectionId" element={<StudentPage />} /> {/* Update route */}
              <Route path="/observerPage/:sectionId" element={<ObserverPage />} /> {/* Update route */}
              <Route path="/admin" element={<AdminPage />} />
              <Route path="/sectionControls/:sectionId" element={<SectionControls />} /> {/* New route */}
              <Route path="/battlePage" element={<BattlePage />} />
              <Route path="/AAR/:sectionId" element={<AAR />} />
            </Routes>
          </Router>
        </UnitProvider>
      </UserRoleProvider>
    </React.StrictMode>
  </MantineProvider>
);

reportWebVitals();
