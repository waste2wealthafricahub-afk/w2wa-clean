import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import SchoolDashboard from "./pages/SchoolDashboard";
import RepDashboard from "./pages/RepDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import SchoolRegistration from "./pages/SchoolRegistration";
import RepRegistration from "./pages/RepRegistration";
import AdminApprovals from "./pages/AdminApprovals";

function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/register-school" element={<SchoolRegistration />} />
        <Route path="/apply-rep" element={<RepRegistration />} />

        {/* Admin Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/approvals"
          element={
            <ProtectedRoute allowedRole="admin">
              <AdminApprovals />
            </ProtectedRoute>
          }
        />

        {/* School Routes */}
        <Route
          path="/school"
          element={
            <ProtectedRoute allowedRole="school">
              <SchoolDashboard />
            </ProtectedRoute>
          }
        />

        {/* Representative Routes */}
        <Route
          path="/rep"
          element={
            <ProtectedRoute allowedRole="rep">
              <RepDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;