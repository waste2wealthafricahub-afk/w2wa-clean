import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Login from "./pages/Login";
import SchoolRegistration from "./pages/SchoolRegistration";
import RepresentativeRegistration from "./pages/RepresentativeRegistration";
import MonitorRegistration from "./pages/MonitorRegistration";

import SchoolDashboard from "./pages/SchoolDashboard";
import SchoolWalletDashboard from "./pages/SchoolWalletDashboard";
import RepresentativeDashboard from "./pages/RepresentativeDashboard";

import AdminDashboard from "./pages/AdminDashboard";
import MonitoringDashboard from "./pages/MonitoringDashboard";
import UserManagement from "./pages/UserManagement";

import WeeklyChecklist from "./pages/WeeklyChecklist";
import ProofReview from "./pages/ProofReview.jsx";
import ClubActivities from "./pages/ClubActivities";
import TrainingModules from "./pages/TrainingModules";
import Activities from "./pages/Activities";
import Reports from "./pages/Reports";
import Rewards from "./pages/Rewards";

import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* LOGIN */}
        <Route
          path="/"
          element={<Login />}
        />

        {/* REGISTRATIONS */}
        <Route
          path="/school-registration"
          element={<SchoolRegistration />}
        />

        <Route
          path="/rep-registration"
          element={<RepresentativeRegistration />}
        />

        <Route
          path="/monitor-registration"
          element={<MonitorRegistration />}
        />

        {/* SCHOOL */}
        <Route
          path="/school-dashboard"
          element={
            <ProtectedRoute allowedRole="school">
              <SchoolDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/school-wallet"
          element={
            <ProtectedRoute allowedRole="school">
              <SchoolWalletDashboard />
            </ProtectedRoute>
          }
        />

        {/* SCHOOL PROGRAMME MODULES */}
        <Route
          path="/weekly-checklist"
          element={
            <ProtectedRoute allowedRole="school">
              <WeeklyChecklist />
            </ProtectedRoute>
          }
        />
        <Route
  path="/proof-review"
  element={
    <ProtectedRoute allowedRole="admin">
      <ProofReview />
    </ProtectedRoute>
  }
/>

        <Route
          path="/club-activities"
          element={
            <ProtectedRoute allowedRole="school">
              <ClubActivities />
            </ProtectedRoute>
          }
        />

        <Route
          path="/training-modules"
          element={
            <ProtectedRoute allowedRole="school">
              <TrainingModules />
            </ProtectedRoute>
          }
        />

        <Route
          path="/activities"
          element={
            <ProtectedRoute allowedRole="school">
              <Activities />
            </ProtectedRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <ProtectedRoute allowedRole="school">
              <Reports />
            </ProtectedRoute>
          }
        />

        <Route
          path="/rewards"
          element={
            <ProtectedRoute allowedRole="school">
              <Rewards />
            </ProtectedRoute>
          }
        />

        {/* REPRESENTATIVE */}
        <Route
          path="/rep-dashboard"
          element={
            <ProtectedRoute allowedRole="representative">
              <RepresentativeDashboard />
            </ProtectedRoute>
          }
        />

        {/* ADMIN */}
        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* MINISTRY MONITOR */}
        <Route
          path="/monitoring-dashboard"
          element={
            <ProtectedRoute allowedRole="monitor">
              <MonitoringDashboard />
            </ProtectedRoute>
          }
        />

        {/* USER MANAGEMENT */}
        <Route
          path="/user-management"
          element={
            <ProtectedRoute allowedRole="admin">
              <UserManagement />
            </ProtectedRoute>
          }
        />

      </Routes>
    </BrowserRouter>
  );
}
