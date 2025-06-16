import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ShortcutsModal({ isOpen, onClose }: ShortcutsModalProps) {
  const shortcuts = {
    "GENERAL SHORTCUTS": [
      { key: "ALT+CTRL+L", description: "Log out or login" },
      { key: "ALT+S", description: "Search Patient (Clear and search if patient selected)" },
      { key: "ALT+R", description: "Register patient" },
      { key: "ALT+H", description: "Visit History (After patient selected)" },
      { key: "ALT+A", description: "Assign Doctor/Lab Tests (After patient selected)" },
      { key: "ALT+F", description: "Add Pending Lab Result" },
      { key: "ALT+J", description: "Add Pending Radiology Result (After patient selected)" },
      { key: "ALT+U", description: "Add Pending Procedure Result (After patient selected)" },
      { key: "ALT+Z", description: "View Lab Entered Results" },
      { key: "ALT+Y", description: "Home collection registration" },
      { key: "F1", description: "Search" },
      { key: "F2", description: "Todays Bills" },
      { key: "F3", description: "Todays Visits" },
      { key: "CTRL + F2", description: "Collect Sample" },
      { key: "F4", description: "Appointments" },
      { key: "F6", description: "Drug Stocks" },
      { key: "ALT + F6", description: "Brand Name wise Stock" },
      { key: "CTRL + F6", description: "Stock transfer" },
      { key: "F7", description: "Pharmacy Sale" },
      { key: "CTRL+F7", description: "Pharmacy Sale Return" },
      { key: "F8", description: "Register Patient" },
      { key: "F9", description: "New Visit" },
      { key: "ALT+M", description: "Search Menu" },
      { key: "ALT+B", description: "Bills" },
      { key: "ALT+K", description: "Bookings" },
      { key: "ALT+N", description: "Next Patient" },
      { key: "ALT+Q", description: "Lab pending" },
      { key: "ALT+W", description: "Radiology pending" },
      { key: "ALT+E", description: "Procedure pending" },
      { key: "ALT+D", description: "Drug pharmacy pending" },
      { key: "CTRL+ALT+P", description: "Printer Settings" },
      { key: "CTRL+ALT+C", description: "Calculator (Contact HODO if not working)" },
    ],
    "ADD CONSULTATION PAGE SHORTCUTS": [
      { key: "ALT+C", description: "Chief Complaint" },
      { key: "ALT+I", description: "Clinical Notes" },
      { key: "ALT+O", description: "On Examination" },
      { key: "ALT+M", description: "Symptoms" },
      { key: "ALT+G", description: "Diagnosis" },
      { key: "ALT+V", description: "Vitals" },
      { key: "ALT+T", description: "Treatment Plan" },
      { key: "ALT+L", description: "Lab Test" },
      { key: "ALT+Y", description: "Radiology" },
      { key: "ALT+P", description: "Procedure" },
      { key: "ALT+X", description: "Common Remarks" },
    ],
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle className="text-xl font-semibold text-black">Shortcut Keys</DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </DialogHeader>
        
        <div className="space-y-6">
          {Object.entries(shortcuts).map(([category, items]) => (
            <div key={category} className="space-y-3">
              <h3 className="text-lg font-semibold text-black">{category}</h3>
              <div className="grid grid-cols-2 gap-4">
                {items.map((item, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <kbd className="px-2 py-1 text-sm font-semibold text-black bg-gray-100 border border-gray-200 rounded">
                      {item.key}
                    </kbd>
                    <span className="text-sm text-black">{item.description}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 text-center">
          <Button 
            variant="link" 
            className="text-black hover:text-black/80"
            onClick={() => window.location.reload()}
          >
            Click here to refresh the page
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
} 