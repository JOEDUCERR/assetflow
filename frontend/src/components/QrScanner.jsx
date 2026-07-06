import { useEffect, useId, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

export default function QrScanner({ onScan, onError, active = true }) {
  const containerId = useId().replace(/:/g, '')
  const scannerRef = useRef(null)
  const [starting, setStarting] = useState(true)
  const [cameraError, setCameraError] = useState('')

  useEffect(() => {
    if (!active) {
      return undefined
    }

    let cancelled = false
    const scanner = new Html5Qrcode(containerId)
    scannerRef.current = scanner

    async function startScanner() {
      try {
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          (decodedText) => {
            onScan(decodedText)
          },
          () => {},
        )
        if (!cancelled) {
          setStarting(false)
          setCameraError('')
        }
      } catch {
        if (!cancelled) {
          setStarting(false)
          setCameraError(
            'Unable to access the camera. Please allow camera permissions or contact the IT team to assign or return the asset manually.',
          )
          onError?.(
            'Camera unavailable. Contact the IT team for manual assignment.',
          )
        }
      }
    }

    startScanner()

    return () => {
      cancelled = true
      scanner
        .stop()
        .then(() => scanner.clear())
        .catch(() => {})
    }
  }, [active, containerId, onError, onScan])

  return (
    <div className="scanner-wrap">
      <div id={containerId} className="scanner-viewport" />
      {starting && !cameraError && (
        <p className="scanner-status">Starting camera…</p>
      )}
      {cameraError && <div className="form-error">{cameraError}</div>}
    </div>
  )
}
