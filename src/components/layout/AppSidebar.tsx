
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
} from "@/components/ui/sidebar";
import { 
  LayoutDashboard, 
  FileText, 
  Package, 
  Activity, 
  Send, 
  Database, 
  BarChart3,
  Building2
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: LayoutDashboard,
  },
  {
    title: "Request Management",
    url: "/request-management",
    icon: FileText,
  },
  {
    title: "Receive Items",
    url: "/receive-items",
    icon: Package,
  },
  {
    title: "Sterilization Process",
    url: "/sterilization-process",
    icon: Activity,
  },
  {
    title: "Issue Item",
    url: "/issue-item",
    icon: Send,
  },
  {
    title: "Stock Management",
    url: "/stock-management",
    icon: Database,
  },
  {
    title: "Consumption Reports",
    url: "/consumption-reports",
    icon: BarChart3,
  },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar className="bg-black fixed h-screen border-r border-gray-800">
      <SidebarHeader className="p-4 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <img 
            src="src\components\layout\HODO-removebg-preview.png" 
            alt="HODO Logo" 
            className="h-16 w-auto"
          />
         </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-gray-300 text-sm font-medium px-4 py-2">
            <Building2 className="w-4 h-4 mr-2" />
            CSSD Module
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.url}
                    className="hover:bg-gray-800 text-gray-300 hover:text-white data-[active=true]:bg-[#00A8E8] data-[active=true]:text-white"
                  >
                    <Link to={item.url} className="flex items-center gap-3 px-4 py-2">
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
