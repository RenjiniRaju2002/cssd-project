
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Package, Clock, AlertTriangle } from "lucide-react";

const Dashboard = () => {
  const stats = [
    {
      title: "Active Requests",
      value: "24",
      description: "Pending processing",
      icon: Package,
      color: "text-blue-600"
    },
    {
      title: "Sterilization In Progress",
      value: "8",
      description: "Currently processing",
      icon: Activity,
      color: "text-green-600"
    },
    {
      title: "Items Ready",
      value: "156",
      description: "Ready for issue",
      icon: Clock,
      color: "text-purple-600"
    },
    {
      title: "Urgent Requests",
      value: "3",
      description: "Require immediate attention",
      icon: AlertTriangle,
      color: "text-red-600"
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Central Sterile Service Department</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Latest CSSD operations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center p-4 border rounded-lg">
                <Activity className="h-5 w-5 text-green-600 mr-3" />
                <div>
                  <p className="font-medium">Sterilization Completed - REQ001</p>
                  <p className="text-sm text-gray-600">Autoclave cycle finished for surgery kit</p>
                </div>
              </div>
              <div className="flex items-center p-4 border rounded-lg">
                <Package className="h-5 w-5 text-blue-600 mr-3" />
                <div>
                  <p className="font-medium">New Request - REQ002</p>
                  <p className="text-sm text-gray-600">Emergency surgery kit requested from OR-3</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common CSSD tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <Package className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <p className="text-sm font-medium">New Request</p>
              </button>
              <button className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
                <Activity className="h-6 w-6 mx-auto mb-2 text-green-600" />
                <p className="text-sm font-medium">Start Sterilization</p>
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
