import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from 'antd'
import AppHeader from './components/AppHeader'
import Sidebar from './components/Sidebar'
import ProjectList from './pages/ProjectList'
import ProjectCreate from './pages/ProjectCreate'
import ProjectDetail from './pages/ProjectDetail'
import DesignStudio from './pages/DesignStudio'
import MaterialLibrary from './pages/MaterialLibrary'
import './App.css'

const { Content } = Layout

function App() {
  return (
    <Router>
      <Layout style={{ minHeight: '100vh' }}>
        <AppHeader />
        <Layout>
          <Sidebar />
          <Layout style={{ padding: '24px' }}>
            <Content
              style={{
                padding: 24,
                margin: 0,
                minHeight: 280,
                background: '#fff',
                borderRadius: 8,
              }}
            >
              <Routes>
                <Route path="/" element={<Navigate to="/projects" replace />} />
                <Route path="/projects" element={<ProjectList />} />
                <Route path="/projects/create" element={<ProjectCreate />} />
                <Route path="/projects/:id" element={<ProjectDetail />} />
                <Route path="/studio" element={<DesignStudio />} />
                <Route path="/materials" element={<MaterialLibrary />} />
              </Routes>
            </Content>
          </Layout>
        </Layout>
      </Layout>
    </Router>
  )
}

export default App