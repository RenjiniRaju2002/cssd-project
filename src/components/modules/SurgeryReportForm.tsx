import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { X } from "lucide-react";

const SurgeryReportForm = ({ onClose }: { onClose: () => void }) => {
  const { toast } = useToast();
  const [surgeryData, setSurgeryData] = useState({
    surgeryId: "",
    surgeryType: "",
    department: "",
    date: format(new Date(), 'yyyy-MM-dd'),
    beforeCount: 0,
    afterCount: 0,
    consumed: 0,
    itemsUsed: []
  });
  const [items, setItems] = useState([]);
  const [newItem, setNewItem] = useState({
    name: "",
    quantity: 0
  });

  useEffect(() => {
    // Load existing items from localStorage
    const savedItems = JSON.parse(localStorage.getItem('surgeryReportItems') || '[]');
    setItems(savedItems);
  }, []);

  const handleAddItem = () => {
    if (!newItem.name || newItem.quantity <= 0) return;
    
    const updatedItems = [...items, { ...newItem, id: `ITEM-${items.length + 1}` }];
    setItems(updatedItems);
    
    // Save to localStorage
    localStorage.setItem('surgeryReportItems', JSON.stringify(updatedItems));
    
    // Reset form
    setNewItem({ name: "", quantity: 0 });
  };

  const handleRemoveItem = (itemId: string) => {
    const updatedItems = items.filter(item => item.id !== itemId);
    setItems(updatedItems);
    localStorage.setItem('surgeryReportItems', JSON.stringify(updatedItems));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Load existing reports
      const existingReports = JSON.parse(localStorage.getItem('surgeryReports') || '[]');
      
      // Add new report
      const newReport = {
        ...surgeryData,
        id: `SURG-${existingReports.length + 1}`,
        itemsUsed: items
      };
      
      // Save to localStorage
      localStorage.setItem('surgeryReports', JSON.stringify([...existingReports, newReport]));
      
      // Update consumed and after count
      const totalConsumed = items.reduce((sum, item) => sum + item.quantity, 0);
      setSurgeryData(prev => ({
        ...prev,
        consumed: totalConsumed,
        afterCount: prev.beforeCount - totalConsumed
      }));
      
      toast({
        title: "Success",
        description: "Surgery report added successfully",
      });
      
      // Reset form
      setSurgeryData({
        surgeryId: "",
        surgeryType: "",
        department: "",
        date: format(new Date(), 'yyyy-MM-dd'),
        beforeCount: 0,
        afterCount: 0,
        consumed: 0,
        itemsUsed: []
      });
      setItems([]);
      onClose();
    } catch (error) {
      console.error('Error adding surgery report:', error);
      toast({
        title: "Error",
        description: "Failed to add surgery report",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add Surgery Report</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Surgery ID</Label>
              <Input
                value={surgeryData.surgeryId}
                onChange={(e) => setSurgeryData({ ...surgeryData, surgeryId: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Surgery Type</Label>
              <Select value={surgeryData.surgeryType} onValueChange={(value) => setSurgeryData({ ...surgeryData, surgeryType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select surgery type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="General">General Surgery</SelectItem>
                  <SelectItem value="Orthopedic">Orthopedic Surgery</SelectItem>
                  <SelectItem value="Neurosurgery">Neurosurgery</SelectItem>
                  <SelectItem value="Cardiac">Cardiac Surgery</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Department</Label>
              <Select value={surgeryData.department} onValueChange={(value) => setSurgeryData({ ...surgeryData, department: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Surgery">Surgery</SelectItem>
                  <SelectItem value="ICU">ICU</SelectItem>
                  <SelectItem value="Emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Date</Label>
              <Input
                type="date"
                value={surgeryData.date}
                onChange={(e) => setSurgeryData({ ...surgeryData, date: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Before Count</Label>
              <Input
                type="number"
                value={surgeryData.beforeCount}
                onChange={(e) => setSurgeryData({ ...surgeryData, beforeCount: parseInt(e.target.value) || 0 })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>After Count</Label>
              <Input
                type="number"
                value={surgeryData.afterCount}
                onChange={(e) => setSurgeryData({ ...surgeryData, afterCount: parseInt(e.target.value) || 0 })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Consumed</Label>
              <Input
                type="number"
                value={surgeryData.consumed}
                onChange={(e) => setSurgeryData({ ...surgeryData, consumed: parseInt(e.target.value) || 0 })}
                required
              />
            </div>
            
            {/* Items Used Section */}
            <div>
              <Label>Items Used</Label>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Item Name</Label>
                    <Input
                      value={newItem.name}
                      onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label>Quantity</Label>
                    <Input
                      type="number"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem({ ...newItem, quantity: parseInt(e.target.value) || 0 })}
                      required
                    />
                  </div>
                </div>
                <Button onClick={handleAddItem} type="button">
                  Add Item
                </Button>
              </div>
              
              {items.length > 0 && (
                <div className="mt-4 space-y-2">
                  <h3 className="text-sm font-medium">Added Items:</h3>
                  {items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                      <span>{item.name} - {item.quantity}</span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveItem(item.id)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Adding..." : "Add Report"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default SurgeryReportForm;
