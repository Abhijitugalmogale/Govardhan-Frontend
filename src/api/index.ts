import { auth } from '../config/firebase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const API_BASE = `${API_URL}/api`;

const getHeaders = () => {
    const uid = auth.currentUser?.uid;
    if (!uid) {
        // Fallback for development if not actually logged in but testing UI bypass
        return {
            'Content-Type': 'application/json',
            'x-user-id': 'dev-user-mock-123'
        };
    }
    return {
        'Content-Type': 'application/json',
        'x-user-id': uid
    };
};

export const api = {
    get: async (endpoint: string) => {
        try {
            const res = await fetch(`${API_BASE}${endpoint}`, { headers: getHeaders() });
            const text = await res.text();
            if (!res.ok) {
                console.error(`API Error [${res.status}]:`, text);
                throw new Error(`${res.status}: ${text}`);
            }
            return JSON.parse(text);
        } catch (error) {
            console.error(`GET ${endpoint} failed:`, error);
            throw error;
        }
    },
    post: async (endpoint: string, data: any) => {
        try {
            const res = await fetch(`${API_BASE}${endpoint}`, {
                method: 'POST',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });
            const text = await res.text();
            if (!res.ok) {
                console.error(`API Error [${res.status}]:`, text);
                throw new Error(`${res.status}: ${text}`);
            }
            return JSON.parse(text);
        } catch (error) {
            console.error(`POST ${endpoint} failed:`, error);
            throw error;
        }
    },
    put: async (endpoint: string, data: any) => {
        try {
            const res = await fetch(`${API_BASE}${endpoint}`, {
                method: 'PUT',
                headers: getHeaders(),
                body: JSON.stringify(data)
            });
            const text = await res.text();
            if (!res.ok) {
                console.error(`API Error [${res.status}]:`, text);
                throw new Error(`${res.status}: ${text}`);
            }
            return JSON.parse(text);
        } catch (error) {
            console.error(`PUT ${endpoint} failed:`, error);
            throw error;
        }
    },
    delete: async (endpoint: string) => {
        try {
            const res = await fetch(`${API_BASE}${endpoint}`, {
                method: 'DELETE',
                headers: getHeaders()
            });
            const text = await res.text();
            if (!res.ok) {
                console.error(`API Error [${res.status}]:`, text);
                throw new Error(`${res.status}: ${text}`);
            }
            return JSON.parse(text);
        } catch (error) {
            console.error(`DELETE ${endpoint} failed:`, error);
            throw error;
        }
    }
};
