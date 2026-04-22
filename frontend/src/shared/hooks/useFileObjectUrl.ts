import { useCallback, useEffect, useState } from 'react'

function revokeIfObjectUrl(url: string) {
  if (url.startsWith('blob:')) {
    URL.revokeObjectURL(url)
  }
}

/**
 * Keeps a File + its object URL preview in sync and revokes the URL on replace/unmount.
 * Useful for image upload previews without leaking blob URLs.
 */
export function useFileObjectUrl() {
  const [file, setFileState] = useState<File | null>(null)
  const [url, setUrl] = useState('')

  const clear = useCallback(() => {
    revokeIfObjectUrl(url)
    setFileState(null)
    setUrl('')
  }, [url])

  const setFile = useCallback(
    (next: File | null) => {
      revokeIfObjectUrl(url)
      if (!next) {
        setFileState(null)
        setUrl('')
        return
      }
      setFileState(next)
      setUrl(URL.createObjectURL(next))
    },
    [url],
  )

  useEffect(() => {
    return () => {
      revokeIfObjectUrl(url)
    }
  }, [url])

  return { file, url, setFile, clear } as const
}

