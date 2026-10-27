import { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import type { BaggageDto } from '../types';

interface PassengerQrModalProps {
  bag: BaggageDto | null;
  onClose: () => void;
}

export default function PassengerQrModal({ bag, onClose }: PassengerQrModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [useLanIp, setUseLanIp]   = useState(true);

  // Host IP for smartphone camera scanning over local Wi-Fi
  const detectedLanIp =
    typeof window !== 'undefined' &&
    window.location.hostname &&
    window.location.hostname !== 'localhost' &&
    window.location.hostname !== '127.0.0.1'
      ? window.location.hostname
      : '10.206.127.79';

  const port = typeof window !== 'undefined' && window.location.port ? window.location.port : '5173';

  const trackingUrl = bag
    ? useLanIp
      ? `http://${detectedLanIp}:${port}/track?id=${bag.baggageId}`
      : `${window.location.origin}/track?id=${bag.baggageId}`
    : '';

  useEffect(() => {
    if (!bag || !trackingUrl) return;
    QRCode.toDataURL(trackingUrl, {
      width: 220,
      margin: 2,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('QR generation error', err));
  }, [bag, trackingUrl]);

  if (!bag) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" style={{ maxWidth: 440 }} onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title">
            📱 Passenger Digital Baggage Tag
          </div>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body" style={{ alignItems: 'center', textAlign: 'center', gap: 14 }}>
          {/* Header Info */}
          <div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              Vaanam International Airport · Digital Luggage Pass
            </div>
            <div style={{ fontSize: 20, fontWeight: 800, color: '#fff', marginTop: 2 }}>
              {bag.baggageId}
            </div>
            <div style={{ fontSize: 13, color: 'var(--accent-blue)', fontWeight: 600 }}>
              Flight {bag.flightNumber || bag.assignedFlightId} ➔ Gate {bag.destinationBayId}
            </div>
          </div>

          {/* Scannable QR Code */}
          <div
            style={{
              background: '#fff',
              padding: 14,
              borderRadius: 12,
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)',
              display: 'inline-block',
            }}
          >
            {qrDataUrl ? (
              <img
                src={qrDataUrl}
                alt={`QR code for luggage ${bag.baggageId}`}
                style={{ width: 200, height: 200, display: 'block' }}
              />
            ) : (
              <div style={{ width: 200, height: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="spinner" />
              </div>
            )}
          </div>

          {/* Scan Instructions */}
          <div style={{ fontSize: 13, color: '#e2e8f0', lineHeight: 1.4, padding: '0 10px' }}>
            📷 <strong>Scan with any smartphone camera</strong> to open the live real-time passenger luggage tracker!
          </div>

          {/* IP Toggle for presentation flexibility */}
          <div style={{ display: 'flex', gap: 10, fontSize: 11, color: 'var(--text-secondary)' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <input
                type="radio"
                name="ipType"
                checked={useLanIp}
                onChange={() => setUseLanIp(true)}
              />
              Wi-Fi Phone Scan ({detectedLanIp})
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <input
                type="radio"
                name="ipType"
                checked={!useLanIp}
                onChange={() => setUseLanIp(false)}
              />
              Localhost (Desktop)
            </label>
          </div>

          <div
            style={{
              fontSize: 10,
              fontFamily: 'monospace',
              color: 'var(--text-muted)',
              wordBreak: 'break-all',
              background: 'rgba(0,0,0,0.3)',
              padding: '4px 8px',
              borderRadius: 4,
              width: '100%',
            }}
          >
            {trackingUrl}
          </div>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <a
            href={`/track?id=${bag.baggageId}`}
            target="_blank"
            rel="noreferrer"
            className="btn btn-primary"
            style={{ flex: 1 }}
          >
            🖥️ Open Passenger View
          </a>
          <button type="button" className="btn btn-ghost" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
