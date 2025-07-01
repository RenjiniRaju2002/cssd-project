import { Routes, Route } from "react-router-dom";
import { AppSidebar } from "./AppSidebar";
import { CssdNavbar } from "./CssdNavbar";
import RequestManagement from "../modules/RequestManagement";
import ReceiveItems from "../modules/ReceiveItems";
import SterilizationProcess from "../modules/SterilizationProcess";
import IssueItem from "../modules/IssueItem";
import StockManagement from "../modules/StockManagement";
import ConsumptionReports from "../modules/ConsumptionReports";
import Dashboard from "../modules/Dashboard";
import { useSidebar } from "@/components/ui/sidebar";
// import ApiTest from "../modules/ApiTest";

const CssdLayout = () => {
  const { state, toggleSidebar } = useSidebar();
  const sidebarCollapsed = state === "collapsed";

  return (
    <>
      <AppSidebar />
      <main className="flex-1 flex flex-col">
        <CssdNavbar sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
        <div className="flex-1 bg-background">
          <Routes>
            {/* <Route path="/api-test" element={<ApiTest />} /> */}
            <Route path="/" element={<Dashboard sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />} />
            <Route path="/request-management" element={<RequestManagement sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />} />
            <Route path="/receive-items" element={<ReceiveItems sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />} />
            <Route path="/sterilization-process" element={<SterilizationProcess sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />} />
            <Route path="/issue-item" element={<IssueItem sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />} />
            <Route path="/stock-management" element={<StockManagement sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />} />
            <Route path="/consumption-reports" element={<ConsumptionReports sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />} />
          </Routes>
        </div>
      </main>
    </>
  );
};

export default CssdLayout;
