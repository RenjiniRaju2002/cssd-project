import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { CalendarIcon, Download, BarChart3, TrendingUp, TrendingDown, Plus } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

interface ConsumptionRecord {
  id: string;
  surgery: string;
  department: string;
  date: string;
  beforeCount: number;
  afterCount: number;
  consumed: number;
  items: string;
}

const ConsumptionReports = () => {
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [reportGenerated, setReportGenerated] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const [consumptionData, setConsumptionData] = useState<ConsumptionRecord[]>([
    { id: "SURG001", surgery: "Cardiac Surgery", department: "OR-1", date: "2024-06-10", beforeCount: 25, afterCount: 18, consumed: 7, items: "Surgery Kit, Forceps, Clamps" },
    { id: "SURG002", surgery: "Knee Replacement", department: "OR-2", date: "2024-06-10", beforeCount: 15, afterCount: 12, consumed: 3, items: "Orthopedic Kit, Drills" },
    { id: "SURG003", surgery: "Appendectomy", department: "OR-1", date: "2024-06-09", beforeCount: 20, afterCount: 17, consumed: 3, items: "Basic Surgery Kit" }
  ]);

  // Form state
  const [formData, setFormData] = useState({
    surgeryId: "",
    surgery: "",
    department: "",
    date: "",
    beforeCount: "",
    afterCount: "",
    items: ""
  });

  const weeklyData = [
    { week: "Week 1", consumption: 45, sterilized: 52 },
    { week: "Week 2", consumption: 38, sterilized: 41 },
    { week: "Week 3", consumption: 42, sterilized: 48 },
    { week: "Week 4", consumption: 51, sterilized: 55 }
  ];

  const departmentData = [
    { department: "OR-1", count: 28 },
    { department: "OR-2", count: 22 },
    { department: "OR-3", count: 15 },
    { department: "ICU", count: 12 },
    { department: "Emergency", count: 8 }
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmitForm = () => {
    // Validate form
    if (!formData.surgeryId || !formData.surgery || !formData.department || 
        !formData.date || !formData.beforeCount || !formData.afterCount || !formData.items) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive"
      });
      return;
    }

    const beforeCount = parseInt(formData.beforeCount);
    const afterCount = parseInt(formData.afterCount);
    const consumed = beforeCount - afterCount;

    if (beforeCount < 0 || afterCount < 0) {
      toast({
        title: "Invalid Count",
        description: "Before and after counts must be positive numbers.",
        variant: "destructive"
      });
      return;
    }

    if (afterCount > beforeCount) {
      toast({
        title: "Invalid Count",
        description: "After count cannot be greater than before count.",
        variant: "destructive"
      });
      return;
    }

    const newRecord: ConsumptionRecord = {
      id: formData.surgeryId,
      surgery: formData.surgery,
      department: formData.department,
      date: formData.date,
      beforeCount: beforeCount,
      afterCount: afterCount,
      consumed: consumed,
      items: formData.items
    };

    setConsumptionData(prev => [...prev, newRecord]);
    
    // Reset form
    setFormData({
      surgeryId: "",
      surgery: "",
      department: "",
      date: "",
      beforeCount: "",
      afterCount: "",
      items: ""
    });

    setIsDialogOpen(false);

    toast({
      title: "Record Added Successfully",
      description: `Surgery consumption record for ${formData.surgery} has been added.`,
    });
  };

  const generateReport = () => {
    if (!dateFrom || !dateTo) {
      toast({
        title: "Select Date Range",
        description: "Please select both from and to dates to generate the report.",
        variant: "destructive"
      });
      return;
    }
    
    console.log("Generating report with parameters:", {
      dateFrom: format(dateFrom, "dd/MM/yyyy"),
      dateTo: format(dateTo, "dd/MM/yyyy"),
      department: selectedDepartment
    });
    
    setReportGenerated(true);
    toast({
      title: "Report Generated Successfully",
      description: `Consumption report generated for ${selectedDepartment === "all" ? "all departments" : selectedDepartment} from ${format(dateFrom, "dd/MM/yyyy")} to ${format(dateTo, "dd/MM/yyyy")}.`,
    });
  };

  const exportToPDF = () => {
    if (!reportGenerated) {
      toast({
        title: "Generate Report First",
        description: "Please generate a report before exporting to PDF.",
        variant: "destructive"
      });
      return;
    }
    
    const reportData = {
      dateFrom: dateFrom ? format(dateFrom, "dd/MM/yyyy") : "N/A",
      dateTo: dateTo ? format(dateTo, "dd/MM/yyyy") : "N/A",
      department: selectedDepartment,
      totalConsumption: consumptionData.reduce((sum, item) => sum + item.consumed, 0),
      data: consumptionData
    };
    
    console.log("Exporting to PDF with data:", reportData);
    
    // Simulate PDF download
    const element = document.createElement('a');
    const file = new Blob([JSON.stringify(reportData, null, 2)], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `consumption-report-${format(new Date(), 'yyyy-MM-dd')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast({
      title: "PDF Export Successful",
      description: `Consumption report exported for ${selectedDepartment === "all" ? "all departments" : selectedDepartment}.`,
    });
  };

  const exportToExcel = () => {
    if (!reportGenerated) {
      toast({
        title: "Generate Report First",
        description: "Please generate a report before exporting to Excel.",
        variant: "destructive"
      });
      return;
    }
    
    const csvContent = [
      ['Surgery ID', 'Surgery Type', 'Department', 'Date', 'Before Count', 'After Count', 'Consumed', 'Items Used'],
      ...consumptionData.map(item => [
        item.id, item.surgery, item.department, item.date, 
        item.beforeCount, item.afterCount, item.consumed, item.items
      ])
    ].map(row => row.join(',')).join('\n');
    
    const element = document.createElement('a');
    const file = new Blob([csvContent], { type: 'text/csv' });
    element.href = URL.createObjectURL(file);
    element.download = `consumption-report-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast({
      title: "Excel Export Successful",
      description: "Consumption report has been exported to Excel successfully.",
    });
  };

  const totalConsumption = consumptionData.reduce((sum, item) => sum + item.consumed, 0);
  const averageConsumption = (totalConsumption / consumptionData.length).toFixed(1);

  return (
    <div className="space-y-4 sm:space-y-6 bg-background min-h-screen p-4 sm:p-6">
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Consumption Reports</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">Generate and analyze item consumption reports</p>
      </div>

      
      <Card className="bg-white shadow-sm">
        <CardHeader className="border-b border-gray-200 p-4 sm:p-6">
          <CardTitle className="flex items-center gap-2 text-gray-900 text-lg">
            <BarChart3 className="w-5 h-5 text-[#00A8E8]" />
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-gray-700 text-sm">From Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left border-gray-300 hover:border-gray-400 mt-1">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom ? format(dateFrom, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white">
                  <Calendar
                    mode="single"
                    selected={dateFrom}
                    onSelect={setDateFrom}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label className="text-gray-700 text-sm">To Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left border-gray-300 hover:border-gray-400 mt-1">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateTo ? format(dateTo, "PPP") : "Select date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white">
                  <Calendar
                    mode="single"
                    selected={dateTo}
                    onSelect={setDateTo}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div>
              <Label className="text-gray-700 text-sm">Department</Label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="border-gray-300 hover:border-gray-400 focus:border-[#00A8E8] mt-1">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="all">All Departments</SelectItem>
                  <SelectItem value="OR-1">OR-1</SelectItem>
                  <SelectItem value="OR-2">OR-2</SelectItem>
                  <SelectItem value="OR-3">OR-3</SelectItem>
                  <SelectItem value="ICU">ICU</SelectItem>
                  <SelectItem value="Emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button onClick={generateReport} className="w-full bg-[#00A8E8] hover:bg-[#0088cc] text-white">
                Generate Report
              </Button>
            </div>
          </div>

          <div className="flex gap-4 mt-4">
            <Button 
              variant="outline" 
              onClick={exportToPDF} 
              className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50"
              disabled={!reportGenerated}
            >
              <Download className="w-4 h-4" />
              Export PDF
            </Button>
            <Button 
              variant="outline" 
              onClick={exportToExcel} 
              className="flex items-center gap-2 border-gray-300 text-gray-700 hover:bg-gray-50"
              disabled={!reportGenerated}
            >
              <Download className="w-4 h-4" />
              Export Excel
            </Button>
          </div>
        </CardContent>
      </Card>

      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        <Card className="bg-white shadow-sm">
          <CardHeader className="border-b border-gray-200 p-4">
            <CardTitle className="flex items-center gap-2 text-blue-600 text-base">
              <BarChart3 className="w-5 h-5" />
              Total Consumption
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">{totalConsumption}</div>
            <p className="text-xs sm:text-sm text-gray-600">Items consumed</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader className="border-b border-gray-200 p-4">
            <CardTitle className="flex items-center gap-2 text-green-600 text-base">
              <TrendingUp className="w-5 h-5" />
              Average per Surgery
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">{averageConsumption}</div>
            <p className="text-xs sm:text-sm text-gray-600">Items per procedure</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader className="border-b border-gray-200 p-4">
            <CardTitle className="flex items-center gap-2 text-purple-600 text-base">
              <BarChart3 className="w-5 h-5" />
              Total Surgeries
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">{consumptionData.length}</div>
            <p className="text-xs sm:text-sm text-gray-600">Procedures tracked</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="bg-white shadow-sm">
          <CardHeader className="border-b border-gray-200 p-4 sm:p-6">
            <CardTitle className="text-lg text-gray-900">Weekly Consumption Trend</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={weeklyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="week" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="consumption" stroke="#3b82f6" strokeWidth={2} />
                <Line type="monotone" dataKey="sterilized" stroke="#10b981" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-sm">
          <CardHeader className="border-b border-gray-200 p-4 sm:p-6">
            <CardTitle className="text-lg text-gray-900">Outlet-wise Consumption</CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={departmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white shadow-sm">
        <CardHeader className="border-b border-gray-200 p-4 sm:p-6">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg text-gray-900">Surgery Item Consumption Details</CardTitle>
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-[#00A8E8] hover:bg-[#0088cc] text-white">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Consumption Record
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-white max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-gray-900">Add Surgery Consumption Record</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <Label className="text-gray-700 text-sm">Surgery ID</Label>
                    <Input
                      value={formData.surgeryId}
                      onChange={(e) => handleInputChange("surgeryId", e.target.value)}
                      placeholder="e.g., SURG004"
                      className="mt-1 border-gray-300 "
                    />
                  </div>
                  <div>
                    <Label className="text-gray-700 text-sm">Surgery Type</Label>
                    <Input
                      value={formData.surgery}
                      onChange={(e) => handleInputChange("surgery", e.target.value)}
                      placeholder="e.g., Hip Replacement"
                      className="mt-1 border-gray-300 "
                    />
                  </div>
                  <div>
                    <Label className="text-gray-700 text-sm">Department</Label>
                    <Select value={formData.department} onValueChange={(value) => handleInputChange("department", value)}>
                      <SelectTrigger className="border-gray-300  mt-1">
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>
                      <SelectContent className="">
                        <SelectItem value="OR-1">OR-1</SelectItem>
                        <SelectItem value="OR-2">OR-2</SelectItem>
                        <SelectItem value="OR-3">OR-3</SelectItem>
                        <SelectItem value="ICU">ICU</SelectItem>
                        <SelectItem value="Emergency">Emergency</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-gray-700 text-sm">Date</Label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleInputChange("date", e.target.value)}
                      className="mt-1 border-gray-300 "
                    />
                  </div>
                  <div>
                    <Label className="text-gray-700 text-sm">Before Count</Label>
                    <Input
                      type="number"
                      value={formData.beforeCount}
                      onChange={(e) => handleInputChange("beforeCount", e.target.value)}
                      placeholder="e.g., 30"
                      className="mt-1 border-gray-300 f"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-700 text-sm">After Count</Label>
                    <Input
                      type="number"
                      value={formData.afterCount}
                      onChange={(e) => handleInputChange("afterCount", e.target.value)}
                      placeholder="e.g., 25"
                      className="mt-1 border-gray-300 "
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-gray-700 text-sm">Items Used</Label>
                    <Input
                      value={formData.items}
                      onChange={(e) => handleInputChange("items", e.target.value)}
                      placeholder="e.g., Surgery Kit, Forceps, Clamps"
                      className="mt-1 border-gray-300 "
                    />
                  </div>
                </div>
                <div className="flex gap-4 mt-6">
                  <Button 
                    onClick={handleSubmitForm}
                    className="bg-[#00A8E8] hover:bg-[#0088cc] text-white"
                  >
                    Add Record
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsDialogOpen(false)}
                    className="border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-3 text-gray-700 font-medium text-sm">Surgery ID</th>
                  <th className="text-left p-3 text-gray-700 font-medium text-sm">Surgery Type</th>
                  <th className="text-left p-3 text-gray-700 font-medium text-sm">Department</th>
                  <th className="text-left p-3 text-gray-700 font-medium text-sm">Date</th>
                  <th className="text-left p-3 text-gray-700 font-medium text-sm">Before Count</th>
                  <th className="text-left p-3 text-gray-700 font-medium text-sm">After Count</th>
                  <th className="text-left p-3 text-gray-700 font-medium text-sm">Consumed</th>
                  <th className="text-left p-3 text-gray-700 font-medium text-sm">Items Used</th>
                </tr>
              </thead>
              <tbody>
                {consumptionData.map((surgery) => (
                  <tr key={surgery.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-3 font-medium text-gray-900 text-sm">{surgery.id}</td>
                    <td className="p-3 text-gray-900 text-sm">{surgery.surgery}</td>
                    <td className="p-3 text-gray-600 text-sm">{surgery.department}</td>
                    <td className="p-3 text-gray-600 text-sm">{surgery.date}</td>
                    <td className="p-3 text-center text-gray-900 text-sm">{surgery.beforeCount}</td>
                    <td className="p-3 text-center text-gray-900 text-sm">{surgery.afterCount}</td>
                    <td className="p-3 text-center font-medium text-red-600 text-sm">{surgery.consumed}</td>
                    <td className="p-3 text-gray-600 text-sm">{surgery.items}</td>
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

export default ConsumptionReports;
