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
        <Route path="/" element={<Login />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/school-dashboard" element={<SchoolDashboard />} />
        <Route path="/rep-dashboard" element={<RepDashboard />} />
        <Route path="/school-registration" element={<SchoolRegistration />} />
        <Route path="/rep-registration" element={<RepRegistration />} />
        <Route path="/admin-approvals" element={<AdminApprovals />} />
      </Routes>
    </Router>
  );
}

export default App;