import React from 'react';

interface QRCodeProps {
    url: string;
    size?: number;
}

const QRCodeKiosk: React.FC<QRCodeProps> = ({ url, size = 200 }) => {
    // Generate QR code URL using public API
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(url)}`;

    return (
        <div className="flex flex-col items-center gap-3">
            <div className="p-4 bg-white rounded-2xl shadow-lg">
                <img
                    src={qrCodeUrl}
                    alt="QR Code Kiosk Mode"
                    className="w-full h-full"
                    style={{ width: size, height: size }}
                />
            </div>
            <p className="text-sm text-gray-500 text-center">
                Scan untuk akses Kiosk Mode
            </p>
        </div>
    );
};

export default QRCodeKiosk;
