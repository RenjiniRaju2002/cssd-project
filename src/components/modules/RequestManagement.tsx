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
  const [requests, setRequests] = useState(() => {
    const saved = localStorage.getItem('cssdRequests');
    return saved ? JSON.parse(saved) : initialData.requests;
  });
  const [packageKits, setPackageKits] = useState(() => {
    const saved = localStorage.getItem('cssdPackageKits');
    return saved ? JSON.parse(saved) : initialData.packageKits;
  });
  const [workflowItems, setWorkflowItems] = useState(() => {
    const saved = localStorage.getItem('cssdWorkflowItems');
    return saved ? JSON.parse(saved) : initialData.workflowItems;
  });

  const [currentRequest, setCurrentRequest] = useState({
    department: "",
    priority: "",
    requiredDate: "",
    items: [] as Array<{name: string, quantity: number}>
  });

  const [newItem, setNewItem] = useState({
    name: "",
    quantity: 1
  });

  const { search } = useLocation();
  const queryParams = new URLSearchParams(search);
  const searchId = queryParams.get('search');

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
  const [tempRequests, setTempRequests] = useState([]);
  const [itemsList, setItemsList] = useState([]);
  const [itemInput, setItemInput] = useState("");
  const [pendingItems, setPendingItems] = useState([]);
  const [itemQuantity, setItemQuantity] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState("");
  const [selectedPriority, setSelectedPriority] = useState("");

  // Kit creation state variables
  const [pendingKitItems, setPendingKitItems] = useState([]);
  const [kitName, setKitName] = useState("");
  const [kitDepartment, setKitDepartment] = useState("");
  const [kitPriority, setKitPriority] = useState("");
  const [kitQuantity, setKitQuantity] = useState("");
  const [kitItemInput, setKitItemInput] = useState("");

  // Pagination state for Previous Requests
  const [currentPage, setCurrentPage] = useState(1);
  const requestsPerPage = 7;

  // Cleanup effect when component unmounts
  useEffect(() => {
    return () => {
      // Reset component state but keep localStorage data
      setShowCreateKit(false);
      setSelectedRequest(null);
      setShowRequestDetails(false);
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

  // Save package kits to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('cssdPackageKits', JSON.stringify(packageKits));
  }, [packageKits]);

  // Save workflow items to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('cssdWorkflowItems', JSON.stringify(workflowItems));
  }, [workflowItems]);

  const { toast } = useToast();

  const generateRequestId = () => {
    return `REQ${String(requests.length + 1).padStart(3, '0')}`;
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (newItem.name.trim() && newItem.quantity > 0) {
      setCurrentRequest(prev => ({
        ...prev,
        items: [...prev.items, { ...newItem }]
      }));
      setNewItem({ name: "", quantity: 1 });
    }
  };

  const handleRemoveItem = (index: number) => {
    setCurrentRequest(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleSaveRequest = () => {
    if (pendingItems.length === 0) {
      toast({ 
        title: "No Items", 
        description: "Please add at least one item to the request.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create a new request with all pending items
      const newRequest = {
        id: generateRequestId(),
        department: pendingItems[0].department,
        priority: pendingItems[0].priority,
        items: pendingItems.map(i => i.item).join(", "),
        quantity: pendingItems.reduce((sum, i) => sum + Number(i.quantity), 0),
        status: "Requested",
        date: format(selectedDate || new Date(), 'yyyy-MM-dd'),
        time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
      };

      // Create workflow item
      const workflowItem = {
        id: newRequest.id,
        requestId: newRequest.id,
        kitId: "",
        sterilizationId: "",
        currentStatus: "Requested",
        timestamp: new Date().toISOString(),
        location: "Request Queue"
      };

      // Update states
      const updatedRequests = [...requests, newRequest];
      const updatedWorkflowItems = [...workflowItems, workflowItem];
      
      setRequests(updatedRequests);
      setWorkflowItems(updatedWorkflowItems);
      setPendingItems([]);
      
      // Reset form fields
      setSelectedDepartment("");
      setSelectedPriority("");
      setItemInput("");
      setItemQuantity("");
      setSelectedDate(undefined);

      // Save to localStorage
      localStorage.setItem('cssdRequests', JSON.stringify(updatedRequests));
      localStorage.setItem('cssdWorkflowItems', JSON.stringify(updatedWorkflowItems));

      toast({
        title: "Request Created",
        description: `Request ${newRequest.id} has been created successfully.`,
      });
    } catch (error) {
      console.error("Error saving request:", error);
      toast({
        title: "Error",
        description: "Failed to save request. Please try again.",
        variant: "destructive"
      });
    }
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

  // Pagination logic for Previous Requests
  const totalPages = Math.ceil(filteredRequests.length / requestsPerPage);
  const indexOfLastRequest = currentPage * requestsPerPage;
  const indexOfFirstRequest = indexOfLastRequest - requestsPerPage;
  const currentRequests = filteredRequests.slice(indexOfFirstRequest, indexOfLastRequest);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterPriority, filterStatus]);

  const addItemToList = () => {
    if (itemInput.trim()) {
      setItemsList(prev => [...prev, itemInput.trim()]);
      setItemInput("");
    }
  };

  // Add function to add item and details to pendingItems
  const addItemToPending = (event) => {
    event.preventDefault();
    if (!itemInput.trim() || !itemQuantity || !selectedDepartment || !selectedPriority || !selectedDate) {
      toast({ title: "Missing Fields", description: "Please fill all fields before adding." });
      return;
    }
    setPendingItems(prev => [
      ...prev,
      {
        department: selectedDepartment,
        priority: selectedPriority,
        item: itemInput.trim(),
        quantity: itemQuantity,
        date: selectedDate
      }
    ]);
    setItemInput("");
    setItemQuantity("");
  };

  // Add function to add item to kit pending list
  const addItemToKitPending = (event) => {
    event.preventDefault();
    if (!kitItemInput.trim() || !kitQuantity || !kitDepartment || !kitPriority || !kitName.trim()) {
      toast({ title: "Missing Fields", description: "Please fill all fields before adding." });
      return;
    }
    setPendingKitItems(prev => [
      ...prev,
      {
        department: kitDepartment,
        priority: kitPriority,
        item: kitItemInput.trim(),
        quantity: kitQuantity,
        kitName: kitName.trim()
      }
    ]);
    setKitItemInput("");
    setKitQuantity("");
  };

  // Save kit function
  const handleSaveKit = () => {
    if (pendingKitItems.length === 0) {
      toast({ 
        title: "No Items", 
        description: "Please add at least one item to the kit.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Create a new kit with all pending items
      const newKitId = `KIT${String(packageKits.length + 1).padStart(3, '0')}`;
      const newKit = {
        id: newKitId,
        requestId: generateRequestId(),
        name: pendingKitItems[0].kitName,
        items: pendingKitItems.map(i => i.item),
        department: pendingKitItems[0].department,
        priority: pendingKitItems[0].priority,
        status: "Requested",
        quantity: pendingKitItems.reduce((sum, i) => sum + Number(i.quantity), 0),
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
      const updatedKits = [...packageKits, newKit];
      const updatedRequests = [...requests, newRequest];
      const updatedWorkflowItems = [...workflowItems, workflowItem];
      
      setPackageKits(updatedKits);
      setRequests(updatedRequests);
      setWorkflowItems(updatedWorkflowItems);
      setPendingKitItems([]);
      
      // Reset form fields
      setKitName("");
      setKitDepartment("");
      setKitPriority("");
      setKitItemInput("");
      setKitQuantity("");

      // Save to localStorage
      localStorage.setItem('cssdPackageKits', JSON.stringify(updatedKits));
      localStorage.setItem('cssdRequests', JSON.stringify(updatedRequests));
      localStorage.setItem('cssdWorkflowItems', JSON.stringify(updatedWorkflowItems));

      // Close the dialog
      setShowCreateKit(false);

      toast({
        title: "Package Kit Created",
        description: `Kit ${newKitId} and Request ${newKit.requestId} have been created successfully.`,
      });
    } catch (error) {
      console.error("Error saving kit:", error);
      toast({
        title: "Error",
        description: "Failed to save kit. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <>
    <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
    <div className="space-y-4 sm:space-y-5 bg-[#ffffff] min-h-screen p-1 sm:p-5 border-t-4 border-[#038ba4] m-10 mt-0">
       <div className="bg-white  border-l-4 border-[#038ba4] shadow-sm">
      <div className="bg-white rounded-lg shadow-sm p-4">
        <h1 className="text-xl sm:text-xl font-bold text-gray-900" style={{color: "#038ba4"}}>Request Management</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">Create and manage sterilization requests</p>
      </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
        <Card className="bg-white border border-gray-200">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl text-gray-900 mb-4">
              <Plus className="w-5 h-5 text-[#038ba4]" />
              Add Request
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form className="space-y-4" onSubmit={addItemToPending}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="department" className="text-gray-700">Outlet</Label>
                  <Select name="department" value={selectedDepartment} onValueChange={setSelectedDepartment} required>
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
                  <Select name="priority" value={selectedPriority} onValueChange={setSelectedPriority} required>
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
                <Label htmlFor="items" className="text-gray-700">Item /Kit</Label>
                <Input value={itemInput} onChange={e => setItemInput(e.target.value)} placeholder="Add item name" className="border-gray-300 text-black placeholder-black" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity" className="text-gray-700">Quantity</Label>
                  <Input value={itemQuantity} onChange={e => setItemQuantity(e.target.value)} type="number" placeholder="Enter quantity" className="border-gray-300 text-black placeholder-black" />
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
                Add
              </Button>
            </form>
            {/* Show pending items in table */}
            {pendingItems.length > 0 && (
              <div className="mt-8">
                <h3 className="text-base font-semibold mb-2 text-black">Requests to be Added</h3>
                <div className="overflow-x-auto text-black">
                  <table className="w-full text-xs border border-gray-200">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="p-2 text-left">Department</th>
                        <th className="p-2 text-left">Priority</th>
                        <th className="p-2 text-left">Item</th>
                        <th className="p-2 text-left">Quantity</th>
                        <th className="p-2 text-left">Date</th>
                        <th className="p-2 text-left">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pendingItems.map((item, idx) => (
                        <tr key={idx} className="border-b border-gray-100">
                          <td className="p-2">{item.department}</td>
                          <td className="p-2">{item.priority}</td>
                          <td className="p-2">{item.item}</td>
                          <td className="p-2">{item.quantity}</td>
                          <td className="p-2">{format(new Date(item.date), "yyyy-MM-dd")}</td>
                          <td className="p-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="text-black hover:bg-gray-200 p-1 h-6"
                              onClick={() => {
                                setPendingItems(prev => prev.filter((_, i) => i !== idx));
                              }}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="mt-1 flex justify-end space-x-2">
                  <Button 
                    variant="outline"
                    onClick={() => setPendingItems([])}
                    className="bg-[#038ba4] hover:bg-[#027a8f] text-white"
                  >
                    Clear All
                  </Button>
                  <Button 
                    onClick={(e) => {
                      e.preventDefault();
                      handleSaveRequest();
                    }}
                    className="bg-[#038ba4] hover:bg-[#027a8f] text-white"
                  >
                    Save Request
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200">
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
                  <form onSubmit={addItemToKitPending} className="space-y-4">
                    <div>
                      <Label htmlFor="kitName" className="text-gray-700">Kit Name</Label>
                      <Input 
                        value={kitName} 
                        onChange={e => setKitName(e.target.value)} 
                        placeholder="Enter kit name" 
                        required 
                        className="focus:ring-[#038ba4] text-black placeholder-black" 
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="kitDepartment" className="text-gray-700">Outlet</Label>
                        <Select value={kitDepartment} onValueChange={setKitDepartment} required>
                          <SelectTrigger className="border-gray-300 text-black">
                            <SelectValue placeholder="Select department" className="text-black" />
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
                        <Label htmlFor="kitPriority" className="text-black">Priority</Label>
                        <Select value={kitPriority} onValueChange={setKitPriority} required>
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
                      <Label htmlFor="kitItem" className="text-gray-700">Item /Kit</Label>
                      <Input 
                        value={kitItemInput} 
                        onChange={e => setKitItemInput(e.target.value)} 
                        placeholder="Add item name" 
                        required 
                        className="border-gray-300 text-black placeholder-black" 
                      />
                    </div>
                    <div>
                      <Label htmlFor="kitQuantity" className="text-gray-700">Quantity</Label>
                      <Input 
                        value={kitQuantity} 
                        onChange={e => setKitQuantity(e.target.value)} 
                        type="number" 
                        placeholder="Enter quantity" 
                        required 
                        className="border-gray-300 text-black placeholder-black" 
                      />
                    </div>
                    <Button type="submit" className="w-full bg-[#038ba4] hover:bg-[#027a8f] text-white">
                      Add Item
                    </Button>
                  </form>
                  
                  {/* Show pending kit items in table */}
                  {pendingKitItems.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-base font-semibold mb-2 text-black">Kit Items to be Added</h3>
                      <div className="overflow-x-auto text-black">
                        <table className="w-full text-xs border border-gray-200">
                          <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                              <th className="p-2 text-left">Kit Name</th>
                              <th className="p-2 text-left">Department</th>
                              <th className="p-2 text-left">Priority</th>
                              <th className="p-2 text-left">Item</th>
                              <th className="p-2 text-left">Quantity</th>
                              <th className="p-2 text-left">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {pendingKitItems.map((item, idx) => (
                              <tr key={idx} className="border-b border-gray-100">
                                <td className="p-2">{item.kitName}</td>
                                <td className="p-2">{item.department}</td>
                                <td className="p-2">{item.priority}</td>
                                <td className="p-2">{item.item}</td>
                                <td className="p-2">{item.quantity}</td>
                                <td className="p-2">
                                  <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="text-black hover:bg-gray-200 p-1 h-6 "
                                    onClick={() => {
                                      setPendingKitItems(prev => prev.filter((_, i) => i !== idx));
                                    }}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <div className="mt-1 flex justify-end space-x-2">
                        <Button 
                          variant="outline"
                          onClick={() => setPendingKitItems([])}
                          className="bg-[#038ba4] hover:bg-[#027a8f] text-white"
                        >
                          Clear All
                        </Button>
                        <Button 
                          onClick={(e) => {
                            e.preventDefault();
                            handleSaveKit();
                          }}
                          className="bg-[#038ba4] hover:bg-[#027a8f] text-white"
                        >
                          Save Kit
                        </Button>
                      </div>
                    </div>
                  )}
                </DialogContent>
              </Dialog>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="flex justify-between items-center mb-4">
              <Input 
                placeholder="Search kits..." 
                className=" text-black focus:ring-[#038ba4] w-64"
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

      <Card className="bg-white bg-white border border-gray-200">
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="text-lg sm:text-xl text-gray-900 mb-4">Previous Requests</CardTitle>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input 
                placeholder="Search requests..." 
                className="pl-10 border-gray-300 text-black"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-48 border-gray-300 text-black">
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
              <SelectTrigger className="w-48 border-gray-300 text-black">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="Requested">Requested</SelectItem>
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
                {currentRequests.map((request) => (
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

                        request.status === 'Requested' ? 'bg-gray-300 text-gray-800' :
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
          
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
              <div className="text-sm text-gray-700">
                Showing {indexOfFirstRequest + 1} to {Math.min(indexOfLastRequest, filteredRequests.length)} of {filteredRequests.length} requests
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
                    selectedRequest.status === 'Requested' ? 'bg-gray-300 text-gray-800' :
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
    </div>
      <Footer />
    
    </>
  );
};

export default RequestManagement;
