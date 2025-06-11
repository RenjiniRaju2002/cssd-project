import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ItemStatus {
  id: string;
  requestId: string;
  kitId: string;
  sterilizationId: string;
  currentStatus: string;
  timestamp: string;
  location: string;
}

const WorkflowTracking = () => {
  const { toast } = useToast();
  const [workflowItems, setWorkflowItems] = useState<ItemStatus[]>(() => {
    const savedItems = localStorage.getItem('workflowItems');
    return savedItems ? JSON.parse(savedItems) : [];
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItem, setSelectedItem] = useState<ItemStatus | null>(null);

  useEffect(() => {
    localStorage.setItem('workflowItems', JSON.stringify(workflowItems));
  }, [workflowItems]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Requested":
        return "bg-blue-100 text-blue-800";
      case "Received":
        return "bg-purple-100 text-purple-800";
      case "Sterilizing":
        return "bg-yellow-100 text-yellow-800";
      case "Sterilized":
        return "bg-green-100 text-green-800";
      case "Issued":
        return "bg-gray-100 text-gray-800";
      case "Returned":
        return "bg-indigo-100 text-indigo-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const updateWorkflowStatus = (id: string, newStatus: string) => {
    const updatedItems = workflowItems.map(item => 
      item.id === id ? { ...item, currentStatus: newStatus, timestamp: new Date().toISOString() } : item
    );
    setWorkflowItems(updatedItems);
    toast({
      title: "Status Updated",
      description: `Item ${id} status updated to ${newStatus}`
    });
  };

  const filteredItems = workflowItems.filter(item =>
    item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.requestId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.kitId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.sterilizationId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 bg-gray-50 min-h-screen p-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-3xl font-bold text-gray-900">Workflow Tracking</h1>
        <p className="text-gray-600">Track items through the CSSD process</p>
      </div>

      <Card className="bg-white shadow-sm">
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <Search className="w-5 h-5 text-[#00A8E8]" />
            Search Items
          </CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input 
              placeholder="Search by ID, Request ID, Kit ID, or Sterilization ID..." 
              className="pl-10 border-gray-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 text-gray-700 font-medium">Item ID</th>
                  <th className="text-left p-4 text-gray-700 font-medium">Request ID</th>
                  <th className="text-left p-4 text-gray-700 font-medium">Kit ID</th>
                  <th className="text-left p-4 text-gray-700 font-medium">Sterilization ID</th>
                  <th className="text-left p-4 text-gray-700 font-medium">Current Status</th>
                  <th className="text-left p-4 text-gray-700 font-medium">Location</th>
                  <th className="text-left p-4 text-gray-700 font-medium">Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-900">{item.id}</td>
                    <td className="p-4 text-gray-900">{item.requestId}</td>
                    <td className="p-4 text-gray-900">{item.kitId}</td>
                    <td className="p-4 text-gray-900">{item.sterilizationId}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.currentStatus)}`}>
                        {item.currentStatus}
                      </span>
                    </td>
                    <td className="p-4 text-gray-600">{item.location}</td>
                    <td className="p-4 text-gray-600">{new Date(item.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default WorkflowTracking;
