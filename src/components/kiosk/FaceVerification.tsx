import React, { useRef, useState, useEffect } from 'react';
import { Camera, CheckCircle, AlertCircle, Loader, Smile, Meh } from 'lucide-react';
import * as faceapi from 'face-api.js';

interface FaceVerificationProps {
    onFaceDetected: (detected: boolean) => void;
}

type ChallengeType = 'happy' | 'surprised' | 'neutral';

const CHALLENGES: { type: ChallengeType; label: string; icon: React.ReactNode }[] = [
    { type: 'happy', label: 'Tersenyum Lebar 😀', icon: <Smile className="w-8 h-8 text-yellow-400" /> },
    { type: 'surprised', label: 'Terkejut 😮', icon: <span className="text-3xl">😮</span> },
    { type: 'neutral', label: 'Wajah Datar 😐', icon: <Meh className="w-8 h-8 text-gray-400" /> }
];

const FaceVerification: React.FC<FaceVerificationProps> = ({ onFaceDetected }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [status, setStatus] = useState<'loading' | 'ready' | 'detecting' | 'detected' | 'error'>('loading');
    const [error, setError] = useState<string>('');
    const [modelsLoaded, setModelsLoaded] = useState(false);
    const [currentChallenge, setCurrentChallenge] = useState<typeof CHALLENGES[0]>(CHALLENGES[0]);

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
                // Select random challenge on load
                setCurrentChallenge(CHALLENGES[Math.floor(Math.random() * CHALLENGES.length)]);
                setStatus('ready');
            } catch (err) {
                console.error('Error loading models:', err);
                console.error('Error loading models:', err);
                setError('Gagal memuat model AI. Periksa koneksi internet atau refresh.');
                setStatus('error');
            }
        };

        loadModels();
    }, []);

    // Start webcam
    useEffect(() => {
        if (!modelsLoaded) return;

        const currentVideoRef = videoRef.current;

        const startVideo = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: {
                        width: { ideal: 640 },
                        height: { ideal: 480 },
                        facingMode: 'user' // Prioritize front camera on mobile
                    }
                });

                if (currentVideoRef) {
                    currentVideoRef.srcObject = stream;
                }
            } catch (err) {
                console.error('Error accessing camera:', err);
                setError('Gagal mengakses kamera. Izinkan akses kamera di browser Anda.');
                setStatus('error');
            }
        };

        startVideo();

        return () => {
            // Cleanup: stop all video streams
            if (currentVideoRef && currentVideoRef.srcObject) {
                const stream = currentVideoRef.srcObject as MediaStream;
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [modelsLoaded]);

    // Detect face
    const handleDetectFace = async () => {
        if (!videoRef.current || status === 'detecting') return;

        setStatus('detecting');
        setError('');

        try {
            const detections = await faceapi.detectAllFaces(
                videoRef.current,
                new faceapi.TinyFaceDetectorOptions()
            ).withFaceLandmarks().withFaceExpressions(); // Enable expressions

            if (detections.length > 0) {
                // Liveness Detection: Check for specific expression
                const detection = detections[0];
                const expressions = detection.expressions;

                let isMatch = false;
                const THRESHOLD = 0.5;

                if (expressions) {
                    if (currentChallenge.type === 'happy' && expressions.happy > THRESHOLD) isMatch = true;
                    else if (currentChallenge.type === 'surprised' && expressions.surprised > THRESHOLD) isMatch = true;
                    else if (currentChallenge.type === 'neutral' && expressions.neutral > THRESHOLD) isMatch = true;
                }

                if (isMatch) {
                    setStatus('detected');
                    onFaceDetected(true);
                } else {
                    setStatus('ready');
                    setError(`Ekspresi salah! Mohon tunjukkan ekspresi: ${currentChallenge.label}`);
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
        <div className="space-y-6">
            <div className="flex flex-col items-center gap-2 p-4 bg-white/20 rounded-xl border border-white/30 text-white">
                <p className="font-medium text-sm text-white/80">Tantangan Ekspresi:</p>
                <div className="flex items-center gap-3">
                    {currentChallenge.icon}
                    <span className="text-xl font-bold">{currentChallenge.label}</span>
                </div>
            </div>

            <div className="relative rounded-xl overflow-hidden bg-black shadow-2xl border-4 border-white/20">
                <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className="w-full h-auto transform scale-x-[-1]" // Mirror effect
                    onLoadedMetadata={() => setStatus('ready')}
                />
                {status === 'detecting' && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm z-10">
                        <Loader className="w-12 h-12 text-white animate-spin" />
                    </div>
                )}

                {/* Overlay Instructions */}
                <div className="absolute bottom-4 left-0 right-0 text-center z-20">
                    <p className="text-white text-sm bg-black/60 py-2 px-4 rounded-full inline-block backdrop-blur-md">
                        {status === 'ready' ? `Tunjukkan ekspresi: ${currentChallenge.label}` : status === 'detecting' ? 'Menganalisis...' : 'Berhasil!'}
                    </p>
                </div>
            </div>

            {status === 'detected' ? (
                <div className="flex items-center gap-3 p-4 bg-green-500/20 border border-green-400 rounded-xl animate-scale-in">
                    <CheckCircle className="w-6 h-6 text-green-400" />
                    <div>
                        <p className="text-base font-bold text-white">Verifikasi Berhasil</p>
                        <p className="text-sm text-white/80">Ekspresi sesuai dengan tantangan</p>
                    </div>
                </div>
            ) : (
                <button
                    onClick={handleDetectFace}
                    disabled={status === 'detecting'}
                    className="w-full flex items-center justify-center gap-2 px-4 py-4 bg-white text-indigo-600 rounded-xl font-bold hover:bg-gray-100 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
                >
                    <Camera className="w-5 h-5" />
                    {status === 'detecting' ? 'Mendeteksi...' : 'Ambil Foto & Verifikasi'}
                </button>
            )}

            {error && (
                <div className="bg-red-500/20 border border-red-500/50 p-3 rounded-xl animate-shake">
                    <p className="text-sm text-center text-white font-medium">{error}</p>
                </div>
            )}
        </div>
    );
};

export default FaceVerification;
