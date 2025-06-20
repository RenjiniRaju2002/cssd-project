import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, Package, Clock, AlertTriangle } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "./Header";
import Footer from "./Footer";
import { useDashboardStats, useInitializeData } from "@/hooks/use-cssd-api";

const Dashboard = ({ sidebarCollapsed, toggleSidebar }) => {
  const navigate = useNavigate();
  const { stats, loading, error, refetch } = useDashboardStats();
  const { initializeData } = useInitializeData();

  const [currentTime, setCurrentTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Initialize sample data on first load
  useEffect(() => {
    initializeData();
  }, [initializeData]);

  const handleNewRequest = () => {
    navigate('/request-management');
  };

  const handleStartSterilization = () => {
    navigate('/sterilization-process');
  };

  // Show loading state
  if (loading) {
    return (
      <>
        <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
        <div className="space-y-4 sm:space-y-5 bg-[white] min-h-40 p-1 sm:p-5 border-t-4 border-[#038ba4] m-10 mt-0">
          <div className="bg-white shadow-sm p-4 sm:p-4 border-l-4 border-[#038ba4]">
            <h2 className="text-xl sm:text-xl font-bold text-gray-900" style={{color:"#038ba4"}}>Dashboard</h2>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Loading...</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  // Show error state
  if (error) {
    return (
      <>
        <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
        <div className="space-y-4 sm:space-y-5 bg-[white] min-h-40 p-1 sm:p-5 border-t-4 border-[#038ba4] m-10 mt-0">
          <div className="bg-white shadow-sm p-4 sm:p-4 border-l-4 border-[#038ba4]">
            <h2 className="text-xl sm:text-xl font-bold text-gray-900" style={{color:"#038ba4"}}>Dashboard</h2>
            <p className="text-sm sm:text-base text-red-600 mt-1">Error: {error}</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
    <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
    <div className="space-y-4 sm:space-y-5 bg-[white] min-h-40 p-1 sm:p-5 border-t-4 border-[#038ba4] m-10 mt-0 ">
  
      
      <div className=" bg-white shadow-sm p-4 sm:p-4  border-l-4 border-[#038ba4]">
        <h2 className="text-xl sm:text-xl  font-bold text-gray-900 "style={{color:"#038ba4"}}>Dashboard</h2>
        <p className="text-sm sm:text-base text-gray-600 mt-1">Central Sterile Service Department</p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <Card className="bg-white shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-900">Active Requests</CardTitle>
            <Package className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.activeRequests}</div>
            <p className="text-xs text-gray-600">Pending processing</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-900">Sterilization In Progress</CardTitle>
            <Activity className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.sterilizationInProgress}</div>
            <p className="text-xs text-gray-600">Currently processing</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-900">Items Ready</CardTitle>
            <Clock className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.itemsReady}</div>
            <p className="text-xs text-gray-600">Ready for issue</p>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-lg transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 p-4 sm:p-6">
            <CardTitle className="text-xs sm:text-sm font-medium text-gray-900">Low Stock Items</CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
          </CardHeader>
          <CardContent className="p-4 sm:p-6 pt-0">
            <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.lowStockItems}</div>
            <p className="text-xs text-gray-600">Items below minimum level</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <Card className="bg-white shadow-lg">
          <CardHeader className="border-b border-gray-200 p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xm text-gray-900">Recent Activity</CardTitle>
            <CardDescription className="text-sm text-gray-600">Latest CSSD operations</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="space-y-3 sm:space-y-4">
              <div className="flex items-start sm:items-center p-3 sm:p-4 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <Activity className="h-5 w-5 text-green-600 mr-3 mt-0.5 sm:mt-0 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 text-sm sm:text-base">Sterilization Completed - REQ001</p>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">Autoclave cycle finished for surgery kit</p>
                </div>
              </div>
              <div className="flex items-start sm:items-center p-3 sm:p-4 border border-gray-200 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                <Package className="h-5 w-5 text-blue-600 mr-3 mt-0.5 sm:mt-0 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-gray-900 text-sm sm:text-base">New Request - REQ002</p>
                  <p className="text-xs sm:text-sm text-gray-600 mt-1">Emergency surgery kit requested from OR-3</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-lg">
          <CardHeader className="border-b border-gray-200 p-4 sm:p-6">
            <CardTitle className="text-lg sm:text-xm text-gray-900">Quick Actions</CardTitle>
            <CardDescription className="text-sm text-gray-600">Common CSSD tasks</CardDescription>
          </CardHeader>
          <CardContent className="p-4 sm:p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              <button 
                onClick={handleNewRequest}
                className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors bg-white"
              >
                <Package className="h-5 sm:h-6 w-5 sm:w-6 mx-auto mb-2 text-[#038ba4]" />
                <p className="text-xs sm:text-sm font-medium text-gray-900">New Request</p>
              </button>
              <button 
                onClick={handleStartSterilization}
                className="p-3 sm:p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors bg-white"
              >
                <Activity className="h-5 sm:h-6 w-5 sm:w-6 mx-auto mb-2 text-[#038ba4]" />
                <p className="text-xs sm:text-sm font-medium text-gray-900">Start Sterilization</p>
              </button>
            </div>
            
          </CardContent>
        </Card>
        </div>

    </div>
        <Footer />

    </>
  );
};
export default Dashboard;