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
  Search,
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretRight } from '@fortawesome/free-solid-svg-icons';
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";

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
  const navigate = useNavigate();
  const { toast } = useToast();
  const { state } = useSidebar();
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredMenuItems, setFilteredMenuItems] = useState(menuItems);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const filtered = menuItems.filter(item => 
        item.title.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredMenuItems(filtered);
    } else {
      setFilteredMenuItems(menuItems);
    }
  };

  return (
    <Sidebar className="bg-black fixed h-screen border-r border-gray-800 mt-10" data-state={state}>
      <SidebarHeader className="p-4 border-b border-gray-800">
        {/* Profile Section */}
        <div className="flex items-center mb-2 mt-2">
          <Avatar className="w-16 h-16 border-2 border-[#038ba4] rounded-full shadow-sm">
            {/* Set default Christmas profile image */}
            <AvatarImage src="src\components\layout\proimg.png" alt="Profile"  />
           
          </Avatar>
          <div className="ml-4 text-center flex flex-col gap-1 ">
            <div className="text-white font-bold text-lg leading-tight text-xs">System Admin</div>
            <div className="text-xm text-[#038ba4] leading-tight font-semibold">HODO Hospital, Kazhakkottam</div>
            <div className="text-xs text-white leading-tight">System Admin</div>
            
          </div>
        </div>
        
        {/* Search Section */}
        <div className="relative">
            <div className="sidebar-date mt-1 text-center">
              <h6 className="text-xs text-white  leading-tight font-bold">@Anchal {new Date().toLocaleDateString()}</h6>
            </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search components..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-10  text-white placeholder-gray-400  bg-black border-[#038ba4] focus:ring-[#038ba4]"
            />
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMenuItems.length > 0 ? (
                filteredMenuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      isActive={location.pathname === item.url}
                      className="hover:bg-[#b2e4f1] text-white hover:text-black data-[active=true]:bg-[#80def7] hover:border-r-4 hover:border-[#0d92ae] data-[active=true]:border-r-4 data-[active=true]:border-[#0d92ae] data-[active=true]:text-white rounded-none"
                    >
                      <Link to={item.url} className="flex items-center gap-3 px-4 py-2">
                        <FontAwesomeIcon icon={item.icon} className="w-4 h-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              ) : (
                <div className="px-4 py-2 text-gray-400 text-sm">
                  No components found
                </div>
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
