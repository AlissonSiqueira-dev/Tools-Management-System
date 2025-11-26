import { useState, useEffect } from 'react'
import './App.css'

// Serviço da API
const API_BASE_URL = 'http://localhost:8000'

const toolsAPI = {
  getTools: () => fetch(`${API_BASE_URL}/tools`).then(res => res.json()),
  createTool: (toolData) => 
    fetch(`${API_BASE_URL}/tools`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(toolData)
    }).then(res => res.json()),
  deleteTool: (id) => 
    fetch(`${API_BASE_URL}/tools/${id}`, { method: 'DELETE' })
}

function App() {
  const [tools, setTools] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    loadTools()
  }, [])

  const loadTools = async () => {
    try {
      setLoading(true)
      const data = await toolsAPI.getTools()
      setTools(data)
      setError(null)
    } catch (err) {
      setError('Error loading tools. Make sure the backend is running on port 8000.')
      console.error('Error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddTool = async (e) => {
    e.preventDefault()
    if (!name.trim() || !description.trim()) {
      setError('Please fill in both name and description')
      return
    }

    try {
      const newTool = await toolsAPI.createTool({ name, description })
      setTools([...tools, newTool])
      setName('')
      setDescription('')
      setError(null)
    } catch (err) {
      setError('Error adding tool')
      console.error('Error:', err)
    }
  }

  const handleDeleteTool = async (id) => {
    if (!window.confirm('Are you sure you want to delete this tool?')) return

    try {
      await toolsAPI.deleteTool(id)
      setTools(tools.filter(tool => tool.id !== id))
      setError(null)
    } catch (err) {
      setError('Error deleting tool')
      console.error('Error:', err)
    }
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>Tools Management System</h1>
        <p>Manage your development tools</p>
      </header>

      {error && (
        <div className="error-message">
          <span>{error}</span>
          <button onClick={loadTools}>Retry</button>
        </div>
      )}

      <div className="app-content">
        <div className="form-section">
          <form className="add-tool-form" onSubmit={handleAddTool}>
            <h2>Add New Tool</h2>
            
            <div className="form-group">
              <label htmlFor="name">Tool Name:</label>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter tool name"
                required
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="description">Description:</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter tool description"
                required
              />
            </div>
            
            <button type="submit">
              Add Tool
            </button>
          </form>
        </div>

        <div className="list-section">
          <div className="tools-header">
            <h2>Tools List ({tools.length})</h2>
          </div>

          {loading ? (
            <div className="loading">Loading tools...</div>
          ) : tools.length === 0 ? (
            <div className="no-tools">No tools found. Add your first tool!</div>
          ) : (
            <div className="tools-list">
              {tools.map(tool => (
                <div key={tool.id} className="tool-item">
                  <div className="tool-info">
                    <h3>{tool.name}</h3>
                    <p>{tool.description}</p>
                    <small>ID: {tool.id}</small>
                  </div>
                  <button 
                    className="delete-btn"
                    onClick={() => handleDeleteTool(tool.id)}
                  >
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App