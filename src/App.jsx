import React, { useState, useEffect } from 'react';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import './index.css';

function DashboardShell() {
  const { theme, toggleTheme } = useTheme();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [tasks, setTasks] = useState(() => {
    const savedTasks = localStorage.getItem('mwanzo-tasks');
    if (savedTasks) return JSON.parse(savedTasks);
    return [
      { id: '1', title: 'Desenhar Mockup do Kanban', desc: 'Criar wireframes com visual limpo estilo Notion.', status: 'PENDING', priority: 'alta' },
      { id: '2', title: 'Configurar rotas com Express', desc: 'Preparar endpoints da API do backend.', status: 'IN_PROGRESS', priority: 'media' }
    ];
  });

  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newPriority, setNewPriority] = useState('media');
  const [draggedTaskId, setDraggedTaskId] = useState(null);
  const [activeDropColumn, setActiveDropColumn] = useState(null);

  useEffect(() => {
    localStorage.setItem('mwanzo-tasks', JSON.stringify(tasks));
  }, [tasks]);

  const columns = [
    { id: 'PENDING', name: 'A Fazer' },
    { id: 'IN_PROGRESS', name: 'Em Progresso' },
    { id: 'COMPLETED', name: 'Concluído' }
  ];

  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newTask = {
      id: Date.now().toString(),
      title: newTitle,
      desc: newDesc,
      status: 'PENDING',
      priority: newPriority
    };

    setTasks([...tasks, newTask]);
    setNewTitle('');
    setNewDesc('');
    setNewPriority('media');
    setIsModalOpen(false);
  };

  const handleDragStart = (id) => setDraggedTaskId(id);
  const handleDragOver = (e, columnId) => { e.preventDefault(); setActiveDropColumn(columnId); };
  const handleDragLeave = () => setActiveDropColumn(null);
  const handleDrop = (columnId) => {
    if (!draggedTaskId) return;
    setTasks(tasks.map(t => t.id === draggedTaskId ? { ...t, status: columnId } : t));
    setDraggedTaskId(null);
    setActiveDropColumn(null);
  };

  return (
    <div className="app-shell">
      {/* Menu Lateral */}
      <aside className={`sidebar ${isSidebarExpanded ? 'expanded' : ''}`}>
        <div className="sidebar-header">
          <div className="logo-container">
            <span className="logo-mark">M</span>
            {isSidebarExpanded && <span>Mwanzo</span>}
          </div>
          <button className="btn-toggle" onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}>
            <i className={`fas ${isSidebarExpanded ? 'fa-chevron-left' : 'fa-chevron-right'}`}></i>
          </button>
        </div>
        <nav>
          <ul className="nav-links">
            <li>
              <button className="nav-item active">
                <i className="fas fa-columns"></i>
                {isSidebarExpanded && <span>Meu Quadro</span>}
              </button>
            </li>
          </ul>
        </nav>
      </aside>

      {/* Conteúdo Principal */}
      <main className="main-content">
        <header className="main-header">
          <div className="header-title">
            <h1>Quadro Mwanzo</h1>
            <p>Gerencie e arraste suas tarefas em tempo real.</p>
          </div>
          
          <div className="header-actions">
            <button className="btn-add-task" onClick={() => setIsModalOpen(true)}>
              <i className="fas fa-plus"></i> Adicionar Tarefa
            </button>
            <button className="btn-toggle" onClick={toggleTheme}>
              {theme === 'dark' ? <i className="fas fa-sun"></i> : <i className="fas fa-moon"></i>}
            </button>
          </div>
        </header>

        {/* Quadro Kanban Dinâmico */}
        <div className="kanban-board">
          {columns.map(col => {
            const filteredTasks = tasks.filter(t => t.status === col.id);
            return (
              <div 
                key={col.id} 
                className={`kanban-column ${activeDropColumn === col.id ? 'drag-over' : ''}`}
                onDragOver={(e) => handleDragOver(e, col.id)}
                onDragLeave={handleDragLeave}
                onDrop={() => handleDrop(col.id)}
              >
                <div className="column-header">
                  <h3>{col.name}</h3>
                  <span className="task-count">{filteredTasks.length}</span>
                </div>
                
                {filteredTasks.map(task => (
                  <div 
                    key={task.id} 
                    className={`task-card ${draggedTaskId === task.id ? 'dragging' : ''}`}
                    draggable
                    onDragStart={() => handleDragStart(task.id)}
                  >
                    <h4>{task.title}</h4>
                    <p>{task.desc || 'Sem descrição.'}</p>
                    
                    {/* Badge de Prioridade com Mapeamento de Texto Amigável */}
                    <span className={`task-priority priority-${task.priority}`}>
                      {task.priority === 'alta' ? 'Alta' : task.priority === 'media' ? 'Média' : 'Baixa'}
                    </span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>

        {/* POPUP MODAL CENTRALIZADO */}
        {isModalOpen && (
          <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
            <div className="modal-card" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header">
                <div className="modal-title">Nova Tarefa</div>
                <button className="btn-close-modal" onClick={() => setIsModalOpen(false)}>
                  <i className="fas fa-times"></i>
                </button>
              </div>
              
              <form onSubmit={handleCreateTask} className="modal-form">
                <div className="form-group">
                  <label>Título da Tarefa</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Desenvolver o backend em Node" 
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    required
                    autoFocus
                  />
                </div>
                
                <div className="form-group">
                  <label>Nível de Prioridade</label>
                  <select value={newPriority} onChange={(e) => setNewPriority(e.target.value)}>
                    <option value="baixa">Baixa</option>
                    <option value="media">Média</option>
                    <option value="alta">Alta</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label>Descrição Opcional</label>
                  <textarea 
                    placeholder="Descreva os detalhes importantes e passos dessa atividade..."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                  />
                </div>
                
                <button type="submit" className="btn-submit">
                  Criar Tarefa
                </button>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <DashboardShell />
    </ThemeProvider>
  );
}