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
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedItem, setSelectedItem] = useState(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const { toast } = useToast();

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
      setIsAddDialogOpen(false);
      setIsViewDialogOpen(false);
    };
  }, []);

  const handleReceiveItem = (event: React.FormEvent) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const newReceive = {
      id: `REC${String(receivedItems.length + 1).padStart(3, '0')}`,
      requestId: formData.get('requestId') as string,
      department: formData.get('department') as string,
      items: formData.get('items') as string,
      quantity: parseInt(formData.get('quantity') as string),
      receivedQty: parseInt(formData.get('receivedQty') as string),
      status: "Partial",
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })
    };

    // Update status based on received quantity
    if (newReceive.receivedQty === newReceive.quantity) {
      newReceive.status = "Complete";
    } else if (newReceive.receivedQty > 0) {
      newReceive.status = "Partial";
    } else {
      newReceive.status = "Pending";
    }

    // Update workflow status
    const updatedWorkflowItems = workflowItems.map(item => 
      item.requestId === newReceive.requestId ? {
        ...item,
        currentStatus: "Received",
        timestamp: new Date().toISOString(),
        location: "Receiving Area"
      } : item
    );
    setWorkflowItems(updatedWorkflowItems);

    setReceivedItems(prev => [...prev, newReceive]);
    setIsAddDialogOpen(false);
    
    toast({
      title: "Item Received",
      description: `Item ${newReceive.id} has been received successfully.`,
    });
  };

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

  const filteredItems = receivedItems.filter(item => {
    const matchesSearch = item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.requestId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || item.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case "Complete":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "Partial":
        return <Clock className="w-4 h-4 text-yellow-600" />;
      case "Pending":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Complete":
        return "bg-green-100 text-green-800";
      case "Partial":
        return "bg-yellow-100 text-yellow-800";
      case "Pending":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const goToStockManagement = () => {
    navigate('/stock-management');
  };

  return (
    <>
    <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
    <div className="space-y-4 sm:space-y-5 bg-[#ffffff] min-h-40 p-1 sm:p-5 border-t-4 border-[#038ba4] m-10 mt-0">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold"></h1>
        
      </div>
      <div className="bg-white shadow-sm border-l-4 border-[#038ba4]">
      <div className="bg-white rounded-lg shadow-sm p-4">
      
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl sm:text-xl font-bold text-gray-900" style={{color:"#038ba4"}}>Receive Items</h1>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Manage received requests and update status</p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-[#038ba4] hover:bg-[#038ba4]/90 text-white">
                <Plus className="w-4 h-4 mr-2" />
                Add Receive Item
              </Button>
              
            </DialogTrigger>
            <DialogContent className="bg-white">
              <DialogHeader>
                <DialogTitle>Add New Receive Item</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleReceiveItem} className="space-y-4">
                <div>
                  <Label htmlFor="requestId">Request ID</Label>
                  <Input name="requestId" placeholder="Enter request ID" required className="border-gray-300" />
                </div>
                <div>
                  <Label htmlFor="department">Department</Label>
                  <Input name="department" placeholder="Enter department" required className="border-gray-300" />
                </div>
                <div>
                  <Label htmlFor="items">Items</Label>
                  <Input name="items" placeholder="Enter items description" required className="border-gray-300" />
                </div>
                <div>
                  <Label htmlFor="quantity">Quantity</Label>
                  <Input name="quantity" type="number" placeholder="Enter quantity" required className="border-gray-300" />
                </div>
                <div>
                  <Label htmlFor="receivedQty">Received Quantity</Label>
                  <Input name="receivedQty" type="number" placeholder="Enter received quantity" required className="border-gray-300" />
                </div>
                <Button type="submit" className="w-full bg-[#038ba4] hover:bg-[#038ba4]/90 text-white">
                  Add Item
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      </div>

      <Card className="bg-white shadow-sm">
        <CardHeader className="border-b border-gray-200 p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl text-gray-900 mb-4">Received Items Management</CardTitle>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input 
                placeholder="Search by ID, Request ID, or Department..." 
                className="pl-10 border-none focus:ring-0 focus:shadow-none"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 border-gray-300 hover:border-gray-400 focus:border-[#038ba4]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="complete">Complete</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-3 text-gray-700 font-medium text-sm">Receipt ID</th>
                  <th className="text-left p-3 text-gray-700 font-medium text-sm">Request ID</th>
                  <th className="text-left p-3 text-gray-700 font-medium text-sm">Department</th>
                  <th className="text-left p-3 text-gray-700 font-medium text-sm">Items</th>
                  <th className="text-left p-3 text-gray-700 font-medium text-sm">Requested Qty</th>
                  <th className="text-left p-3 text-gray-700 font-medium text-sm">Received Qty</th>
                  <th className="text-left p-3 text-gray-700 font-medium text-sm">Status</th>
                  <th className="text-left p-3 text-gray-700 font-medium text-sm">Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-3 font-medium text-gray-900 text-sm">{item.id}</td>
                    <td className="p-3 text-gray-900 text-sm">{item.requestId}</td>
                    <td className="p-3 text-gray-900 text-sm">{item.department}</td>
                    <td className="p-3 text-gray-900 text-sm">{item.items}</td>
                    <td className="p-3 text-gray-900 text-sm">{item.quantity}</td>
                    <td className="p-3">
                      <Input 
                        type="number" 
                        value={item.receivedQty} 
                        onChange={(e) => {
                          const newQty = parseInt(e.target.value) || 0;
                          const newStatus = newQty === 0 ? "Pending" : 
                                          newQty < item.quantity ? "Partial" : "Complete";
                          updateItemStatus(item.id, newStatus, newQty);
                        }}
                        className="w-16 sm:w-20 border-gray-300 hover:border-gray-400 focus:border-[#038ba4] text-sm"
                        min="0"
                        max={item.quantity}
                      />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(item.status)}
                        <Select 
                          value={item.status}
                          onValueChange={(newStatus) => {
                            handleUpdateStatus(item.id, newStatus);
                          }}
                        >
                          <SelectTrigger className="w-full sm:w-48 border-gray-300 hover:border-gray-400 focus:border-[#038ba4]">
                            <SelectValue placeholder="Update status" />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            <SelectItem value="Pending">Pending</SelectItem>
                            <SelectItem value="Partial">Partial</SelectItem>
                            <SelectItem value="Complete">Complete</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="text-sm">
                        <div className="text-gray-900">{item.date}</div>
                        <div className="text-gray-500 text-xs">{item.time}</div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
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
        <Card className="bg-white shadow-sm">
          <CardHeader className="border-b border-gray-200 p-4">
            <CardTitle className="flex items-center gap-2 text-green-600 text-base">
              <CheckCircle className="w-5 h-5" />
              Complete
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">
              {filteredItems.filter(item => item.status === "Complete").length}
            </div>
            <p className="text-xs sm:text-sm text-gray-600">Items fully received</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader className="border-b border-gray-200 p-4">
            <CardTitle className="flex items-center gap-2 text-yellow-600 text-base">
              <Clock className="w-5 h-5" />
              Partial
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">
              {filteredItems.filter(item => item.status === "Partial").length}
            </div>
            <p className="text-xs sm:text-sm text-gray-600">Partially received items</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader className="border-b border-gray-200 p-4">
            <CardTitle className="flex items-center gap-2 text-red-600 text-base">
              <XCircle className="w-5 h-5" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">
              {filteredItems.filter(item => item.status === "Pending").length}
            </div>
            <p className="text-xs sm:text-sm text-gray-600">Awaiting receipt</p>
          </CardContent>
        </Card>
      </div>
    </div>
    <Footer />
    </>
  );
};

export default ReceiveItems;