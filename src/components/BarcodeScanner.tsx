import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'
import type { IScannerControls } from '@zxing/browser'

interface Props {
  onDetected: (barcode: string) => void
  onClose: () => void
}

export function BarcodeScanner({ onDetected, onClose }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const controlsRef = useRef<IScannerControls | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    const reader = new BrowserMultiFormatReader()

    reader
      .decodeFromConstraints(
        { video: { facingMode: 'environment' } },
        videoRef.current ?? undefined,
        (result, _err, controls) => {
          controlsRef.current = controls
          if (result && !cancelled) {
            cancelled = true
            controls.stop()
            onDetected(result.getText())
          }
        },
      )
      .catch((err: unknown) => {
        if (cancelled) return
        const name = err instanceof Error ? err.name : ''
        if (name === 'NotAllowedError') {
          setError('Permiso de cámara denegado. Actívalo en los ajustes de Safari para este sitio.')
        } else if (name === 'NotFoundError') {
          setError('No se encontró ninguna cámara en este dispositivo.')
        } else {
          setError('No se pudo iniciar la cámara.')
        }
      })

    return () => {
      cancelled = true
      controlsRef.current?.stop()
    }
  }, [onDetected])

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-sheet" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Escanear código de barras</h3>
          <button className="icon-btn" onClick={onClose}>
            ✕
          </button>
        </div>

        {error ? (
          <p className="empty-state">{error}</p>
        ) : (
          <>
            <div className="scanner-frame">
              <video ref={videoRef} muted playsInline />
            </div>
            <p className="entry-meta" style={{ textAlign: 'center', marginTop: 10 }}>
              Apunta a un código de barras EAN del producto
            </p>
          </>
        )}

        <button className="btn-secondary" style={{ width: '100%', marginTop: 12 }} onClick={onClose}>
          Cancelar
        </button>
      </div>
    </div>
  )
}
