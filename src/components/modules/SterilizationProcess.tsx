import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Square, Timer, Activity, AlertCircle, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const SterilizationProcess = () => {
  const [processes, setProcesses] = useState([
    { id: "STE001", machine: "Autoclave-1", process: "Steam Sterilization", itemId: "REQ001", startTime: "10:30", endTime: "", status: "In Progress", duration: 45 },
    { id: "STE002", machine: "Autoclave-2", process: "Chemical Sterilization", itemId: "REQ002", startTime: "09:15", endTime: "10:30", status: "Completed", duration: 75 },
  ]);
  const [selectedMachine, setSelectedMachine] = useState("");
  const [selectedProcess, setSelectedProcess] = useState("");
  const [timer, setTimer] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();

  const machines = [
    { id: "autoclave-1", name: "Autoclave-1", status: "Available" },
    { id: "autoclave-2", name: "Autoclave-2", status: "In Use" },
    { id: "autoclave-3", name: "Autoclave-3", status: "Maintenance" },
    { id: "chemical-1", name: "Chemical Sterilizer-1", status: "Available" },
  ];

  const sterilizationMethods = [
    { id: "steam", name: "Steam Sterilization", duration: 45, temp: "121°C" },
    { id: "chemical", name: "Chemical Sterilization", duration: 75, temp: "Room Temp" },
    { id: "plasma", name: "Plasma Sterilization", duration: 60, temp: "50°C" },
    { id: "ethylene", name: "Ethylene Oxide", duration: 180, temp: "55°C" },
  ];

  const startSterilization = (event: React.FormEvent) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);
    const newProcess = {
      id: `STE${String(processes.length + 1).padStart(3, '0')}`,
      machine: selectedMachine,
      process: selectedProcess,
      itemId: formData.get('itemId') as string,
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
    setProcesses(prevProcesses =>
      prevProcesses.map(process =>
        process.id === id
          ? { ...process, status: "Completed", endTime: new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit' }) }
          : process
      )
    );
    toast({
      title: "Process Completed",
      description: `Sterilization process ${id} has been completed.`,
    });
  };

  const pauseProcess = (id: string) => {
    setProcesses(prevProcesses =>
      prevProcesses.map(process =>
        process.id === id
          ? { ...process, status: "Paused" }
          : process
      )
    );
    setIsRunning(false);
  };

  const resumeProcess = (id: string) => {
    setProcesses(prevProcesses =>
      prevProcesses.map(process =>
        process.id === id
          ? { ...process, status: "In Progress" }
          : process
      )
    );
    setIsRunning(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Progress":
        return "bg-blue-100 text-blue-800";
      case "Completed":
        return "bg-green-100 text-green-800";
      case "Paused":
        return "bg-blue-100 text-blue-800";
      case "Error":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "In Progress":
        return <Play className="w-4 h-4 text-blue-600" />;
      case "Completed":
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case "Paused":
        return <Pause className="w-4 h-4 text-blue-600" />;
      case "Error":
        return <AlertCircle className="w-4 h-4 text-red-600" />;
      default:
        return <Timer className="w-4 h-4 text-gray-600" />;
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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Sterilization Process</h1>
        <p className="text-gray-600">Manage sterilization cycles and monitor progress</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="border-b border-black">
            <CardTitle className="flex items-center gap-2">
              <Play className="w-5 h-5" />
              Start New Sterilization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={startSterilization} className="space-y-4">
              <div>
                <Label htmlFor="machine" className="text-gray-700">Select Machine</Label>
                <Select value={selectedMachine} onValueChange={setSelectedMachine} required>
                  <SelectTrigger className="w-48 border-black">
                    <SelectValue placeholder="Choose sterilization machine" />
                  </SelectTrigger>
                  <SelectContent>
                    {machines.filter(machine => machine.status === "Available").map((machine) => (
                      <SelectItem key={machine.id} value={machine.name}>
                        {machine.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="process" className="text-gray-700">Sterilization Method</Label>
                <Select value={selectedProcess} onValueChange={setSelectedProcess} required>
                  <SelectTrigger className="w-48 border-black">
                    <SelectValue placeholder="Choose sterilization method" />
                  </SelectTrigger>
                  <SelectContent>
                    {sterilizationMethods.map((method) => (
                      <SelectItem key={method.id} value={method.name}>
                        {method.name} ({method.duration} min, {method.temp})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="itemId" className="text-gray-700">Item/Request ID</Label>
                <Input name="itemId" placeholder="Enter request ID" required className="border-black" />
              </div>

              <Button type="submit" className="w-full" disabled={!selectedMachine || !selectedProcess}>
                Start Sterilization Process
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-black">
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-5 h-5" />
              Machine Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {machines.map((machine) => (
                <div key={machine.id} className="flex items-center justify-between p-3">
                  <div>
                    <h4 className="font-medium">{machine.name}</h4>
                    <p className="text-sm text-gray-600">Sterilization Unit</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs ${getMachineStatusColor(machine.status)}`}>
                    {machine.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="border-b border-black">
          <CardTitle className="flex items-center gap-2">
            <Timer className="w-5 h-5" />
            Active Processes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-black">
                <tr>
                  <th className="text-left p-4 text-gray-700">Process ID</th>
                  <th className="text-left p-4 text-gray-700">Machine</th>
                  <th className="text-left p-4 text-gray-700">Method</th>
                  <th className="text-left p-4 text-gray-700">Item ID</th>
                  <th className="text-left p-4 text-gray-700">Start Time</th>
                  <th className="text-left p-4 text-gray-700">Duration</th>
                  <th className="text-left p-4 text-gray-700">Status</th>
                  <th className="text-left p-4 text-gray-700">Actions</th>
                </tr>
              </thead>
              <tbody>
                {processes.map((process) => (
                  <tr key={process.id} className="border-b border-black hover:bg-gray-50">
                    <td className="p-4 text-gray-900">{process.id}</td>
                    <td className="p-4 text-gray-900">{process.machine}</td>
                    <td className="p-4 text-gray-900">{process.process}</td>
                    <td className="p-4 text-gray-900">{process.itemId}</td>
                    <td className="p-4 text-gray-900">{process.startTime}</td>
                    <td className="p-4 text-gray-900">{process.duration} min</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded-full text-xs ${getStatusColor(process.status)}`}>
                        {getStatusIcon(process.status)} {process.status}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex gap-2">
                        {process.status === "In Progress" && (
                          <>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => pauseProcess(process.id)}
                              className="text-black hover:bg-[rgb(75,85,99)]"
                            >
                              <Pause className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => completeProcess(process.id)}
                              className="text-black hover:bg-[rgb(75,85,99)]"
                            >
                              <Square className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        {process.status === "Paused" && (
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => resumeProcess(process.id)}
                            className="text-black hover:bg-[rgb(75,85,99)]"
                          >
                            <Play className="w-4 h-4" />
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

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="border-b border-black">
            <CardTitle className="flex items-center gap-2 text-blue-600">
              <Activity className="w-5 h-5" />
              In Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {processes.filter(p => p.status === "In Progress").length}
            </div>
            <p className="text-sm text-gray-600">Active cycles</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-black">
            <CardTitle className="flex items-center gap-2 text-green-600">
              <Timer className="w-5 h-5" />
              Completed Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {processes.filter(p => p.status === "Completed").length}
            </div>
            <p className="text-sm text-gray-600">Successfully processed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="border-b border-black">
            <CardTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              Alerts
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {machines.filter(m => m.status === "Maintenance").length}
            </div>
            <p className="text-sm text-gray-600">Machines need attention</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SterilizationProcess;
