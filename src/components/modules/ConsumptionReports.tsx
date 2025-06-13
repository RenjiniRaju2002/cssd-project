import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import Header from "./Header";
import Footer from "./Footer";  
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { CalendarIcon, Download, BarChart3, TrendingUp, TrendingDown, Plus, Clock as ClockIcon, Calculator as CalculatorIcon } from "lucide-react";

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

const ConsumptionReports = ({ sidebarCollapsed, toggleSidebar }) => {
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [reportGenerated, setReportGenerated] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const [consumptionData, setConsumptionData] = useState<ConsumptionRecord[]>(() => {
    const saved = localStorage.getItem('consumptionData');
    return saved ? JSON.parse(saved) : [
      { id: "SURG001", surgery: "Cardiac Surgery", department: "OR-1", date: "2024-06-10", beforeCount: 25, afterCount: 18, consumed: 7, items: "Surgery Kit, Forceps, Clamps" },
      { id: "SURG002", surgery: "Knee Replacement", department: "OR-2", date: "2024-06-10", beforeCount: 15, afterCount: 12, consumed: 3, items: "Orthopedic Kit, Drills" },
      { id: "SURG003", surgery: "Appendectomy", department: "OR-1", date: "2024-06-09", beforeCount: 20, afterCount: 17, consumed: 3, items: "Basic Surgery Kit" }
    ];
  });

  // Persist consumption data to localStorage
  useEffect(() => {
    localStorage.setItem('consumptionData', JSON.stringify(consumptionData));
  }, [consumptionData]);

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

  // Get filtered data based on selected filters
  const getFilteredData = () => {
    return consumptionData.filter(item => {
      const date = new Date(item.date);
      return (!dateFrom || date >= dateFrom) && 
             (!dateTo || date <= dateTo) && 
             (selectedDepartment === "all" || item.department === selectedDepartment);
    });
  };

  // Calculate statistics from consumption data
  const calculateStatistics = () => {
    const filteredData = getFilteredData();

    // Calculate weekly consumption
    const weeklyData = [];
    const startDate = dateFrom || new Date(consumptionData[0]?.date || new Date());
    const endDate = dateTo || new Date();
    
    // Calculate weeks
    const weeks = Math.ceil((endDate.getTime() - startDate.getTime()) / (7 * 24 * 60 * 60 * 1000));
    for (let i = 0; i < weeks; i++) {
      const weekStart = new Date(startDate.getTime() + (i * 7 * 24 * 60 * 60 * 1000));
      const weekEnd = new Date(weekStart.getTime() + (6 * 24 * 60 * 60 * 1000));
      
      const weekConsumption = filteredData.filter(item => {
        const itemDate = new Date(item.date);
        return itemDate >= weekStart && itemDate <= weekEnd;
      }).reduce((sum, item) => sum + item.consumed, 0);

      weeklyData.push({
        week: `Week ${i + 1} (${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d')})`,
        consumption: weekConsumption,
        sterilized: weekConsumption // Assuming sterilized items are equal to consumed
      });
    }

    // Calculate department-wise consumption
    const departmentData = Array.from(
      new Set(filteredData.map(item => item.department))
    ).map(dept => ({
      department: dept,
      count: filteredData.filter(item => item.department === dept).length,
      totalConsumption: filteredData.filter(item => item.department === dept)
        .reduce((sum, item) => sum + item.consumed, 0)
    }));

    // Calculate total statistics
    const totalConsumption = filteredData.reduce((sum, item) => sum + item.consumed, 0);
    const totalSurgery = filteredData.length;
    const averagePerSurgery = totalSurgery > 0 ? totalConsumption / totalSurgery : 0;

    return {
      weeklyData,
      departmentData,
      totalConsumption,
      totalSurgery,
      averagePerSurgery,
      filteredData
    };
  };

  const stats = calculateStatistics();

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
    
    const filteredData = getFilteredData();
    const reportData = {
      dateFrom: dateFrom ? format(dateFrom, "dd/MM/yyyy") : "N/A",
      dateTo: dateTo ? format(dateTo, "dd/MM/yyyy") : "N/A",
      department: selectedDepartment === "all" ? "All Departments" : selectedDepartment,
      totalConsumption: stats.totalConsumption,
      totalSurgeries: stats.totalSurgery,
      averagePerSurgery: stats.averagePerSurgery.toFixed(1),
      data: filteredData
    };
    
    console.log("Exporting to PDF with filtered data:", reportData);
    
    // Create formatted report content
    const reportContent = `
HODO Hospital - Central Sterile Service Department
Consumption Report

Report Period: ${reportData.dateFrom} to ${reportData.dateTo}
Department: ${reportData.department}
Generated on: ${format(new Date(), 'dd/MM/yyyy HH:mm')}

SUMMARY:
Total Consumption: ${reportData.totalConsumption} items
Total Surgeries: ${reportData.totalSurgeries}
Average per Surgery: ${reportData.averagePerSurgery} items

DETAILED DATA:
${filteredData.map(item => 
  `Surgery ID: ${item.id}
  Surgery Type: ${item.surgery}
  Department: ${item.department}
  Date: ${item.date}
  Before Count: ${item.beforeCount}
  After Count: ${item.afterCount}
  Consumed: ${item.consumed}
  Items Used: ${item.items}
  ---`
).join('\n')}
    `;
    
    // Simulate PDF download
    const element = document.createElement('a');
    const file = new Blob([reportContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `consumption-report-${selectedDepartment === "all" ? "all-departments" : selectedDepartment}-${format(new Date(), 'yyyy-MM-dd')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast({
      title: "PDF Export Successful",
      description: `Consumption report exported for ${reportData.department} with ${filteredData.length} records.`,
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
    
    const filteredData = getFilteredData();
    
    // Create CSV content with filtered data
    const csvContent = [
      // Header with report info
      [`HODO Hospital - Consumption Report`],
      [`Report Period: ${dateFrom ? format(dateFrom, "dd/MM/yyyy") : "N/A"} to ${dateTo ? format(dateTo, "dd/MM/yyyy") : "N/A"}`],
      [`Department: ${selectedDepartment === "all" ? "All Departments" : selectedDepartment}`],
      [`Generated on: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`],
      [`Total Records: ${filteredData.length}`],
      [`Total Consumption: ${stats.totalConsumption} items`],
      [],
      // Data headers
      ['Surgery ID', 'Surgery Type', 'Department', 'Date', 'Before Count', 'After Count', 'Consumed', 'Items Used'],
      // Data rows
      ...filteredData.map(item => [
        item.id, item.surgery, item.department, item.date, 
        item.beforeCount, item.afterCount, item.consumed, item.items
      ])
    ].map(row => row.join(',')).join('\n');
    
    const element = document.createElement('a');
    const file = new Blob([csvContent], { type: 'text/csv' });
    element.href = URL.createObjectURL(file);
    element.download = `consumption-report-${selectedDepartment === "all" ? "all-departments" : selectedDepartment}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    toast({
      title: "Excel Export Successful",
      description: `Consumption report exported with ${filteredData.length} filtered records.`,
    });
  };

  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <>
    <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
    <div className="space-y-4 sm:space-y-6 bg-[#d9e0e7] min-h-screen p-4 sm:p-6">
     
      <div className="border-t-4 border-[#00A8E8] bg-white rounded-lg shadow-sm p-4 sm:p-6">
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
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.totalConsumption}</div>
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
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.averagePerSurgery.toFixed(1)}</div>
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
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.totalSurgery}</div>
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
              <LineChart data={stats.weeklyData}>
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
              <BarChart data={stats.departmentData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="department" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="totalConsumption" fill="#8b5cf6" />
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
                    <Label className="text-black text-sm font-poppins">Surgery ID</Label>
                    <Input
                      value={formData.surgeryId}
                      onChange={(e) => handleInputChange("surgeryId", e.target.value)}
                      placeholder="e.g., SURG004"
                      className="mt-1 border-gray-300 text-black font-poppins"
                    />
                  </div>
                  <div>
                    <Label className="text-black text-sm font-poppins">Surgery Type</Label>
                    <Input
                      value={formData.surgery}
                      onChange={(e) => handleInputChange("surgery", e.target.value)}
                      placeholder="e.g., Hip Replacement"
                      className="mt-1 border-gray-300 text-black font-poppins"
                    />
                  </div>
                  <div>
                    <Label className="text-black text-sm font-poppins">Department</Label>
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
                    <Label className="text-black text-sm font-poppins">Date</Label>
                    <Input
                      type="date"
                      value={formData.date}
                      onChange={(e) => handleInputChange("date", e.target.value)}
                      className="mt-1 border-gray-300 text-black font-poppins"
                    />
                  </div>
                  <div>
                    <Label className="text-black text-sm font-poppins">Before Count</Label>
                    <Input
                      type="number"
                      value={formData.beforeCount}
                      onChange={(e) => handleInputChange("beforeCount", e.target.value)}
                      placeholder="e.g., 30"
                      className="mt-1 border-gray-300 text-black font-poppins"
                    />
                  </div>
                  <div>
                    <Label className="text-black text-sm font-poppins">After Count</Label>
                    <Input
                      type="number"
                      value={formData.afterCount}
                      onChange={(e) => handleInputChange("afterCount", e.target.value)}
                      placeholder="e.g., 25"
                      className="mt-1 border-gray-300 text-black font-poppins"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label className="text-black text-sm font-poppins">Items Used</Label>
                    <Input
                      value={formData.items}
                      onChange={(e) => handleInputChange("items", e.target.value)}
                      placeholder="e.g., Surgery Kit, Forceps, Clamps"
                      className="mt-1 border-gray-300 text-black font-poppins"
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
                {stats.filteredData.map((surgery) => (
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
          <Footer />
        </CardContent>
      </Card>
    </div>
   
    </>
  );
};

export default ConsumptionReports;
