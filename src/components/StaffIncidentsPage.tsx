import React, { useState } from 'react';
import { Search, Filter, Download, Eye, Edit, MoreHorizontal, Grid, List, Plus, X } from 'lucide-react';
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
  title: string;
  category: string;
  status: 'new' | 'in_progress' | 'resolved' | 'closed';
  location: string;
  submittedBy: string;
  submittedOn: string;
  lastUpdated: string;
  assignedTo: string | null;
  description: string;
};

// Mock incidents data
const mockIncidents: Incident[] = [
  {
    id: 'INC-2024-0001',
    title: 'Water leak on Main Street',
    category: 'Infrastructure',
    status: 'new',
    location: '123 Main Street',
    submittedBy: 'John Doe',
    submittedOn: '2024-01-15',
    lastUpdated: '2024-01-15',
    assignedTo: null,
    description: 'Large water leak observed near the intersection'
  },
  {
    id: 'INC-2024-0002',
    title: 'Broken streetlight',
    category: 'Infrastructure',
    status: 'in_progress',
    location: 'Oak Avenue',
    submittedBy: 'Jane Smith',
    submittedOn: '2024-01-14',
    lastUpdated: '2024-01-16',
    assignedTo: 'Mike Wilson',
    description: 'Streetlight not working, area is dark at night'
  },
  {
    id: 'INC-2024-0003',
    title: 'Potholes on Highway 101',
    category: 'Transportation',
    status: 'resolved',
    location: 'Highway 101',
    submittedBy: 'Bob Johnson',
    submittedOn: '2024-01-12',
    lastUpdated: '2024-01-18',
    assignedTo: 'Sarah Davis',
    description: 'Multiple potholes causing vehicle damage'
  },
];

const statusColors = {
  new: 'bg-orange-100 text-orange-800',
  in_progress: 'bg-blue-100 text-blue-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800'
};

export function StaffIncidentsPage({ user }: StaffIncidentsPageProps) {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [showUpdateModal, setShowUpdateModal] = useState(false);

  const filteredIncidents = mockIncidents.filter(incident => {
    const matchesSearch = incident.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         incident.id.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || incident.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || incident.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleUpdateIncident = (incident: Incident) => {
    setSelectedIncident(incident);
    setShowUpdateModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium text-slate-900">Incidents Management</h1>
          <p className="text-slate-600">Manage and track all reported incidents</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Incident
          </Button>
        </div>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search incidents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="new">New</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                <SelectItem value="Transportation">Transportation</SelectItem>
                <SelectItem value="Safety">Safety</SelectItem>
                <SelectItem value="Environment">Environment</SelectItem>
              </SelectContent>
            </Select>

            <div className="flex items-center gap-1 bg-slate-100 rounded-md p-1">
              <Button
                variant={viewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('table')}
                className="h-7"
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('grid')}
                className="h-7"
              >
                <Grid className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content */}
      {viewMode === 'table' ? (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Submitted On</TableHead>
                  <TableHead>Assigned To</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredIncidents.map((incident) => (
                  <TableRow key={incident.id}>
                    <TableCell className="font-mono text-sm">{incident.id}</TableCell>
                    <TableCell className="font-medium">{incident.title}</TableCell>
                    <TableCell>{incident.category}</TableCell>
                    <TableCell>
                      <Badge className={statusColors[incident.status]}>
                        {incident.status.replace('_', ' ').toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>{incident.location}</TableCell>
                    <TableCell>{incident.submittedOn}</TableCell>
                    <TableCell>{incident.assignedTo || 'Unassigned'}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
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
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIncidents.map((incident) => (
            <Card key={incident.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <p className="font-mono text-sm text-slate-600">{incident.id}</p>
                    <CardTitle className="text-base leading-tight">{incident.title}</CardTitle>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
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
                <div className="flex items-center justify-between">
                  <Badge variant="secondary">{incident.category}</Badge>
                  <Badge className={statusColors[incident.status]}>
                    {incident.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                <div className="text-xs text-slate-500 space-y-1">
                  <p>📍 {incident.location}</p>
                  <p>👤 {incident.submittedBy}</p>
                  <p>📅 {incident.submittedOn}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
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
                <p className="text-sm font-mono text-slate-600">{selectedIncident.id}</p>
              </div>
              
              <div>
                <Label>Status</Label>
                <Select defaultValue={selectedIncident.status}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="in_progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Assign To</Label>
                <Select defaultValue={selectedIncident.assignedTo || 'unassigned'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    <SelectItem value="mike.wilson">Mike Wilson</SelectItem>
                    <SelectItem value="sarah.davis">Sarah Davis</SelectItem>
                    <SelectItem value="john.smith">John Smith</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Internal Comment</Label>
                <Textarea 
                  placeholder="Add internal notes or updates..."
                  className="resize-none"
                  rows={3}
                />
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowUpdateModal(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setShowUpdateModal(false)}>
                  Update Incident
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}