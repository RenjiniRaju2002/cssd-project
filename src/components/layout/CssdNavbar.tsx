import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Bell, Search, Settings, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export function CssdNavbar() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);

  useEffect(() => {
    // Clear search query and results when navigating away
    return () => {
      setSearchQuery("");
      setSearchResults([]);
    };
  }, []);

  const handleSearch = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      const query = searchQuery.trim().toUpperCase();
      
      // Check if it's a request ID (REQ prefix)
      if (query.startsWith("REQ")) {
        // Get all request-related data from localStorage
        const requests = localStorage.getItem('cssdRequests') ? JSON.parse(localStorage.getItem('cssdRequests')!) : [];
        const receivedItems = localStorage.getItem('receivedItems') ? JSON.parse(localStorage.getItem('receivedItems')!) : [];
        const issuedItems = localStorage.getItem('issuedItems') ? JSON.parse(localStorage.getItem('issuedItems')!) : [];
        
        // Search across all datasets
        const results = [...
          requests.filter(req => req.id === query || req.id.includes(query)),
          receivedItems.filter(item => item.requestId === query || item.requestId.includes(query)),
          issuedItems.filter(item => item.requestId === query || item.requestId.includes(query))
        ];

        if (results.length > 0) {
          // Navigate to appropriate page based on item type
          const firstResult = results[0];
          if (firstResult.status === "Issued") {
            navigate(`/issue-items?search=${encodeURIComponent(query)}`);
          } else if (firstResult.status === "Complete") {
            navigate(`/receive-items?search=${encodeURIComponent(query)}`);
          } else {
            navigate(`/request-management?search=${encodeURIComponent(query)}`);
          }
        } else {
          toast({
            title: "Request Not Found",
            description: `No request found with ID: ${query}`,
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Invalid Format",
          description: "Please enter a valid request ID (e.g., REQ001)",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <div className="bg-black border-b border-gray-800 px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <SidebarTrigger className="text-white hover:bg-gray-800" />
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input 
            placeholder="Search request ID... (e.g., REQ001)" 
            className="pl-10 w-80 bg-gray-900 border-gray-700 text-white placeholder:text-gray-400"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearch}
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" className="text-white hover:bg-gray-800">
          <Bell className="w-5 h-5" />
        </Button>
        <Button variant="ghost" size="icon" className="text-white hover:bg-gray-800">
          <Settings className="w-5 h-5" />
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="text-white hover:bg-gray-800 flex items-center gap-2">
              <User className="w-5 h-5" />
              <span>System Admin</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 bg-white">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Logout</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
