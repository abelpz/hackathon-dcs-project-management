import React, { FormEvent, useState } from 'react';
import { useProjectManager } from '../contexts/ProjectManagerContext';

export const LoginForm: React.FC = () => {
    const { login, isLoading, error } = useProjectManager();
    const [formData, setFormData] = useState({
        username: '',
        password: '',
        apiUrl: 'https://qa.door43.org/api/v1'
    });

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        const { username, password, apiUrl } = formData;
        await login(username, password, apiUrl);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <div className="login-container">
            <form className="login-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                        className="theia-input"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        className="theia-input"
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="apiUrl">DCS API URL</label>
                    <input
                        type="url"
                        id="apiUrl"
                        name="apiUrl"
                        value={formData.apiUrl}
                        onChange={handleChange}
                        required
                        className="theia-input"
                    />
                </div>
                {error && <div className="error-message">{error}</div>}
                <button type="submit" className="theia-button main" disabled={isLoading}>
                    {isLoading ? 'Logging in...' : 'Login'}
                </button>
            </form>
            {isLoading && (
                <div className="loading-indicator">
                    <div className="spinner" />
                </div>
            )}
        </div>
    );
}; 