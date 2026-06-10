import { Routes, Route } from 'react-router-dom'
import Layout from './components/layout/Layout.jsx'
import ProjectsPage from './pages/ProjectsPage.jsx'
import NewProjectPage from './pages/NewProjectPage.jsx'
import ProjectDetailPage from './pages/ProjectDetailPage.jsx'
import TopicPage from './pages/TopicPage.jsx'
import SettingsPage from './pages/SettingsPage.jsx'
import ProjectStylePage from './pages/ProjectStylePage.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<ProjectsPage />} />
        <Route path="projects/new" element={<NewProjectPage />} />
        <Route path="projects/:projectId" element={<ProjectDetailPage />} />
        <Route path="projects/:projectId/style" element={<ProjectStylePage />} />
        <Route path="projects/:projectId/topics/:topicId" element={<TopicPage />} />
        <Route path="settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  )
}
