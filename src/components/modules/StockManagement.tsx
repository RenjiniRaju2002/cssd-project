import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Package, Edit, Trash2, Eye } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Header from "./Header";
import Footer from "./Footer";
import initialData from "../../data/stockManagementData.json";


const StockManagement = ({ sidebarCollapsed, toggleSidebar }) => {
  const [stockItems, setStockItems] = useState(() => {
    const savedItems = localStorage.getItem('stockItems');
    return savedItems ? JSON.parse(savedItems) : initialData.stockItems;
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [editingItem, setEditingItem] = useState(null);
  const [showAddItem, setShowAddItem] = useState(false);
  const [showEditItem, setShowEditItem] = useState(false);

  useEffect(() => {
    const loadStockItems = () => {
      try {
        // Load stock items
        const stock = localStorage.getItem('stockItems');
        const parsedStock = stock ? JSON.parse(stock) : [];

        // Load sterilization processes
        const processes = localStorage.getItem('sterilizationProcesses');
        const parsedProcesses = processes ? JSON.parse(processes) : [];
        const inProgressItems = parsedProcesses.filter(p => p.status === "In Progress").map(p => p.itemId);

        // Update stock items with sterilization status
        const updatedStock = parsedStock.map(item => ({
          ...item,
          status: inProgressItems.includes(item.id) ? "In Sterilization" : item.status
        }));

        setStockItems(updatedStock);
      } catch (error) {
        console.error('Error loading stock items:', error);
      }
    };

    // Load initial data
    loadStockItems();

    // Listen for localStorage changes
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === 'stockItems' || event.key === 'sterilizationProcesses') {
        loadStockItems();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Stock":
        return "bg-green-100 text-green-800";
      case "Low Stock":
        return "bg-red-100 text-red-800";
      case "In Sterilization":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const handleAddItem = (event: React.FormEvent) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const newItem = {
      id: `STK${String(stockItems.length + 1).padStart(3, '0')}`,
      name: formData.get('itemName') as string,
      category: formData.get('category') as string,
      quantity: parseInt(formData.get('quantity') as string),
      location: formData.get('location') as string,
      minLevel: parseInt(formData.get('minLevel') as string),
      status: parseInt(formData.get('quantity') as string) > parseInt(formData.get('minLevel') as string) ? "In Stock" : "Low Stock"
    };
    
    const updatedItems = [...stockItems, newItem];
    setStockItems(updatedItems);
    localStorage.setItem('stockItems', JSON.stringify(updatedItems));
    
    setShowAddItem(false);
  };

  const handleEditItem = (event: React.FormEvent) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const updatedItem = {
      ...editingItem,
      name: formData.get('itemName') as string,
      category: formData.get('category') as string,
      quantity: parseInt(formData.get('quantity') as string),
      location: formData.get('location') as string,
      minLevel: parseInt(formData.get('minLevel') as string),
      status: parseInt(formData.get('quantity') as string) > parseInt(formData.get('minLevel') as string) ? "In Stock" : "Low Stock"
    };
    
    const updatedItems = stockItems.map(item => item.id === editingItem.id ? updatedItem : item);
    setStockItems(updatedItems);
    localStorage.setItem('stockItems', JSON.stringify(updatedItems));
    
    setShowEditItem(false);
    setEditingItem(null);
  };

  const handleDeleteItem = (itemId: string) => {
    const updatedItems = stockItems.filter(item => item.id !== itemId);
    setStockItems(updatedItems);
    localStorage.setItem('stockItems', JSON.stringify(updatedItems));
  };

  const openEditDialog = (item: any) => {
    setEditingItem(item);
    setShowEditItem(true);
  };

  const viewItemDetails = (item: any) => {
    console.log(item);
  };

  const filteredItems = stockItems.filter(item =>
    item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockCount = stockItems.filter(item => item.status === "Low Stock").length;
  const totalItems = stockItems.length;

  return (
    <>
    <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
    <div className="space-y-4 sm:space-y-5 bg-[#ffffff] min-h-40 p-1 sm:p-5 border-t-4 border-[#038ba4] m-10 mt-0">
       <div className="bg-white shadow-sm border-l-4 border-[#038ba4]">
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-4 border-0">
        <h1 className="text-xl sm:text-xl font-bold text-gray-900" style={{color:"#038ba4"}}>Stock Management</h1>
        <p className="text-gray-600">Manage inventory items and stock levels</p>
      </div>
      </div>

      <Card className="bg-white shadow-sm">
        <CardHeader className="border-b border-gray-200">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2 text-gray-900 text-xl">
              <Package className="w-5 h-5 text-[#038ba4]" />
              Inventory Management
            </CardTitle>
            <Dialog open={showAddItem} onOpenChange={setShowAddItem}>
              <DialogTrigger asChild>
                <Button className="bg-[#038ba4] hover:bg-[#038ba4]/90 text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Item
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white">
                <DialogHeader>
                  <DialogTitle className="text-gray-900">Add New Item</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddItem} className="space-y-4">
                  <div>
                    <Label htmlFor="itemName" className="text-gray-700">Item Name</Label>
                    <Input name="itemName" placeholder="Enter item name" required className="border-gray-300" />
                  </div>
                  <div>
                    <Label htmlFor="category" className="text-gray-700">Category</Label>
                    <Select name="category" required>
                      <SelectTrigger className="border-gray-300">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="Reusable">Reusable</SelectItem>
                        <SelectItem value="Non-Reusable">Non-Reusable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="quantity" className="text-gray-700">Quantity</Label>
                      <Input type="number" name="quantity" min="0" required className="border-gray-300" />
                    </div>
                    <div>
                      <Label htmlFor="minLevel" className="text-gray-700">Min Level</Label>
                      <Input type="number" name="minLevel" min="0" required className="border-gray-300" />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="location" className="text-gray-700">Location</Label>
                    <Input name="location" placeholder="Storage location" required className="border-gray-300" />
                  </div>
                  <Button type="submit" className="w-full bg-[#038ba4] hover:bg-[#038ba4]/90 text-white">
                    Add Item
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input 
              placeholder="Search inventory..." 
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
                  <th className="text-left p-4 text-gray-700 font-medium">Item ID</th>
                  <th className="text-left p-4 text-gray-700 font-medium">Name</th>
                  <th className="text-left p-4 text-gray-700 font-medium">Category</th>
                  <th className="text-left p-4 text-gray-700 font-medium">Quantity</th>
                  <th className="text-left p-4 text-gray-700 font-medium">Location</th>
                  <th className="text-left p-4 text-gray-700 font-medium">Status</th>
                  <th className="text-left p-4 text-gray-700 font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-900">{item.id}</td>
                    <td className="p-4 text-gray-900">{item.name}</td>
                    <td className="p-4 text-gray-600">{item.category}</td>
                    <td className="p-4 text-gray-900">{item.quantity}</td>
                    <td className="p-4 text-gray-600">{item.location}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(item.status)}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openEditDialog(item)}
                          className="text-black hover:bg-gray-100 hover:text-black focus:text-black active:text-black"
                        >
                          <Edit className="w-4 h-4 mr-2" />
                          Edit
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleDeleteItem(item.id)}
                          className="text-black hover:bg-gray-100 hover:text-black focus:text-black active:text-black"
                        >
                          <Trash2 className="w-4 h-4" />
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

      {/* Edit Item Dialog */}
      <Dialog open={showEditItem} onOpenChange={setShowEditItem}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="text-gray-900">Edit Item</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <form onSubmit={handleEditItem} className="space-y-4">
              <div>
                <Label htmlFor="itemName" className="text-gray-700">Item Name</Label>
                <Input 
                  name="itemName" 
                  defaultValue={editingItem.name}
                  required 
                  className="border-gray-300" 
                />
              </div>
              <div>
                <Label htmlFor="category" className="text-gray-700">Category</Label>
                <Select name="category" defaultValue={editingItem.category} required>
                  <SelectTrigger className="border-gray-300">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    <SelectItem value="Reusable">Reusable</SelectItem>
                    <SelectItem value="Non-Reusable">Non-Reusable</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="quantity" className="text-gray-700">Quantity</Label>
                  <Input 
                    type="number" 
                    name="quantity" 
                    defaultValue={editingItem.quantity}
                    min="0" 
                    required 
                    className="border-gray-300" 
                  />
                </div>
                <div>
                  <Label htmlFor="minLevel" className="text-gray-700">Min Level</Label>
                  <Input 
                    type="number" 
                    name="minLevel" 
                    defaultValue={editingItem.minLevel}
                    min="0" 
                    required 
                    className="border-gray-300" 
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="location" className="text-gray-700">Location</Label>
                <Input 
                  name="location" 
                  defaultValue={editingItem.location}
                  required 
                  className="border-gray-300" 
                />
              </div>
              <Button type="submit" className="w-full bg-[#038ba4] hover:bg-[#038ba4]/90 text-white">
                Update Item
              </Button>
            </form>
          )}
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-white shadow-sm">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="flex items-center gap-2 text-blue-600 text-base">
              <Package className="w-5 h-5" />
              Total Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{totalItems}</div>
            <p className="text-sm text-gray-600">Total items in stock</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="flex items-center gap-2 text-orange-600 text-base">
              <Edit className="w-5 h-5" />
              Low Stock Items
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">{lowStockCount}</div>
            <p className="text-sm text-gray-600">Items below minimum level</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader className="border-b border-gray-200">
            <CardTitle className="flex items-center gap-2 text-green-600 text-base">
              <Eye className="w-5 h-5" />
              Categories
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900">2</div>
            <p className="text-sm text-gray-600">Number of categories</p>
          </CardContent>
        </Card>
      </div>
    </div>
      <Footer />
     </>
  );
};

export default StockManagement;
