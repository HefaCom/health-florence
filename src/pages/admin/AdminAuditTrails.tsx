import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Search, Filter, Clock, User, FileText } from "lucide-react";
import { generateClient } from 'aws-amplify/api';
import { listAuditEvents } from '../../graphql/queries';
import { GraphQLResult } from '@aws-amplify/api';
import { xrplService } from '../../services/xrpl.service';

const client = generateClient();

interface AuditEvent {
  id: string;
  timestamp: string;
  userId: string;
  action: string;
  resourceId: string;
  details: any;
  transactionHash?: string;
}

interface ListAuditEventsQuery {
  listAuditEvents: {
    items: AuditEvent[];
    nextToken?: string;
  };
}

const AdminAuditTrails = () => {
  const [auditEvents, setAuditEvents] = useState<AuditEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const fetchAuditEvents = async () => {
    setIsLoading(true);
    try {
      const response = await client.graphql({
        query: listAuditEvents,
        variables: {
          filter: filter !== "all" ? { action: { eq: filter } } : null,
          limit: 100
        },
        authMode: 'apiKey'
      }) as GraphQLResult<ListAuditEventsQuery>;

      if (response.errors) {
        console.error('GraphQL Errors:', response.errors);
        throw new Error(response.errors[0].message);
      }

      if (response.data?.listAuditEvents?.items) {
        setAuditEvents(response.data.listAuditEvents.items);
      } else {
        setAuditEvents([]);
      }
    } catch (error) {
      console.error('Error fetching audit events:', error);
      if (error.message?.includes('not authorized')) {
        console.error('User is not authorized to view audit events');
      }
      setAuditEvents([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAuditEvents();
  }, [filter]);

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const formatAction = (action: string) => {
    return action.split('_').map(word => 
      word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
    ).join(' ');
  };

  const getActionSeverity = (action: string) => {
    const criticalActions = ['PASSWORD_CHANGE', 'ROLE_CHANGE', 'PERMISSIONS_CHANGE'];
    const moderateActions = ['PROFILE_UPDATE', 'MEDICAL_RECORD_ACCESS'];
    
    if (criticalActions.includes(action)) return 'critical';
    if (moderateActions.includes(action)) return 'moderate';
    return 'low';
  };

  const formatDetails = (details: any) => {
    if (!details) return null;
    
    try {
      const parsedDetails = typeof details === 'string' ? JSON.parse(details) : details;
      
      // Special formatting for password changes
      if (parsedDetails.changeType === 'user-initiated') {
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-semibold">Type:</span>
              <span className="capitalize">{parsedDetails.changeType.replace('-', ' ')}</span>
            </div>
            {parsedDetails.metadata && (
              <>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Source:</span>
                  <span className="capitalize">{parsedDetails.metadata.source.replace('-', ' ')}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-semibold">Password Strength:</span>
                  <span className={`capitalize ${
                    parsedDetails.metadata.passwordComplexity === 'strong' 
                      ? 'text-green-600' 
                      : 'text-yellow-600'
                  }`}>
                    {parsedDetails.metadata.passwordComplexity}
                  </span>
                </div>
              </>
            )}
            <div className="flex items-center gap-2">
              <span className="font-semibold">Security Impact:</span>
              <span className="capitalize text-red-600">{parsedDetails.securityImpact}</span>
            </div>
          </div>
        );
      }
      
      // Default formatting for other events
      return (
        <pre className="text-xs bg-muted p-2 rounded-md overflow-x-auto">
          {JSON.stringify(parsedDetails, null, 2)}
        </pre>
      );
    } catch (error) {
      console.error('Error parsing details:', error);
      return (
        <pre className="text-xs bg-muted p-2 rounded-md overflow-x-auto">
          {details}
        </pre>
      );
    }
  };

  // Validate transaction hash format
  const validateTransactionHash = (hash: string) => {
    if (!hash || hash === 'pending') {
      return { isValid: false, status: 'pending' };
    }
    
    const validation = xrplService.validateTransactionHash(hash);
    return {
      isValid: validation.isValid,
      status: validation.isValid ? 'valid' : 'invalid',
      error: validation.error
    };
  };

  const getTransactionHashDisplay = (hash: string) => {
    const validation = validateTransactionHash(hash);
    
    if (validation.status === 'pending') {
      return <span className="text-yellow-600">Pending</span>;
    }
    
    if (validation.status === 'invalid') {
      return (
        <span className="text-red-600" title={validation.error}>
          Invalid Hash
        </span>
      );
    }
    
    // Valid hash - show as link to XRPL explorer
    return (
      <a
        href={`https://testnet.xrpl.org/transactions/${hash}`}
        target="_blank"
        rel="noopener noreferrer"
        className="text-primary hover:underline"
        onClick={(e) => e.stopPropagation()}
      >
        {hash.slice(0, 8)}...
      </a>
    );
  };

  const filteredEvents = auditEvents.filter(event => 
    searchQuery === "" || 
    event.userId.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
    event.resourceId.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRowClick = (event: AuditEvent) => {
    setSelectedEvent(event);
    setIsDetailsOpen(true);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Audit Trails</h1>
          <p className="text-muted-foreground">
            Monitor and review system activity logs
          </p>
        </div>
      </div>

      <Card className="mb-6">
        <div className="p-4 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Search audit trails..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Filter by action" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Actions</SelectItem>
              <SelectItem value="PROFILE_UPDATE">Profile Updates</SelectItem>
              <SelectItem value="PASSWORD_CHANGE">Password Changes</SelectItem>
              <SelectItem value="APPOINTMENT_CREATE">Appointment Created</SelectItem>
              <SelectItem value="APPOINTMENT_CANCEL">Appointment Cancelled</SelectItem>
              <SelectItem value="APPOINTMENT_RESCHEDULE">Appointment Rescheduled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">Timestamp</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Resource ID</TableHead>
                <TableHead>XRPL Hash</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    <Clock className="h-5 w-5 animate-spin mx-auto mb-2" />
                    Loading audit trails...
                  </TableCell>
                </TableRow>
              ) : filteredEvents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8">
                    No audit trails found
                  </TableCell>
                </TableRow>
              ) : (
                filteredEvents.map((event) => (
                  <TableRow 
                    key={event.id}
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleRowClick(event)}
                  >
                    <TableCell className="whitespace-nowrap">
                      {formatTimestamp(event.timestamp)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <User className="h-4 w-4 mr-2 text-muted-foreground" />
                        {event.userId}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span className={`
                          ${getActionSeverity(event.action) === 'critical' ? 'text-red-600 font-semibold' : ''}
                          ${getActionSeverity(event.action) === 'moderate' ? 'text-yellow-600' : ''}
                        `}>
                          {formatAction(event.action)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>{event.resourceId}</TableCell>
                    <TableCell className="font-mono text-xs">
                      {event.transactionHash ? (
                        getTransactionHashDisplay(event.transactionHash)
                      ) : (
                        "Pending"
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {selectedEvent && formatAction(selectedEvent.action)}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedEvent && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-1">Timestamp</h4>
                    <p className="text-sm">{formatTimestamp(selectedEvent.timestamp)}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">User ID</h4>
                    <p className="text-sm">{selectedEvent.userId}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">Resource ID</h4>
                    <p className="text-sm">{selectedEvent.resourceId}</p>
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">XRPL Status</h4>
                    <p className="text-sm">
                      {selectedEvent.transactionHash ? (
                        getTransactionHashDisplay(selectedEvent.transactionHash)
                      ) : (
                        "Pending XRPL Confirmation"
                      )}
                    </p>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold mb-2">Details</h4>
                  <div className="bg-muted rounded-lg p-4">
                    {formatDetails(selectedEvent.details)}
                  </div>
                </div>
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminAuditTrails; 