import React, { useState, useEffect } from 'react';
import { MapPin, AlertCircle, CheckCircle } from 'lucide-react';

interface LocationGuardProps {
    onLocationVerified: (verified: boolean) => void;
    schoolLat?: number;
    schoolLng?: number;
    maxDistanceKm?: number;
}

const LocationGuard: React.FC<LocationGuardProps> = ({
    onLocationVerified,
    schoolLat = -6.9589335, // Default: Jakarta coordinates (change to your school)
    schoolLng = 108.9813691,
    maxDistanceKm = 50  // 50 km radius for testing (change to 0.5 for production)
}) => {
    const [status, setStatus] = useState<'checking' | 'verified' | 'denied' | 'error'>('checking');
    const [distance, setDistance] = useState<number | null>(null);
    const [error, setError] = useState<string>('');

    // Calculate distance between two coordinates using Haversine formula
    const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371; // Earth's radius in kilometers
        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    };

    useEffect(() => {
        if (!navigator.geolocation) {
            setStatus('error');
            setError('Browser tidak mendukung geolokasi');
            onLocationVerified(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { latitude, longitude } = position.coords;
                const dist = calculateDistance(latitude, longitude, schoolLat, schoolLng);
                setDistance(dist);

                if (dist <= maxDistanceKm) {
                    setStatus('verified');
                    onLocationVerified(true);
                } else {
                    setStatus('denied');
                    onLocationVerified(false);
                }
            },
            (err) => {
                setStatus('error');
                setError(err.message || 'Gagal mendapatkan lokasi');
                onLocationVerified(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 15000,
                maximumAge: 5000
            }
        );
    }, [schoolLat, schoolLng, maxDistanceKm, onLocationVerified]);

    if (status === 'checking') {
        return (
            <div className="flex items-center gap-3 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <MapPin className="w-5 h-5 text-blue-500 animate-pulse" />
                <div>
                    <p className="text-sm font-medium text-blue-800">Memverifikasi Lokasi...</p>
                    <p className="text-xs text-blue-600">Pastikan GPS aktif</p>
                </div>
            </div>
        );
    }

    if (status === 'verified') {
        return (
            <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                    <p className="text-sm font-medium text-green-800">✓ Lokasi Terverifikasi</p>
                    <p className="text-xs text-green-600">
                        Jarak: {distance ? (distance * 1000).toFixed(0) : '?'} meter dari sekolah
                    </p>
                </div>
            </div>
        );
    }

    if (status === 'denied') {
        return (
            <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
                <AlertCircle className="w-5 h-5 text-red-500" />
                <div>
                    <p className="text-sm font-medium text-red-800">Lokasi Terlalu Jauh</p>
                    <p className="text-xs text-red-600">
                        Jarak: {distance ? (distance * 1000).toFixed(0) : '?'} meter. Maksimal: {maxDistanceKm * 1000} meter
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-xl">
            <AlertCircle className="w-5 h-5 text-yellow-500" />
            <div>
                <p className="text-sm font-medium text-yellow-800">Error Lokasi</p>
                <p className="text-xs text-yellow-600">{error}</p>
            </div>
        </div>
    );
};

export default LocationGuard;
