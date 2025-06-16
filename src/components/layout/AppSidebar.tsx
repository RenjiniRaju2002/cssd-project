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
  useSidebar,
} from "@/components/ui/sidebar";
import { 
  LayoutDashboard, 
  FileText, 
  Package, 
  Activity, 
  Send, 
  Database, 
  BarChart3,
  Building2,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretRight } from '@fortawesome/free-solid-svg-icons';

const menuItems = [
  {
    title: "Dashboard",
    url: "/",
    icon: faCaretRight,
  },
  {
    title: "Request Management",
    url: "/request-management",
    icon: faCaretRight,
  },
  {
    title: "Receive Items",
    url: "/receive-items",
    icon: faCaretRight,
  },
  {
    title: "Sterilization Process",
    url: "/sterilization-process",
    icon: faCaretRight,
  },
  {
    title: "Issue Item",
    url: "/issue-item",
    icon: faCaretRight,
  },
  {
    title: "Stock Management",
    url: "/stock-management",
    icon: faCaretRight,
  },
  {
    title: "Consumption Reports",
    url: "/consumption-reports",
    icon: faCaretRight,
  },
];

export function AppSidebar() {
  const location = useLocation();
  const { state } = useSidebar();

  return (
    <Sidebar className="bg-black fixed h-screen border-r border-gray-800 mt-20" data-state={state}>
      <SidebarHeader className="p-4 border-b border-gray-800">
        
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
                    className="hover:bg-[#b2e4f1] text-gray-300 hover:text-black data-[active=true]:bg-[#038ba4] data-[active=true]:text-white"
                  >
                    <Link to={item.url} className="flex items-center gap-3 px-4 py-2">
                      <FontAwesomeIcon icon={item.icon} className="w-4 h-4" />
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
