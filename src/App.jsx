import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from './layouts/AppLayout.jsx'
import PrivateRoute from './components/PrivateRoute.jsx'
import PublicRoute from './components/PublicRoute.jsx'
import DashboardPage from './pages/DashboardPage.jsx'
import LoginPage from './pages/LoginPage.jsx'
import NotFoundPage from './pages/NotFoundPage.jsx'
import ReportPage from './pages/ReportPage.jsx'
import ResumeUploadPage from './pages/ResumeUploadPage.jsx'
import InterviewV2Page from './interview-v2/pages/InterviewV2Page.jsx'
import InterviewSetupPage from './modules/interview/pages/InterviewSetupPage.jsx'
import StandardInterviewPage from './modules/interview/pages/StandardInterviewPage.jsx'

function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />

      <Route
        element={
          <PrivateRoute>
            <AppLayout />
          </PrivateRoute>
        }
      >
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/resume" element={<ResumeUploadPage />} />
        <Route path="/setup" element={<InterviewSetupPage />} />
        <Route path="/interview" element={<StandardInterviewPage />} />
        <Route path="/report" element={<ReportPage />} />
      </Route>

      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/interview-v2-test" element={<InterviewV2Page />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}

export default App
