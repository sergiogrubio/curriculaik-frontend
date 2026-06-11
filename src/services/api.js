import axios from 'axios'

const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8000',
  headers: { 'Content-Type': 'application/json' }
})

// ─── Projects ─────────────────────────────────────────────────────────────────
export const getProjects = () =>
  API.get('/api/projects/').then(r => r.data)

export const getProject = (id) =>
  API.get(`/api/projects/${id}`).then(r => r.data)

export const createProject = (data) =>
  API.post('/api/projects/', data).then(r => r.data)

export const updateProject = (id, data) =>
  API.put(`/api/projects/${id}`, data).then(r => r.data)

export const deleteProject = (id) =>
  API.delete(`/api/projects/${id}`).then(r => r.data)

export const saveStyle = (id, style) =>
  API.put(`/api/projects/${id}/style`, style).then(r => r.data)

// ─── Topics ───────────────────────────────────────────────────────────────────
export const getTopics = (projectId) =>
  API.get(`/api/projects/${projectId}/topics`).then(r => r.data)

export const getTopic = (projectId, topicId) =>
  API.get(`/api/projects/${projectId}/topics/${topicId}`).then(r => r.data)

// ─── Uploads ──────────────────────────────────────────────────────────────────
export const uploadRegulation = (projectId, file) => {
  const form = new FormData()
  form.append('file', file)
  return API.post(`/api/projects/${projectId}/upload/regulation`, form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(r => r.data)
}

export const uploadProgramme = (projectId, file) => {
  const form = new FormData()
  form.append('file', file)
  return API.post(`/api/projects/${projectId}/upload/programme`, form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(r => r.data)
}

export const uploadSources = (projectId, file) => {
  const form = new FormData()
  form.append('file', file)
  return API.post(`/api/projects/${projectId}/upload/sources`, form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(r => r.data)
}

export const uploadLogo = (projectId, file) => {
  const form = new FormData()
  form.append('file', file)
  return API.post(`/api/projects/${projectId}/upload/logo`, form, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(r => r.data)
}

// ─── Agents ───────────────────────────────────────────────────────────────────
export const parseCurriculum = (projectId) =>
  API.post(`/api/projects/${projectId}/parse`).then(r => r.data)

export const ingestSources = (projectId) =>
  API.post(`/api/projects/${projectId}/ingest`).then(r => r.data)

// ─── Materials ────────────────────────────────────────────────────────────────
export const getMaterials = (projectId, topicId) =>
  API.get(`/api/projects/${projectId}/topics/${topicId}/materials`).then(r => r.data)

export const downloadMaterial = (projectId, topicId, materialType) => {
  const url = `${API.defaults.baseURL}/api/projects/${projectId}/topics/${topicId}/materials/${materialType}/download`
  window.open(url, '_blank')
}

export const generateNotes = (projectId, topicId) =>
  API.post(`/api/projects/${projectId}/topics/${topicId}/generate/notes`).then(r => r.data)

export const generateSlides = (projectId, topicId) =>
  API.post(`/api/projects/${projectId}/topics/${topicId}/generate/slides`).then(r => r.data)

export const generateExercises = (projectId, topicId) =>
  API.post(`/api/projects/${projectId}/topics/${topicId}/generate/exercises`).then(r => r.data)

export const generateExam = (projectId, topicId) =>
  API.post(`/api/projects/${projectId}/topics/${topicId}/generate/exam`).then(r => r.data)

// ─── Costs ────────────────────────────────────────────────────────────────────
export const getCostSummary = (projectId) =>
  API.get(`/api/projects/${projectId}/cost`).then(r => r.data)
