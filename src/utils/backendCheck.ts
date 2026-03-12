const API_URL = import.meta.env.VITE_API_URL || 'https://govardhan-backend-1.onrender.com';

export const checkBackendConnectivity = async (): Promise<{
    isAvailable: boolean;
    message: string;
    apiUrl: string;
    error?: string;
}> => {
    try {
        console.log(`Checking backend connectivity to: ${API_URL}`);
        const response = await fetch(`${API_URL}/health`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            const data = await response.json();
            console.log('Backend health check passed:', data);
            return {
                isAvailable: true,
                message: `Backend is running (${data.environment} mode)`,
                apiUrl: API_URL
            };
        } else {
            console.warn(`Backend returned status ${response.status}`);
            return {
                isAvailable: false,
                message: `Backend returned status ${response.status}`,
                apiUrl: API_URL,
                error: `HTTP ${response.status}`
            };
        }
    } catch (error: any) {
        console.error('Backend connectivity check failed:', error);
        return {
            isAvailable: false,
            message: `Cannot connect to backend at ${API_URL}`,
            apiUrl: API_URL,
            error: error.message || 'Network error'
        };
    }
};

export const testApiEndpoint = async (endpoint: string, userId?: string) => {
    try {
        const headers: any = {
            'Content-Type': 'application/json'
        };
        
        if (userId) {
            headers['x-user-id'] = userId;
        }

        const response = await fetch(`${API_URL}${endpoint}`, {
            method: 'GET',
            headers
        });

        if (response.ok) {
            const data = await response.json();
            return { success: true, data };
        } else {
            const error = await response.text();
            return { 
                success: false, 
                status: response.status,
                error 
            };
        }
    } catch (error: any) {
        return {
            success: false,
            error: error.message || 'Network error'
        };
    }
};
