import { ErrorBoundary } from '@shared/components/ErrorBoundary';
import { AppProvider } from '@core/store';
import { AppRouter } from '@core/router';

function App() {
    return (
        <ErrorBoundary>
            <AppProvider>
                <AppRouter />
            </AppProvider>
        </ErrorBoundary>
    );
}

export default App;