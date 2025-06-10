
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Send, Clock, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const IssueItem = () => {
  const [issuedItems, setIssuedItems] = useState([
    { id: "ISS001", requestId: "REQ001", department: "OR-1", items: "Surgery Kit", quantity: 2, issuedTime: "14:30", issuedDate: "2024-06-10", status: "Issued" },
    { id: "ISS002", requestId: "REQ002", department: "OR-2", items: "Instruments", quantity: 3, issuedTime: "15:15", issuedDate: "2024-06-10", status: "Issued" }
  ]);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const availableItems = [
    { id: "REQ001", department: "OR-1", items: "Surgery Kit", quantity: 2, status: "Sterilized", readyTime: "14:00" },
    { id: "REQ003", department: "ICU", items: "Medical Tools", quantity: 4, status: "Sterilized", readyTime: "13:30" },
    { id: "REQ004", department: "OR-3", items: "Emergency Kit", quantity: 1, status: "Sterilized", readyTime: "15:00" }
  ];

  const handleIssueItem = (event: React.FormEvent) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const requestId = formData.get('requestId') as string;
    const outlet = formData.get('outlet') as string;
    
    const itemToIssue = availableItems.find(item => item.id === requestId);
    if (!itemToIssue) return;

    const newIssue = {
      id: `ISS${String(issuedItems.length + 1).padStart(3, '0')}`,
      requestId: itemToIssue.id,
      department: outlet,
      items: itemToIssue.items,
      quantity: itemToIssue.quantity,
      issuedTime: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      issuedDate: new Date().toISOString().split('T')[0],
      status: "Issued"
    };

    setIssuedItems([...issuedItems, newIssue]);
    toast({
      title: "Item Issued Successfully",
      description: `${newIssue.items} issued to ${outlet}`,
    });
    (event.target as HTMLFormElement).reset();
  };

  const filteredIssuedItems = issuedItems.filter(item =>
    item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.requestId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Issue Item</h1>
        <p className="text-gray-600">Issue sterilized items to departments and outlets</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              Issue Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleIssueItem} className="space-y-4">
              <div>
                <Label htmlFor="requestId">Request ID</Label>
                <Select name="requestId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select request to issue" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableItems.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.id} - {item.items} ({item.quantity} units)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="outlet">Department/Outlet</Label>
                <Select name="outlet" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Select destination" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="OR-1">Operating Room 1</SelectItem>
                    <SelectItem value="OR-2">Operating Room 2</SelectItem>
                    <SelectItem value="OR-3">Operating Room 3</SelectItem>
                    <SelectItem value="ICU">Intensive Care Unit</SelectItem>
                    <SelectItem value="Emergency">Emergency Department</SelectItem>
                    <SelectItem value="Ward-A">Ward A</SelectItem>
                    <SelectItem value="Ward-B">Ward B</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Issue Time</Label>
                  <Input 
                    type="time" 
                    defaultValue={new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
                    readOnly
                  />
                </div>
                <div>
                  <Label>Issue Date</Label>
                  <Input 
                    type="date" 
                    defaultValue={new Date().toISOString().split('T')[0]}
                    readOnly
                  />
                </div>
              </div>

              <Button type="submit" className="w-full">
                Issue Item
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Available Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {availableItems.map((item) => (
                <div key={item.id} className="p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium">{item.id}</h4>
                      <p className="text-sm text-gray-600">{item.items}</p>
                      <p className="text-xs text-gray-500">Qty: {item.quantity} | Ready: {item.readyTime}</p>
                    </div>
                    <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            Issue History
          </CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input 
              placeholder="Search issued items..." 
              className="pl-10 max-w-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-3">Issue ID</th>
                  <th className="text-left p-3">Request ID</th>
                  <th className="text-left p-3">Department</th>
                  <th className="text-left p-3">Items</th>
                  <th className="text-left p-3">Quantity</th>
                  <th className="text-left p-3">Issue Time</th>
                  <th className="text-left p-3">Issue Date</th>
                  <th className="text-left p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredIssuedItems.map((item) => (
                  <tr key={item.id} className="border-b hover:bg-gray-50">
                    <td className="p-3 font-medium">{item.id}</td>
                    <td className="p-3">{item.requestId}</td>
                    <td className="p-3">{item.department}</td>
                    <td className="p-3">{item.items}</td>
                    <td className="p-3">{item.quantity}</td>
                    <td className="p-3">{item.issuedTime}</td>
                    <td className="p-3">{item.issuedDate}</td>
                    <td className="p-3">
                      <span className="px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                        {item.status}
                      </span>
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
            <CardTitle className="flex items-center gap-2 text-blue-600">
              <CheckCircle className="w-5 h-5" />
              Available
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{availableItems.length}</div>
            <p className="text-sm text-gray-600">Ready for issue</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <Send className="w-5 h-5" />
              Issued Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {issuedItems.filter(item => item.issuedDate === new Date().toISOString().split('T')[0]).length}
            </div>
            <p className="text-sm text-gray-600">Items issued</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-600">
              <Clock className="w-5 h-5" />
              Total Issued
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{issuedItems.length}</div>
            <p className="text-sm text-gray-600">All time</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default IssueItem;
