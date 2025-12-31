import { useState, useEffect, useRef } from 'react';
import { Upload, X, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@shared/components/Button';
import { routesApiService } from '@features/routes/services/routes.api.service';

interface RouteUploadProps {
    isOpen: boolean;
    onClose: () => void;
    refetch: () => void;
}

export function RouteUpload({ isOpen, onClose, refetch }: RouteUploadProps) {
    const [file, setFile] = useState<File | null>(null);
    const [name, setName] = useState('');
    const [uploading, setUploading] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const nameInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFile = e.target.files?.[0];
        if (selectedFile) {
            processFile(selectedFile);
        }
    };

    const handleRemoveFile = () => {
        setFile(null);
    };

    const validateFile = (selectedFile: File): boolean => {
        const validTypes = ['.kml'];
        const fileExtension = selectedFile.name.substring(selectedFile.name.lastIndexOf('.')).toLowerCase();

        if (!validTypes.includes(fileExtension)) {
            toast.error('Tipo de archivo no válido', {
                description: 'Solo se permiten archivos KML.',
            });
            return false;
        }

        return true;
    };

    const processFile = (selectedFile: File) => {
        if (validateFile(selectedFile)) {
            setFile(selectedFile);
            if (!name) {
                setName(selectedFile.name.replace(/\.[^/.]+$/, ''));
            }
        }
    };

    const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (!uploading) {
            setIsDragging(true);
        }
    };

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        if (!uploading) {
            setIsDragging(false);
        }
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        if (uploading) return;

        const droppedFile = e.dataTransfer.files?.[0];
        if (droppedFile) {
            processFile(droppedFile);
        }
    };

    const handleUpload = async () => {
        if (!file) {
            toast.error('Archivo requerido', {
                description: 'Por favor selecciona un archivo KML.',
            });
            return;
        }

        if (!name.trim()) {
            toast.error('Nombre requerido', {
                description: 'Por favor ingresa un nombre para la ruta.',
            });
            return;
        }

        setUploading(true);

        try {
            await routesApiService.uploadRoute(file, name.trim());
            toast.success('Ruta creada exitosamente', {
                description: `La ruta "${name.trim()}" ha sido registrada correctamente en el sistema.`,
            });
            setFile(null);
            setName('');
            refetch();
            onClose();
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            toast.error('Error al subir la ruta', {
                description: errorMessage,
            });
        } finally {
            setUploading(false);
        }
    };

    const handleClose = () => {
        if (!uploading) {
            onClose();
            setFile(null);
            setName('');
            setIsDragging(false);
        }
    };

    // Auto-focus en el nombre cuando se abre el modal
    useEffect(() => {
        if (isOpen && nameInputRef.current) {
            setTimeout(() => {
                nameInputRef.current?.focus();
            }, 100);
        }
    }, [isOpen]);

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            // Esc para cerrar
            if (e.key === 'Escape' && !uploading) {
                handleClose();
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, uploading]);

    // Formato de tamaño de archivo
    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={!uploading ? handleClose : undefined}
            />

            {/* Modal */}
            <div className="relative bg-white dark:bg-[#0A1628] border border-gray-300 dark:border-[#004599]/30 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col animate-in slide-in-from-bottom-4 duration-300">
                {/* Header */}
                <div className="flex items-center justify-between p-6 pb-4 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-primary/20 rounded-full">
                            <Upload size={20} className="text-primary" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Subir Ruta</h2>
                    </div>
                    <button
                        onClick={handleClose}
                        disabled={uploading}
                        className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors p-1 disabled:opacity-50"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto px-6 py-4">
                    <div className="space-y-4">
                    <div>
                        <label htmlFor="route-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Nombre de la ruta *
                        </label>
                        <input
                            ref={nameInputRef}
                            id="route-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Ej: Ruta de Patrullaje Norte"
                            disabled={uploading}
                            className="w-full px-3 py-2 bg-gray-50 dark:bg-black/30 border border-gray-300 dark:border-[#004599]/30 rounded-lg text-gray-900 dark:text-white text-sm placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 transition-all"
                        />
                    </div>

                    {!file ? (
                        <div
                            onDragEnter={handleDragEnter}
                            onDragLeave={handleDragLeave}
                            onDragOver={handleDragOver}
                            onDrop={handleDrop}
                            className={`relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ${
                                isDragging
                                    ? 'border-primary bg-primary/10 scale-[1.02] shadow-lg shadow-primary/20'
                                    : 'border-gray-300 dark:border-[#004599]/30 hover:border-primary/50 hover:bg-gray-50 dark:hover:bg-black/30 bg-gray-50 dark:bg-black/20'
                            }`}
                        >
                            {isDragging && (
                                <div className="absolute inset-0 bg-primary/5 rounded-xl animate-pulse" />
                            )}
                            <label
                                htmlFor="file-upload"
                                className="flex flex-col items-center justify-center w-full h-full cursor-pointer relative z-10"
                            >
                                <div className="flex flex-col items-center justify-center">
                                    <div className={`p-3 rounded-full mb-3 transition-all duration-200 ${
                                        isDragging ? 'bg-primary/20 scale-110' : 'bg-[#004599]/20'
                                    }`}>
                                        <Upload className={`w-8 h-8 transition-all duration-200 ${
                                            isDragging ? 'text-primary animate-bounce' : 'text-gray-400'
                                        }`} />
                                    </div>
                                    <p className={`mb-2 text-sm font-medium transition-colors ${
                                        isDragging ? 'text-primary' : 'text-gray-600 dark:text-gray-300'
                                    }`}>
                                        {isDragging ? 'Suelta el archivo aquí' : (
                                            <>
                                                <span className="font-semibold">Haz clic para subir</span> o arrastra y suelta
                                            </>
                                        )}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-500 flex items-center gap-1">
                                        <FileText className="w-3 h-3" />
                                        Solo archivos KML (max 5MB)
                                    </p>
                                </div>
                                <input
                                    ref={fileInputRef}
                                    id="file-upload"
                                    type="file"
                                    className="hidden"
                                    accept=".kml"
                                    onChange={handleFileChange}
                                    disabled={uploading}
                                />
                            </label>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-100 to-gray-50 dark:from-black/40 dark:to-black/30 rounded-xl border border-primary/30 animate-in slide-in-from-top-2 duration-300">
                            <div className="p-3 bg-primary/20 rounded-lg">
                                <FileText className="w-8 h-8 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate mb-0.5">
                                    {file.name}
                                </p>
                                <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                                    <span className="px-2 py-0.5 bg-primary/10 rounded text-primary font-medium">
                                        KML
                                    </span>
                                    <span>•</span>
                                    <span>{formatFileSize(file.size)}</span>
                                </div>
                            </div>
                            {!uploading && (
                                <button
                                    onClick={handleRemoveFile}
                                    className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                    aria-label="Remover archivo"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                        </div>
                    )}
                    </div>
                </div>

                {/* Footer with Actions */}
                <div className="p-6 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex gap-3">
                    <Button
                        type="button"
                        variant="secondary"
                        onClick={handleClose}
                        disabled={uploading}
                        className="flex-1"
                    >
                        Cancelar
                    </Button>
                    <Button
                        type="button"
                        variant="primary"
                        onClick={handleUpload}
                        disabled={!file || !name.trim() || uploading}
                        isLoading={uploading}
                        className="flex-1 relative"
                    >
                        {uploading ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                Subiendo...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <Upload className="w-4 h-4" />
                                Subir Ruta
                            </span>
                        )}
                    </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
