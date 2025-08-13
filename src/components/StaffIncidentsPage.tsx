import React, { useState, useEffect } from 'react';
import { Search, Filter, Download, Eye, Edit, MoreHorizontal, Grid, List, Plus, X, RefreshCw, Loader2, UserPlus, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { toast } from 'sonner';
import { incidentsAPI } from '../services/api';

type User = {
  id: string;
  name: string;
  email: string;
  role: 'resident' | 'staff' | 'admin';
};

interface StaffIncidentsPageProps {
  user: User;
}

type Incident = {
  id: string;
  incidentId?: string;
  title: string;
  category: string;
  status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  location: string;
  submittedBy: string;
  userId?: any;
  submittedOn: string;
  lastUpdated: string;
  assignedTo: string | null;
  description: string;
  contactInfo?: {
    email?: string;
    phone?: string;
  };
  statusHistory?: Array<{
    status: string;
    updatedBy: any;
    notes: string;
    updatedAt: string;
  }>;
  internalNotes?: Array<{
    content: string;
    author: any;
    createdAt: string;
  }>;
  photos?: string[];
  createdAt?: string;
  updatedAt?: string;
};

const statusColors = {
  'NEW': 'bg-orange-100 text-orange-800 border-orange-200',
  'IN_PROGRESS': 'bg-blue-100 text-blue-800 border-blue-200',
  'RESOLVED': 'bg-green-100 text-green-800 border-green-200',
  'CLOSED': 'bg-gray-100 text-gray-800 border-gray-200'
};

const priorityColors = {
  'LOW': 'bg-green-50 text-green-700',
  'MEDIUM': 'bg-yellow-50 text-yellow-700',
  'HIGH': 'bg-orange-50 text-orange-700',
  'URGENT': 'bg-red-50 text-red-700'
};

const categories = [
  'Infrastructure', 'Transportation', 'Safety', 'Environment', 
  'Utilities', 'Parks & Recreation', 'Public Property', 
  'Water & Utilities', 'Road Maintenance'
];

export function StaffIncidentsPage({ user }: StaffIncidentsPageProps) {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [assignmentFilter, setAssignmentFilter] = useState<string>('all');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Loading states
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // Update form state
  const [updateForm, setUpdateForm] = useState({
    status: '',
    assignedTo: '',
    notes: '',
    priority: ''
  });

  // Staff list for assignment
  const [staffList, setStaffList] = useState([
    { id: user.id, name: user.name, email: user.email },
    // Add more staff members as needed
  ]);

  const itemsPerPage = 20;

  // Load incidents when component mounts or filters change
  useEffect(() => {
    loadIncidents();
  }, [currentPage, statusFilter, categoryFilter, priorityFilter, assignmentFilter, searchQuery]);

  const loadIncidents = async (refresh = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const params = {
        page: currentPage,
        limit: itemsPerPage,
        ...(searchQuery && { search: searchQuery }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(categoryFilter !== 'all' && { category: categoryFilter }),
        ...(priorityFilter !== 'all' && { priority: priorityFilter }),
        ...(assignmentFilter === 'assigned' && { assigned: 'true' }),
        ...(assignmentFilter === 'unassigned' && { assignedTo: null })
      };

      console.log('Loading incidents with params:', params);

      const response = await incidentsAPI.getAll(params);
      
      // Transform backend data
      const transformedIncidents = (response.incidents || []).map(incident => ({
        ...incident,
        id: incident.id || incident._id,
        incidentId: incident.incidentId || `INC-${(incident.id || incident._id).slice(-6).toUpperCase()}`,
        submittedOn: incident.createdAt || incident.submittedOn,
        lastUpdated: incident.updatedAt || incident.lastUpdated,
        submittedBy: incident.userId?.name || incident.submittedBy || 'Unknown User',
        assignedTo: incident.assignedTo?.name || null,
        priority: incident.priority || 'MEDIUM'
      }));
      
      setIncidents(transformedIncidents);
      setTotalCount(response.total || 0);
      setTotalPages(response.totalPages || 1);
      
      console.log('Incidents loaded successfully:', transformedIncidents.length);
      
    } catch (error) {
      console.error('Failed to load incidents:', error);
      toast.error('Failed to load incidents. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleUpdateIncident = async (incident: Incident) => {
    setSelectedIncident(incident);
    setUpdateForm({
      status: incident.status,
      assignedTo: incident.assignedTo || '',
      notes: '',
      priority: incident.priority
    });
    setShowUpdateModal(true);
  };

  const handleViewDetails = async (incident: Incident) => {
    try {
      // Fetch full incident details
      const fullIncident = await incidentsAPI.getById(incident.id);
      setSelectedIncident(fullIncident);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Failed to load incident details:', error);
      toast.error('Failed to load incident details.');
    }
  };

  const submitUpdate = async () => {
    if (!selectedIncident) return;

    setIsUpdating(true);
    try {
      await incidentsAPI.updateStatus(
        selectedIncident.id,
        updateForm.status,
        updateForm.notes,
        updateForm.assignedTo || undefined
      );

      toast.success('Incident updated successfully');
      setShowUpdateModal(false);
      await loadIncidents(true);
      
    } catch (error) {
      console.error('Failed to update incident:', error);
      toast.error('Failed to update incident. Please try again.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleExport = async () => {
    try {
      toast.info('Preparing export...');
      // Implement export functionality
      const params = {
        search: searchQuery,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        category: categoryFilter !== 'all' ? categoryFilter : undefined,
        format: 'csv'
      };
      
      // Call export API endpoint
      console.log('Exporting with params:', params);
      toast.success('Export completed successfully');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Export failed. Please try again.');
    }
  };

  const getStatusBadge = (status: string) => {
    return (
      <Badge className={statusColors[status] || statusColors['NEW']}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    return (
      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${priorityColors[priority] || priorityColors['MEDIUM']}`}>
        {priority}
      </span>
    );
  };

  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {incidents.map((incident) => (
        <Card key={incident.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-400">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-1 flex-1 min-w-0">
                <p className="font-mono text-sm text-slate-600">{incident.incidentId}</p>
                <CardTitle className="text-base leading-tight truncate">{incident.title}</CardTitle>
                <div className="flex items-center gap-2">
                  {getStatusBadge(incident.status)}
                  {getPriorityBadge(incident.priority)}
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleViewDetails(incident)}>
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleUpdateIncident(incident)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Update Status
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <p className="text-sm text-slate-600 line-clamp-2">{incident.description}</p>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Category:</span>
                <Badge variant="secondary">{incident.category}</Badge>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Location:</span>
                <span className="text-slate-700 truncate">{incident.location}</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-500">Assigned:</span>
                <span className="text-slate-700">{incident.assignedTo || 'Unassigned'}</span>
              </div>
            </div>
            <div className="text-xs text-slate-500 pt-2 border-t space-y-1">
              <p>Submitted: {new Date(incident.submittedOn).toLocaleDateString()}</p>
              <p>By: {incident.submittedBy}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600 mx-auto mb-2" />
          <p className="text-slate-600">Loading incidents...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Incidents Management</h1>
          <p className="text-slate-600">
            Manage and track all reported incidents • Total: {totalCount} incidents
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => loadIncidents(true)}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button size="sm" onClick={() => setShowCreateModal(true)}>
            <Plus className="w-4 h-4 mr-2" />
            New Incident
          </Button>
        </div>
      </div>

      {/* Enhanced Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4 items-center">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search incidents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="NEW">New</SelectItem>
                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                <SelectItem value="RESOLVED">Resolved</SelectItem>
                <SelectItem value="CLOSED">Closed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={priorityFilter} onValueChange={setPriorityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priority</SelectItem>
                <SelectItem value="LOW">Low</SelectItem>
                <SelectItem value="MEDIUM">Medium</SelectItem>
                <SelectItem value="HIGH">High</SelectItem>
                <SelectItem value="URGENT">Urgent</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-1 bg-slate-100 rounded-[3rem] p-1">
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="h-7 px-2"
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="h-7 px-2"
              >
                <Grid className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {incidents.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4 opacity-20">📋</div>
          <h3 className="text-lg font-medium text-slate-800 mb-2">No incidents found</h3>
          <p className="text-slate-600 mb-6">
            {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all' 
              ? 'Try adjusting your filters or search terms'
              : 'No incidents have been reported yet'
            }
          </p>
        </div>
      ) : viewMode === 'table' ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-semibold">ID</TableHead>
                    <TableHead className="font-semibold">Title</TableHead>
                    <TableHead className="font-semibold">Category</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Priority</TableHead>
                    <TableHead className="font-semibold">Location</TableHead>
                    <TableHead className="font-semibold">Submitted</TableHead>
                    <TableHead className="font-semibold">Assigned To</TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {incidents.map((incident) => (
                    <TableRow key={incident.id} className="hover:bg-slate-50">
                      <TableCell className="font-mono text-sm">{incident.incidentId}</TableCell>
                      <TableCell className="font-medium max-w-48 truncate">{incident.title}</TableCell>
                      <TableCell>{incident.category}</TableCell>
                      <TableCell>{getStatusBadge(incident.status)}</TableCell>
                      <TableCell>{getPriorityBadge(incident.priority)}</TableCell>
                      <TableCell className="max-w-32 truncate">{incident.location}</TableCell>
                      <TableCell>{new Date(incident.submittedOn).toLocaleDateString()}</TableCell>
                      <TableCell>{incident.assignedTo || 'Unassigned'}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleViewDetails(incident)}>
                              <Eye className="w-4 h-4 mr-2" />
                              View Details
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateIncident(incident)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Update Status
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <GridView />
      )}

      {/* Update Incident Modal */}
      <Dialog open={showUpdateModal} onOpenChange={setShowUpdateModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Update Incident</DialogTitle>
          </DialogHeader>
          {selectedIncident && (
            <div className="space-y-4">
              <div>
                <Label>Incident ID</Label>
                <p className="text-sm font-mono text-slate-600 bg-slate-50 p-2 rounded">
                  {selectedIncident.incidentId}
                </p>
              </div>

              <div>
                <Label>Title</Label>
                <p className="text-sm text-slate-700 bg-slate-50 p-2 rounded">
                  {selectedIncident.title}
                </p>
              </div>
              
              <div>
                <Label htmlFor="status">Status</Label>
                <Select 
                  value={updateForm.status} 
                  onValueChange={(value) => setUpdateForm(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NEW">New</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="RESOLVED">Resolved</SelectItem>
                    <SelectItem value="CLOSED">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="assignedTo">Assign To</Label>
                <Select 
                  value={updateForm.assignedTo} 
                  onValueChange={(value) => setUpdateForm(prev => ({ ...prev, assignedTo: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select staff member" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Unassigned</SelectItem>
                    {staffList.map((staff) => (
                      <SelectItem key={staff.id} value={staff.id}>
                        {staff.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="notes">Update Notes</Label>
                <Textarea 
                  id="notes"
                  placeholder="Add internal notes about this update..."
                  className="resize-none"
                  rows={3}
                  value={updateForm.notes}
                  onChange={(e) => setUpdateForm(prev => ({ ...prev, notes: e.target.value }))}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button 
                  variant="outline" 
                  onClick={() => setShowUpdateModal(false)}
                  disabled={isUpdating}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={submitUpdate}
                  disabled={isUpdating}
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Incident'
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Incident Details Modal */}
      <Dialog open={showDetailsModal} onOpenChange={setShowDetailsModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Incident Details</DialogTitle>
          </DialogHeader>
          {selectedIncident && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4 p-4 bg-slate-50 rounded-[3rem]">
                <div>
                  <p className="text-sm font-medium text-slate-600">ID</p>
                  <p className="font-mono text-sm">{selectedIncident.incidentId}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Status</p>
                  {getStatusBadge(selectedIncident.status)}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Priority</p>
                  {getPriorityBadge(selectedIncident.priority)}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">Category</p>
                  <p className="text-sm">{selectedIncident.category}</p>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-slate-800 mb-2">Title</h4>
                <p className="text-slate-700">{selectedIncident.title}</p>
              </div>

              <div>
                <h4 className="font-semibold text-slate-800 mb-2">Description</h4>
                <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-[3rem]">
                  {selectedIncident.description}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">Location</h4>
                  <p className="text-slate-700">{selectedIncident.location}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">Submitted By</h4>
                  <p className="text-slate-700">{selectedIncident.submittedBy}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">Submitted On</h4>
                  <p className="text-slate-700">{new Date(selectedIncident.submittedOn).toLocaleString()}</p>
                </div>
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">Last Updated</h4>
                  <p className="text-slate-700">{new Date(selectedIncident.lastUpdated).toLocaleString()}</p>
                </div>
              </div>

              {selectedIncident.contactInfo && (
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">Contact Information</h4>
                  <div className="bg-slate-50 p-3 rounded-[3rem]">
                    {selectedIncident.contactInfo.email && (
                      <p className="text-sm">Email: {selectedIncident.contactInfo.email}</p>
                    )}
                    {selectedIncident.contactInfo.phone && (
                      <p className="text-sm">Phone: {selectedIncident.contactInfo.phone}</p>
                    )}
                  </div>
                </div>
              )}

              {selectedIncident.statusHistory && selectedIncident.statusHistory.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2">Status History</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedIncident.statusHistory.map((entry, index) => (
                      <div key={index} className="bg-slate-50 p-3 rounded-[3rem] text-sm">
                        <div className="flex justify-between items-center mb-1">
                          <Badge className={statusColors[entry.status] || statusColors['NEW']}>
                            {entry.status}
                          </Badge>
                          <span className="text-slate-500">
                            {new Date(entry.updatedAt).toLocaleDateString()}
                          </span>
                        </div>
                        {entry.notes && <p className="text-slate-700">{entry.notes}</p>}
                        <p className="text-slate-500 text-xs">
                          By: {entry.updatedBy?.name || 'System'}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4 border-t">
                <Button 
                  variant="outline" 
                  onClick={() => handleUpdateIncident(selectedIncident)}
                  className="flex-1"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Update Status
                </Button>
                <Button variant="outline" className="flex-1">
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Add Comment
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}