export interface DashboardStats {
  totalFiles: number;
  storageUsed: number;
  storageTotal: number;
  activeUsers: number;
  totalFolders: number;
}

export interface ActivityLog {
  id: string;
  action: string;
  fileName: string;
  user: string;
  timestamp: string;
  type: 'upload' | 'download' | 'delete' | 'share' | 'folder';
}
