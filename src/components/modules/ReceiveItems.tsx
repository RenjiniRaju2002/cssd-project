import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from "react-router-dom";
import { Search, Eye, CheckCircle, Clock, XCircle, Plus } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "./Header";
import Footer from "./Footer";
import initialData from "../../data/receiveItemsData.json";

const ReceiveItems = ({ sidebarCollapsed, toggleSidebar }) => {
  const navigate = useNavigate();
  const [receivedItems, setReceivedItems] = useState(() => {
    const savedItems = localStorage.getItem('receivedItems');
    try {
      return savedItems ? JSON.parse(savedItems) : initialData.receivedItems;
    } catch (error) {
      console.error('Error loading received items:', error);
      return initialData.receivedItems;
    }
  });
  const [workflowItems, setWorkflowItems] = useState(() => {
    const savedWorkflowItems = localStorage.getItem('workflowItems');
    return savedWorkflowItems ? JSON.parse(savedWorkflowItems) : initialData.workflowItems;
  });
  
  // Load requested items from Request Management
  const [requestedItems, setRequestedItems] = useState([]);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedItem, setSelectedItem] = useState(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const { toast } = useToast();
  const [previousRequestSearch, setPreviousRequestSearch] = useState("");

  // Pagination state for Requested Items
  const [currentPage, setCurrentPage] = useState(1);
  const requestsPerPage = 7;

  // Load requested items from localStorage on component mount
  useEffect(() => {
    const savedRequests = localStorage.getItem('cssdRequests');
    if (savedRequests) {
      const requests = JSON.parse(savedRequests);
      setRequestedItems(requests);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem('receivedItems', JSON.stringify(receivedItems));
    } catch (error) {
      console.error('Error saving received items:', error);
    }
  }, [receivedItems]);

  useEffect(() => {
    localStorage.setItem('workflowItems', JSON.stringify(workflowItems));
  }, [workflowItems]);

  useEffect(() => {
    return () => {
      setIsViewDialogOpen(false);
    };
  }, []);

  const handleUpdateStatus = (id: string, status: string) => {
    setReceivedItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, status } : item
      )
    );
  };

  const viewItemDetails = (item) => {
    setSelectedItem(item);
    setIsViewDialogOpen(true);
  };

  const updateItemStatus = (id, newStatus, receivedQty) => {
    setReceivedItems(prevItems =>
      prevItems.map(item =>
        item.id === id 
          ? { ...item, status: newStatus, ...(receivedQty !== undefined && { receivedQty }) }
          : item
      )
    );
    toast({
      title: "Status Updated",
      description: `Item ${id} status changed to ${newStatus}`,
    });
  };

  const goToStockManagement = () => {
    navigate('/stock-management');
  };

  // Handle receiving an item from the requested items list
  const handleReceiveFromRequest = (request) => {
    const newReceive = {
      id: `REC${String(receivedItems.length + 1).padStart(3, '0')}`,
      requestId: request.id,
      department: request.department,
      items: request.items,
      quantity: request.quantity,
      receivedQty: 0,
      status: "Pending",
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
    };

    // Update workflow status
    const updatedWorkflowItems = workflowItems.map(item => 
      item.requestId === request.id ? {
        ...item,
        currentStatus: "Received",
        timestamp: new Date().toISOString(),
        location: "Receiving Area"
      } : item
    );
    setWorkflowItems(updatedWorkflowItems);

    setReceivedItems(prev => [...prev, newReceive]);
    
    toast({
      title: "Item Added for Receiving",
      description: `Request ${request.id} has been added to receiving list.`,
    });
  };

  // Handle changing status of a requested item
  const handleChangeStatus = (requestId, newStatus) => {
    // Update the requested items status
    setRequestedItems(prevItems => {
      const updatedItems = prevItems.map(item => 
        item.id === requestId ? { ...item, status: newStatus } : item
      );
      // Save to localStorage
      localStorage.setItem('cssdRequests', JSON.stringify(updatedItems));
      return updatedItems;
    });

    // Update workflow status
    const updatedWorkflowItems = workflowItems.map(item => 
      item.requestId === requestId ? {
        ...item,
        currentStatus: newStatus,
        timestamp: new Date().toISOString(),
        location: newStatus === "Completed" ? "Completed" : "Processing"
      } : item
    );
    setWorkflowItems(updatedWorkflowItems);
    localStorage.setItem('cssdWorkflowItems', JSON.stringify(updatedWorkflowItems));
    
    // If status is set to Completed, add to sterilizationProcesses
    if (newStatus === "Completed") {
      toast({
        title: "Ready for Sterilization",
        description: `Request ${requestId} is now ready for sterilization process.`
      });
    } else {
      toast({
        title: "Status Updated",
        description: `Request ${requestId} status changed to ${newStatus}.`
      });
    }
  };

  const filteredItems = requestedItems.filter(item => {
    const matchesSearch = item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.items.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  // Pagination logic for Requested Items
  const totalPages = Math.ceil(filteredItems.length / requestsPerPage);
  const indexOfLastRequest = currentPage * requestsPerPage;
  const indexOfFirstRequest = indexOfLastRequest - requestsPerPage;
  const currentRequests = filteredItems.slice(indexOfFirstRequest, indexOfLastRequest);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const getStatusIcon = (status) => {
    switch (status) {
      case "Complete":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "Processing":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "Requested":
        return <Clock className="w-4 h-4 text-blue-600" />;
      case "Pending":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Processing":
        return "bg-blue-100 text-blue-800";
      case "Pending":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Filter requested items that haven't been received yet
  const unreceivedRequests = requestedItems.filter(request => 
    !receivedItems.some(received => received.requestId === request.id)
  );

  const filteredPreviousRequests = receivedItems.filter(item => {
    const matchesSearch = item.requestId.toLowerCase().includes(previousRequestSearch.toLowerCase()) ||
                         item.department.toLowerCase().includes(previousRequestSearch.toLowerCase()) ||
                         item.items.toLowerCase().includes(previousRequestSearch.toLowerCase());
    return matchesSearch;
  });

  return (
    <>
    <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
    <div className="space-y-4 sm:space-y-5 bg-[#ffffff] min-h-screen p-1 sm:p-5 border-t-4 border-[#038ba4] m-10 mt-0 ">
     
      <div className="bg-white shadow-sm border-l-4 border-[#038ba4]">
      <div className="bg-white rounded-lg shadow-sm p-4 ">
      
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-xl font-bold text-gray-900 " style={{color:"#038ba4"}}>Receive Items</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Manage received requests and update status</p>
          </div>
        </div>
      </div>
      </div>

      <Card className="bg-white border border-gray-200 ">
        <CardHeader className="border-b border-gray-200 p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl text-gray-900 mb-4">Requested Items</CardTitle>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input 
                placeholder="Search by Request ID, Department, or Items..." 
                className="pl-10 border border-gray-300 focus:ring-0 focus:shadow-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 border-gray-300 hover:border-gray-400 text-black">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-3 text-gray-700 font-medium text-sm">Request ID</th>
                  <th className="text-left p-3 text-gray-700 font-medium text-sm">Department</th>
                  <th className="text-left p-3 text-gray-700 font-medium text-sm">Priority</th>
                  <th className="text-left p-3 text-gray-700 font-medium text-sm">Items</th>
                  <th className="text-left p-3 text-gray-700 font-medium text-sm">Quantity</th>
                  <th className="text-left p-3 text-gray-700 font-medium text-sm">Status</th>
                  <th className="text-left p-3 text-gray-700 font-medium text-sm">Date</th>
                  <th className="text-left p-3 text-gray-700 font-medium text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentRequests.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-3 font-medium text-gray-900 text-sm">{item.id}</td>
                    <td className="p-3 text-gray-900 text-sm">{item.department}</td>
                    <td className="p-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item.priority === 'High' ? 'bg-red-100 text-red-800' :
                        item.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {item.priority}
                      </span>
                    </td>
                    <td className="p-3 text-gray-900 text-sm">{item.items}</td>
                    <td className="p-3 text-gray-900 text-sm">{item.quantity}</td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(item.status)}
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                    </td>
                    <td className="p-3 text-gray-600 text-sm">{item.date}</td>
                    <td className="p-3">
                      <Select 
                        value={item.status}
                        onValueChange={(newStatus) => handleChangeStatus(item.id, newStatus)}
                      >
                        <SelectTrigger className="w-32 border-gray-300 text-sm">
                          <SelectValue placeholder="Change Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="Pending">Pending</SelectItem>
                          <SelectItem value="Processing">Processing</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {currentRequests.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              No requested items found
            </div>
          )}
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
              <div className="text-sm text-gray-700">
                Showing {indexOfFirstRequest + 1} to {Math.min(indexOfLastRequest, filteredItems.length)} of {filteredItems.length} requests
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Previous
                </Button>
                
                {/* Page Numbers */}
                <div className="flex items-center space-x-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                      className={
                        currentPage === page 
                          ? "bg-[#038ba4] text-white hover:bg-[#027a8f]" 
                          : "border-gray-300 text-gray-700 hover:bg-gray-50"
                      }
                    >
                      {page}
                    </Button>
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Item Details</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Receipt ID</Label>
                  <p className="font-medium">{selectedItem.id}</p>
                </div>
                <div>
                  <Label>Request ID</Label>
                  <p className="font-medium">{selectedItem.requestId}</p>
                </div>
                <div>
                  <Label>Department</Label>
                  <p className="font-medium">{selectedItem.department}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedItem.status)}
                    <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(selectedItem.status)}`}>
                      {selectedItem.status}
                    </span>
                  </div>
                </div>
              </div>
              <div>
                <Label>Items</Label>
                <p className="font-medium">{selectedItem.items}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Requested Quantity</Label>
                  <p className="font-medium">{selectedItem.quantity}</p>
                </div>
                <div>
                  <Label>Received Quantity</Label>
                  <p className="font-medium">{selectedItem.receivedQty}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date</Label>
                  <p className="font-medium">{selectedItem.date}</p>
                </div>
                <div>
                  <Label>Time</Label>
                  <p className="font-medium">{selectedItem.time}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <Card className="bg-white border border-gray-200">
          <CardHeader className="border-b border-gray-200 p-4">
            <CardTitle className="flex items-center gap-2 text-red-600 text-base">
              <XCircle className="w-5 h-5" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">
              {requestedItems.filter(item => item.status === "Pending").length}
            </div>
            <p className="text-xs sm:text-sm text-gray-600">Awaiting processing</p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200">
          <CardHeader className="border-b border-gray-200 p-4">
            <CardTitle className="flex items-center gap-2 text-yellow-600 text-base">
              <Clock className="w-5 h-5" />
              Processing
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">
              {requestedItems.filter(item => item.status === "Processing").length}
            </div>
            <p className="text-xs sm:text-sm text-gray-600">Items being processed</p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200">
          <CardHeader className="border-b border-gray-200 p-4">
            <CardTitle className="flex items-center gap-2 text-green-600 text-base">
              <CheckCircle className="w-5 h-5" />
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">
              {requestedItems.filter(item => item.status === "Completed").length}
            </div>
            <p className="text-xs sm:text-sm text-gray-600">Completed requests</p>
          </CardContent>
        </Card>
      </div>
    </div>
    <Footer />
    </>
  );
};

export default ReceiveItems;