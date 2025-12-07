'use client'

import React, { useState } from 'react'
import { Download, ExternalLink, X, ZoomIn, ZoomOut } from 'lucide-react'
import { Modal } from '@/components/ui/Modal'

interface FileViewerProps {
  fileUrl: string
  fileName: string
  fileType?: 'pdf' | 'image'
}

export function FileViewer({ fileUrl, fileName, fileType = 'pdf' }: FileViewerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [zoom, setZoom] = useState(100)

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = fileUrl
    link.download = fileName
    link.target = '_blank'
    link.click()
  }

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
      >
        <ExternalLink className="w-4 h-4" />
        View Certificate
      </button>

      <Modal 
        isOpen={isOpen} 
        onClose={() => setIsOpen(false)} 
        title={fileName}
        size="xl"
      >
        <div className="space-y-4">
          {/* Controls */}
          <div className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center gap-2">
              {fileType === 'image' && (
                <>
                  <button
                    onClick={() => setZoom(Math.max(50, zoom - 10))}
                    className="p-2 hover:bg-gray-200 rounded transition-colors"
                    aria-label="Zoom out"
                  >
                    <ZoomOut className="w-4 h-4" />
                  </button>
                  <span className="text-sm font-medium">{zoom}%</span>
                  <button
                    onClick={() => setZoom(Math.min(200, zoom + 10))}
                    className="p-2 hover:bg-gray-200 rounded transition-colors"
                    aria-label="Zoom in"
                  >
                    <ZoomIn className="w-4 h-4" />
                  </button>
                </>
              )}
            </div>
            <button
              onClick={handleDownload}
              className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
          </div>

          {/* Viewer */}
          <div className="border border-gray-200 rounded-lg overflow-auto max-h-[600px] bg-gray-50">
            {fileType === 'pdf' ? (
              <iframe
                src={fileUrl}
                className="w-full h-[600px]"
                title={fileName}
              />
            ) : (
              <div className="p-4 flex items-center justify-center">
                <img
                  src={fileUrl}
                  alt={fileName}
                  style={{ width: `${zoom}%` }}
                  className="max-w-none"
                />
              </div>
            )}
          </div>
        </div>
      </Modal>
    </>
  )
}