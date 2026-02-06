import React, { useRef, useState, useEffect } from 'react';
import { Camera, CheckCircle, AlertCircle, Loader } from 'lucide-react';
import * as faceapi from 'face-api.js';

interface FaceVerificationProps {
    onFaceDetected: (detected: boolean) => void;
}

const FaceVerification: React.FC<FaceVerificationProps> = ({ onFaceDetected }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [status, setStatus] = useState<'loading' | 'ready' | 'detecting' | 'detected' | 'error'>('loading');
    const [error, setError] = useState<string>('');
    const [modelsLoaded, setModelsLoaded] = useState(false);

    // Load face-api models
    useEffect(() => {
        const loadModels = async () => {
            try {
                const MODEL_URL = '/models'; // Models should be in public/models folder

                await Promise.all([
                    faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
                    faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
                    faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
                    faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL) // Added expression model
                ]);

                setModelsLoaded(true);
                setStatus('ready');
            } catch (err) {
                console.error('Error loading models:', err);
                setError('Gagal memuat model AI. Pastikan file model tersedia di /public/models');
                setStatus('error');
            }
        };

        loadModels();
    }, []);

    // Start webcam
    useEffect(() => {
        if (!modelsLoaded) return;

        const startVideo = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: 640,
                        height: 480
                    }
                });

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error('Error accessing camera:', err);
                setError('Gagal mengakses kamera. Pastikan izin kamera telah diberikan');
                setStatus('error');
            }
        };

        startVideo();

        return () => {
            // Cleanup: stop all video streams
            if (videoRef.current && videoRef.current.srcObject) {
                const stream = videoRef.current.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [modelsLoaded]);

    // Detect face
    const handleDetectFace = async () => {
        if (!videoRef.current || status === 'detecting') return;

        setStatus('detecting');

        try {
            const detections = await faceapi.detectAllFaces(
                videoRef.current,
                new faceapi.TinyFaceDetectorOptions()
            ).withFaceLandmarks().withFaceExpressions(); // Enable expressions

            if (detections.length > 0) {
                // Liveness Detection: Check for smile
                const detection = detections[0];
                const expressions = detection.expressions;

                if (expressions && expressions.happy > 0.7) {
                    setStatus('detected');
                    onFaceDetected(true);
                } else {
                    setStatus('ready');
                    setError('Wajah terdeteksi. Silakan TERSENYUM untuk verifikasi!');
                    onFaceDetected(false);
                }
            } else {
                setError('Tidak ada wajah terdeteksi. Posisikan wajah di depan kamera');
                setStatus('ready');
                onFaceDetected(false);
            }
        } catch (err) {
            console.error('Detection error:', err);
            setError('Error saat mendeteksi wajah');
            setStatus('ready');
            onFaceDetected(false);
        }
    };

    if (status === 'loading') {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-blue-50 rounded-xl border border-blue-200">
                <Loader className="w-8 h-8 text-blue-500 animate-spin mb-4" />
                <p className="text-sm font-medium text-blue-800">Memuat Model AI...</p>
                <p className="text-xs text-blue-600">Tunggu sebentar</p>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <div>
                    <p className="text-sm font-medium text-red-800">Error</p>
                    <p className="text-xs text-red-600">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="relative rounded-xl overflow-hidden bg-black">
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-auto"
                    onLoadedMetadata={() => setStatus('ready')}
                />
                {status === 'detecting' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                        <Loader className="w-12 h-12 text-white animate-spin" />
                    </div>
                )}
                {/* Face Box Overlay (Optional) */}
                <div className="absolute bottom-4 left-0 right-0 text-center">
                    <p className="text-white text-sm bg-black/50 py-1 px-3 rounded-full inline-block">
                        {status === 'ready' ? 'Silakan Tersenyum 🙂' : status === 'detecting' ? 'Mengecek...' : 'Berhasil!'}
                    </p>
                </div>
            </div>

            {status === 'detected' ? (
                <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl animate-scale-in">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <div>
                        <p className="text-sm font-medium text-green-800">✓ Verifikasi Berhasil</p>
                        <p className="text-xs text-green-600">Liveness confirmed (Smile detected)</p>
                    </div>
                </div>
            ) : (
                <button
                    onClick={handleDetectFace}
                    disabled={status === 'detecting'}
                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Camera className="w-5 h-5" />
                    {status === 'detecting' ? 'Mendeteksi Ekspresi...' : 'Verifikasi (Tersenyum)'}
                </button>
            )}

            {error && (
                <p className="text-xs text-red-600 text-center">{error}</p>
            )}
        </div>
    );
};

export default FaceVerification;
