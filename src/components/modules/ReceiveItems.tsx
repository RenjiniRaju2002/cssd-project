import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Eye, CheckCircle, Clock, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const ReceiveItems = () => {
  const [receivedItems, setReceivedItems] = useState([
    { id: "REC001", requestId: "REQ001", department: "OR-1", items: "Surgery Kit", quantity: 2, receivedQty: 2, status: "Complete", date: "2024-06-10", time: "10:30" },
    { id: "REC002", requestId: "REQ002", department: "OR-2", items: "Instruments", quantity: 5, receivedQty: 3, status: "Partial", date: "2024-06-10", time: "11:15" },
    { id: "REC003", requestId: "REQ003", department: "ICU", items: "Medical Tools", quantity: 4, receivedQty: 0, status: "Pending", date: "2024-06-10", time: "12:00" }
  ]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const { toast } = useToast();

  const updateItemStatus = (id: string, newStatus: string, receivedQty?: number) => {
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

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Complete":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "Partial":
        return <Clock className="w-4 h-4 text-gray-600" />;
      case "Pending":
        return <XCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Clock className="w-4 h-4 text-gray-600" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Complete":
        return "bg-green-100 text-green-800";
      case "Partial":
        return "bg-gray-100 text-gray-800";
      case "Pending":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Receive Items</h1>
        <p className="text-gray-600">Manage received requests and update status</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Received Items Management</CardTitle>
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input 
                placeholder="Search by ID, Request ID, or Department..." 
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="complete">Complete</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Receipt ID</th>
                  <th className="text-left p-3">Request ID</th>
                  <th className="text-left p-3">Department</th>
                  <th className="text-left p-3">Items</th>
                  <th className="text-left p-3">Requested Qty</th>
                  <th className="text-left p-3">Received Qty</th>
                  <th className="text-left p-3">Status</th>
                  <th className="text-left p-3">Date & Time</th>
                  <th className="text-left p-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{item.id}</td>
                    <td className="p-3">{item.requestId}</td>
                    <td className="p-3">{item.department}</td>
                    <td className="p-3">{item.items}</td>
                    <td className="p-3">{item.quantity}</td>
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
                        className="w-20"
                        min="0"
                        max={item.quantity}
                      />
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(item.status)}
                        <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(item.status)}`}>
                          {item.status}
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="text-sm">
                        <div>{item.date}</div>
                        <div className="text-gray-500">{item.time}</div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => updateItemStatus(item.id, "Complete", item.quantity)}
                          disabled={item.status === "Complete"}
                        >
                          Complete
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Eye className="w-4 h-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <CheckCircle className="w-5 h-5" />
              Complete
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {filteredItems.filter(item => item.status === "Complete").length}
            </div>
            <p className="text-sm text-gray-600">Items fully received</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-gray-600">
              <Clock className="w-5 h-5" />
              Partial
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {filteredItems.filter(item => item.status === "Partial").length}
            </div>
            <p className="text-sm text-gray-600">Partially received items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="w-5 h-5" />
              Pending
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {filteredItems.filter(item => item.status === "Pending").length}
            </div>
            <p className="text-sm text-gray-600">Awaiting receipt</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ReceiveItems;
