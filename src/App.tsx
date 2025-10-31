import { ErrorBoundary } from '@shared/components/ErrorBoundary';
import { AppProvider } from '@core/store';
import { AppRouter } from '@core/router';
import { Toaster } from 'sonner';

function App() {
    return (
        <ErrorBoundary>
            <AppProvider>
                <AppRouter />
                <Toaster
                    position="top-right"
                    richColors
                    theme="dark"
                    closeButton
                />
            </AppProvider>
        </ErrorBoundary>
    );
}

export default App;