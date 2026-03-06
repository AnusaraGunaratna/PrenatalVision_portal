import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './libs/context/AuthContext';
import { ProtectedRoute } from './libs/components/ProtectedRoute';
import { AppLayout } from './libs/components/AppLayout/AppLayout';
import { LoginPage } from './modules/auth/LoginPage';
import { RegisterPage } from './modules/auth/RegisterPage';
import { ScanAnalysisPage } from './modules/scanAnalysis/ScanAnalysisPage';
import { SavedScansPage } from './modules/savedScans/SavedScansPage';
import { SavedScanDetailPage } from './modules/savedScans/SavedScanDetailPage';
import { UserSettingsPage } from './modules/settings/UserSettingsPage';

function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <Routes>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route
                        element={
                            <ProtectedRoute>
                                <AppLayout />
                            </ProtectedRoute>
                        }
                    >
                        <Route path="/" element={<ScanAnalysisPage />} />
                        <Route path="/saved-scans" element={<SavedScansPage />} />
                        <Route path="/saved-scans/:id" element={<SavedScanDetailPage />} />
                        <Route path="/settings" element={<UserSettingsPage />} />
                    </Route>
                    <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
            </AuthProvider>
        </BrowserRouter>
    );
}

export default App;
