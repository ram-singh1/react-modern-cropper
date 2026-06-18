import { useCallback } from 'react'
import { useCropStore } from '@/store/cropStore'

const isVideoUrl = (url: string) => {
  if (url.startsWith('data:video/')) return true
  if (url.startsWith('blob:') && url.includes('/video-')) return true
  const cleanUrl = url.split(/[?#]/)[0]
  return /\.(mp4|webm|ogg|mov|mkv|3gp|avi)$/i.test(cleanUrl)
}

/** Load an image or video from a File, Blob, or URL string into the editor store. */
export function useImageLoader(onLoad?: (media: HTMLImageElement | HTMLVideoElement) => void) {
  const setImage = useCropStore((s) => s.setImage)
  const setLoading = useCropStore((s) => s.setLoading)

  const loadFromSrc = useCallback(
    (src: string, mediaType?: 'image' | 'video') =>
      new Promise<HTMLImageElement | HTMLVideoElement>((resolve, reject) => {
        const type = mediaType || (isVideoUrl(src) ? 'video' : 'image')
        setLoading(true, `Loading ${type}…`)

        if (type === 'video') {
          const video = document.createElement('video')
          video.crossOrigin = 'anonymous'
          video.preload = 'auto'
          video.muted = true
          video.playsInline = true
          video.onloadedmetadata = () => {
            setImage(src, video, 'video')
            setLoading(false)
            onLoad?.(video)
            resolve(video)
          }
          video.onerror = () => {
            setLoading(false)
            reject(new Error('Failed to load video'))
          }
          video.src = src
        } else {
          const img = new Image()
          img.crossOrigin = 'anonymous'
          img.onload = () => {
            setImage(src, img, 'image')
            setLoading(false)
            onLoad?.(img)
            resolve(img)
          }
          img.onerror = () => {
            setLoading(false)
            reject(new Error('Failed to load image'))
          }
          img.src = src
        }
      }),
    [setImage, setLoading, onLoad],
  )

  const loadFromFile = useCallback(
    (file: File) =>
      new Promise<HTMLImageElement | HTMLVideoElement>((resolve, reject) => {
        const isVideo = file.type.startsWith('video/')
        const isImage = file.type.startsWith('image/')
        if (!isImage && !isVideo) {
          reject(new Error('Unsupported file type. Please upload an image or video.'))
          return
        }
        
        const url = URL.createObjectURL(file)
        loadFromSrc(url, isVideo ? 'video' : 'image')
          .then((media) => {
            resolve(media)
          })
          .catch((err) => {
            URL.revokeObjectURL(url)
            reject(err)
          })
      }),
    [loadFromSrc],
  )

  return { loadFromSrc, loadFromFile }
}
