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

const CssdLayout = () => {
  return (
    <>
      <AppSidebar />
      <main className="flex-1 flex flex-col">
        <CssdNavbar />
        <div className="flex-1 bg-background">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/request-management" element={<RequestManagement />} />
            <Route path="/receive-items" element={<ReceiveItems />} />
            <Route path="/sterilization-process" element={<SterilizationProcess />} />
            <Route path="/issue-item" element={<IssueItem />} />
            <Route path="/stock-management" element={<StockManagement />} />
            <Route path="/consumption-reports" element={<ConsumptionReports />} />
          </Routes>
        </div>
      </main>
    </>
  );
};

export default CssdLayout;
