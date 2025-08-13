import React, { useState, useEffect } from "react";
import { Layout } from "./Layout";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Badge } from "./ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./ui/dialog";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "./ui/pagination";
import {
  Search,
  Plus,
  Eye,
  Grid,
  List,
  Calendar,
  MapPin,
  AlertTriangle,
  Loader2,
  RefreshCw,
  CheckCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { incidentsAPI } from "../services/api";

type User = {
  id: string;
  name: string;
  email: string;
  role?: "resident" | "staff" | "admin";
};

type Page =
  | "login"
  | "signup"
  | "dashboard"
  | "chatbot"
  | "incidents"
  | "profile";

type Incident = {
  id: string;
  title: string;
  description: string;
  category: string;
  location: string;
  status: "NEW" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT";
  submittedOn: string;
  lastUpdated: string;
  contactInfo?: string;
  submittedBy?: string;
  assignedTo?: string;
  estimatedResolution?: string;
  images?: string[];
};

interface ReportedIncidentsProps {
  user: User;
  onNavigate: (page: Page) => void;
  onLogout: () => void;
}

export function ReportedIncidents({
  user,
  onNavigate,
  onLogout,
}: ReportedIncidentsProps) {
  const [viewMode, setViewMode] = useState<"table" | "grid">("grid");
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [statusCheckId, setStatusCheckId] = useState("");
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(
    null,
  );

  // Loading states
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Report form state
  const [reportForm, setReportForm] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    priority: "MEDIUM",
    contactInfo: user.email,
    images: [] as File[],
  });

  // Kenya-specific categories matching your backend
  const categories = [
    "Infrastructure",
    "Transportation",
    "Safety",
    "Environment",
    "Utilities",
    "Parks & Recreation",
    "Public Property",
    "Water & Utilities",
    "Road Maintenance",
  ];

  const itemsPerPage = 12;

  // Load incidents on component mount and when filters change
  useEffect(() => {
    loadIncidents();
  }, [currentPage, categoryFilter, statusFilter, priorityFilter, searchTerm]);

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
        ...(searchTerm && { search: searchTerm }),
        ...(categoryFilter !== "all" && { category: categoryFilter }),
        ...(statusFilter !== "all" && { status: statusFilter }),
        ...(priorityFilter !== "all" && { priority: priorityFilter }),
      };

      console.log("📡 Loading incidents with params:", params);

      const response = await incidentsAPI.getAll(params);

      // Handle different response formats from your backend
      const incidentsList = response.incidents || response.data || response;
      const pagination = response.pagination || {};

      // Transform backend data to match frontend expectations
      const transformedIncidents = incidentsList.map((incident) => ({
        ...incident,
        id: incident.id || incident._id,
        incidentId:
          incident.incidentId ||
          `INC-${(incident.id || incident._id).slice(-6).toUpperCase()}`,
        submittedOn: incident.createdAt || incident.submittedOn,
        lastUpdated: incident.updatedAt || incident.lastUpdated,
        priority: incident.priority || "MEDIUM",
      }));

      setIncidents(transformedIncidents);
      setTotalCount(pagination.total || transformedIncidents.length);
      setTotalPages(
        pagination.pages ||
          Math.ceil(transformedIncidents.length / itemsPerPage),
      );

      console.log("✅ Incidents loaded:", transformedIncidents.length);
    } catch (error) {
      console.error("❌ Failed to load incidents:", error);

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Failed to load incidents";

      toast.error(`${errorMessage} 😞`);

      // Set empty state on error
      setIncidents([]);
      setTotalCount(0);
      setTotalPages(0);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  const handleReportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      !reportForm.title ||
      !reportForm.description ||
      !reportForm.category ||
      !reportForm.location
    ) {
      toast.error("Please fill in all required fields 📝");
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare incident data to match your backend schema
      const incidentData = {
        title: reportForm.title.trim(),
        description: reportForm.description.trim(),
        category: reportForm.category,
        location: reportForm.location.trim(),
        contactInfo: {
          email: reportForm.contactInfo.includes("@")
            ? reportForm.contactInfo
            : user.email,
          phone: !reportForm.contactInfo.includes("@")
            ? reportForm.contactInfo
            : undefined,
        },
        priority: reportForm.priority,
      };

      console.log("📤 Submitting incident:", incidentData);

      const response = await incidentsAPI.create(incidentData);

      const referenceId =
        response.incidentId || `INC-${response.id?.slice(-6)?.toUpperCase()}`;

      toast.success(
        `Incident reported successfully! 🎉 Reference ID: ${referenceId}`,
        {
          duration: 5000,
          action: {
            label: "Copy ID",
            onClick: () => navigator.clipboard.writeText(referenceId),
          },
        },
      );

      // Reset form and close modal
      setReportForm({
        title: "",
        description: "",
        category: "",
        location: "",
        priority: "MEDIUM",
        contactInfo: user.email,
        images: [],
      });
      setShowReportModal(false);

      // Refresh incidents list
      await loadIncidents(true);
    } catch (error) {
      console.error("❌ Failed to submit incident:", error);

      // Parse error message from backend
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to submit incident. Please try again.";

      toast.error(`Submission failed: ${errorMessage} 😞`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusCheck = async () => {
    if (!statusCheckId.trim()) {
      toast.error("Please enter a reference ID 🔍");
      return;
    }

    try {
      console.log("🔍 Checking status for:", statusCheckId);

      // Try both formats - with and without INC- prefix
      let searchId = statusCheckId.trim().toUpperCase();
      if (!searchId.startsWith("INC-")) {
        searchId = `INC-${searchId}`;
      }

      // Use the public status endpoint
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || "http://localhost:5000/api"}/incidents/status/${searchId.replace("INC-", "")}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (!response.ok) {
        throw new Error("Incident not found");
      }

      const incident = await response.json();

      // Create a detailed status message
      const statusMessage = `Status: ${incident.status} | Last Updated: ${new Date(incident.lastUpdated).toLocaleDateString()}`;

      toast.success(`Found! 📋 ${statusMessage}`, {
        duration: 8000,
        description: `Incident: ${incident.title}`,
      });

      // Optionally set as selected incident for detailed view
      setSelectedIncident({
        ...incident,
        submittedOn: incident.submittedOn,
        lastUpdated: incident.lastUpdated,
      });
    } catch (error) {
      console.error("❌ Status check failed:", error);
      toast.error("Incident not found. Please check your reference ID 🔍");
    } finally {
      setStatusCheckId("");
      setShowStatusModal(false);
    }
  };

  const handleRefresh = () => {
    loadIncidents(true);
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      NEW: {
        icon: "🆕",
        className: "bg-orange-100 text-orange-800 border-orange-200",
        text: "New",
      },
      IN_PROGRESS: {
        icon: "⏳",
        className: "bg-blue-100 text-blue-800 border-blue-200",
        text: "In Progress",
      },
      RESOLVED: {
        icon: "✅",
        className: "bg-green-100 text-green-800 border-green-200",
        text: "Resolved",
      },
      CLOSED: {
        icon: "🔒",
        className: "bg-gray-100 text-gray-800 border-gray-200",
        text: "Closed",
      },
    };

    const badge = badges[status] || badges["NEW"];

    return (
      <Badge className={`${badge.className} flex items-center gap-1`}>
        <span>{badge.icon}</span>
        {badge.text}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const badges = {
      LOW: { icon: "🟢", className: "bg-green-50 text-green-700" },
      MEDIUM: { icon: "🟡", className: "bg-yellow-50 text-yellow-700" },
      HIGH: { icon: "🟠", className: "bg-orange-50 text-orange-700" },
      URGENT: { icon: "🔴", className: "bg-red-50 text-red-700" },
    };

    const badge = badges[priority] || badges["MEDIUM"];

    return (
      <span
        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${badge.className}`}
      >
        {badge.icon} {priority}
      </span>
    );
  };

  const getCategoryIcon = (category: string) => {
    const icons = {
      Infrastructure: "🏗️",
      Transportation: "🚌",
      Safety: "🚨",
      Environment: "🌍",
      Utilities: "⚡",
      "Parks & Recreation": "🌳",
      "Public Property": "🏛️",
      "Water & Utilities": "💧",
      "Road Maintenance": "🛣️",
    };
    return icons[category] || "📋";
  };

  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {incidents.map((incident) => (
        <Card
          key={incident.id}
          className="hover:shadow-lg transition-all duration-300 border-l-4 border-l-blue-400 bg-white/90 backdrop-blur-sm"
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-2">
                <span className="text-xl mt-1">
                  {getCategoryIcon(incident.category)}
                </span>
                <div className="flex-1">
                  <CardTitle className="text-lg text-slate-800 leading-tight">
                    {incident.title}
                  </CardTitle>
                  <p className="text-xs text-slate-500 mt-1">
                    ID: {incident.id}
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-1 items-end">
                {getStatusBadge(incident.status)}
                {getPriorityBadge(incident.priority)}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-slate-600 leading-relaxed">
              {incident.description}
            </p>

            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 text-slate-600">
                <span>📍</span>
                <span>{incident.location}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <span>📅</span>
                <span>
                  Submitted:{" "}
                  {new Date(incident.submittedOn).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <span>🔄</span>
                <span>
                  Updated: {new Date(incident.lastUpdated).toLocaleDateString()}
                </span>
              </div>
              {incident.estimatedResolution && (
                <div className="flex items-center gap-2 text-slate-600">
                  <span>⏱️</span>
                  <span>Est. Resolution: {incident.estimatedResolution}</span>
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500">
                  {getCategoryIcon(incident.category)} {incident.category}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedIncident(incident)}
                  className="h-7 px-3 text-xs hover:bg-blue-50"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  View Details
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <Layout
      user={user}
      currentPage="incidents"
      onNavigate={onNavigate}
      onLogout={onLogout}
    >
      <div className="space-y-6">
        {/* Header with Stats */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-2">
              📋 Ripoti za Jamii
            </h1>
            <p className="text-slate-600 flex items-center gap-1">
              🏛️ Track your civic reports • Total: {totalCount} incidents
            </p>
          </div>

          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="hover:bg-emerald-50"
            >
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4 mr-2" />
              )}
              Refresh
            </Button>

            <Dialog open={showStatusModal} onOpenChange={setShowStatusModal}>
              <DialogTrigger asChild>
                <Button variant="outline" className="hover:bg-blue-50">
                  <Eye className="h-4 w-4 mr-2" />
                  🔍 Check Status
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    🔍 Check Incident Status
                  </DialogTitle>
                  <DialogDescription>
                    Enter your reference ID to check the status of your reported
                    incident.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label
                      htmlFor="statusId"
                      className="flex items-center gap-1"
                    >
                      📋 Reference ID
                    </Label>
                    <Input
                      id="statusId"
                      placeholder="Enter reference ID (e.g., INC-001)"
                      value={statusCheckId}
                      onChange={(e) =>
                        setStatusCheckId(e.target.value.toUpperCase())
                      }
                      className="font-mono"
                    />
                  </div>
                  <Button
                    onClick={handleStatusCheck}
                    className="w-full bg-emerald-600 hover:bg-emerald-700"
                  >
                    🔍 Check Status
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

            <Dialog open={showReportModal} onOpenChange={setShowReportModal}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700 shadow-lg">
                  <Plus className="h-4 w-4 mr-2" />
                  📝 Report New Issue
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    📝 Report New Incident
                  </DialogTitle>
                  <DialogDescription>
                    Help improve your community by reporting issues to county
                    authorities.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleReportSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="title" className="flex items-center gap-1">
                      📄 Title *
                    </Label>
                    <Input
                      id="title"
                      value={reportForm.title}
                      onChange={(e) =>
                        setReportForm({ ...reportForm, title: e.target.value })
                      }
                      placeholder="Brief description of the issue"
                      required
                      maxLength={100}
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      {reportForm.title.length}/100 characters
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label
                        htmlFor="category"
                        className="flex items-center gap-1"
                      >
                        🏷️ Category *
                      </Label>
                      <Select
                        value={reportForm.category}
                        onValueChange={(value) =>
                          setReportForm({ ...reportForm, category: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category} value={category}>
                              {getCategoryIcon(category)} {category}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label
                        htmlFor="priority"
                        className="flex items-center gap-1"
                      >
                        ⚡ Priority
                      </Label>
                      <Select
                        value={reportForm.priority}
                        onValueChange={(value) =>
                          setReportForm({ ...reportForm, priority: value })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LOW">🟢 Low</SelectItem>
                          <SelectItem value="MEDIUM">🟡 Medium</SelectItem>
                          <SelectItem value="HIGH">🟠 High</SelectItem>
                          <SelectItem value="URGENT">🔴 Urgent</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label
                      htmlFor="location"
                      className="flex items-center gap-1"
                    >
                      📍 Location *
                    </Label>
                    <Input
                      id="location"
                      value={reportForm.location}
                      onChange={(e) =>
                        setReportForm({
                          ...reportForm,
                          location: e.target.value,
                        })
                      }
                      placeholder="e.g., CBD, Westlands, Kasarani..."
                      required
                    />
                  </div>

                  <div>
                    <Label
                      htmlFor="description"
                      className="flex items-center gap-1"
                    >
                      📝 Description *
                    </Label>
                    <Textarea
                      id="description"
                      value={reportForm.description}
                      onChange={(e) =>
                        setReportForm({
                          ...reportForm,
                          description: e.target.value,
                        })
                      }
                      placeholder="Provide detailed information about the issue, when it started, and how it affects the community..."
                      required
                      rows={4}
                      maxLength={500}
                    />
                    <p className="text-xs text-slate-500 mt-1">
                      {reportForm.description.length}/500 characters
                    </p>
                  </div>

                  <div>
                    <Label
                      htmlFor="contact"
                      className="flex items-center gap-1"
                    >
                      📞 Contact Info
                    </Label>
                    <Input
                      id="contact"
                      value={reportForm.contactInfo}
                      onChange={(e) =>
                        setReportForm({
                          ...reportForm,
                          contactInfo: e.target.value,
                        })
                      }
                      placeholder="Phone number or email for updates"
                    />
                  </div>

                  <div>
                    <Label className="flex items-center gap-1">
                      📸 Photos (Optional)
                    </Label>
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => {
                        const files = Array.from(e.target.files || []);
                        setReportForm({ ...reportForm, images: files });
                      }}
                      className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100"
                    />
                    {reportForm.images.length > 0 && (
                      <p className="text-xs text-emerald-600 mt-1">
                        📸 {reportForm.images.length} photo(s) selected
                      </p>
                    )}
                  </div>

                  <Button
                    type="submit"
                    className="w-full bg-gradient-to-r from-emerald-600 to-blue-600 hover:from-emerald-700 hover:to-blue-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Submitting... ⏳
                      </>
                    ) : (
                      <>📤 Submit Report</>
                    )}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Enhanced Filters */}
        <Card className="bg-gradient-to-r from-emerald-50/50 to-blue-50/50">
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="🔍 Search by title, description, or location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 bg-white/80"
                  />
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <Select
                  value={categoryFilter}
                  onValueChange={setCategoryFilter}
                >
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="🏷️ Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {getCategoryIcon(category)} {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-36">
                    <SelectValue placeholder="📊 Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="NEW">🆕 New</SelectItem>
                    <SelectItem value="IN_PROGRESS">⏳ In Progress</SelectItem>
                    <SelectItem value="RESOLVED">✅ Resolved</SelectItem>
                    <SelectItem value="CLOSED">🔒 Closed</SelectItem>
                  </SelectContent>
                </Select>

                <Select
                  value={priorityFilter}
                  onValueChange={setPriorityFilter}
                >
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="⚡ Priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priority</SelectItem>
                    <SelectItem value="LOW">🟢 Low</SelectItem>
                    <SelectItem value="MEDIUM">🟡 Medium</SelectItem>
                    <SelectItem value="HIGH">🟠 High</SelectItem>
                    <SelectItem value="URGENT">🔴 Urgent</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex border border-slate-200 rounded-[3rem] bg-white">
                  <Button
                    variant={viewMode === "table" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("table")}
                    className="rounded-r-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className="rounded-l-none"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <div className="text-6xl mb-4 animate-bounce">📋</div>
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mb-2" />
            <p className="text-slate-600">Loading incidents...</p>
          </div>
        ) : incidents.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🤷‍♂️</div>
            <h3 className="text-xl font-semibold text-slate-800 mb-2">
              No incidents found
            </h3>
            <p className="text-slate-600 mb-6">
              {searchTerm || categoryFilter !== "all" || statusFilter !== "all"
                ? "Try adjusting your filters or search terms"
                : "No incidents have been reported yet"}
            </p>
            {(searchTerm ||
              categoryFilter !== "all" ||
              statusFilter !== "all") && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm("");
                  setCategoryFilter("all");
                  setStatusFilter("all");
                  setPriorityFilter("all");
                }}
              >
                🔄 Clear Filters
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Content */}
            {viewMode === "table" ? (
              <Card className="overflow-hidden">
                <CardContent className="p-0">
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-slate-50">
                          <TableHead className="font-semibold">
                            📄 Title
                          </TableHead>
                          <TableHead className="font-semibold">
                            🏷️ Category
                          </TableHead>
                          <TableHead className="font-semibold">
                            📍 Location
                          </TableHead>
                          <TableHead className="font-semibold">
                            📊 Status
                          </TableHead>
                          <TableHead className="font-semibold">
                            ⚡ Priority
                          </TableHead>
                          <TableHead className="font-semibold">
                            📅 Submitted
                          </TableHead>
                          <TableHead className="font-semibold">
                            🔄 Updated
                          </TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {incidents.map((incident) => (
                          <TableRow
                            key={incident.id}
                            className="hover:bg-slate-50 cursor-pointer"
                            onClick={() => setSelectedIncident(incident)}
                          >
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <span className="text-lg">
                                  {getCategoryIcon(incident.category)}
                                </span>
                                <div>
                                  <p className="font-medium text-slate-900">
                                    {incident.title}
                                  </p>
                                  <p className="text-xs text-slate-500">
                                    ID: {incident.id}
                                  </p>
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>{incident.category}</TableCell>
                            <TableCell className="max-w-32 truncate">
                              {incident.location}
                            </TableCell>
                            <TableCell>
                              {getStatusBadge(incident.status)}
                            </TableCell>
                            <TableCell>
                              {getPriorityBadge(incident.priority)}
                            </TableCell>
                            <TableCell>
                              {new Date(
                                incident.submittedOn,
                              ).toLocaleDateString()}
                            </TableCell>
                            <TableCell>
                              {new Date(
                                incident.lastUpdated,
                              ).toLocaleDateString()}
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() =>
                          setCurrentPage((prev) => Math.max(1, prev - 1))
                        }
                        className={
                          currentPage === 1
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer hover:bg-emerald-50"
                        }
                      />
                    </PaginationItem>
                    {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 7) {
                        pageNum = i + 1;
                      } else if (currentPage <= 4) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 3) {
                        pageNum = totalPages - 6 + i;
                      } else {
                        pageNum = currentPage - 3 + i;
                      }

                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            onClick={() => setCurrentPage(pageNum)}
                            isActive={currentPage === pageNum}
                            className="cursor-pointer hover:bg-emerald-50"
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() =>
                          setCurrentPage((prev) =>
                            Math.min(totalPages, prev + 1),
                          )
                        }
                        className={
                          currentPage === totalPages
                            ? "pointer-events-none opacity-50"
                            : "cursor-pointer hover:bg-emerald-50"
                        }
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}

        {/* Incident Details Modal */}
        {selectedIncident && (
          <Dialog
            open={!!selectedIncident}
            onOpenChange={() => setSelectedIncident(null)}
          >
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {getCategoryIcon(selectedIncident.category)}{" "}
                  {selectedIncident.title}
                </DialogTitle>
                <DialogDescription>
                  Incident Details • ID: {selectedIncident.id}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Status and Priority */}
                <div className="flex flex-wrap gap-3">
                  {getStatusBadge(selectedIncident.status)}
                  {getPriorityBadge(selectedIncident.priority)}
                </div>

                {/* Description */}
                <div>
                  <h4 className="font-semibold text-slate-800 mb-2 flex items-center gap-1">
                    📝 Description
                  </h4>
                  <p className="text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-[3rem]">
                    {selectedIncident.description}
                  </p>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <span>📍</span>
                      <span className="font-medium">Location:</span>
                      <span className="text-slate-600">
                        {selectedIncident.location}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <span>🏷️</span>
                      <span className="font-medium">Category:</span>
                      <span className="text-slate-600">
                        {selectedIncident.category}
                      </span>
                    </div>

                    {selectedIncident.contactInfo && (
                      <div className="flex items-center gap-2 text-sm">
                        <span>📞</span>
                        <span className="font-medium">Contact:</span>
                        <span className="text-slate-600">
                          {selectedIncident.contactInfo}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <span>📅</span>
                      <span className="font-medium">Submitted:</span>
                      <span className="text-slate-600">
                        {new Date(
                          selectedIncident.submittedOn,
                        ).toLocaleDateString("en-KE", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <span>🔄</span>
                      <span className="font-medium">Last Updated:</span>
                      <span className="text-slate-600">
                        {new Date(
                          selectedIncident.lastUpdated,
                        ).toLocaleDateString("en-KE", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>

                    {selectedIncident.estimatedResolution && (
                      <div className="flex items-center gap-2 text-sm">
                        <span>⏱️</span>
                        <span className="font-medium">Est. Resolution:</span>
                        <span className="text-slate-600">
                          {selectedIncident.estimatedResolution}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                {user.role === "staff" || user.role === "admin" ? (
                  <div className="flex gap-2 pt-4 border-t">
                    <Button variant="outline" className="flex-1">
                      💬 Add Comment
                    </Button>
                    <Button variant="outline" className="flex-1">
                      🔄 Update Status
                    </Button>
                  </div>
                ) : (
                  <div className="bg-blue-50 p-3 rounded-[3rem]">
                    <p className="text-sm text-blue-800 flex items-center gap-1">
                      ℹ️ <strong>Need to update this report?</strong> Contact
                      your county office or use the chat assistant for help.
                    </p>
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </Layout>
  );
}
