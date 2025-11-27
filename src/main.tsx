import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './hooks/useTheme';
import { supabase } from './lib/supabase';
import App from './App';
import './index.css';

// Processar callback OAuth ANTES de renderizar o app
const handleOAuthCallback = async () => {
  console.log('🌐 URL atual:', window.location.href);
  console.log('🌐 Hash:', window.location.hash);

  const hashParams = new URLSearchParams(window.location.hash.substring(1));
  const accessToken = hashParams.get('access_token');

  if (accessToken) {
    console.log('🔑 Token OAuth detectado, processando...');
    // Dar tempo para o Supabase processar
    await new Promise(resolve => setTimeout(resolve, 100));
  } else {
    console.log('⚠️ Nenhum token OAuth no hash');
  }
};

handleOAuthCallback().then(() => {
  createRoot(document.getElementById('root')!).render(
    <StrictMode>
      <BrowserRouter>
        <AuthProvider>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </AuthProvider>
      </BrowserRouter>
    </StrictMode>
  );
});