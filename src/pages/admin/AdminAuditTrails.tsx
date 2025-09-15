import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { auditService, AuditEvent, AuditBatch, AuditFilter } from '@/services/audit.service';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import {
  Shield, 
  Search, 
  Filter, 
  Download, 
  RefreshCw,
  Eye,
  CheckCircle,
  XCircle,
  AlertCircle,
  Clock,
  FileText,
  Database,
  ExternalLink,
  Calendar,
  User,
  Activity
} from 'lucide-react';

export default function AdminAuditTrails() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [batches, setBatches] = useState<AuditBatch[]>([]);
  const [filter, setFilter] = useState<AuditFilter>({});
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);
  const [selectedBatch, setSelectedBatch] = useState<AuditBatch | null>(null);
  const [pendingEventsCount, setPendingEventsCount] = useState(0);

  useEffect(() => {
    loadAuditData();
    loadPendingEventsCount();
    
    // Refresh pending events count every 30 seconds
    const interval = setInterval(loadPendingEventsCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadAuditData = async () => {
    try {
      setIsLoading(true);
      const [eventsResult, batchesResult] = await Promise.all([
        auditService.getAuditEvents(filter),
        auditService.getAuditBatches(20)
      ]);
      
      setEvents(eventsResult.events);
      setBatches(batchesResult);
    } catch (error) {
      console.error('Error loading audit data:', error);
      toast.error('Failed to load audit data');
    } finally {
      setIsLoading(false);
    }
  };

  const loadPendingEventsCount = async () => {
    try {
      const count = auditService.getPendingEventsCount();
      setPendingEventsCount(count);
    } catch (error) {
      console.error('Error loading pending events count:', error);
    }
  };

  const handleFilterChange = (key: keyof AuditFilter, value: any) => {
    setFilter(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    loadAuditData();
  };

  const handleForceProcessBatch = async () => {
    try {
      await auditService.forceProcessBatch();
      toast.success('Batch processing initiated');
      loadAuditData();
      loadPendingEventsCount();
    } catch (error) {
      console.error('Error forcing batch process:', error);
      toast.error('Failed to process batch');
    }
  };

  const handleVerifyIntegrity = async (eventId: string) => {
    try {
      const isValid = await auditService.verifyAuditIntegrity(eventId);
      if (isValid) {
        toast.success('Audit record verified successfully');
      } else {
        toast.error('Audit record verification failed');
      }
    } catch (error) {
      console.error('Error verifying integrity:', error);
      toast.error('Failed to verify audit integrity');
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getOutcomeColor = (outcome: string) => {
    switch (outcome) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'failure':
        return 'bg-red-100 text-red-800';
      case 'partial':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const exportAuditData = () => {
    const csvContent = [
      ['Timestamp', 'User ID', 'Action', 'Resource ID', 'Category', 'Severity', 'Outcome', 'Transaction Hash'],
      ...events.map(event => [
        event.timestamp,
        event.userId,
        event.action,
        event.resourceId,
        event.category,
        event.severity,
        event.outcome,
        event.transactionHash || 'N/A'
      ])
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-trails-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading audit trails...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Audit Trails</h1>
          <p className="text-gray-600">Monitor system activities and ensure HIPAA compliance</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={loadAuditData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={exportAuditData} variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Events</p>
                <p className="text-2xl font-bold">{events.length}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Events</p>
                <p className="text-2xl font-bold">{pendingEventsCount}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Audit Batches</p>
                <p className="text-2xl font-bold">{batches.length}</p>
              </div>
              <Database className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">System Health</p>
                <p className="text-2xl font-bold text-green-600">Healthy</p>
              </div>
              <Shield className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="userId">User ID</Label>
              <Input
                id="userId"
                placeholder="Enter user ID"
                value={filter.userId || ''}
                onChange={(e) => handleFilterChange('userId', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="action">Action</Label>
            <Input
                id="action"
                placeholder="Enter action"
                value={filter.action || ''}
                onChange={(e) => handleFilterChange('action', e.target.value)}
            />
          </div>
            
            <div>
              <Label htmlFor="category">Category</Label>
              <Select value={filter.category || ''} onValueChange={(value) => handleFilterChange('category', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="authentication">Authentication</SelectItem>
                  <SelectItem value="data_access">Data Access</SelectItem>
                  <SelectItem value="data_modification">Data Modification</SelectItem>
                  <SelectItem value="system">System</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="severity">Severity</Label>
              <Select value={filter.severity || ''} onValueChange={(value) => handleFilterChange('severity', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select severity" />
            </SelectTrigger>
            <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
          </div>
          
          <div className="flex justify-end mt-4">
            <Button onClick={handleSearch}>
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Batch Processing Controls */}
      {pendingEventsCount > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-800">
                    {pendingEventsCount} events pending batch processing
                  </p>
                  <p className="text-sm text-yellow-600">
                    Events will be automatically processed in the next batch cycle
                  </p>
                </div>
              </div>
              <Button onClick={handleForceProcessBatch} variant="outline" size="sm">
                Process Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs defaultValue="events" className="space-y-4">
        <TabsList>
          <TabsTrigger value="events">Audit Events</TabsTrigger>
          <TabsTrigger value="batches">Audit Batches</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
      <Card>
            <CardHeader>
              <CardTitle>Audit Events</CardTitle>
              <CardDescription>
                Individual audit events logged by the system
              </CardDescription>
            </CardHeader>
            <CardContent>
              {events.length === 0 ? (
                <div className="text-center py-8">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No audit events found</h3>
                  <p className="text-gray-600">Try adjusting your filters or check back later</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {events.map((event) => (
                    <div key={event.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getSeverityColor(event.severity)}>
                              {event.severity.toUpperCase()}
                            </Badge>
                            <Badge className={getOutcomeColor(event.outcome)}>
                              {event.outcome.toUpperCase()}
                            </Badge>
                            <span className="text-sm text-gray-600">
                              {event.category.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                          
                          <h4 className="font-medium mb-1">{event.action}</h4>
                          <p className="text-sm text-gray-600 mb-2">
                            Resource: {event.resourceId} | User: {event.userId}
                          </p>
                          
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatTimestamp(event.timestamp)}
                            </span>
                            {event.transactionHash && event.transactionHash !== 'pending' && (
                              <span className="flex items-center gap-1">
                                <ExternalLink className="h-3 w-3" />
                                {event.transactionHash.slice(0, 8)}...
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          {event.transactionHash && event.transactionHash !== 'pending' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleVerifyIntegrity(event.id!)}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedEvent(event)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="batches" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Audit Batches</CardTitle>
              <CardDescription>
                Batched audit events submitted to XRPL blockchain
              </CardDescription>
            </CardHeader>
            <CardContent>
              {batches.length === 0 ? (
                <div className="text-center py-8">
                  <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">No audit batches found</h3>
                  <p className="text-gray-600">Audit batches will appear here once events are processed</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {batches.map((batch) => (
                    <div key={batch.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge className={getStatusColor(batch.status)}>
                              {batch.status.toUpperCase()}
                            </Badge>
                            <span className="text-sm text-gray-600">
                              {batch.events.length} events
                            </span>
                          </div>
                          
                          <h4 className="font-medium mb-1">Audit Batch {batch.id?.slice(0, 8)}</h4>
                          <p className="text-sm text-gray-600 mb-2">
                            Merkle Root: {batch.merkleRoot.slice(0, 16)}...
                          </p>
                          
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {formatTimestamp(batch.timestamp)}
                            </span>
                            {batch.transactionHash && batch.transactionHash !== 'failed' && (
                              <span className="flex items-center gap-1">
                                <ExternalLink className="h-3 w-3" />
                                {batch.transactionHash.slice(0, 8)}...
                        </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setSelectedBatch(batch)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Audit Event Details</h3>
              <Button variant="ghost" size="sm" onClick={() => setSelectedEvent(null)}>
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="space-y-4">
              <div>
                <Label>Action</Label>
                <p className="font-medium">{selectedEvent.action}</p>
              </div>
              
              <div>
                <Label>User ID</Label>
                <p>{selectedEvent.userId}</p>
              </div>
              
              <div>
                <Label>Resource ID</Label>
                <p>{selectedEvent.resourceId}</p>
              </div>
              
              <div>
                <Label>Details</Label>
                <pre className="bg-gray-100 p-3 rounded text-sm overflow-x-auto">
                  {JSON.stringify(selectedEvent.details, null, 2)}
                </pre>
              </div>
              
              <div>
                <Label>Transaction Hash</Label>
                <p className="font-mono text-sm">{selectedEvent.transactionHash || 'N/A'}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Batch Details Modal */}
      {selectedBatch && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Audit Batch Details</h3>
              <Button variant="ghost" size="sm" onClick={() => setSelectedBatch(null)}>
                <XCircle className="h-4 w-4" />
              </Button>
            </div>
            
          <div className="space-y-4">
                  <div>
                <Label>Batch ID</Label>
                <p className="font-mono text-sm">{selectedBatch.id}</p>
                  </div>
              
                  <div>
                <Label>Status</Label>
                <Badge className={getStatusColor(selectedBatch.status)}>
                  {selectedBatch.status.toUpperCase()}
                </Badge>
                  </div>
              
                  <div>
                <Label>Merkle Root</Label>
                <p className="font-mono text-sm break-all">{selectedBatch.merkleRoot}</p>
                  </div>
              
                  <div>
                <Label>Transaction Hash</Label>
                <p className="font-mono text-sm">{selectedBatch.transactionHash}</p>
                  </div>
              
                <div>
                <Label>Event Count</Label>
                <p>{selectedBatch.events.length} events</p>
                  </div>
                </div>
          </div>
        </div>
      )}
    </div>
  );
}