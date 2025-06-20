import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Send, Clock, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "./Header";
import Footer from "./Footer";
import initialData from "../../data/issueItemData.json";

const IssueItem = ({ sidebarCollapsed, toggleSidebar }) => {
  const [issuedItems, setIssuedItems] = useState(() => {
    const savedItems = localStorage.getItem('issuedItems');
    return savedItems ? JSON.parse(savedItems) : [
      { id: "ISS001", requestId: "REQ001", department: "OR-1", items: "Surgery Kit", quantity: 2, issuedTime: "14:30", issuedDate: "2024-06-10", status: "Issued" },
      { id: "ISS002", requestId: "REQ002", department: "OR-2", items: "Instruments", quantity: 3, issuedTime: "15:15", issuedDate: "2024-06-10", status: "Issued" }
    ];
  });
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('issuedItems', JSON.stringify(issuedItems));
  }, [issuedItems]);

  const availableItems = initialData.availableItems;

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
    <>
    <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
    <div className="space-y-4 sm:space-y-5 bg-[#ffffff] min-h-40 p-1 sm:p-5 border-t-4 border-[#038ba4] m-10 mt-0 ">
      

      <div className="bg-white shadow-sm p-4 border-l-4 border-[#038ba4]">
        <h1 className="text-xl font-bold text-gray-900" style={{color:"#038ba4"}}>Issue Item</h1>
        <p className="text-gray-600">Issue sterilized items to departments and outlets</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white shadow-lg border-0">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl text-gray-900 mb-4">
              <Send className="w-5 h-5 text-[#038ba4]" />
              Issue Items
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <form onSubmit={handleIssueItem} className="space-y-4">
              <div>
                <Label htmlFor="requestId" className="text-gray-700">Request ID</Label>
                <Select name="requestId" required>
                  <SelectTrigger className="border-gray-300">
                    <SelectValue placeholder="Select request to issue" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-0">
                    {availableItems.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.id} - {item.items} ({item.quantity} units)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="outlet" className="text-gray-700">Department/Outlet</Label>
                <Select name="outlet" required>
                  <SelectTrigger className="border-gray-300">
                    <SelectValue placeholder="Select destination" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-0">
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
                  <Label className="text-gray-700">Issue Time</Label>
                  <Input 
                    type="time" 
                    defaultValue={new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' })}
                    readOnly
                    className="border-gray-300 bg-gray-50"
                  />
                </div>
                <div>
                  <Label className="text-gray-700">Issue Date</Label>
                  <Input 
                    type="date" 
                    defaultValue={new Date().toISOString().split('T')[0]}
                    readOnly
                    className="border-gray-300 bg-gray-50"
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-[#038ba4] hover:bg-[#038ba4]/90 text-white"
              >
                Issue Item
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg border-0">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="flex items-center gap-2 text-lg sm:text-xl text-gray-900 mb-4">
              <CheckCircle className="w-5 h-5 text-[#038ba4]" />
              Available Items
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {availableItems.map((item) => (
                <div key={item.id} className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 bg-white">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-gray-900">{item.id}</h4>
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

      <Card className="bg-white shadow-lg border-0">
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="flex items-center gap-2 text-lg sm:text-xl text-gray-900 mb-4">
            <Clock className="w-5 h-5 text-[#038ba4]" />
            Issue History
          </CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input 
              placeholder="Search issued items..." 
              className="pl-10 max-w-sm border-gray-300"
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
                  <th className="text-left p-3 text-gray-700 font-medium">Issue ID</th>
                  <th className="text-left p-3 text-gray-700 font-medium">Request ID</th>
                  <th className="text-left p-3 text-gray-700 font-medium">Department</th>
                  <th className="text-left p-3 text-gray-700 font-medium">Items</th>
                  <th className="text-left p-3 text-gray-700 font-medium">Quantity</th>
                  <th className="text-left p-3 text-gray-700 font-medium">Issue Time</th>
                  <th className="text-left p-3 text-gray-700 font-medium">Issue Date</th>
                  <th className="text-left p-3 text-gray-700 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredIssuedItems.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-3 font-medium text-gray-900">{item.id}</td>
                    <td className="p-3 text-gray-900">{item.requestId}</td>
                    <td className="p-3 text-gray-900">{item.department}</td>
                    <td className="p-3 text-gray-900">{item.items}</td>
                    <td className="p-3 text-gray-900">{item.quantity}</td>
                    <td className="p-3 text-gray-900">{item.issuedTime}</td>
                    <td className="p-3 text-gray-900">{item.issuedDate}</td>
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
        <Card className="bg-white shadow-lg border-0">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="flex items-center gap-2 text-blue-600 text-base">
              <CheckCircle className="w-5 h-5" />
              Available
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-gray-900">{availableItems.length}</div>
            <p className="text-sm text-gray-600">Ready for issue</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg border-0">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="flex items-center gap-2 text-green-600 text-base">
              <Send className="w-5 h-5" />
              Issued Today
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-gray-900">
              {issuedItems.filter(item => item.issuedDate === new Date().toISOString().split('T')[0]).length}
            </div>
            <p className="text-sm text-gray-600">Items issued</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg border-0">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="flex items-center gap-2 text-purple-600 text-base">
              <Clock className="w-5 h-5" />
              Total Issued
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="text-3xl font-bold text-gray-900">{issuedItems.length}</div>
            <p className="text-sm text-gray-600">All time</p>
          </CardContent>
        </Card>
      </div>
    </div>
    <Footer />
    </>
  );
};

export default IssueItem;