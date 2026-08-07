import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom";

import Login from "./pages/Login";

import SchoolRegistration from "./pages/SchoolRegistration";

import RepresentativeRegistration from "./pages/RepresentativeRegistration";

import SchoolDashboard from "./pages/SchoolDashboard";

import RepresentativeDashboard from "./pages/RepresentativeDashboard";

import AdminDashboard from "./pages/AdminDashboard";

import ProtectedRoute from "./components/ProtectedRoute";
import SchoolWalletDashboard from "./pages/SchoolWalletDashboard";
import MonitoringDashboard from "./pages/MonitoringDashboard";
import MonitorRegistration from "./pages/MonitorRegistration";
import UserManagement from "./pages/UserManagement";
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
          element={
            <SchoolRegistration />
          }
        />
<Route
  path="/monitor-registration"
  element={
    <MonitorRegistration />
  }
/>
        <Route
          path="/rep-registration"
          element={
            <RepresentativeRegistration />
          }
        />

        {/* SCHOOL */}

        <Route
          path="/school-dashboard"
          element={
            <ProtectedRoute
              allowedRole="school"
            >
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
        {/* REPRESENTATIVE */}

        <Route
          path="/rep-dashboard"
          element={
            <ProtectedRoute
              allowedRole="representative"
            >
              <RepresentativeDashboard />
            </ProtectedRoute>
          }
        />

        {/* ADMIN */}

        <Route
          path="/admin-dashboard"
          element={
            <ProtectedRoute
              allowedRole="admin"
            >
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
<Route
  path="/monitoring-dashboard"
  element={
    <ProtectedRoute
     allowedRole="monitor"
    >
      <MonitoringDashboard />
    </ProtectedRoute>
  }
/>
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