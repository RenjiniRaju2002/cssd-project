import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Plus, Search, Filter, Eye, Package, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useLocation } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import initialData from "../../data/requestManagementData.json";


const RequestManagement = ({ sidebarCollapsed, toggleSidebar }) => {
  const [requests, setRequests] = useState(initialData.requests);
  const [packageKits, setPackageKits] = useState(initialData.packageKits);
  const [workflowItems, setWorkflowItems] = useState(initialData.workflowItems);

  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const searchId = queryParams.get('search');

  // Load requests from localStorage on component mount
  useEffect(() => {
    const savedRequests = localStorage.getItem('cssdRequests');
    if (savedRequests) {
      setRequests(JSON.parse(savedRequests));
    } else {
      // Initialize with JSON data if no localStorage data exists
      setRequests(initialData.requests);
      localStorage.setItem('cssdRequests', JSON.stringify(initialData.requests));
    }
  }, []);

  // Save requests to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('cssdRequests', JSON.stringify(requests));
  }, [requests]);

  const [selectedDate, setSelectedDate] = useState<Date>();
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [showCreateKit, setShowCreateKit] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [showRequestDetails, setShowRequestDetails] = useState(false);
  const [showStatusChange, setShowStatusChange] = useState(false);

  // Cleanup effect when component unmounts
  useEffect(() => {
    return () => {
      // Reset component state but keep localStorage data
      setShowCreateKit(false);
      setSelectedRequest(null);
      setShowRequestDetails(false);
      setShowStatusChange(false);
    };
  }, []);

  // Delete request functionality
  const handleDeleteRequest = (requestId: string) => {
    // Remove from requests
    setRequests(prevRequests => {
      const updatedRequests = prevRequests.filter(request => request.id !== requestId);
      localStorage.setItem('cssdRequests', JSON.stringify(updatedRequests));
      return updatedRequests;
    });

    // Remove from workflow items
    setWorkflowItems(prevWorkflow => {
      const updatedWorkflow = prevWorkflow.filter(item => item.requestId !== requestId);
      localStorage.setItem('cssdWorkflowItems', JSON.stringify(updatedWorkflow));
      return updatedWorkflow;
    });

    // Remove related package kit if it exists
    const relatedKit = packageKits.find(kit => kit.requestId === requestId);
    if (relatedKit) {
      const updatedKits = packageKits.filter(kit => kit.requestId !== requestId);
      setPackageKits(updatedKits);
      localStorage.setItem('cssdPackageKits', JSON.stringify(updatedKits));
    }

    toast({
      title: "Request Deleted",
      description: `Request ${requestId} has been deleted successfully.`,
    });
  };

  // Load package kits from localStorage on component mount
  useEffect(() => {
    const savedKits = localStorage.getItem('cssdPackageKits');
    if (savedKits) {
      setPackageKits(JSON.parse(savedKits));
    } else {
      // Initialize with JSON data if no localStorage data exists
      setPackageKits(initialData.packageKits);
      localStorage.setItem('cssdPackageKits', JSON.stringify(initialData.packageKits));
    }
  }, []);

  // Save package kits to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('cssdPackageKits', JSON.stringify(packageKits));
  }, [packageKits]);

  // Load workflow items from localStorage on component mount
  useEffect(() => {
    const savedWorkflowItems = localStorage.getItem('cssdWorkflowItems');
    if (savedWorkflowItems) {
      setWorkflowItems(JSON.parse(savedWorkflowItems));
    } else {
      // Initialize with JSON data if no localStorage data exists
      setWorkflowItems(initialData.workflowItems);
      localStorage.setItem('cssdWorkflowItems', JSON.stringify(initialData.workflowItems));
    }
  }, []);

  // Save workflow items to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('cssdWorkflowItems', JSON.stringify(workflowItems));
  }, [workflowItems]);

  const { toast } = useToast();

  const generateRequestId = () => {
    return `REQ${String(requests.length + 1).padStart(3, '0')}`;
  };

  const handleCreateRequest = (event: React.FormEvent) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const newRequest = {
      id: generateRequestId(),
      department: formData.get('department') as string,
      items: formData.get('items') as string,
      quantity: parseInt(formData.get('quantity') as string),
      priority: formData.get('priority') as string,
      status: "Requested",
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
    };

    // Add to workflow tracking
    const workflowItem = {
      id: newRequest.id,
      requestId: newRequest.id,
      kitId: "",
      sterilizationId: "",
      currentStatus: "Requested",
      timestamp: new Date().toISOString(),
      location: "Request Queue"
    };
    
    setWorkflowItems([...workflowItems, workflowItem]);
    
    setRequests([...requests, newRequest]);
    toast({
      title: "Request Created",
      description: `Request ${newRequest.id} has been created successfully.`,
    });
    (event.target as HTMLFormElement).reset();
    setSelectedDate(undefined);
  };

  const handleCreateKit = (event: React.FormEvent) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const newKitId = `KIT${String(packageKits.length + 1).padStart(3, '0')}`;
    const newKit = {
      id: newKitId,
      requestId: generateRequestId(),
      name: formData.get('kitName') as string,
      items: (formData.get('kitItems') as string).split(',').map(item => item.trim()),
      department: formData.get('kitDepartment') as string,
      priority: formData.get('priority') as string,
      status: formData.get('status') as string,
      quantity: parseInt(formData.get('quantity') as string),
      creationDate: new Date().toISOString().split('T')[0]
    };

    // Create request for the new kit
    const newRequest = {
      id: newKit.requestId,
      department: newKit.department,
      items: newKit.name,
      quantity: newKit.quantity,
      priority: newKit.priority,
      status: "Requested",
      date: newKit.creationDate,
      time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
    };

    // Add to workflow tracking
    const workflowItem = {
      id: newKit.requestId,
      requestId: newKit.requestId,
      kitId: newKitId,
      sterilizationId: "",
      currentStatus: "Requested",
      timestamp: new Date().toISOString(),
      location: "Request Queue"
    };
    
    // Update states
    setPackageKits(prevKits => [...prevKits, newKit]);
    setRequests(prevRequests => [...prevRequests, newRequest]);
    setWorkflowItems(prevWorkflow => [...prevWorkflow, workflowItem]);
    
    // Save to localStorage
    localStorage.setItem('cssdPackageKits', JSON.stringify([...packageKits, newKit]));
    localStorage.setItem('cssdRequests', JSON.stringify([...requests, newRequest]));
    localStorage.setItem('cssdWorkflowItems', JSON.stringify([...workflowItems, workflowItem]));
    
    toast({
      title: "Package Kit Created",
      description: `Kit ${newKitId} and Request ${newKit.requestId} have been created successfully.`,
    });
    
    // Close the dialog
    setShowCreateKit(false);
    
    // Reset form
    (event.target as HTMLFormElement).reset();
  };

  const handleDeleteKit = (kitId: string) => {
    // Find the kit to get its requestId
    const kitToDelete = packageKits.find(kit => kit.id === kitId);
    if (!kitToDelete) return;

    // Remove the kit from package kits
    const updatedKits = packageKits.filter(kit => kit.id !== kitId);
    setPackageKits(updatedKits);

    // Remove the associated request
    const updatedRequests = requests.filter(request => request.id !== kitToDelete.requestId);
    setRequests(updatedRequests);

    // Remove the associated workflow items
    const updatedWorkflowItems = workflowItems.filter(item => 
      item.kitId !== kitId && item.requestId !== kitToDelete.requestId
    );
    setWorkflowItems(updatedWorkflowItems);

    // Save all changes to localStorage
    localStorage.setItem('cssdPackageKits', JSON.stringify(updatedKits));
    localStorage.setItem('cssdRequests', JSON.stringify(updatedRequests));
    localStorage.setItem('cssdWorkflowItems', JSON.stringify(updatedWorkflowItems));

    toast({
      title: "Kit and Request Deleted",
      description: `Kit ${kitId} and its associated request have been deleted successfully.`,
    });
  };

  const handleViewKit = (kit: any) => {
    setSelectedRequest(kit);
    setShowRequestDetails(true);
  };

  const handleViewRequest = (request: any) => {
    setSelectedRequest(request);
    setShowRequestDetails(true);
  };

  const handleStatusChange = (request: any) => {
    setSelectedRequest(request);
    setShowStatusChange(true);
  };

  const handleUpdateStatus = (requestId: string, newStatus: string) => {
    // Update requests state
    setRequests(prevRequests => {
      const updatedRequests = prevRequests.map(request => 
        request.id === requestId ? { ...request, status: newStatus } : request
      );
      localStorage.setItem('cssdRequests', JSON.stringify(updatedRequests));
      return updatedRequests;
    });

    // Update workflow items
    setWorkflowItems(prevWorkflow => {
      const updatedWorkflow = prevWorkflow.map(item =>
        item.requestId === requestId ? { ...item, currentStatus: newStatus } : item
      );
      localStorage.setItem('cssdWorkflowItems', JSON.stringify(updatedWorkflow));
      return updatedWorkflow;
    });

    // Close status change dialog
    setShowStatusChange(false);
    setSelectedRequest(null);

    // Force a re-render to update the UI
    setRequests(prev => [...prev]);
  };

  // Add useEffect to listen for localStorage changes
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'cssdRequests' || e.key === 'cssdWorkflowItems') {
        loadRequests();
        loadWorkflowItems();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Add loading functions
  const loadRequests = () => {
    const savedRequests = localStorage.getItem('cssdRequests');
    if (savedRequests) {
      const parsedRequests = JSON.parse(savedRequests);
      setRequests(parsedRequests);
    }
  };

  const loadWorkflowItems = () => {
    const savedWorkflow = localStorage.getItem('cssdWorkflowItems');
    if (savedWorkflow) {
      const parsedWorkflow = JSON.parse(savedWorkflow);
      setWorkflowItems(parsedWorkflow);
    }
  };

  // Load initial data
  useEffect(() => {
    loadRequests();
    loadWorkflowItems();
  }, []);

  // Filter package kits based on search term
  const filteredKits = packageKits.filter(kit => 
    kit.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    kit.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredRequests = searchId ? 
    requests.filter(request => 
      request.id === searchId || 
      request.items.includes(searchId) || 
      request.department.includes(searchId)
    ) : requests.filter(request => {
    const matchesSearch = request.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.items.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesPriority = filterPriority === "all" || request.priority === filterPriority;
    const matchesStatus = filterStatus === "all" || request.status === filterStatus;
    
    return matchesSearch && matchesPriority && matchesStatus;
  });

  return (
    <>
    <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
    <div className="space-y-4 sm:space-y-5 bg-[#ffffff] min-h-40 p-1 sm:p-5 border-t-4 border-[#038ba4] m-10 mt-0">
       <div className="bg-white  border-l-4 border-[#038ba4] shadow-sm">
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h1 className="text-xl sm:text-xl font-bold text-gray-900" style={{color: "#038ba4"}}>Request Management</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">Create and manage sterilization requests</p>
      </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
        <Card className="bg-white shadow-lg">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl text-gray-900 mb-4">
              <Plus className="w-5 h-5 text-[#038ba4]" />
              Create New Request
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleCreateRequest} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="department" className="text-gray-700">Department</Label>
                  <Select name="department" required>
                    <SelectTrigger className="border-gray-300 text-black">
                      <SelectValue placeholder="Select department " className="text-black" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="OR-1" className="text-black">OR-1</SelectItem>
                      <SelectItem value="OR-2" className="text-black">OR-2</SelectItem>
                      <SelectItem value="OR-3" className="text-black">OR-3</SelectItem>
                      <SelectItem value="ICU" className="text-black">ICU</SelectItem>
                      <SelectItem value="Emergency" className="text-black">Emergency</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority" className="text-black">Priority</Label>
                  <Select name="priority" required>
                    <SelectTrigger className="border-gray-300 text-black">
                      <SelectValue placeholder="Select priority" className="text-black" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      <SelectItem value="High" className="text-black">High</SelectItem>
                      <SelectItem value="Medium" className="text-black">Medium</SelectItem>
                      <SelectItem value="Low" className="text-black">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div>
                <Label htmlFor="items" className="text-gray-700">Items Description</Label>
                <Textarea name="items" placeholder="Describe the items needed" required className="border-gray-300 text-black placeholder-black" />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity" className="text-gray-700">Quantity</Label>
                  <Input name="quantity" type="number" placeholder="Enter quantity" required className="border-gray-300 text-black placeholder-black" />
                </div>
                <div>
                  <Label className="text-gray-700">Required Date</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" className="w-full justify-start text-left border-gray-300">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {selectedDate ? format(selectedDate, "PPP") : "Pick a date"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-white">
                      <Calendar
                        mode="single"
                        selected={selectedDate}
                        onSelect={setSelectedDate}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
              
              <Button type="submit" className="w-full bg-[#038ba4] hover:bg-[#027a8f] text-white">
                Create Request
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg text-xs">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="flex items-center justify-between text-lg sm:text-xl text-gray-900 mb-4">
              <span className="flex items-center gap-2 text-gray-900">
                <Package className="w-5 h-5 text-[#038ba4]" />
                Package Kits
              </span>
              <Dialog open={showCreateKit} onOpenChange={setShowCreateKit}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="border-gray-300 text-gray-700 hover:bg-gray-50">
                    Create Kit
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-white">
                  <DialogHeader>
                    <DialogTitle className="text-gray-900">Create Package Kit</DialogTitle>
                  </DialogHeader>
                  <form onSubmit={handleCreateKit} className="space-y-4">
                    <div>
                      <Label htmlFor="kitName" className="text-gray-700">Kit Name</Label>
                      <Input name="kitName" placeholder="Enter kit name" required className="border-[#038ba4] focus:border-[#038ba4] focus:ring-[#038ba4] text-black placeholder-black" />
                    </div>
                    <div>
                      <Label htmlFor="kitItems" className="text-gray-700">Kit Items (comma-separated)</Label>
                      <Textarea name="kitItems" placeholder="Enter items separated by commas" required className="border-[#038ba4] focus:border-[#038ba4] focus:ring-[#038ba4] text-black placeholder-black" />
                    </div>
                    <div>
                      <Label htmlFor="kitDepartment" className="text-gray-700">Department</Label>
                      <Input name="kitDepartment" placeholder="Enter department" required className="border-[#038ba4] focus:border-[#038ba4] focus:ring-[#038ba4] text-black placeholder-black" />
                    </div>
                    <div>
                      <Label htmlFor="priority" className="text-gray-700">Priority</Label>
                      <Select name="priority" required>
                        <SelectTrigger className="border-[#038ba4] focus:border-[#038ba4] focus:ring-[#038ba4] text-black">
                          <SelectValue placeholder="Select priority" className="text-black" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-0">
                          <SelectItem value="High" className="text-black">High</SelectItem>
                          <SelectItem value="Medium" className="text-black">Medium</SelectItem>
                          <SelectItem value="Low" className="text-black">Low</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="status" className="text-gray-700">Status</Label>
                      <Select name="status" required>
                        <SelectTrigger className="border-[#038ba4] focus:border-[#038ba4] focus:ring-[#038ba4] text-black">
                          <SelectValue placeholder="Select status" className="text-black" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-0">
                          <SelectItem value="Requested" className="text-black">Requested</SelectItem>
                          <SelectItem value="Pending" className="text-black">Pending</SelectItem>
                          <SelectItem value="Processing" className="text-black">Processing</SelectItem>
                          <SelectItem value="Completed" className="text-black">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="quantity" className="text-gray-700">Quantity</Label>
                      <Input name="quantity" type="number" placeholder="Enter quantity" required className="border-[#038ba4] focus:border-[#038ba4] focus:ring-[#038ba4] text-black placeholder-black" />
                    </div>
                    <Button type="submit" className="w-full bg-[#038ba4] hover:bg-[#027a8f] text-white">
                      Create Package Kit
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <Input 
                placeholder="Search kits..." 
                className="border-[#038ba4] focus:border-[#038ba4] focus:ring-[#038ba4] w-64"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {filteredKits.length === 0 ? (
                <div className="text-center py-4 text-gray-500">
                  No kits found
                </div>
              ) : (
                filteredKits.map((kit) => (
                  <div key={kit.id} className="p-3 border border-gray-200 rounded-lg bg-gray-50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-gray-900">{kit.name}</h4>
                        <p className="text-sm text-gray-600">{kit.department}</p>
                        <div className="mt-2 space-y-1">
                          {kit.items.map((item, index) => (
                            <span key={index} className="inline-flex items-center px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                              {item}
                            </span>
                          ))}
                        </div>
                        <p className="text-sm text-gray-600">Created on: {kit.creationDate}</p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleViewKit(kit)}
                          className="text-black hover:bg-gray-100 hover:text-black focus:text-black active:text-black"
                        >
                          <Eye className="w-4 h-4 text-black" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteKit(kit.id)}
                          className="text-black hover:bg-gray-100 hover:text-black focus:text-black active:text-black"
                        >
                          <Trash2 className="w-4 h-4 text-black" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white shadow-lg">
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="text-lg sm:text-xl text-gray-900 mb-4">Previous Requests</CardTitle>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input 
                placeholder="Search requests..." 
                className="pl-10 border-gray-300"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-48 border-gray-300">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="High">High</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-48 border-gray-300">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Processing">Processing</SelectItem>
                <SelectItem value="Completed">Completed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 text-gray-700 font-medium">Request ID</th>
                  <th className="text-left p-4 text-gray-700 font-medium">Department</th>
                  <th className="text-left p-4 text-gray-700 font-medium">Priority</th>
                  <th className="text-left p-4 text-gray-700 font-medium">Items</th>
                  <th className="text-left p-4 text-gray-700 font-medium">Quantity</th>
                  <th className="text-left p-4 text-gray-700 font-medium">Status</th>
                  <th className="text-left p-4 text-gray-700 font-medium">Date</th>
                  <th className="text-left p-4 text-gray-700 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredRequests.map((request) => (
                  <tr key={request.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-900">{request.id}</td>
                    <td className="p-4 text-gray-900">{request.department}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        request.priority === 'High' ? 'bg-red-100 text-red-800' :
                        request.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {request.priority}
                      </span>
                    </td>
                    <td className="p-4 text-gray-900">{request.items}</td>
                    <td className="p-4 text-gray-900">{request.quantity}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        request.status === 'Pending' ? 'bg-gray-100 text-gray-800' :
                        request.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                        'bg-green-100 text-green-800'
                      }`}>
                        {request.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600">{request.date}</td>
                    <td className="p-4 flex items-center gap-2">
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleViewRequest(request)}
                        className="text-black hover:bg-gray-100"
                      >
                        <Eye className="w-4 h-4 text-black" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleStatusChange(request)}
                        className="text-black hover:bg-gray-100"
                      >
                        Change Status
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => handleDeleteRequest(request.id)}
                        className="text-black hover:bg-gray-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Request Details Dialog */}
      <Dialog open={showRequestDetails} onOpenChange={setShowRequestDetails}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Request Details</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-700">Request ID</Label>
                  <p className="font-medium text-gray-900">{selectedRequest.id}</p>
                </div>
                <div>
                  <Label className="text-gray-700">Department</Label>
                  <p className="font-medium text-gray-900">{selectedRequest.department}</p>
                </div>
                <div>
                  <Label className="text-gray-700">Priority</Label>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    selectedRequest.priority === 'High' ? 'bg-red-100 text-red-800' :
                    selectedRequest.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {selectedRequest.priority}
                  </span>
                </div>
                <div>
                  <Label className="text-gray-700">Status</Label>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    selectedRequest.status === 'Pending' ? 'bg-gray-100 text-gray-800' :
                    selectedRequest.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {selectedRequest.status}
                  </span>
                </div>
              </div>
              <div>
                <Label className="text-gray-700">Items</Label>
                <p className="text-gray-900">{selectedRequest.items}</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-700">Quantity</Label>
                  <p className="text-gray-900">{selectedRequest.quantity}</p>
                </div>
                <div>
                  <Label className="text-gray-700">Date</Label>
                  <p className="text-gray-900">{selectedRequest.date}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Status Change Dialog */}
      <Dialog open={showStatusChange} onOpenChange={setShowStatusChange}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Change Request Status</DialogTitle>
          </DialogHeader>
          {selectedRequest && (
            <div className="space-y-4">
              <div>
                <Label className="text-gray-700">Request ID</Label>
                <p className="font-medium text-gray-900">{selectedRequest.id}</p>
              </div>
              <div>
                <Label className="text-gray-700">Current Status</Label>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  selectedRequest.status === 'Pending' ? 'bg-gray-100 text-gray-800' :
                  selectedRequest.status === 'Processing' ? 'bg-blue-100 text-blue-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {selectedRequest.status}
                </span>
              </div>
              <div>
                <Label htmlFor="newStatus" className="text-gray-700">Status</Label>
                <Select 
                  value={selectedRequest?.status || ""} 
                  onValueChange={(value) => {
                    handleUpdateStatus(selectedRequest?.id || "", value);
                  }}
                >
                  <SelectTrigger className="border-gray-300">
                    <SelectValue placeholder="Select new status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="Pending">Pending</SelectItem>
                    <SelectItem value="Processing">Processing</SelectItem>
                    <SelectItem value="Completed">Completed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
      <Footer />
    
    </>
  );
};

export default RequestManagement;
