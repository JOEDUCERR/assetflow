import { useEffect, useId, useRef, useState } from 'react'
import { Html5Qrcode, Html5QrcodeScannerState } from 'html5-qrcode'

export default function QrScanner({ onScan, onError, active = true }) {
  const containerId = useId().replace(/:/g, '')
  const scannerRef = useRef(null)
  const onScanRef = useRef(onScan)
  const onErrorRef = useRef(onError)
  const [starting, setStarting] = useState(true)
  const [cameraError, setCameraError] = useState('')

  useEffect(() => {
    onScanRef.current = onScan
    onErrorRef.current = onError
  }, [onError, onScan])

  useEffect(() => {
    if (!active) {
      return undefined
    }

    let cancelled = false
    let cleanedUp = false
    let hasScanned = false
    let startPromise = null
    const scanner = new Html5Qrcode(containerId)
    scannerRef.current = scanner

    async function stopScanner() {
      try {
        const state = scanner.getState()
        const canStop =
          state === Html5QrcodeScannerState.SCANNING ||
          state === Html5QrcodeScannerState.PAUSED

        if (canStop) {
          await scanner.stop()
        }
      } catch {
        // The scanner can transition during React Strict Mode cleanup.
      }
    }

    async function cleanupScanner() {
      if (cleanedUp) return

      cleanedUp = true
      await startPromise?.catch(() => {})
      await stopScanner()
      try {
        scanner.clear()
      } catch {
        // Clear can race with an incomplete start in development remounts.
      }
      if (scannerRef.current === scanner) {
        scannerRef.current = null
      }
    }

    async function startScanner() {
      try {
        startPromise = scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 240, height: 240 } },
          async (decodedText) => {
            if (hasScanned || cancelled) return

            hasScanned = true
            await stopScanner()

            if (!cancelled) {
              onScanRef.current(decodedText)
            }
          },
          () => {},
        )
        await startPromise
        if (cancelled) {
          cleanupScanner()
          return
        }
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
          onErrorRef.current?.(
            'Camera unavailable. Contact the IT team for manual assignment.',
          )
        }
      }
    }

    startScanner()

    return () => {
      cancelled = true
      cleanupScanner()
    }
  }, [active, containerId])

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
