import { useState, useEffect } from 'react';
import { clientAPI } from '../utils/api';
import ExerciseLibrary from './ExerciseLibrary';
import TemplateList from './TemplateList';
import TemplateForm from './TemplateForm';
import ClientManagement from './ClientManagement';
import AssignedWorkouts from './AssignedWorkouts';

export default function CoachDashboard() {
  const [activeTab, setActiveTab] = useState('exercises');
  const [clients, setClients] = useState([]);
  const [templateView, setTemplateView] = useState('list'); // 'list' | 'form'
  const [editingTemplate, setEditingTemplate] = useState(null);

  const loadClients = async () => {
    try {
      const response = await clientAPI.getMyClients();
      setClients(response.data);
    } catch (err) {
      console.error('Error loading clients:', err);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const handleEditTemplate = (template) => {
    setEditingTemplate(template);
    setTemplateView('form');
  };

  const handleTemplateSaved = () => {
    setEditingTemplate(null);
    setTemplateView('list');
  };

  const handleTemplateCancel = () => {
    setEditingTemplate(null);
    setTemplateView('list');
  };

  return (
    <div className="coach-dashboard">
      <div className="dashboard-tabs">
        <button
          className={activeTab === 'exercises' ? 'active' : ''}
          onClick={() => setActiveTab('exercises')}
        >
          Exercise Library
        </button>
        <button
          className={activeTab === 'templates' ? 'active' : ''}
          onClick={() => setActiveTab('templates')}
        >
          Templates
        </button>
        <button
          className={activeTab === 'clients' ? 'active' : ''}
          onClick={() => setActiveTab('clients')}
        >
          Clients
        </button>
        <button
          className={activeTab === 'assigned' ? 'active' : ''}
          onClick={() => setActiveTab('assigned')}
        >
          Assigned Workouts
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'exercises' && <ExerciseLibrary />}
        {activeTab === 'templates' && (
          templateView === 'list' ? (
            <TemplateList onEditTemplate={handleEditTemplate} />
          ) : (
            <TemplateForm
              template={editingTemplate}
              onSaved={handleTemplateSaved}
              onCancel={handleTemplateCancel}
            />
          )
        )}
        {activeTab === 'clients' && <ClientManagement onClientsChange={loadClients} />}
        {activeTab === 'assigned' && <AssignedWorkouts clients={clients} />}
      </div>
    </div>
  );
}
