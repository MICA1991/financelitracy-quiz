import React, { useState, useEffect, useCallback } from 'react';
import { AdminUser } from '../types';

interface StudentPerformance {
  id: string;
  studentName: string;
  studentId: string;
  mobile: string;
  level: number;
  score: number;
  totalQuestions: number;
  percentage: number;
  timeTakenSeconds: number;
  accuracy: number;
  avgTimePerQuestion: number;
  startTime: string;
  endTime: string;
  hasFeedback: boolean;
  feedbackText?: string;
  student?: any;
}

interface SortConfig {
  key: keyof StudentPerformance;
  direction: 'asc' | 'desc';
}

interface FilterConfig {
  level?: number;
  minScore?: number;
  maxScore?: number;
  startDate?: string;
  endDate?: string;
  search?: string;
}

interface AdminDashboardProps {
  adminUser: AdminUser | null;
  onAdminLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ adminUser, onAdminLogout }) => {
  const [studentPerformances, setStudentPerformances] = useState<StudentPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'startTime', direction: 'desc' });
  const [filters, setFilters] = useState<FilterConfig>({});
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [exporting, setExporting] = useState(false);

  // Fetch student performance data
  const fetchStudentPerformances = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = localStorage.getItem('userToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const queryParams = new URLSearchParams({
        page: currentPage.toString(),
        limit: '20',
        sortBy: sortConfig.key,
        sortOrder: sortConfig.direction,
        ...(filters.level && { level: filters.level.toString() }),
        ...(filters.minScore && { minScore: filters.minScore.toString() }),
        ...(filters.maxScore && { maxScore: filters.maxScore.toString() }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate }),
        ...(filters.search && { search: filters.search })
      });

      const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/admin/sessions?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (data.success) {
        setStudentPerformances(data.data.sessions || []);
        setTotalPages(data.data.pagination?.pages || 1);
      } else {
        throw new Error(data.message || 'Failed to fetch data');
      }
    } catch (err) {
      console.error('Error fetching student performances:', err);
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  }, [currentPage, sortConfig, filters]);

  // Export to Excel
  const exportToExcel = async () => {
    try {
      setExporting(true);
      
      const token = localStorage.getItem('userToken');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const queryParams = new URLSearchParams({
        ...(filters.level && { level: filters.level.toString() }),
        ...(filters.minScore && { minScore: filters.minScore.toString() }),
        ...(filters.maxScore && { maxScore: filters.maxScore.toString() }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate })
      });

      const API_BASE_URL = (import.meta as any).env.VITE_API_BASE_URL || 'http://localhost:5000/api';
      const response = await fetch(`${API_BASE_URL}/admin/export/performance?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // Get filename from response headers
      const contentDisposition = response.headers.get('content-disposition');
      const filename = contentDisposition?.split('filename=')[1]?.replace(/"/g, '') || 'student_performance.xlsx';

      // Create blob and download
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

    } catch (err) {
      console.error('Error exporting to Excel:', err);
      alert('Failed to export data. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  // Handle sorting
  const handleSort = (key: keyof StudentPerformance) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Handle filter changes
  const handleFilterChange = (key: keyof FilterConfig, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Clear all filters
  const clearFilters = () => {
    setFilters({});
    setCurrentPage(1);
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Get sort indicator
  const getSortIndicator = (key: keyof StudentPerformance) => {
    if (sortConfig.key !== key) return '↕️';
    return sortConfig.direction === 'asc' ? '↑' : '↓';
  };

  // Load data on component mount and when dependencies change
  useEffect(() => {
    fetchStudentPerformances();
  }, [fetchStudentPerformances]);

  if (loading && studentPerformances.length === 0) {
    return (
      <div className="min-h-screen bg-slate-800 flex items-center justify-center">
        <div className="text-white text-xl">Loading student performance data...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-800 p-4 sm:p-6 text-white">
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-bold">Admin Dashboard</h1>
          <p className="text-slate-300 mt-2">Student Performance Management</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <span className="text-sm text-slate-300">Welcome, {adminUser?.username || 'Admin'}!</span>
          <div className="flex gap-2">
            <button
              onClick={fetchStudentPerformances}
              className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg text-sm shadow-md transition"
            >
              Refresh
            </button>
            <button
              onClick={exportToExcel}
              disabled={exporting || studentPerformances.length === 0}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-500 text-white font-semibold py-2 px-4 rounded-lg text-sm shadow-md transition"
            >
              {exporting ? 'Exporting...' : 'Export to Excel'}
            </button>
            <button
              onClick={onAdminLogout}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg text-sm shadow-md transition"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Filters */}
      <div className="bg-slate-700 p-6 rounded-xl shadow-xl mb-6">
        <h2 className="text-xl font-semibold mb-4 text-sky-300">Filters & Search</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Search</label>
            <input
              type="text"
              placeholder="Search by name, ID, or mobile..."
              value={filters.search || ''}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-slate-600 border border-slate-500 focus:ring-2 focus:ring-sky-400 focus:border-sky-400 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Level</label>
            <select
              value={filters.level || ''}
              onChange={(e) => handleFilterChange('level', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 rounded-lg bg-slate-600 border border-slate-500 focus:ring-2 focus:ring-sky-400 focus:border-sky-400 outline-none transition"
            >
              <option value="">All Levels</option>
              <option value="1">Level 1</option>
              <option value="2">Level 2</option>
              <option value="3">Level 3</option>
              <option value="4">Level 4</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Min Score</label>
            <input
              type="number"
              placeholder="Min score"
              value={filters.minScore || ''}
              onChange={(e) => handleFilterChange('minScore', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 rounded-lg bg-slate-600 border border-slate-500 focus:ring-2 focus:ring-sky-400 focus:border-sky-400 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Max Score</label>
            <input
              type="number"
              placeholder="Max score"
              value={filters.maxScore || ''}
              onChange={(e) => handleFilterChange('maxScore', e.target.value ? parseInt(e.target.value) : undefined)}
              className="w-full px-3 py-2 rounded-lg bg-slate-600 border border-slate-500 focus:ring-2 focus:ring-sky-400 focus:border-sky-400 outline-none transition"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Start Date</label>
            <input
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => handleFilterChange('startDate', e.target.value || undefined)}
              className="w-full px-3 py-2 rounded-lg bg-slate-600 border border-slate-500 focus:ring-2 focus:ring-sky-400 focus:border-sky-400 outline-none transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">End Date</label>
            <input
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => handleFilterChange('endDate', e.target.value || undefined)}
              className="w-full px-3 py-2 rounded-lg bg-slate-600 border border-slate-500 focus:ring-2 focus:ring-sky-400 focus:border-sky-400 outline-none transition"
            />
          </div>
        </div>
        <div className="mt-4">
          <button
            onClick={clearFilters}
            className="bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg text-sm shadow-md transition"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-200 p-4 rounded-lg mb-6">
          <strong>Error:</strong> {error}
        </div>
      )}

      {/* Performance Table */}
      <div className="bg-slate-700 p-6 rounded-xl shadow-xl mb-6">
        <h2 className="text-xl font-semibold mb-4 text-sky-300">Student Performance Data</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-600">
            <thead className="bg-slate-600/50">
              <tr>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider cursor-pointer hover:bg-slate-500/50 transition"
                  onClick={() => handleSort('studentName')}
                >
                  Student Name {getSortIndicator('studentName')}
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider cursor-pointer hover:bg-slate-500/50 transition"
                  onClick={() => handleSort('studentId')}
                >
                  Student ID {getSortIndicator('studentId')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Contact
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider cursor-pointer hover:bg-slate-500/50 transition"
                  onClick={() => handleSort('level')}
                >
                  Level {getSortIndicator('level')}
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider cursor-pointer hover:bg-slate-500/50 transition"
                  onClick={() => handleSort('score')}
                >
                  Score {getSortIndicator('score')}
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider cursor-pointer hover:bg-slate-500/50 transition"
                  onClick={() => handleSort('percentage')}
                >
                  Percentage {getSortIndicator('percentage')}
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider cursor-pointer hover:bg-slate-500/50 transition"
                  onClick={() => handleSort('timeTakenSeconds')}
                >
                  Time (s) {getSortIndicator('timeTakenSeconds')}
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider cursor-pointer hover:bg-slate-500/50 transition"
                  onClick={() => handleSort('accuracy')}
                >
                  Accuracy {getSortIndicator('accuracy')}
                </th>
                <th 
                  className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider cursor-pointer hover:bg-slate-500/50 transition"
                  onClick={() => handleSort('startTime')}
                >
                  Date {getSortIndicator('startTime')}
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">
                  Feedback
                </th>
              </tr>
            </thead>
            <tbody className="bg-slate-700 divide-y divide-slate-600">
              {studentPerformances.map((performance, index) => (
                <tr key={performance.id || index} className="hover:bg-slate-600/70 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {performance.studentName || performance.student?.studentName || 'N/A'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {performance.studentId || performance.student?.studentId || 'N/A'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {performance.mobile || performance.student?.mobileNumber || performance.student?.azureAdEmail || 'N/A'}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    Level {performance.level}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {performance.score}/{performance.totalQuestions}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {performance.percentage}%
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {performance.timeTakenSeconds || performance.timeTaken || 0}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {performance.accuracy || 0}%
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {formatDate(performance.startTime)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    {performance.hasFeedback || performance.feedbackText ? 'Yes' : 'No'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-between items-center mt-6">
            <div className="text-sm text-slate-300">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="bg-slate-600 hover:bg-slate-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold py-2 px-4 rounded-lg text-sm shadow-md transition"
              >
                Previous
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="bg-slate-600 hover:bg-slate-500 disabled:bg-slate-700 disabled:text-slate-500 text-white font-semibold py-2 px-4 rounded-lg text-sm shadow-md transition"
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* No Data Message */}
        {studentPerformances.length === 0 && !loading && (
          <div className="text-center py-8 text-slate-400">
            No student performance data found matching the current filters.
          </div>
        )}
      </div>

      {/* Summary Statistics */}
      {studentPerformances.length > 0 && (
        <div className="bg-slate-700 p-6 rounded-xl shadow-xl">
          <h2 className="text-xl font-semibold mb-4 text-amber-300">Summary Statistics</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-sky-300">{studentPerformances.length}</div>
              <div className="text-sm text-slate-300">Total Sessions</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-300">
                {Math.round(studentPerformances.reduce((sum, p) => sum + p.percentage, 0) / studentPerformances.length)}%
              </div>
              <div className="text-sm text-slate-300">Average Score</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-300">
                {Math.round(studentPerformances.reduce((sum, p) => sum + (p.timeTakenSeconds || 0), 0) / studentPerformances.length)}s
              </div>
              <div className="text-sm text-slate-300">Avg Time</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-300">
                {studentPerformances.filter(p => p.hasFeedback || p.feedbackText).length}
              </div>
              <div className="text-sm text-slate-300">With Feedback</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard; 