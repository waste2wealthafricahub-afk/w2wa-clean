import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import SchoolDashboard from "./pages/SchoolDashboard";
import RepDashboard from "./pages/RepDashboard";
import SchoolRegistration from "./pages/SchoolRegistration";
import RepRegistration from "./pages/RepRegistration";
import AdminApprovals from "./pages/AdminApprovals";
function App() {
  return (
    <Router>
      <Routes>
        {/* Authentication */}
        <Route path="/" element={<Login />} />

        {/* Online Registration */}
        <Route path="/register-school" element={<SchoolRegistration />} />
        <Route path="/register-rep" element={<RepRegistration />} />

        {/* Dashboards */}
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/school-dashboard" element={<SchoolDashboard />} />
        <Route path="/rep-dashboard" element={<RepDashboard />} />

        {/* Admin Controls */}
        <Route path="/admin-approvals" element={<AdminApprovals />} />

        {/* Fallback Route */}
        <Route
          path="*"
          element={
            <div style={{ textAlign: "center", marginTop: "50px" }}>
              <h2>404 - Page Not Found</h2>
              <p>The page you are looking for does not exist.</p>
            </div>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;