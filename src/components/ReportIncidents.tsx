import React, { useState } from 'react';
import { Layout } from './Layout';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from './ui/pagination';
import { Search, Plus, Eye, Grid, List, Calendar, MapPin, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

type User = {
  id: string;
  name: string;
  email: string;
};

type Page = 'login' | 'signup' | 'dashboard' | 'chatbot' | 'incidents' | 'profile';

type Incident = {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  status: 'NEW' | 'IN_PROGRESS' | 'RESOLVED';
  submittedOn: string;
  lastUpdated: string;
  contactInfo?: string;
};

interface ReportedIncidentsProps {
  user: User;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

export function ReportedIncidents({ user, onNavigate, onLogout }: ReportedIncidentsProps) {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusCheckId, setStatusCheckId] = useState('');

  // Report form state
  const [reportForm, setReportForm] = useState({
    title: '',
    description: '',
    category: '',
    location: '',
    contactInfo: user.email,
  });

  // Mock incidents data
  const [incidents] = useState<Incident[]>([
    {
      id: 'INC-001',
      title: 'Broken streetlight on Main Street',
      description: 'The streetlight at Main St and 1st Ave has been flickering and went out completely yesterday.',
      category: 'Infrastructure',
      location: 'Main St & 1st Ave',
      status: 'IN_PROGRESS',
      submittedOn: '2024-01-15',
      lastUpdated: '2024-01-16',
      contactInfo: 'john@email.com'
    },
    {
      id: 'INC-002',
      title: 'Pothole near City Hall',
      description: 'Large pothole causing vehicle damage on the main road to City Hall.',
      category: 'Road Maintenance',
      location: 'City Hall Main Entrance',
      status: 'RESOLVED',
      submittedOn: '2024-01-12',
      lastUpdated: '2024-01-18',
      contactInfo: 'jane@email.com'
    },
    {
      id: 'INC-003',
      title: 'Graffiti on bus stop',
      description: 'Inappropriate graffiti on the bus stop bench at Oak Street.',
      category: 'Public Property',
      location: 'Oak Street Bus Stop',
      status: 'NEW',
      submittedOn: '2024-01-18',
      lastUpdated: '2024-01-18',
      contactInfo: 'mike@email.com'
    },
    {
      id: 'INC-004',
      title: 'Broken playground equipment',
      description: 'Swing set chain is broken at Central Park playground.',
      category: 'Parks & Recreation',
      location: 'Central Park Playground',
      status: 'IN_PROGRESS',
      submittedOn: '2024-01-14',
      lastUpdated: '2024-01-17',
      contactInfo: 'sarah@email.com'
    },
    {
      id: 'INC-005',
      title: 'Water leak at intersection',
      description: 'Water main leak causing flooding at the intersection.',
      category: 'Water & Utilities',
      location: 'Pine St & 2nd Ave',
      status: 'NEW',
      submittedOn: '2024-01-17',
      lastUpdated: '2024-01-17',
      contactInfo: 'alex@email.com'
    },
  ]);

  const categories = ['Infrastructure', 'Road Maintenance', 'Public Property', 'Parks & Recreation', 'Water & Utilities'];
  const itemsPerPage = 10;

  // Filter incidents
  const filteredIncidents = incidents.filter(incident => {
    const matchesSearch = 
      incident.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      incident.location.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = categoryFilter === 'all' || incident.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || incident.status === statusFilter;
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalPages = Math.ceil(filteredIncidents.length / itemsPerPage);
  const paginatedIncidents = filteredIncidents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handleReportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (reportForm.title && reportForm.description && reportForm.category && reportForm.location) {
      const refId = `INC-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`;
      toast.success(`Incident reported successfully! Reference ID: ${refId}`);
      setShowReportModal(false);
      setReportForm({
        title: '',
        description: '',
        category: '',
        location: '',
        contactInfo: user.email,
      });
    }
  };

  const handleStatusCheck = () => {
    const incident = incidents.find(inc => inc.id === statusCheckId);
    if (incident) {
      toast.success('Status found!');
    } else {
      toast.error('Incident not found. Please check your reference ID.');
    }
    setStatusCheckId('');
    setShowStatusModal(false);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'NEW':
        return <Badge className="bg-orange-100 text-orange-800">New</Badge>;
      case 'IN_PROGRESS':
        return <Badge className="bg-blue-100 text-blue-800">In Progress</Badge>;
      case 'RESOLVED':
        return <Badge className="bg-green-100 text-green-800">Resolved</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {paginatedIncidents.map((incident) => (
        <Card key={incident.id} className="hover:shadow-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <CardTitle className="text-lg">{incident.title}</CardTitle>
              {getStatusBadge(incident.status)}
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600 mb-3">{incident.description}</p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-slate-400" />
                <span>{incident.location}</span>
              </div>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-slate-400" />
                <span>{incident.category}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-slate-400" />
                <span>Submitted: {incident.submittedOn}</span>
              </div>
            </div>
            <div className="mt-3 pt-3 border-t">
              <p className="text-xs text-slate-500">ID: {incident.id}</p>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <Layout user={user} currentPage="incidents" onNavigate={onNavigate} onLogout={onLogout}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl text-slate-900">Reported Incidents</h1>
            <p className="text-slate-600">Track and manage your civic reports</p>
          </div>
          <div className="flex gap-2">
            <Dialog open={showStatusModal} onOpenChange={setShowStatusModal}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  Check Status
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Check Incident Status</DialogTitle>
                  <DialogDescription>
                    Enter your reference ID to check the status of your reported incident.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="statusId">Reference ID</Label>
                    <Input
                      id="statusId"
                      placeholder="Enter reference ID (e.g., INC-001)"
                      value={statusCheckId}
                      onChange={(e) => setStatusCheckId(e.target.value)}
                    />
                  </div>
                  <Button onClick={handleStatusCheck} className="w-full">
                    Check Status
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showReportModal} onOpenChange={setShowReportModal}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Report New Incident
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Report New Incident</DialogTitle>
                  <DialogDescription>
                    Help us improve your community by reporting issues.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleReportSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Title *</Label>
                    <Input
                      id="title"
                      value={reportForm.title}
                      onChange={(e) => setReportForm({ ...reportForm, title: e.target.value })}
                      placeholder="Brief description of the issue"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category *</Label>
                    <Select
                      value={reportForm.category}
                      onValueChange={(value) => setReportForm({ ...reportForm, category: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map((category) => (
                          <SelectItem key={category} value={category}>
                            {category}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="location">Location *</Label>
                    <Input
                      id="location"
                      value={reportForm.location}
                      onChange={(e) => setReportForm({ ...reportForm, location: e.target.value })}
                      placeholder="Where is this issue located?"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={reportForm.description}
                      onChange={(e) => setReportForm({ ...reportForm, description: e.target.value })}
                      placeholder="Provide detailed information about the issue"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="contact">Contact Info</Label>
                    <Input
                      id="contact"
                      value={reportForm.contactInfo}
                      onChange={(e) => setReportForm({ ...reportForm, contactInfo: e.target.value })}
                      placeholder="How can we reach you for updates?"
                    />
                  </div>
                  <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700">
                    Submit Report
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Filters and Search */}
        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search by title, description, or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-40">
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
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="NEW">New</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="RESOLVED">Resolved</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex border border-slate-200 rounded-lg">
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                    className="rounded-r-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-l-none"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                </div>
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
                    <TableHead>Title</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted On</TableHead>
                    <TableHead>Last Updated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedIncidents.map((incident) => (
                    <TableRow key={incident.id}>
                      <TableCell>
                        <div>
                          <p className="text-slate-900">{incident.title}</p>
                          <p className="text-sm text-slate-600">ID: {incident.id}</p>
                        </div>
                      </TableCell>
                      <TableCell>{incident.category}</TableCell>
                      <TableCell>{incident.location}</TableCell>
                      <TableCell>{getStatusBadge(incident.status)}</TableCell>
                      <TableCell>{incident.submittedOn}</TableCell>
                      <TableCell>{incident.lastUpdated}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ) : (
          <GridView />
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <PaginationItem key={page}>
                    <PaginationLink
                      onClick={() => setCurrentPage(page)}
                      isActive={currentPage === page}
                      className="cursor-pointer"
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext 
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </Layout>
  );
}