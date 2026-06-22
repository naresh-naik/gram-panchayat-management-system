import { Routes, Route } from "react-router";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Records from "./pages/Records";
import Schemes from "./pages/Schemes";
import Finances from "./pages/Finances";
import Meetings from "./pages/Meetings";
import Grievances from "./pages/Grievances";
import Reports from "./pages/Reports";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import UserManagement from "./pages/UserManagement";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/records" element={<ProtectedRoute roles={["admin", "secretary"]}><Records /></ProtectedRoute>} />
      <Route path="/schemes" element={<ProtectedRoute><Schemes /></ProtectedRoute>} />
      <Route path="/finances" element={<ProtectedRoute roles={["admin", "secretary", "monitor"]}><Finances /></ProtectedRoute>} />
      <Route path="/meetings" element={<ProtectedRoute><Meetings /></ProtectedRoute>} />
      <Route path="/grievances" element={<ProtectedRoute roles={["admin", "secretary", "citizen"]}><Grievances /></ProtectedRoute>} />
      <Route path="/reports" element={<ProtectedRoute roles={["admin", "monitor"]}><Reports /></ProtectedRoute>} />
      <Route path="/users" element={<ProtectedRoute roles={["admin"]}><UserManagement /></ProtectedRoute>} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
