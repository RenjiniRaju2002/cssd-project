import { Settings, Bell, Search, User, Plus, Calendar, Clock, Calculator, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface CssdNavbarProps {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

export function CssdNavbar({ sidebarCollapsed, toggleSidebar }: CssdNavbarProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [currentProfile, setCurrentProfile] = useState<any>(null);
  const [allProfiles, setAllProfiles] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  const navItems = [
    { id: "dashboard", label: "Dashboard", path: "/" },
    { id: "billing", label: "Billing", path: "/billing" },
    { id: "pharmacy", label: "Pharmacy", path: "/pharmacy" },
    { id: "Appointments", label: "Appointments", path: "/appointments" },
  ];

  const moreNavItems = [
    // Add more modules here if needed
    // Example: { id: "appointments", label: "Appointments", path: "/appointments" },
  ];

  useEffect(() => {
    // Load notifications from localStorage
    const requests = JSON.parse(localStorage.getItem('cssdRequests') || '[]');
    const receivedItems = JSON.parse(localStorage.getItem('receivedItems') || '[]');
    const issuedItems = JSON.parse(localStorage.getItem('issuedItems') || '[]');
    
    const allNotifications = [
      ...requests.map((record: any) => ({
        id: record.id,
        type: 'request',
        message: `New request: ${record.id}`,
        time: new Date(record.createdAt),
        profile: record
      })),
      ...receivedItems.map((record: any) => ({
        id: record.id,
        type: 'received',
        message: `Item received: ${record.id}`,
        time: new Date(record.receivedAt),
        profile: record
      })),
      ...issuedItems.map((record: any) => ({
        id: record.id,
        type: 'issued',
        message: `Item issued: ${record.id}`,
        time: new Date(record.issuedAt),
        profile: record
      }))
    ].sort((a, b) => b.time.getTime() - a.time.getTime()).slice(0, 10);

    setNotifications(allNotifications);

    // Load all profiles
    const profiles = [
      ...requests.map((record: any) => ({ ...record, type: 'request' })),
      ...receivedItems.map((record: any) => ({ ...record, type: 'received' })),
      ...issuedItems.map((record: any) => ({ ...record, type: 'issued' }))
    ];
    setAllProfiles(profiles);

    // Update date and time every second
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleSettingsClick = (setting: string) => {
    console.log(`Opening ${setting} settings`);
    localStorage.setItem('selectedSetting', setting);
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      const requests = JSON.parse(localStorage.getItem('cssdRequests') || '[]');
      const receivedItems = JSON.parse(localStorage.getItem('receivedItems') || '[]');
      const issuedItems = JSON.parse(localStorage.getItem('issuedItems') || '[]');
      
      const allProfiles = [
        ...requests.map((record: any) => ({ ...record, type: 'request' })),
        ...receivedItems.map((record: any) => ({ ...record, type: 'received' })),
        ...issuedItems.map((record: any) => ({ ...record, type: 'issued' }))
      ];
      
      const results = allProfiles.filter(profile => 
        profile.id?.toString().includes(query) ||
        profile.requestId?.toString().includes(query)
      ).slice(0, 5);
      
      setSearchResults(results);
      setShowSearchResults(true);
          } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  const handleProfileSelect = (profile: any) => {
    setCurrentProfile(profile);
    navigate(profile.type === 'request' ? '/request-management' : 
             profile.type === 'received' ? '/receive-items' : '/issue-item');
          toast({
      title: "Profile Selected",
      description: `Viewing details for ${profile.id}`,
    });
  };

  const handleLogout = () => {
    setCurrentProfile(null);
        toast({
      title: "Logged Out",
      description: "Successfully logged out from profile",
    });
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 60) {
      return `${diffInMinutes}m ago`;
    } else if (diffInMinutes < 1440) {
      return `${Math.floor(diffInMinutes / 60)}h ago`;
    } else {
      return `${Math.floor(diffInMinutes / 1440)}d ago`;
    }
  };

  const currentDate: string = currentDateTime.toLocaleDateString('en-US', {
    weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const formattedTime: string = currentDateTime.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return (
    <div className="header-container mt-8">
      {/* <SidebarTrigger /> */}
      <h1></h1>
      {/* <div className="header-div">
        <div className="icons-div">
          <div className="icon-item">
            <i className="header-icon fa-solid fa-calendar-days"></i>
            <span className="header-span">{currentDate}</span>
          </div>
          <div className="icon-item">
            <i className="header-icon fa-solid fa-clock custom-clock"></i>
            <span className="header-span">{formattedTime}</span>
          </div>
          <div className="icon-item">
            <i className="header-icon fa-solid fa-calculator"></i>
          </div>
        </div>
      </div> */}
      <nav className="bg-black border-b border-gray-800 w-full fixed top-0 left-0 z-50 shadow-lg">
        <div className="flex items-center justify-between h-19 px-8 py-1">
          {/* Left side - Logo and navigation */}
          <div className="flex items-center gap-1">
            {/* Logo */}
            
            <div className=" gap-2">
          <a href="/">
          <img 
            src="https://hodo.in/wp-content/uploads/2022/05/cropped-HODO-Fav.png" 
            alt="HODO Logo" 
            className="h-10 w-auto"
          />
          </a>
         </div>
           
            
            {/* Navigation items */}
            <div className="flex items-center" style={{fontSize: '12px',fontWeight:300}}>
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "px-4 py-2 text-sm font-normal transition-colors",
                    window.location.pathname === item.path
                      ? "text-gray-300"
                      : "text-gray-300 hover:text-[#038ba4]"
                  )}
                >
                  {item.label}
                </button>
              ))}

              {/* More Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      "px-4 py-2 text-sm font-medium transition-colors mr-4 flex items-center gap-1",
                      moreNavItems.some(item => window.location.pathname === item.path)
                        ? "text-[#038ba4] border-b-2 border-[#038ba4]"
                        : "text-gray-300 hover:text-[#038ba4]"
                    )}
                  >
                    More
                    <i className="fa-solid fa-caret-down ml-1"></i>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56 bg-white border border-gray-200 shadow-lg">
                  {moreNavItems.map((item) => (
                    <DropdownMenuItem
                      key={item.id}
                      onClick={() => navigate(item.path)}
                      className={cn(
                        "px-3 py-2 text-sm font-medium transition-colors hover:bg-[#0d92ae] hover:text-white",
                        window.location.pathname === item.path
                          ? "text-[#038ba4] bg-[#038ba4]/10"
                          : "text-gray-700"
                      )}
                    >
                      {item.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          
          {/* Center - Search Bar */}
          <div className="flex-1 max-w-md relative ml-auto">
            <div className="relative">
              <Search className="absolute left-5 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search by request ID..."
                value={searchQuery}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10 bg-white text-black placeholder-gray-500 focus:[#038ba4]"
              />
            </div>
            
            {/* Search Results Dropdown */}
            {showSearchResults && searchResults.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-y-auto z-50">
                {searchResults.map((profile, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 p-2 hover:bg-gray-50 cursor-pointer"
                    onClick={() => {
                      setShowSearchResults(false);
                      setSearchQuery("");
                      navigate(profile.type === 'request' ? '/request-management' : 
                              profile.type === 'received' ? '/receive-items' : '/issue-item');
                    }}
                  >
                    <div>
                      <div className="font-medium text-sm">ID: {profile.id}</div>
                      <div className="text-xs text-gray-500">
                        {profile.type} record
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Right side - New Sale, Notifications, Profile, Settings */}
          <div className="flex items-center gap-2">
            {/* New Sale Button */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="ml-7 flex items-center gap-2 px-4 py-2 text-sm font-normal text-white btn-with-gradient rounded-md transition-colors">
                  New Sale
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white border border-gray-200 shadow-lg">
                <DropdownMenuItem onClick={() => navigate("/request-management")} className="text-black hover:bg-[#038ba4]">
                  Create Request
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/receive-items")} className="text-black hover:bg-[#038ba4]">
                  Receive Items
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/issue-item")} className="text-black hover:bg-[#038ba4]">
                  Issue Items
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Add Patient Button */}
            <button className="ml-2 flex items-center gap-2 px-4 py-2 text-sm font-normal text-white btn-with-gradient rounded-md transition-colors" onClick={() => navigate('/add-patient')}>
              + Add Patient
            </button>

            {/* Search Icon Button */}
            <button className="ml-2 p-2 rounded-md bg-black hover:bg-[#038ba4] hover:text-black text-[#038ba4] transition-colors  flex items-center justify-center" style={{ height: '40px', width: '40px' }}>
              {/* <Search className="w-5 h-5 text-white" /> */}
              <i className="fas fa-search mt-1 text-white"></i>
            </button>

            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-2 text-gray-300 hover:text-white transition-colors relative">
          {/* <Bell className="w-5 h-5 text-white" /> */}
                  <i className="fas fa-bell mt-1 text-white"></i>
                  {notifications.length > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs bg-red-500">
                      {notifications.length}
                    </Badge>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 bg-white border border-gray-200 shadow-lg">
                <DropdownMenuLabel className="text-black">Recent Activities</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {notifications.length > 0 ? (
                  notifications.map((notification, index) => (
                    <DropdownMenuItem 
                      key={index} 
                      className="flex flex-col items-start p-3 cursor-pointer hover:bg-[#038ba4]/10 hover:text-[#038ba4]"
                      onClick={() => {
                        navigate(notification.type === 'request' ? '/request-management' : 
                                notification.type === 'received' ? '/receive-items' : '/issue-item');
                      }}
                    >
                      <span className="font-medium text-sm text-black">{notification.message}</span>
                      <span className="text-xs text-gray-500">{formatTimeAgo(notification.time)}</span>
                    </DropdownMenuItem>
                  ))
                ) : (
                  <DropdownMenuItem className="text-black hover:bg-[#038ba4]/10 hover:text-[#038ba4]">No recent activities</DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Settings */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
                <button className="p-2 text-gray-300 hover:text-white transition-colors">
                  {/* <Settings className="w-5 h-5 text-white" /> */}
                  <i className="fas fa-cog  mt-1 text-white"></i>
                </button>
          </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-white border border-gray-200 shadow-lg text-black">
                <DropdownMenuLabel className="text-black">Settings</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {/* Change Profile Picture Option */}
                <DropdownMenuItem asChild className="hover:bg-[#038ba4]/10 hover:text-[#038ba4] cursor-pointer text-black">
                  <label htmlFor="profile-picture-upload" className="w-full flex items-center cursor-pointer text-black">
                    <User className="w-4 h-4 mr-2 text-black" />
                    Change Profile Picture
                    <input
                      id="profile-picture-upload"
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={() => { /* handle image upload here if needed */ }}
                    />
                  </label>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleSettingsClick("dashboard")} className="hover:bg-[#038ba4]/10 hover:text-[#038ba4] text-black">
                  Dashboard Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSettingsClick("request-management")} className="hover:bg-[#038ba4]/10 hover:text-[#038ba4] text-black">
                  Request Management Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSettingsClick("receive-items")} className="hover:bg-[#038ba4]/10 hover:text-[#038ba4] text-black">
                  Receive Items Settings
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSettingsClick("issue-items")} className="hover:bg-[#038ba4]/10 hover:text-[#038ba4] text-black">
                  Issue Items Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleSettingsClick("user-management")} className="hover:bg-[#038ba4]/10 hover:text-[#038ba4] text-black">
                  User Management
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSettingsClick("system")} className="hover:bg-[#038ba4]/10 hover:text-[#038ba4] text-black">
                  System Settings
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </nav>
    </div>
  );
}
