import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Download, BarChart3, TrendingUp, TrendingDown } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

const ConsumptionReports = () => {
  const [dateFrom, setDateFrom] = useState<Date>();
  const [dateTo, setDateTo] = useState<Date>();
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [reportGenerated, setReportGenerated] = useState(false);
  const { toast } = useToast();

  const consumptionData = [
    { id: "SURG001", surgery: "Cardiac Surgery", department: "OR-1", date: "2024-06-10", beforeCount: 25, afterCount: 18, consumed: 7, items: "Surgery Kit, Forceps, Clamps" },
    { id: "SURG002", surgery: "Knee Replacement", department: "OR-2", date: "2024-06-10", beforeCount: 15, afterCount: 12, consumed: 3, items: "Orthopedic Kit, Drills" },
    { id: "SURG003", surgery: "Appendectomy", department: "OR-1", date: "2024-06-09", beforeCount: 20, afterCount: 17, consumed: 3, items: "Basic Surgery Kit" }
  ];

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

  const exportToPDF = () => {
    if (!reportGenerated) {
      toast({
        title: "Generate Report First",
        description: "Please generate a report before exporting to PDF.",
        variant: "destructive"
      });
      return;
    }
    
    // Simulate PDF generation
    const reportData = {
      dateFrom: dateFrom ? format(dateFrom, "dd/MM/yyyy") : "N/A",
      dateTo: dateTo ? format(dateTo, "dd/MM/yyyy") : "N/A",
      department: selectedDepartment,
      totalConsumption: consumptionData.reduce((sum, item) => sum + item.consumed, 0),
      data: consumptionData
    };
    
    console.log("Generating PDF with data:", reportData);
    
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
    
    // Simulate Excel generation
    toast({
      title: "Excel Export Successful",
      description: "Consumption report has been exported to Excel successfully.",
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
    
    setReportGenerated(true);
    toast({
      title: "Report Generated Successfully",
      description: `Consumption report generated for ${selectedDepartment === "all" ? "all departments" : selectedDepartment} from ${format(dateFrom, "dd/MM/yyyy")} to ${format(dateTo, "dd/MM/yyyy")}.`,
    });
  };

  const totalConsumption = consumptionData.reduce((sum, item) => sum + item.consumed, 0);
  const averageConsumption = (totalConsumption / consumptionData.length).toFixed(1);

  return (
    <div className="space-y-6 bg-gray-50 min-h-screen p-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-3xl font-bold text-gray-900">Consumption Reports</h1>
        <p className="text-gray-600">Generate and analyze item consumption reports</p>
      </div>

      <Card className="bg-white shadow-sm">
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="flex items-center gap-2 text-gray-900">
            <BarChart3 className="w-5 h-5 text-[#00A8E8]" />
            Report Filters
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label className="text-gray-700">From Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left border-gray-300">
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
              <Label className="text-gray-700">To Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start text-left border-gray-300">
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
              <Label className="text-gray-700">Department</Label>
              <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
                <SelectTrigger className="border-gray-300">
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

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-600">
              <BarChart3 className="w-5 h-5" />
              Total Consumption
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{totalConsumption}</div>
            <p className="text-sm text-gray-600">Items consumed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <TrendingUp className="w-5 h-5" />
              Average per Surgery
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{averageConsumption}</div>
            <p className="text-sm text-gray-600">Items per procedure</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-purple-600">
              <BarChart3 className="w-5 h-5" />
              Total Surgeries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{consumptionData.length}</div>
            <p className="text-sm text-gray-600">Procedures tracked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600">
              <TrendingDown className="w-5 h-5" />
              Efficiency Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">94%</div>
            <p className="text-sm text-gray-600">Utilization efficiency</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Weekly Consumption Trend</CardTitle>
          </CardHeader>
          <CardContent>
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

        <Card>
          <CardHeader>
            <CardTitle>Department-wise Consumption</CardTitle>
          </CardHeader>
          <CardContent>
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
        <CardHeader className="border-b border-gray-200">
          <CardTitle className="text-gray-900">Surgery Item Consumption Details</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-4 text-gray-700 font-medium">Surgery ID</th>
                  <th className="text-left p-4 text-gray-700 font-medium">Surgery Type</th>
                  <th className="text-left p-4 text-gray-700 font-medium">Department</th>
                  <th className="text-left p-4 text-gray-700 font-medium">Date</th>
                  <th className="text-left p-4 text-gray-700 font-medium">Before Count</th>
                  <th className="text-left p-4 text-gray-700 font-medium">After Count</th>
                  <th className="text-left p-4 text-gray-700 font-medium">Consumed</th>
                  <th className="text-left p-4 text-gray-700 font-medium">Items Used</th>
                </tr>
              </thead>
              <tbody>
                {consumptionData.map((surgery) => (
                  <tr key={surgery.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-4 font-medium text-gray-900">{surgery.id}</td>
                    <td className="p-4 text-gray-900">{surgery.surgery}</td>
                    <td className="p-4 text-gray-600">{surgery.department}</td>
                    <td className="p-4 text-gray-600">{surgery.date}</td>
                    <td className="p-4 text-center text-gray-900">{surgery.beforeCount}</td>
                    <td className="p-4 text-center text-gray-900">{surgery.afterCount}</td>
                    <td className="p-4 text-center font-medium text-red-600">{surgery.consumed}</td>
                    <td className="p-4 text-gray-600">{surgery.items}</td>
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
