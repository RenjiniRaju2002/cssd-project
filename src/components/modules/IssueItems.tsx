import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

const IssueItems = () => {
  const { toast } = useToast();
  const [items, setItems] = useState([]);
  const [selectedItem, setSelectedItem] = useState("");
  const [selectedQuantity, setSelectedQuantity] = useState("");

  // Load available items on component mount
  useEffect(() => {
    loadAvailableItems();
  }, []);

  // Set up storage event listener for automatic updates
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'stockItems' || e.key === 'sterilizationProcesses' || e.key === 'issuedItems') {
        loadAvailableItems();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Set up polling for updates every 30 seconds
  useEffect(() => {
    const pollInterval = setInterval(loadAvailableItems, 30000);
    return () => clearInterval(pollInterval);
  }, []);

  const loadAvailableItems = () => {
    try {
      // Get stock items from localStorage
      const stock = localStorage.getItem('stockItems');
      const parsedStock = stock ? JSON.parse(stock) : [];
      
      // Get completed processes from localStorage
      const processes = localStorage.getItem('sterilizationProcesses');
      const parsedProcesses = processes ? JSON.parse(processes) : [];
      const completedProcesses = parsedProcesses.filter(p => p.status === "Completed");

      // Get issued items to prevent re-issuing
      const issuedItems = localStorage.getItem('issuedItems');
      const parsedIssuedItems = issuedItems ? JSON.parse(issuedItems) : [];

      // Combine stock items with sterilized items, ensuring we don't double-count
      const availableItems = parsedStock
        .filter(item => item.status === "In Stock")
        .map(stockItem => {
          // Find matching completed processes
          const matchingProcesses = completedProcesses.filter(p => p.itemId === stockItem.id);
          
          // Calculate total available quantity
          const totalQuantity = stockItem.quantity + matchingProcesses.length;
          
          return {
            ...stockItem,
            quantity: totalQuantity,
            available: totalQuantity > 0,
            lastSterilized: matchingProcesses.length > 0 
              ? new Date(matchingProcesses[0].endTime).toLocaleString()
              : "Not sterilized yet"
          };
        })
        .filter(item => item.available); // Only show items that are actually available

      // Remove items that have been fully issued
      const filteredItems = availableItems.filter(item => {
        const issuedForThisItem = parsedIssuedItems.filter(i => i.itemId === item.id);
        const totalIssued = issuedForThisItem.reduce((sum, i) => sum + i.quantity, 0);
        return item.quantity > totalIssued;
      });

      setItems(filteredItems);
    } catch (error) {
      console.error('Error loading available items:', error);
      toast({
        title: "Error",
        description: "Failed to load available items",
        variant: "destructive"
      });
    }
  };

  const handleIssueItem = () => {
    if (!selectedItem || !selectedQuantity) {
      toast({
        title: "Error",
        description: "Please select an item and quantity",
        variant: "destructive"
      });
      return;
    }

    try {
      const selectedItemData = items.find(item => item.id === selectedItem);
      if (!selectedItemData) {
        throw new Error("Selected item not found");
      }

      const requestedQuantity = parseInt(selectedQuantity);
      if (requestedQuantity > selectedItemData.quantity) {
        toast({
          title: "Error",
          description: `Only ${selectedItemData.quantity} items available`,
          variant: "destructive"
        });
        return;
      }

      // Get existing issued items
      const issuedItems = localStorage.getItem('issuedItems');
      const parsedIssuedItems = issuedItems ? JSON.parse(issuedItems) : [];

      // Create new issued item
      const newIssuedItem = {
        id: `ISS${String(parsedIssuedItems.length + 1).padStart(3, '0')}`,
        itemId: selectedItem,
        name: selectedItemData.name,
        quantity: requestedQuantity,
        issuedTime: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
        issuedDate: new Date().toISOString().split('T')[0],
        status: "Issued"
      };

      // Update stock levels
      const stock = localStorage.getItem('stockItems');
      const parsedStock = stock ? JSON.parse(stock) : [];
      const updatedStock = parsedStock.map(item => 
        item.id === selectedItem 
          ? { ...item, quantity: item.quantity - requestedQuantity }
          : item
      );
      
      // Update localStorage
      localStorage.setItem('issuedItems', JSON.stringify([...parsedIssuedItems, newIssuedItem]));
      localStorage.setItem('stockItems', JSON.stringify(updatedStock));

      // Reset form
      setSelectedItem("");
      setSelectedQuantity("");

      // Reload available items
      loadAvailableItems();

      toast({
        title: "Success",
        description: `${requestedQuantity} ${selectedItemData.name} issued successfully`,
      });
    } catch (error) {
      console.error('Error issuing item:', error);
      toast({
        title: "Error",
        description: "Failed to issue item",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 bg-gray-50 min-h-screen p-4 sm:p-6">
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6 border-0">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Issue Items</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">Issue sterilized items to departments</p>
      </div>

      <Card className="bg-white shadow-sm border-0">
        <CardHeader className="border-b border-gray-200 p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-gray-900 text-lg">
            <span>Issue Item</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <form className="space-y-4">
            <div>
              <Label htmlFor="item" className="text-gray-700 text-sm">Select Item</Label>
              <Select value={selectedItem} onValueChange={setSelectedItem} required>
                <SelectTrigger className="border-gray-300 hover:border-gray-400 focus:border-[#00A8E8] mt-1">
                  <SelectValue placeholder="Choose item to issue" />
                </SelectTrigger>
                <SelectContent className="bg-white border-0">
                  {items.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} ({item.quantity} available)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="quantity" className="text-gray-700 text-sm">Quantity</Label>
              <Input
                type="number"
                min="1"
                value={selectedQuantity}
                onChange={(e) => setSelectedQuantity(e.target.value)}
                className="mt-1"
                placeholder="Enter quantity"
              />
            </div>

            <Button 
              type="button"
              onClick={handleIssueItem}
              className="w-full bg-[#00A8E8] hover:bg-[#0088cc] text-white"
            >
              Issue Item
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="bg-white shadow-sm border-0">
        <CardHeader className="border-b border-gray-200 p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-gray-900 text-lg">
            <span>Available Items</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="space-y-4">
            {items.length === 0 ? (
              <p className="text-gray-500 text-sm">No available items found</p>
            ) : (
              items.map((item) => (
                <div key={item.id} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm">{item.name} ({item.quantity} available)</h3>
                  </div>
                  <Badge className="bg-green-100 text-green-800 text-xs px-2 py-1">
                    {item.category}
                  </Badge>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default IssueItems;
