import React, { useState } from 'react';
import { Search, Plus, Edit, Trash2, Eye, MoreHorizontal, Grid, List, Book } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { Switch } from './ui/switch';

type User = {
  id: string;
  name: string;
  email: string;
  role: 'resident' | 'staff' | 'admin';
};

interface StaffKnowledgeBasePageProps {
  user: User;
}

type Article = {
  id: string;
  title: string;
  category: string;
  status: 'draft' | 'published';
  views: number;
  lastUpdated: string;
  author: string;
  content: string;
  tags: string[];
};

// Mock articles data
const mockArticles: Article[] = [
  {
    id: 'KB-001',
    title: 'How to Report a Water Leak Emergency',
    category: 'Infrastructure',
    status: 'published',
    views: 1247,
    lastUpdated: '2024-01-18',
    author: 'Sarah Davis',
    content: 'Step-by-step guide for reporting water leak emergencies...',
    tags: ['emergency', 'water', 'infrastructure']
  },
  {
    id: 'KB-002',
    title: 'Understanding City Council Meetings',
    category: 'Civic Engagement',
    status: 'published',
    views: 856,
    lastUpdated: '2024-01-16',
    author: 'Mike Wilson',
    content: 'Learn about city council meetings and how to participate...',
    tags: ['council', 'meetings', 'civic']
  },
  {
    id: 'KB-003',
    title: 'Emergency Evacuation Procedures',
    category: 'Safety',
    status: 'draft',
    views: 0,
    lastUpdated: '2024-01-20',
    author: 'John Smith',
    content: 'Draft article about emergency evacuation procedures...',
    tags: ['emergency', 'evacuation', 'safety']
  },
];

export function StaffKnowledgeBasePage({ user }: StaffKnowledgeBasePageProps) {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);

  const filteredArticles = mockArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || article.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || article.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const handleEditArticle = (article: Article) => {
    setSelectedArticle(article);
    setShowEditModal(true);
  };

  const handleNewArticle = () => {
    setSelectedArticle({
      id: '',
      title: '',
      category: '',
      status: 'draft',
      views: 0,
      lastUpdated: '',
      author: user.name,
      content: '',
      tags: []
    });
    setShowNewModal(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium text-slate-900">Knowledge Base Manager</h1>
          <p className="text-slate-600">Create and manage helpful articles for residents</p>
        </div>
        <Button onClick={handleNewArticle}>
          <Plus className="w-4 h-4 mr-2" />
          New Article
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Book className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">15</p>
                <p className="text-sm text-slate-600">Total Articles</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Eye className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">12.5K</p>
                <p className="text-sm text-slate-600">Total Views</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Edit className="w-8 h-8 text-orange-600" />
              <div>
                <p className="text-2xl font-bold">3</p>
                <p className="text-sm text-slate-600">Draft Articles</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search articles..."
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
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full sm:w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                <SelectItem value="Safety">Safety</SelectItem>
                <SelectItem value="Civic Engagement">Civic Engagement</SelectItem>
                <SelectItem value="Transportation">Transportation</SelectItem>
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
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Last Updated</TableHead>
                  <TableHead>Author</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredArticles.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell className="font-medium">{article.title}</TableCell>
                    <TableCell>{article.category}</TableCell>
                    <TableCell>
                      <Badge variant={article.status === 'published' ? 'default' : 'secondary'}>
                        {article.status.toUpperCase()}
                      </Badge>
                    </TableCell>
                    <TableCell>{article.views.toLocaleString()}</TableCell>
                    <TableCell>{article.lastUpdated}</TableCell>
                    <TableCell>{article.author}</TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditArticle(article)}>
                            <Edit className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem>
                            <Eye className="w-4 h-4 mr-2" />
                            Preview
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-red-600">
                            <Trash2 className="w-4 h-4 mr-2" />
                            Delete
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
          {filteredArticles.map((article) => (
            <Card key={article.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="space-y-1 flex-1">
                    <CardTitle className="text-base leading-tight line-clamp-2">
                      {article.title}
                    </CardTitle>
                    <Badge variant={article.status === 'published' ? 'default' : 'secondary'} className="text-xs">
                      {article.status.toUpperCase()}
                    </Badge>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEditArticle(article)}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Eye className="w-4 h-4 mr-2" />
                        Preview
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-red-600">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <p className="text-sm text-slate-600 line-clamp-3">{article.content}</p>
                <div className="flex flex-wrap gap-1">
                  {article.tags.slice(0, 3).map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="text-xs text-slate-500 space-y-1">
                  <p>📂 {article.category}</p>
                  <p>👁️ {article.views.toLocaleString()} views</p>
                  <p>📅 Updated {article.lastUpdated}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Article Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Article</DialogTitle>
          </DialogHeader>
          {selectedArticle && (
            <div className="space-y-4">
              <div>
                <Label>Title</Label>
                <Input defaultValue={selectedArticle.title} />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Category</Label>
                  <Select defaultValue={selectedArticle.category}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                      <SelectItem value="Safety">Safety</SelectItem>
                      <SelectItem value="Civic Engagement">Civic Engagement</SelectItem>
                      <SelectItem value="Transportation">Transportation</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-center justify-between">
                  <Label>Published</Label>
                  <Switch defaultChecked={selectedArticle.status === 'published'} />
                </div>
              </div>

              <div>
                <Label>Content</Label>
                <Textarea 
                  defaultValue={selectedArticle.content}
                  rows={8}
                  className="resize-none"
                />
              </div>

              <div>
                <Label>Tags (comma-separated)</Label>
                <Input defaultValue={selectedArticle.tags.join(', ')} />
              </div>

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowEditModal(false)}>
                  Cancel
                </Button>
                <Button onClick={() => setShowEditModal(false)}>
                  Save Article
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* New Article Modal */}
      <Dialog open={showNewModal} onOpenChange={setShowNewModal}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Article</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input placeholder="Enter article title..." />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Category</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Infrastructure">Infrastructure</SelectItem>
                    <SelectItem value="Safety">Safety</SelectItem>
                    <SelectItem value="Civic Engagement">Civic Engagement</SelectItem>
                    <SelectItem value="Transportation">Transportation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <Label>Published</Label>
                <Switch />
              </div>
            </div>

            <div>
              <Label>Content</Label>
              <Textarea 
                placeholder="Write your article content here..."
                rows={8}
                className="resize-none"
              />
            </div>

            <div>
              <Label>Tags (comma-separated)</Label>
              <Input placeholder="tag1, tag2, tag3" />
            </div>

            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowNewModal(false)}>
                Cancel
              </Button>
              <Button onClick={() => setShowNewModal(false)}>
                Create Article
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}