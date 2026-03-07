import { auth } from '../config/firebase';

const API_BASE = 'http://localhost:5000/api';

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
        const res = await fetch(`${API_BASE}${endpoint}`, { headers: getHeaders() });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },
    post: async (endpoint: string, data: any) => {
        const res = await fetch(`${API_BASE}${endpoint}`, {
            method: 'POST',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },
    put: async (endpoint: string, data: any) => {
        const res = await fetch(`${API_BASE}${endpoint}`, {
            method: 'PUT',
            headers: getHeaders(),
            body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    },
    delete: async (endpoint: string) => {
        const res = await fetch(`${API_BASE}${endpoint}`, {
            method: 'DELETE',
            headers: getHeaders()
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
    }
};
