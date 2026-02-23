// ⚠️  IMPORTANT: Change this to your PC's local IP address before running on phone
// To find your IP: run `ipconfig` in Windows terminal → look for IPv4 Address
// Example: 'http://192.168.1.5:3001'
export const API_BASE = 'http://10.230.98.222:3001';

export const ENDPOINTS = {
    health: `${API_BASE}/api/health`,
    generatePlan: `${API_BASE}/api/generate-plan`,
};
