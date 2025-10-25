// src/utils/handleError.ts
export class AppError extends Error {
    code?: string;
    statusCode?: number;

    constructor(
        message: string,
        code?: string,
        statusCode?: number
    ) {
        super(message);
        this.name = 'AppError';
        this.code = code;
        this.statusCode = statusCode;
    }
}

export const handleError = (error: unknown): string => {
    if (error instanceof AppError) {
        return error.message;
    }

    if (error instanceof Error) {
        return error.message;
    }

    if (typeof error === 'string') {
        return error;
    }

    return 'Ha ocurrido un error inesperado';
};

export const logError = (error: unknown, context?: string) => {
    const errorMessage = handleError(error);
    const timestamp = new Date().toISOString();

    console.error(`[${timestamp}] ${context || 'Error'}:`, errorMessage);

    // TODO: Integrar con servicio de monitoreo (Sentry, LogRocket, etc.)
};

export const createApiError = (statusCode: number, message: string): AppError => {
    return new AppError(message, `API_ERROR_${statusCode}`, statusCode);
};