import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Square, Timer, Activity, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Header from "./Header";
import Footer from "./Footer";
import initialData from "../../data/sterilizationProcessData.json";


const SterilizationProcess = ({ sidebarCollapsed, toggleSidebar }) => {
  const [processes, setProcesses] = useState(() => {
    const savedProcesses = localStorage.getItem('sterilizationProcesses');
    try {
      return savedProcesses ? JSON.parse(savedProcesses) : [
        { id: "STE001", machine: "Autoclave-1", process: "Steam Sterilization", itemId: "REQ001", startTime: "10:30", endTime: "", status: "In Progress", duration: 45 },
        { id: "STE002", machine: "Autoclave-2", process: "Chemical Sterilization", itemId: "REQ002", startTime: "09:15", endTime: "10:30", status: "Completed", duration: 75 },
      ];
    } catch (error) {
      console.error('Error loading processes:', error);
      return [
        { id: "STE001", machine: "Autoclave-1", process: "Steam Sterilization", itemId: "REQ001", startTime: "10:30", endTime: "", status: "In Progress", duration: 45 },
        { id: "STE002", machine: "Autoclave-2", process: "Chemical Sterilization", itemId: "REQ002", startTime: "09:15", endTime: "10:30", status: "Completed", duration: 75 },
      ];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('sterilizationProcesses', JSON.stringify(processes));
    } catch (error) {
      console.error('Error saving processes:', error);
    }
  }, [processes]);

  useEffect(() => {
    return () => {
      try {
        localStorage.setItem('sterilizationProcesses', JSON.stringify(processes));
      } catch (error) {
        console.error('Error saving processes on unmount:', error);
      }
    };
  }, [processes]);

  const [selectedMachine, setSelectedMachine] = useState("");
  const [selectedProcess, setSelectedProcess] = useState("");
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();

  const [machines, setMachines] = useState(initialData.machines);
  const sterilizationMethods = initialData.sterilizationMethods;

  const [availableRequests, setAvailableRequests] = useState([]);
  const [selectedRequestId, setSelectedRequestId] = useState("");

  useEffect(() => {
    // Load completed requests from localStorage
    const savedRequests = localStorage.getItem('cssdRequests');
    if (savedRequests) {
      const requests = JSON.parse(savedRequests);
      // Include only Completed requests for sterilization
      setAvailableRequests(requests.filter(r => r.status === "Completed"));
    }
  }, []);

  const startSterilization = (event: React.FormEvent) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const newProcess = {
      id: `STE${String(processes.length + 1).padStart(3, '0')}`,
      machine: selectedMachine,
      process: selectedProcess,
      itemId: selectedRequestId,
      startTime: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }),
      endTime: "",
      status: "In Progress",
      duration: sterilizationMethods.find(method => method.name === selectedProcess)?.duration || 45
    };

    setProcesses([...processes, newProcess]);
    setIsRunning(true);
    toast({
      title: "Sterilization Started",
      description: `Process ${newProcess.id} has been initiated.`,
    });
  };

  const completeProcess = (id: string) => {
    setProcesses(prevProcesses => {
      const updated = prevProcesses.map(process =>
        process.id === id
          ? { ...process, status: "Completed", endTime: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) }
          : process
      );
      localStorage.setItem('sterilizationProcesses', JSON.stringify(updated));

      // Update stock levels when process is completed
      const completedProcess = updated.find(p => p.id === id);
      if (completedProcess) {
        const stock = localStorage.getItem('stockItems');
        const parsedStock = stock ? JSON.parse(stock) : [];
        
        // Find if item exists in stock
        const existingItem = parsedStock.find(item => item.id === completedProcess.itemId);
        
        if (existingItem) {
          // Update existing item quantity
          const updatedStock = parsedStock.map(item =>
            item.id === completedProcess.itemId
              ? { ...item, quantity: item.quantity + 1 }
              : item
          );
          localStorage.setItem('stockItems', JSON.stringify(updatedStock));
        } else {
          // Add new item to stock
          const newItem = {
            id: completedProcess.itemId,
            name: completedProcess.itemId, // You might want to map this to a proper name
            category: "Sterilized",
            quantity: 1,
            location: "Sterilization Area",
            minLevel: 1,
            status: "In Stock"
          };
          localStorage.setItem('stockItems', JSON.stringify([...parsedStock, newItem]));
        }
      }

      return updated;
    });
    toast({
      title: "Process Completed",
      description: `Sterilization process ${id} has been completed.`,
    });
  };

  const pauseProcess = (id: string) => {
    setProcesses(prevProcesses => {
      const updated = prevProcesses.map(process =>
        process.id === id
          ? { ...process, status: "Paused" }
          : process
      );
      localStorage.setItem('sterilizationProcesses', JSON.stringify(updated));
      return updated;
    });
    setIsRunning(false);
  };

  const resumeProcess = (id: string) => {
    setProcesses(prevProcesses => {
      const updated = prevProcesses.map(process =>
        process.id === id
          ? { ...process, status: "In Progress" }
          : process
      );
      localStorage.setItem('sterilizationProcesses', JSON.stringify(updated));
      return updated;
    });
    setIsRunning(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Paused":
        return "bg-yellow-100 text-yellow-800";
      case "Cancelled":
        return "bg-red-100 text-red-800";
      case "Pending":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getMachineStatusColor = (status: string) => {
    switch (status) {
      case "Available":
        return "bg-green-100 text-green-800";
      case "In Use":
        return "bg-blue-100 text-blue-800";
      case "Maintenance":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const updateProcessStatus = (id: string, status: string) => {
    setProcesses(prevProcesses => {
      const updated = prevProcesses.map(process =>
        process.id === id
          ? { ...process, status }
          : process
      );
      localStorage.setItem('sterilizationProcesses', JSON.stringify(updated));
      return updated;
    });
    toast({
      title: "Status Updated",
      description: `Sterilization process ${id} status changed to ${status}.`,
    });
  };

  const updateMachineStatus = (id: string, status: string) => {
    setMachines(prevMachines => {
      const updated = prevMachines.map(machine =>
        machine.id === id
          ? { ...machine, status }
          : machine
      );
      try {
        localStorage.setItem('cssdMachines', JSON.stringify(updated));
      } catch (error) {
        console.error('Error saving machine status:', error);
      }
      return updated;
    });
    toast({
      title: "Status Updated",
      description: `Machine status updated to ${status}.`,
    });
  };



  return (
    <>
    <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
    <div className="space-y-4 sm:space-y-5 bg-[#ffffff] min-h-screen p-1 sm:p-5 border-t-4 border-[#038ba4] m-10 mt-0">
       <div className="bg-white  border-l-4 border-[#038ba4] shadow-sm">
      <div className="bg-white rounded-lg shadow-sm p-4 sm:p-4 border-0">
        <h1 className="text-xl sm:text-xl font-bold text-gray-900" style={{color:"#038ba4"}}>Sterilization Process</h1>
        <p className="text-sm sm:text-base text-gray-600 mt-1">Manage sterilization cycles and monitor progress</p>
      </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="bg-white border border-gray-200">
          <CardHeader className="border-b border-gray-200 p-4 sm:p-6">
            <CardTitle className="flex items-center gap-2 text-gray-900 text-lg">
              <Play className="w-5 h-5 text-[#038ba4]" />
              Start New Sterilization
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <form onSubmit={startSterilization} className="space-y-4">
              <div>
                <Label htmlFor="machine" className="text-gray-700 text-sm">Select Machine</Label>
                <Select value={selectedMachine} onValueChange={setSelectedMachine} required>
                  <SelectTrigger className="border-gray-300 hover:border-gray-400 mt-1 text-black">
                    <SelectValue placeholder="Choose sterilization machine"/>
                  </SelectTrigger>
                  <SelectContent className="bg-white border-0">
                    {machines.filter(machine => machine.status === "Available").map((machine) => (
                      <SelectItem key={machine.id} value={machine.name}>
                        {machine.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="process" className="text-gray-700 text-sm">Sterilization Method</Label>
                <Select value={selectedProcess} onValueChange={setSelectedProcess} required>
                  <SelectTrigger className="border-gray-300 hover:border-gray-400 mt-1 text-black">
                    <SelectValue placeholder="Choose sterilization method"/>
                  </SelectTrigger>
                  <SelectContent className="bg-white border-0">
                    {sterilizationMethods.map((method) => (
                      <SelectItem key={method.id} value={method.name}>
                        <span className="text-sm">{method.name} ({method.duration} min, {method.temp})</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="itemId" className="text-gray-700 text-sm">Item/Request ID</Label>
                <Select value={selectedRequestId} onValueChange={setSelectedRequestId} required>
                  <SelectTrigger className="border-gray-300 hover:border-gray-400 mt-1 text-black">
                    <SelectValue placeholder="Select completed request ID" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-0">
                    {availableRequests.length === 0 ? (
                      <SelectItem value="" disabled>No completed requests</SelectItem>
                    ) : (
                      availableRequests.map((req) => (
                        <SelectItem key={req.id} value={req.id}>
                          {req.id}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-[#038ba4] hover:bg-[#038ba4] text-white text-sm py-2" 
                disabled={!selectedMachine || !selectedProcess || !selectedRequestId}
              >
                Start Sterilization Process
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200">
          <CardHeader className="border-b border-gray-200 p-4">
            <CardTitle className="flex items-center gap-2 text-red-600 text-base">
              <AlertCircle className="w-5 h-5" />
              Machine Status
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="space-y-4">
              {machines.map((machine) => (
                <div key={machine.id} className="flex justify-between items-center p-3 border-b border-gray-200 last:border-0">
                  <div className="flex items-center gap-2">
                    <div className="text-sm font-medium text-gray-900">{machine.name}</div>
                  </div>
                  <div className="w-40">
                    <Select value={machine.status} onValueChange={(status) => updateMachineStatus(machine.id, status)}>
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Available">Available</SelectItem>
                        <SelectItem value="In Use">In Use</SelectItem>
                        <SelectItem value="Maintenance">Maintenance</SelectItem>
                        <SelectItem value="Offline">Offline</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-white border border-gray-200">
        <CardHeader className="border-b border-gray-200 p-4 sm:p-6">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2 text-gray-900 text-lg">
              <Timer className="w-5 h-5 text-[#038ba4]" />
              Active Processes
            </CardTitle>
         
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left p-3 text-gray-700 font-medium text-sm">Process ID</th>
                  <th className="text-left p-3 text-gray-700 font-medium text-sm">Machine</th>
                  <th className="text-left p-3 text-gray-700 font-medium text-sm">Method</th>
                  <th className="text-left p-3 text-gray-700 font-medium text-sm">Item ID</th>
                  <th className="text-left p-3 text-gray-700 font-medium text-sm">Start Time</th>
                  <th className="text-left p-3 text-gray-700 font-medium text-sm">Duration</th>
                  <th className="text-left p-3 text-gray-700 font-medium text-sm">Status</th>
                  <th className="text-left p-3 text-gray-700 font-medium text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {processes.map((process) => (
                  <tr key={process.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="p-3 font-medium text-gray-900 text-sm">{process.id}</td>
                    <td className="p-3 text-gray-900 text-sm">{process.machine}</td>
                    <td className="p-3 text-gray-900 text-sm">{process.process}</td>
                    <td className="p-3 text-gray-900 text-sm">{process.itemId}</td>
                    <td className="p-3 text-gray-900 text-sm">{process.startTime}</td>
                    <td className="p-3 text-gray-900 text-sm">{process.duration} min</td>
                    <td className="p-3">
                      <Select value={process.status} onValueChange={(status) => updateProcessStatus(process.id, status)}>
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="In Progress">In Progress</SelectItem>
                          <SelectItem value="Paused">Paused</SelectItem>
                          <SelectItem value="Completed">Completed</SelectItem>
                        </SelectContent>
                      </Select>
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1 sm:gap-2">
                        {process.status === "In Progress" && (
                          <>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => pauseProcess(process.id)}
                              className="border-gray-300 text-gray-700 hover:bg-gray-50 p-1 sm:p-2"
                            >
                              <Pause className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => completeProcess(process.id)}
                              className="bg-[#038ba4] text-white hover:bg-[#0088cc] border-0 p-1 sm:p-2"
                            >
                              <Square className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Button>
                          </>
                        )}
                        {process.status === "Paused" && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => resumeProcess(process.id)}
                            className="bg-[#038ba4] text-white hover:bg-[#0088cc] border-0 p-1 sm:p-2"
                          >
                            <Play className="w-3 h-3 sm:w-4 sm:h-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <Card className="bg-white border border-gray-200">
          <CardHeader className="border-b border-gray-200 p-4">
            <CardTitle className="flex items-center gap-2 text-blue-600 text-base">
              <Activity className="w-5 h-5" />
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">
              {processes.filter(p => p.status === "In Progress").length}
            </div>
            <p className="text-xs sm:text-sm text-gray-600">Active cycles</p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200">
          <CardHeader className="border-b border-gray-200 p-4">
            <CardTitle className="flex items-center gap-2 text-green-600 text-base">
              <Timer className="w-5 h-5" />
              Completed Today
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">
              {processes.filter(p => p.status === "Completed").length}
            </div>
            <p className="text-xs sm:text-sm text-gray-600">Successfully processed</p>
          </CardContent>
        </Card>

        <Card className="bg-white border border-gray-200">
          <CardHeader className="border-b border-gray-200 p-4">
            <CardTitle className="flex items-center gap-2 text-red-600 text-base">
              <AlertCircle className="w-5 h-5" />
              Alerts
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4">
            <div className="text-2xl sm:text-3xl font-bold text-gray-900">
              {machines.filter(m => m.status === "Maintenance").length}
            </div>
            <p className="text-xs sm:text-sm text-gray-600">Machines need attention</p>
          </CardContent>
        </Card>
      </div>
    </div>
    <Footer />
    </>
  );
};

export default SterilizationProcess;