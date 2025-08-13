import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Eye, MoreHorizontal, Grid, List, Book, RefreshCw, Loader2, Archive, Globe } from 'lucide-react';
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
import { toast } from 'sonner';
import { kbAPI } from '../services/api';

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
  _id?: string;
  title: string;
  category: string;
  status: 'draft' | 'published' | 'archived';
  views: number;
  createdAt: string;
  updatedAt: string;
  author: {
    name: string;
    email: string;
  };
  content: string;
  tags: string[];
  sourceUrl?: string;
};

type ArticleStats = {
  totalArticles: number;
  totalViews: number;
  draftArticles: number;
  publishedArticles: number;
};

const categories = [
  'Infrastructure', 'Safety', 'Civic Engagement', 
  'Transportation', 'Environment', 'Utilities', 'General'
];

export function StaffKnowledgeBasePage({ user }: StaffKnowledgeBasePageProps) {
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showNewModal, setShowNewModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);

  // Data state
  const [articles, setArticles] = useState<Article[]>([]);
  const [stats, setStats] = useState<ArticleStats>({
    totalArticles: 0,
    totalViews: 0,
    draftArticles: 0,
    publishedArticles: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // Form state
  const [articleForm, setArticleForm] = useState({
    title: '',
    content: '',
    category: '',
    tags: '',
    sourceUrl: '',
    status: 'draft' as 'draft' | 'published' | 'archived'
  });

  const itemsPerPage = 20;

  useEffect(() => {
    loadArticles();
  }, [currentPage, statusFilter, categoryFilter, searchQuery]);

  const loadArticles = async (refresh = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }

      const params = {
        page: currentPage,
        limit: itemsPerPage,
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(categoryFilter !== 'all' && { category: categoryFilter }),
        ...(searchQuery && { search: searchQuery })
      };

      console.log('Loading articles with params:', params);

      const response = await kbAPI.getArticles(params);
      
      const transformedArticles = (response.articles || []).map(article => ({
        ...article,
        id: article.id || article._id,
        createdAt: article.createdAt,
        updatedAt: article.updatedAt
      }));

      setArticles(transformedArticles);
      setTotalPages(response.pagination?.pages || 1);

      // Calculate stats from loaded articles
      const totalArticles = transformedArticles.length;
      const totalViews = transformedArticles.reduce((sum, article) => sum + (article.views || 0), 0);
      const draftArticles = transformedArticles.filter(a => a.status === 'draft').length;
      const publishedArticles = transformedArticles.filter(a => a.status === 'published').length;

      setStats({
        totalArticles,
        totalViews,
        draftArticles,
        publishedArticles
      });

      console.log('Articles loaded successfully:', transformedArticles.length);
      
    } catch (error) {
      console.error('Failed to load articles:', error);
      toast.error('Failed to load articles. Please try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleCreateArticle = async () => {
    if (!articleForm.title || !articleForm.content || !articleForm.category) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        title: articleForm.title.trim(),
        content: articleForm.content.trim(),
        category: articleForm.category,
        tags: articleForm.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        sourceUrl: articleForm.sourceUrl.trim() || undefined,
        status: articleForm.status
      };

      await kbAPI.createArticle(payload);
      
      toast.success('Article created successfully');
      setShowNewModal(false);
      resetForm();
      await loadArticles(true);
      
    } catch (error) {
      console.error('Failed to create article:', error);
      toast.error('Failed to create article. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUpdateArticle = async () => {
    if (!selectedArticle || !articleForm.title || !articleForm.content) {
      toast.error('Please fill in all required fields');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        title: articleForm.title.trim(),
        content: articleForm.content.trim(),
        category: articleForm.category,
        tags: articleForm.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        sourceUrl: articleForm.sourceUrl.trim() || undefined,
        status: articleForm.status
      };

      await kbAPI.updateArticle(selectedArticle.id, payload);
      
      toast.success('Article updated successfully');
      setShowEditModal(false);
      resetForm();
      await loadArticles(true);
      
    } catch (error) {
      console.error('Failed to update article:', error);
      toast.error('Failed to update article. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteArticle = async (article: Article) => {
    if (!confirm(`Are you sure you want to delete "${article.title}"?`)) {
      return;
    }

    try {
      await kbAPI.deleteArticle(article.id);
      toast.success('Article deleted successfully');
      await loadArticles(true);
    } catch (error) {
      console.error('Failed to delete article:', error);
      toast.error('Failed to delete article. Please try again.');
    }
  };

  const handleEditArticle = (article: Article) => {
    setSelectedArticle(article);
    setArticleForm({
      title: article.title,
      content: article.content,
      category: article.category,
      tags: article.tags.join(', '),
      sourceUrl: article.sourceUrl || '',
      status: article.status
    });
    setShowEditModal(true);
  };

  const handlePreviewArticle = (article: Article) => {
    setSelectedArticle(article);
    setShowPreviewModal(true);
  };

  const handleNewArticle = () => {
    resetForm();
    setShowNewModal(true);
  };

  const resetForm = () => {
    setSelectedArticle(null);
    setArticleForm({
      title: '',
      content: '',
      category: '',
      tags: '',
      sourceUrl: '',
      status: 'draft'
    });
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'published': 'bg-green-100 text-green-800 border-green-200',
      'draft': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'archived': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    
    return (
      <Badge className={variants[status] || variants['draft']}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {articles.map((article) => (
        <Card key={article.id} className="hover:shadow-lg transition-shadow border-l-4 border-l-green-400">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="space-y-2 flex-1 min-w-0">
                <CardTitle className="text-base leading-tight line-clamp-2">
                  {article.title}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {getStatusBadge(article.status)}
                  <Badge variant="outline" className="text-xs">
                    {article.category}
                  </Badge>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handlePreviewArticle(article)}>
                    <Eye className="w-4 h-4 mr-2" />
                    Preview
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleEditArticle(article)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => handleDeleteArticle(article)}
                    className="text-red-600"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="pt-0 space-y-3">
            <p className="text-sm text-slate-600 line-clamp-3">{article.content}</p>
            {article.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {article.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {article.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{article.tags.length - 3} more
                  </Badge>
                )}
              </div>
            )}
            <div className="text-xs text-slate-500 space-y-1 pt-2 border-t">
              <div className="flex justify-between">
                <span>Views: {article.views.toLocaleString()}</span>
                <span>By: {article.author.name}</span>
              </div>
              <p>Updated: {new Date(article.updatedAt).toLocaleDateString()}</p>
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
          <Loader2 className="h-8 w-8 animate-spin text-green-600 mx-auto mb-2" />
          <p className="text-slate-600">Loading knowledge base...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Knowledge Base Manager</h1>
          <p className="text-slate-600">Create and manage helpful articles for residents</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={() => loadArticles(true)}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Refresh
          </Button>
          <Button onClick={handleNewArticle}>
            <Plus className="w-4 h-4 mr-2" />
            New Article
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Book className="w-8 h-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{stats.totalArticles}</p>
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
                <p className="text-2xl font-bold">{stats.totalViews.toLocaleString()}</p>
                <p className="text-sm text-slate-600">Total Views</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Globe className="w-8 h-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{stats.publishedArticles}</p>
                <p className="text-sm text-slate-600">Published</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Edit className="w-8 h-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">{stats.draftArticles}</p>
                <p className="text-sm text-slate-600">Drafts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-center">
            <div className="relative lg:col-span-2">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input
                placeholder="Search articles..."
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
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
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
      {articles.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4 opacity-20">
            <Book className="h-16 w-16 mx-auto" />
          </div>
          <h3 className="text-lg font-medium text-slate-800 mb-2">No articles found</h3>
          <p className="text-slate-600 mb-6">
            {searchQuery || statusFilter !== 'all' || categoryFilter !== 'all' 
              ? 'Try adjusting your filters or search terms'
              : 'Create your first knowledge base article'
            }
          </p>
          <Button onClick={handleNewArticle}>
            <Plus className="w-4 h-4 mr-2" />
            Create First Article
          </Button>
        </div>
      ) : viewMode === 'table' ? (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50">
                    <TableHead className="font-semibold">Title</TableHead>
                    <TableHead className="font-semibold">Category</TableHead>
                    <TableHead className="font-semibold">Status</TableHead>
                    <TableHead className="font-semibold">Views</TableHead>
                    <TableHead className="font-semibold">Last Updated</TableHead>
                    <TableHead className="font-semibold">Author</TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {articles.map((article) => (
                    <TableRow key={article.id} className="hover:bg-slate-50">
                      <TableCell className="font-medium max-w-64 truncate">{article.title}</TableCell>
                      <TableCell>{article.category}</TableCell>
                      <TableCell>{getStatusBadge(article.status)}</TableCell>
                      <TableCell>{article.views.toLocaleString()}</TableCell>
                      <TableCell>{new Date(article.updatedAt).toLocaleDateString()}</TableCell>
                      <TableCell>{article.author.name}</TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handlePreviewArticle(article)}>
                              <Eye className="w-4 h-4 mr-2" />
                              Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditArticle(article)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDeleteArticle(article)}
                              className="text-red-600"
                            >
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
            </div>
          </CardContent>
        </Card>
      ) : (
        <GridView />
      )}

      {/* Edit Article Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Article</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="edit-title">Title *</Label>
              <Input 
                id="edit-title"
                value={articleForm.title}
                onChange={(e) => setArticleForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter article title..."
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-category">Category *</Label>
                <Select 
                  value={articleForm.category}
                  onValueChange={(value) => setArticleForm(prev => ({ ...prev, category: value }))}
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
                <Label htmlFor="edit-status">Status</Label>
                <Select 
                  value={articleForm.status}
                  onValueChange={(value: 'draft' | 'published' | 'archived') => 
                    setArticleForm(prev => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="edit-content">Content *</Label>
              <Textarea 
                id="edit-content"
                value={articleForm.content}
                onChange={(e) => setArticleForm(prev => ({ ...prev, content: e.target.value }))}
                rows={10}
                className="resize-none"
                placeholder="Write your article content here..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-tags">Tags (comma-separated)</Label>
                <Input 
                  id="edit-tags"
                  value={articleForm.tags}
                  onChange={(e) => setArticleForm(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="tag1, tag2, tag3"
                />
              </div>
              
              <div>
                <Label htmlFor="edit-source">Source URL (optional)</Label>
                <Input 
                  id="edit-source"
                  value={articleForm.sourceUrl}
                  onChange={(e) => setArticleForm(prev => ({ ...prev, sourceUrl: e.target.value }))}
                  placeholder="https://example.com"
                  type="url"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowEditModal(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleUpdateArticle}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* New Article Modal */}
      <Dialog open={showNewModal} onOpenChange={setShowNewModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Create New Article</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="new-title">Title *</Label>
              <Input 
                id="new-title"
                value={articleForm.title}
                onChange={(e) => setArticleForm(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter article title..."
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="new-category">Category *</Label>
                <Select 
                  value={articleForm.category}
                  onValueChange={(value) => setArticleForm(prev => ({ ...prev, category: value }))}
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
                <Label htmlFor="new-status">Status</Label>
                <Select 
                  value={articleForm.status}
                  onValueChange={(value: 'draft' | 'published' | 'archived') => 
                    setArticleForm(prev => ({ ...prev, status: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="new-content">Content *</Label>
              <Textarea 
                id="new-content"
                value={articleForm.content}
                onChange={(e) => setArticleForm(prev => ({ ...prev, content: e.target.value }))}
                placeholder="Write your article content here..."
                rows={10}
                className="resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="new-tags">Tags (comma-separated)</Label>
                <Input 
                  id="new-tags"
                  value={articleForm.tags}
                  onChange={(e) => setArticleForm(prev => ({ ...prev, tags: e.target.value }))}
                  placeholder="tag1, tag2, tag3"
                />
              </div>
              
              <div>
                <Label htmlFor="new-source">Source URL (optional)</Label>
                <Input 
                  id="new-source"
                  value={articleForm.sourceUrl}
                  onChange={(e) => setArticleForm(prev => ({ ...prev, sourceUrl: e.target.value }))}
                  placeholder="https://example.com"
                  type="url"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowNewModal(false)}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleCreateArticle}
                disabled={isSaving}
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Article'
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Preview Modal */}
      <Dialog open={showPreviewModal} onOpenChange={setShowPreviewModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Article Preview</DialogTitle>
          </DialogHeader>
          {selectedArticle && (
            <div className="space-y-4">
              <div className="border-b pb-4">
                <h1 className="text-2xl font-bold text-slate-900 mb-2">{selectedArticle.title}</h1>
                <div className="flex items-center gap-4 text-sm text-slate-600">
                  <span>Category: {selectedArticle.category}</span>
                  <span>•</span>
                  <span>By: {selectedArticle.author.name}</span>
                  <span>•</span>
                  <span>Views: {selectedArticle.views.toLocaleString()}</span>
                  <span>•</span>
                  <span>{getStatusBadge(selectedArticle.status)}</span>
                </div>
                {selectedArticle.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {selectedArticle.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap leading-relaxed text-slate-700">
                  {selectedArticle.content}
                </div>
              </div>
              
              {selectedArticle.sourceUrl && (
                <div className="border-t pt-4">
                  <p className="text-sm text-slate-600">
                    Source: <a href={selectedArticle.sourceUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {selectedArticle.sourceUrl}
                    </a>
                  </p>
                </div>
              )}
              
              <div className="flex gap-2 justify-end pt-4 border-t">
                <Button variant="outline" onClick={() => setShowPreviewModal(false)}>
                  Close
                </Button>
                <Button onClick={() => {
                  setShowPreviewModal(false);
                  handleEditArticle(selectedArticle);
                }}>
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Article
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}