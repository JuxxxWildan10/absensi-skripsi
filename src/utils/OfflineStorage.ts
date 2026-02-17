// import { AttendanceRecord } from '../types';

const STORAGE_KEY = 'offline_attendance_queue';

export interface OfflineRecord {
    studentId: string;
    classId: string; // Helpful for syncing context if needed
    date: string;
    time: string;
    status: 'present' | 'late' | 'alpha' | 'permission' | 'sick';
    subject: string; // 'Self Check-in' usually
    timestamp: number;
}

export const OfflineStorage = {
    saveRecord: (record: OfflineRecord) => {
        try {
            const existing = OfflineStorage.getRecords();
            existing.push(record);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
            return true;
        } catch (error) {
            console.error('Failed to save offline record:', error);
            return false;
        }
    },

    getRecords: (): OfflineRecord[] => {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Failed to get offline records:', error);
            return [];
        }
    },

    clearRecords: () => {
        try {
            localStorage.removeItem(STORAGE_KEY);
        } catch (error) {
            console.error('Failed to clear offline records:', error);
        }
    },

    removeRecord: (timestamp: number) => {
        try {
            const existing = OfflineStorage.getRecords();
            const filtered = existing.filter(r => r.timestamp !== timestamp);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        } catch (error) {
            console.error('Failed to remove offline record:', error);
        }
    },

    count: (): number => {
        return OfflineStorage.getRecords().length;
    }
};
