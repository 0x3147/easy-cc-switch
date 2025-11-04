import { useState, useEffect } from 'react'
import { IconButton } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import MinimizeIcon from '@mui/icons-material/Minimize'
import CropSquareIcon from '@mui/icons-material/CropSquare'
import './index.less'

type Platform = 'darwin' | 'win32' | 'linux'

const TitleBar = () => {
  const [platform, setPlatform] = useState<Platform>('darwin')

  useEffect(() => {
    const detectedPlatform = window.api?.getPlatform()
    if (detectedPlatform) {
      setPlatform(detectedPlatform as Platform)
    }
  }, [])

  const handleMinimize = () => {
    window.api?.windowMinimize()
  }

  const handleMaximize = () => {
    window.api?.windowMaximize()
  }

  const handleClose = () => {
    window.api?.windowClose()
  }

  // macOS 现代化设计 - 不使用 MUI 组件
  if (platform === 'darwin') {
    return (
      <div className="title-bar title-bar--darwin">
        <div className="title-bar__toolbar">
          <div className="title-bar__traffic-lights-spacer" />
          <div className="title-bar__title">Easy CC Switch</div>
          <div className="title-bar__actions-spacer" />
        </div>
      </div>
    )
  }

  // Windows/Linux 现代化设计
  return (
    <div className="title-bar title-bar--windows">
      <div className="title-bar__toolbar title-bar__toolbar--windows">
        <div className="title-bar__brand">
          <div className="title-bar__title">Easy CC Switch</div>
        </div>

        <div className="title-bar__controls">
          <IconButton
            size="small"
            onClick={handleMinimize}
            className="title-bar__control-btn title-bar__control-btn--minimize"
            aria-label="Minimize"
          >
            <MinimizeIcon className="title-bar__control-icon" />
          </IconButton>

          <IconButton
            size="small"
            onClick={handleMaximize}
            className="title-bar__control-btn title-bar__control-btn--maximize"
            aria-label="Maximize"
          >
            <CropSquareIcon className="title-bar__control-icon" />
          </IconButton>

          <IconButton
            size="small"
            onClick={handleClose}
            className="title-bar__control-btn title-bar__control-btn--close"
            aria-label="Close"
          >
            <CloseIcon className="title-bar__control-icon" />
          </IconButton>
        </div>
      </div>
    </div>
  )
}

export default TitleBar
