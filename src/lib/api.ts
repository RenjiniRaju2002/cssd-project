// Mock API for CSSD Data Storage
// This provides a centralized interface for data operations

export interface CSSDRequest {
  id: string;
  department: string;
  priority: 'High' | 'Medium' | 'Low';
  items: string;
  quantity: number;
  status: 'Pending' | 'Processing' | 'Completed';
  date: string;
  createdAt: string;
  requiredDate?: string;
}

export interface ReceivedItem {
  id: string;
  requestId: string;
  department: string;
  items: string;
  quantity: number;
  receivedQuantity: number;
  status: 'Fully Received' | 'Partially Received' | 'Awaiting Receipt';
  receivedAt: string;
  receivedDate: string;
}

export interface IssuedItem {
  id: string;
  requestId: string;
  department: string;
  items: string;
  quantity: number;
  issuedTime: string;
  issuedDate: string;
  status: 'Issued';
  outlet: string;
}

export interface PackageKit {
  id: string;
  name: string;
  items: string[];
  department: string;
  priority: 'High' | 'Medium' | 'Low';
  status: 'Requested' | 'Pending' | 'Processing' | 'Completed';
  quantity: number;
  creationDate: string;
}

export interface StockItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  minQuantity: number;
  maxQuantity: number;
  unit: string;
  lastUpdated: string;
  status: 'In Stock' | 'Low Stock' | 'Out of Stock';
}

export interface SterilizationProcess {
  id: string;
  requestId: string;
  items: string;
  quantity: number;
  processType: 'Steam' | 'Chemical' | 'Gas';
  startTime: string;
  endTime?: string;
  status: 'In Progress' | 'Completed' | 'Failed';
  operator: string;
  temperature?: number;
  pressure?: number;
  cycleTime?: number;
}

export interface ConsumptionReport {
  id: string;
  department: string;
  period: string;
  totalConsumption: number;
  averagePerSurgery: number;
  totalSurgery: number;
  items: Array<{
    name: string;
    quantity: number;
    cost: number;
  }>;
  generatedAt: string;
}

// API Class
class CSSDAPI {
  private storageKey = {
    requests: 'cssdRequests',
    receivedItems: 'receivedItems',
    issuedItems: 'issuedItems',
    packageKits: 'packageKits',
    stockItems: 'stockItems',
    sterilizationProcesses: 'sterilizationProcesses',
    consumptionReports: 'consumptionReports'
  };

  // Generic storage methods
  private getStorage<T>(key: string): T[] {
    try {
      const data = localStorage.getItem(key);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error(`Error reading from storage ${key}:`, error);
      return [];
    }
  }

  private setStorage<T>(key: string, data: T[]): void {
    try {
      localStorage.setItem(key, JSON.stringify(data));
    } catch (error) {
      console.error(`Error writing to storage ${key}:`, error);
    }
  }

  // Request Management API
  async getRequests(): Promise<CSSDRequest[]> {
    return this.getStorage<CSSDRequest>(this.storageKey.requests);
  }

  async createRequest(request: Omit<CSSDRequest, 'id' | 'createdAt'>): Promise<CSSDRequest> {
    const requests = this.getStorage<CSSDRequest>(this.storageKey.requests);
    const newRequest: CSSDRequest = {
      ...request,
      id: this.generateId(),
      createdAt: new Date().toISOString()
    };
    requests.push(newRequest);
    this.setStorage(this.storageKey.requests, requests);
    return newRequest;
  }

  async updateRequest(id: string, updates: Partial<CSSDRequest>): Promise<CSSDRequest | null> {
    const requests = this.getStorage<CSSDRequest>(this.storageKey.requests);
    const index = requests.findIndex(req => req.id === id);
    if (index !== -1) {
      requests[index] = { ...requests[index], ...updates };
      this.setStorage(this.storageKey.requests, requests);
      return requests[index];
    }
    return null;
  }

  async deleteRequest(id: string): Promise<boolean> {
    const requests = this.getStorage<CSSDRequest>(this.storageKey.requests);
    const filtered = requests.filter(req => req.id !== id);
    if (filtered.length !== requests.length) {
      this.setStorage(this.storageKey.requests, filtered);
      return true;
    }
    return false;
  }

  // Received Items API
  async getReceivedItems(): Promise<ReceivedItem[]> {
    return this.getStorage<ReceivedItem>(this.storageKey.receivedItems);
  }

  async createReceivedItem(item: Omit<ReceivedItem, 'id' | 'receivedAt' | 'receivedDate'>): Promise<ReceivedItem> {
    const items = this.getStorage<ReceivedItem>(this.storageKey.receivedItems);
    const newItem: ReceivedItem = {
      ...item,
      id: this.generateId(),
      receivedAt: new Date().toISOString(),
      receivedDate: new Date().toISOString().split('T')[0]
    };
    items.push(newItem);
    this.setStorage(this.storageKey.receivedItems, items);
    return newItem;
  }

  // Issued Items API
  async getIssuedItems(): Promise<IssuedItem[]> {
    return this.getStorage<IssuedItem>(this.storageKey.issuedItems);
  }

  async createIssuedItem(item: Omit<IssuedItem, 'id' | 'issuedTime' | 'issuedDate'>): Promise<IssuedItem> {
    const items = this.getStorage<IssuedItem>(this.storageKey.issuedItems);
    const newItem: IssuedItem = {
      ...item,
      id: this.generateId(),
      issuedTime: new Date().toLocaleTimeString('en-US', { hour12: false }),
      issuedDate: new Date().toISOString().split('T')[0],
      status: 'Issued'
    };
    items.push(newItem);
    this.setStorage(this.storageKey.issuedItems, items);
    return newItem;
  }

  // Package Kits API
  async getPackageKits(): Promise<PackageKit[]> {
    return this.getStorage<PackageKit>(this.storageKey.packageKits);
  }

  async createPackageKit(kit: Omit<PackageKit, 'id' | 'creationDate'>): Promise<PackageKit> {
    const kits = this.getStorage<PackageKit>(this.storageKey.packageKits);
    const newKit: PackageKit = {
      ...kit,
      id: this.generateId(),
      creationDate: new Date().toISOString()
    };
    kits.push(newKit);
    this.setStorage(this.storageKey.packageKits, kits);
    return newKit;
  }

  async deletePackageKit(id: string): Promise<boolean> {
    const kits = this.getStorage<PackageKit>(this.storageKey.packageKits);
    const filtered = kits.filter(kit => kit.id !== id);
    if (filtered.length !== kits.length) {
      this.setStorage(this.storageKey.packageKits, filtered);
      return true;
    }
    return false;
  }

  // Stock Management API
  async getStockItems(): Promise<StockItem[]> {
    return this.getStorage<StockItem>(this.storageKey.stockItems);
  }

  async createStockItem(item: Omit<StockItem, 'id' | 'lastUpdated'>): Promise<StockItem> {
    const items = this.getStorage<StockItem>(this.storageKey.stockItems);
    const newItem: StockItem = {
      ...item,
      id: this.generateId(),
      lastUpdated: new Date().toISOString()
    };
    items.push(newItem);
    this.setStorage(this.storageKey.stockItems, items);
    return newItem;
  }

  async updateStockItem(id: string, updates: Partial<StockItem>): Promise<StockItem | null> {
    const items = this.getStorage<StockItem>(this.storageKey.stockItems);
    const index = items.findIndex(item => item.id === id);
    if (index !== -1) {
      items[index] = { 
        ...items[index], 
        ...updates, 
        lastUpdated: new Date().toISOString() 
      };
      this.setStorage(this.storageKey.stockItems, items);
      return items[index];
    }
    return null;
  }

  // Sterilization Process API
  async getSterilizationProcesses(): Promise<SterilizationProcess[]> {
    return this.getStorage<SterilizationProcess>(this.storageKey.sterilizationProcesses);
  }

  async createSterilizationProcess(process: Omit<SterilizationProcess, 'id' | 'startTime'>): Promise<SterilizationProcess> {
    const processes = this.getStorage<SterilizationProcess>(this.storageKey.sterilizationProcesses);
    const newProcess: SterilizationProcess = {
      ...process,
      id: this.generateId(),
      startTime: new Date().toISOString()
    };
    processes.push(newProcess);
    this.setStorage(this.storageKey.sterilizationProcesses, processes);
    return newProcess;
  }

  async updateSterilizationProcess(id: string, updates: Partial<SterilizationProcess>): Promise<SterilizationProcess | null> {
    const processes = this.getStorage<SterilizationProcess>(this.storageKey.sterilizationProcesses);
    const index = processes.findIndex(process => process.id === id);
    if (index !== -1) {
      processes[index] = { ...processes[index], ...updates };
      this.setStorage(this.storageKey.sterilizationProcesses, processes);
      return processes[index];
    }
    return null;
  }

  // Consumption Reports API
  async getConsumptionReports(): Promise<ConsumptionReport[]> {
    return this.getStorage<ConsumptionReport>(this.storageKey.consumptionReports);
  }

  async createConsumptionReport(report: Omit<ConsumptionReport, 'id' | 'generatedAt'>): Promise<ConsumptionReport> {
    const reports = this.getStorage<ConsumptionReport>(this.storageKey.consumptionReports);
    const newReport: ConsumptionReport = {
      ...report,
      id: this.generateId(),
      generatedAt: new Date().toISOString()
    };
    reports.push(newReport);
    this.setStorage(this.storageKey.consumptionReports, reports);
    return newReport;
  }

  // Utility methods
  private generateId(): string {
    return Math.random().toString(36).substr(2, 9);
  }

  // Search methods
  async searchRequests(query: string): Promise<CSSDRequest[]> {
    const requests = await this.getRequests();
    return requests.filter(request => 
      request.id.toLowerCase().includes(query.toLowerCase()) ||
      request.department.toLowerCase().includes(query.toLowerCase()) ||
      request.items.toLowerCase().includes(query.toLowerCase())
    );
  }

  async searchIssuedItems(query: string): Promise<IssuedItem[]> {
    const items = await this.getIssuedItems();
    return items.filter(item => 
      item.id.toLowerCase().includes(query.toLowerCase()) ||
      item.requestId.toLowerCase().includes(query.toLowerCase()) ||
      item.department.toLowerCase().includes(query.toLowerCase())
    );
  }

  // Statistics methods
  async getDashboardStats() {
    const requests = await this.getRequests();
    const receivedItems = await this.getReceivedItems();
    const issuedItems = await this.getIssuedItems();
    const stockItems = await this.getStockItems();

    return {
      activeRequests: requests.filter(r => r.status === 'Pending').length,
      sterilizationInProgress: requests.filter(r => r.status === 'Processing').length,
      itemsReady: receivedItems.filter(r => r.status === 'Fully Received').length,
      lowStockItems: stockItems.filter(s => s.status === 'Low Stock').length,
      totalRequests: requests.length,
      totalReceived: receivedItems.length,
      totalIssued: issuedItems.length
    };
  }

  // Clear all data (for testing/reset)
  async clearAllData(): Promise<void> {
    Object.values(this.storageKey).forEach(key => {
      localStorage.removeItem(key);
    });
  }

  // Initialize with sample data
  async initializeSampleData(): Promise<void> {
    // Only initialize if no data exists
    const requests = await this.getRequests();
    if (requests.length === 0) {
      // Add sample requests
      await this.createRequest({
        department: 'OR-1',
        priority: 'High',
        items: 'Surgical instruments set',
        quantity: 2,
        status: 'Pending',
        date: new Date().toISOString().split('T')[0]
      });

      await this.createRequest({
        department: 'ICU',
        priority: 'Medium',
        items: 'Catheters and tubing',
        quantity: 5,
        status: 'Processing',
        date: new Date().toISOString().split('T')[0]
      });

      // Add sample received items
      await this.createReceivedItem({
        requestId: 'REQ001',
        department: 'OR-1',
        items: 'Surgical instruments set',
        quantity: 2,
        receivedQuantity: 2,
        status: 'Fully Received'
      });

      // Add sample issued items
      await this.createIssuedItem({
        requestId: 'REQ001',
        department: 'OR-1',
        items: 'Surgical instruments set',
        quantity: 1,
        outlet: 'OR-1'
      });

      // Add sample package kits
      await this.createPackageKit({
        name: 'Emergency Kit',
        items: ['Scalpel', 'Forceps', 'Sutures', 'Gauze'],
        department: 'Emergency',
        priority: 'High',
        status: 'Requested',
        quantity: 10
      });

      // Add sample stock items
      await this.createStockItem({
        name: 'Surgical Masks',
        category: 'PPE',
        quantity: 500,
        minQuantity: 100,
        maxQuantity: 1000,
        unit: 'pieces',
        status: 'In Stock'
      });

      await this.createStockItem({
        name: 'Sterile Gloves',
        category: 'PPE',
        quantity: 50,
        minQuantity: 100,
        maxQuantity: 500,
        unit: 'boxes',
        status: 'Low Stock'
      });
    }
  }
}

// Export singleton instance
export const cssdAPI = new CSSDAPI();

// Export types for use in components
export type {
  CSSDRequest,
  ReceivedItem,
  IssuedItem,
  PackageKit,
  StockItem,
  SterilizationProcess,
  ConsumptionReport
}; 