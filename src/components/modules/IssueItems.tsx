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

  // Load available items from completed sterilization processes
  useEffect(() => {
    const loadAvailableItems = () => {
      try {
        // Get completed processes from localStorage
        const processes = localStorage.getItem('sterilizationProcesses');
        if (!processes) return;

        const parsedProcesses = JSON.parse(processes);
        const completedProcesses = parsedProcesses.filter(p => p.status === "Completed");

        // Extract unique items from completed processes
        const availableItems = Array.from(new Set(completedProcesses.map(p => p.itemId)));
        setItems(availableItems);
      } catch (error) {
        console.error('Error loading available items:', error);
        toast({
          title: "Error",
          description: "Failed to load available items",
          variant: "destructive"
        });
      }
    };

    loadAvailableItems();
  }, [toast]);

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
      // Get current stock from localStorage
      const stock = localStorage.getItem('cssdStock');
      const parsedStock = stock ? JSON.parse(stock) : {};

      // Update stock quantity
      const updatedStock = {
        ...parsedStock,
        [selectedItem]: {
          ...(parsedStock[selectedItem] || {}),
          quantity: (parsedStock[selectedItem]?.quantity || 0) - parseInt(selectedQuantity)
        }
      };

      // Save updated stock
      localStorage.setItem('cssdStock', JSON.stringify(updatedStock));

      // Reset form
      setSelectedItem("");
      setSelectedQuantity("");

      toast({
        title: "Success",
        description: `Item ${selectedItem} issued successfully`,
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
                    <SelectItem key={item} value={item}>
                      {item}
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
              className="bg-[#00A8E8] hover:bg-[#0088cc] text-white"
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
                <div key={item} className="flex justify-between items-center p-3 border border-gray-200 rounded-lg">
                  <div>
                    <h3 className="font-medium text-gray-900 text-sm">{item}</h3>
                  </div>
                  <Badge className="bg-green-100 text-green-800 text-xs px-2 py-1">
                    Available
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
