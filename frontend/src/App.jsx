import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from './layouts/DashboardLayout';
import EventTypes from './pages/EventTypes';
import Availability from './pages/Availability';
import Bookings from './pages/Bookings';
import PublicBooking from './pages/PublicBooking';
import SettingsLayout from './layouts/SettingsLayout';
import Profile from './pages/settings/Profile';
import Appearance from './pages/settings/Appearance';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Navigate to="/dashboard/event-types" replace />} />
          <Route path="event-types" element={<EventTypes />} />
          <Route path="availability" element={<Availability />} />
          <Route path="bookings" element={<Bookings />} />
          <Route path="settings/my-account" element={<SettingsLayout />}>
            <Route index element={<Navigate to="profile" replace />} />
            <Route path="profile" element={<Profile />} />
            <Route path="appearance" element={<Appearance />} />
          </Route>
        </Route>
        <Route path="/:slug" element={<PublicBooking />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
