import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, FolderPlus, Folder, Plus, Edit, Trash2, ShoppingCart, Copy, Download } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import useCart from '../hooks/useCartSafe';
import { projectsAPI, handleAPIError } from '../lib/api';

interface ProjectItem {
  id: number;
  name: string;
  brand: string;
  articleNumber: string;
  price: string;
  quantity: number;
  unitType: 'piece' | 'meter';
  unitSize?: number;
  image: string;
}

interface Project {
  id: number;
  name: string;
  description: string;
  createdDate: string;
  lastUsed: string;
  items: ProjectItem[];
  totalValue: number;
}

export default function ProjectLists() {
  const { state } = useAuth();
  const { addItem, openCart } = useCart();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');

  // Load projects on component mount
  React.useEffect(() => {
    const loadProjects = async () => {
      try {
        const projectsData = await projectsAPI.getProjects();
        
        // Transform API data to frontend format
        const transformedProjects = projectsData.map((project: any) => ({
          id: project.id,
          name: project.name,
          description: project.description,
          createdDate: project.created_at.split('T')[0],
          lastUsed: project.last_used.split('T')[0],
          items: [], // Will be loaded when needed
          totalValue: project.total_value
        }));
        
        setProjects(transformedProjects);
      } catch (error) {
        console.error('Failed to load projects:', handleAPIError(error));
      } finally {
        setIsLoading(false);
      }
    };

    if (state.isAuthenticated) {
      loadProjects();
    }
  }, [state.isAuthenticated]);
  if (!state.isAuthenticated || !state.user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Folder className="mx-auto mb-4 text-gray-400" size={48} />
          <h1 className="text-2xl font-bold mb-4">Anmeldung erforderlich</h1>
          <p className="text-gray-600 mb-6">
            Bitte melden Sie sich an, um Ihre Projektlisten zu verwalten.
          </p>
          <Link to="/" className="px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600">
            Zur Startseite
          </Link>
        </div>
      </div>
    );
  }

  const createProject = async () => {
    if (!newProjectName.trim()) return;
    
    try {
      const response = await projectsAPI.createProject({
        name: newProjectName,
        description: newProjectDescription
      });
      
      const newProject: Project = {
        id: response.projectId,
        name: newProjectName,
        description: newProjectDescription,
        createdDate: new Date().toISOString().split('T')[0],
        lastUsed: new Date().toISOString().split('T')[0],
        items: [],
        totalValue: 0
      };
      
      setProjects([newProject, ...projects]);
      setNewProjectName('');
      setNewProjectDescription('');
      setShowCreateModal(false);
    } catch (error) {
      console.error('Failed to create project:', handleAPIError(error));
    }
  };

  const deleteProject = async (projectId: number) => {
    try {
      await projectsAPI.deleteProject(projectId);
      setProjects(projects.filter(p => p.id !== projectId));
    } catch (error) {
      console.error('Failed to delete project:', handleAPIError(error));
    }
  };

  const duplicateProject = (project: Project) => {
    const duplicatedProject: Project = {
      ...project,
      id: Date.now(),
      name: `${project.name} (Kopie)`,
      createdDate: new Date().toISOString().split('T')[0],
      lastUsed: new Date().toISOString().split('T')[0]
    };
    
    setProjects([duplicatedProject, ...projects]);
  };

  const addProjectToCart = (project: Project) => {
    project.items.forEach(item => {
      addItem({
        id: item.id,
        name: item.name,
        brand: item.brand,
        price: item.price,
        image: item.image,
        quantity: item.quantity,
        unitType: item.unitType,
        unitSize: item.unitSize,
        minQuantity: 1,
        specs: [item.articleNumber]
      });
    });
    openCart();
  };

  const exportProject = async (project: Project) => {
    try {
      const blob = await projectsAPI.exportProject(project.id);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.name.replace(/[^a-zA-Z0-9]/g, '_')}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Failed to export project:', handleAPIError(error));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-AT', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Projektlisten werden geladen...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Link to="/" className="inline-flex items-center text-gray-600 hover:text-amber-500 mb-4">
            <ArrowLeft size={20} className="mr-2" />
            Zurück zur Startseite
          </Link>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <Folder className="mr-3 text-amber-500" size={28} />
                Projektlisten
              </h1>
              <p className="text-gray-600 mt-1">
                Verwalten Sie wiederkehrende Bestellungen und Projektlisten
              </p>
            </div>
            
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
            >
              <FolderPlus size={16} className="mr-2" />
              Neue Projektliste
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {projects.length === 0 ? (
          <div className="text-center py-12">
            <Folder className="mx-auto mb-4 text-gray-400" size={48} />
            <h2 className="text-xl font-semibold mb-2">Noch keine Projektlisten</h2>
            <p className="text-gray-600 mb-6">
              Erstellen Sie Projektlisten für wiederkehrende Bestellungen.
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
            >
              Erste Projektliste erstellen
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((project) => (
              <div key={project.id} className="bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-300">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {project.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                        {project.description}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-1 ml-2">
                      <button
                        onClick={() => setSelectedProject(project)}
                        className="p-1 text-gray-400 hover:text-amber-500"
                        title="Details anzeigen"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => duplicateProject(project)}
                        className="p-1 text-gray-400 hover:text-blue-500"
                        title="Duplizieren"
                      >
                        <Copy size={16} />
                      </button>
                      <button
                        onClick={() => deleteProject(project.id)}
                        className="p-1 text-gray-400 hover:text-red-500"
                        title="Löschen"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Artikel:</span>
                      <span className="font-medium">{project.items.length}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Gesamtwert:</span>
                      <span className="font-medium">€{project.totalValue.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Erstellt:</span>
                      <span>{formatDate(project.createdDate)}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Zuletzt verwendet:</span>
                      <span>{formatDate(project.lastUsed)}</span>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <button
                      onClick={() => addProjectToCart(project)}
                      className="flex-1 flex items-center justify-center px-3 py-2 bg-amber-500 text-white rounded text-sm hover:bg-amber-600"
                    >
                      <ShoppingCart size={14} className="mr-2" />
                      In Warenkorb
                    </button>
                    <button
                      onClick={() => exportProject(project)}
                      className="px-3 py-2 border border-gray-300 rounded text-sm hover:bg-gray-50"
                      title="Als CSV exportieren"
                    >
                      <Download size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setShowCreateModal(false)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Neue Projektliste erstellen</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Projektname *
                    </label>
                    <input
                      type="text"
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="z.B. Bürobeleuchtung Gebäude A"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Beschreibung
                    </label>
                    <textarea
                      value={newProjectDescription}
                      onChange={(e) => setNewProjectDescription(e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                      placeholder="Kurze Beschreibung des Projekts..."
                    />
                  </div>
                </div>
                
                <div className="flex space-x-3 mt-6">
                  <button
                    onClick={createProject}
                    disabled={!newProjectName.trim()}
                    className="flex-1 px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
                  >
                    Erstellen
                  </button>
                  <button
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Abbrechen
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Project Details Modal */}
      {selectedProject && (
        <>
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setSelectedProject(null)} />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-xl font-semibold">{selectedProject.name}</h2>
                    <p className="text-gray-600">{selectedProject.description}</p>
                  </div>
                  <button
                    onClick={() => setSelectedProject(null)}
                    className="p-2 hover:bg-gray-100 rounded"
                  >
                    ×
                  </button>
                </div>
                
                <div className="space-y-4">
                  {selectedProject.items.map((item) => (
                    <div key={item.id} className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded"
                      />
                      <div className="flex-1">
                        <p className="text-sm text-gray-600">{item.brand}</p>
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-gray-500">{item.articleNumber}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">€{item.price}</p>
                        <p className="text-sm text-gray-600">{item.quantity}x</p>
                      </div>
                      <div className="text-right min-w-[80px]">
                        <p className="font-bold">
                          €{(parseFloat(item.price) * item.quantity).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-between items-center mt-6 pt-6 border-t">
                  <div className="text-lg font-semibold">
                    Gesamtwert: €{selectedProject.totalValue.toFixed(2)}
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => exportProject(selectedProject)}
                      className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <Download size={16} className="mr-2" />
                      Exportieren
                    </button>
                    <button
                      onClick={() => {
                        addProjectToCart(selectedProject);
                        setSelectedProject(null);
                      }}
                      className="flex items-center px-4 py-2 bg-amber-500 text-white rounded-lg hover:bg-amber-600"
                    >
                      <ShoppingCart size={16} className="mr-2" />
                      In Warenkorb
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}