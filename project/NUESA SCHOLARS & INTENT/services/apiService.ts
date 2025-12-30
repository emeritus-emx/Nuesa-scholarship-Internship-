
import { User } from '../types';

const API_BASE_URL = 'http://localhost:8000/api'; // Change to your production URL when deployed

export const apiService = {
    async register(name: string, email: string, password: string): Promise<any> {
        const response = await fetch(`${API_BASE_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ full_name: name, email, password })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Registration failed');
        }
        return response.json();
    },

    async login(email: string, password: string): Promise<{access_token: string, token_type: string}> {
        const response = await fetch(`${API_BASE_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.detail || 'Login failed');
        }

        const data = await response.json();
        localStorage.setItem('nuesa_token', data.access_token);
        return data;
    },

    async getTrendingOpportunities(): Promise<any[]> {
        const response = await fetch(`${API_BASE_URL}/opportunities/trending`);
        if (!response.ok) return [];
        return response.json();
    },

    logout() {
        localStorage.removeItem('nuesa_token');
    }
};
