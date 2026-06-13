import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import BriefForm  from './BriefForm';
import AdminPage  from './AdminPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"          element={<BriefForm />} />
        <Route path="/admin-3b"  element={<AdminPage />} />
        <Route path="*"          element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
