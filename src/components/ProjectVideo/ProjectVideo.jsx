import { useState, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import "./ProjectVideo.css";

export default function ProjectVideo({ id, title, video, thumbnail, client, result }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isFloatingOpen, setIsFloatingOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [videoDuration, setVideoDuration] = useState("0:00");
  const [currentTime, setCurrentTime] = useState("0:00");
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [floatingOrigin, setFloatingOrigin] = useState({ x: 0, y: 0 });
  const videoRef = useRef(null);
  const floatingVideoRef = useRef(null);
  const floatingRef = useRef(null);
  const cardRef = useRef(null);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const currentDragPos = useRef({ x: 0, y: 0 });

  const handleMouseEnter = () => {
    if (videoRef.current && !hasError && !isFloatingOpen) {
      videoRef.current.currentTime = 0;
      videoRef.current.muted = true;
      videoRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((error) => {
        console.log("Autoplay prevented or video error for", video, ":", error);
        setHasError(true);
      });
    }
  };

  const handleMouseLeave = () => {
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  };

  const handleVideoError = () => {
    console.log("Video failed to load:", video);
    setHasError(true);
  };

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleLoadedMetadata = () => {
    if (floatingVideoRef.current) {
      const duration = floatingVideoRef.current.duration;
      setVideoDuration(formatDuration(duration));
    }
  };

  const handleTimeUpdate = () => {
    if (floatingVideoRef.current) {
      const current = floatingVideoRef.current.currentTime;
      setCurrentTime(formatDuration(current));
    }
  };

  const calculateFloatingPosition = useCallback(() => {
    const floatingWidth = 300;
    const floatingHeight = Math.min(window.innerHeight * 0.85, window.innerHeight - 40);
    const margin = 20;

    // Always center in viewport
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;

    // Clamp so the floating player stays within the viewport
    x = Math.max(floatingWidth / 2 + margin, Math.min(window.innerWidth - floatingWidth / 2 - margin, x));
    y = Math.max(floatingHeight / 2 + margin, Math.min(window.innerHeight - floatingHeight / 2 - margin, y));

    return { x, y };
  }, []);

  const handleClick = () => {
    const origin = calculateFloatingPosition();
    setFloatingOrigin(origin);
    setIsFloatingOpen(true);
    setDragPosition({ x: 0, y: 0 });
    currentDragPos.current = { x: 0, y: 0 };
  };

  const handleCloseFloating = () => {
    setIsClosing(true);
    setTimeout(() => {
      if (floatingVideoRef.current) {
        floatingVideoRef.current.pause();
        floatingVideoRef.current.currentTime = 0;
      }
      setIsFloatingOpen(false);
      setIsClosing(false);
      setDragPosition({ x: 0, y: 0 });
      currentDragPos.current = { x: 0, y: 0 };
      setCurrentTime("0:00");
    }, 150);
  };

  const handlePointerDown = (e) => {
    if (e.target.closest('.projectVideo__close') || e.target.closest('.projectVideo__progress') || e.target.closest('.projectVideo__timing')) return;
    
    setIsDragging(true);
    dragStartPos.current = {
      x: e.clientX - currentDragPos.current.x,
      y: e.clientY - currentDragPos.current.y
    };
    setDragPosition(currentDragPos.current);
    
    if (floatingRef.current) {
      floatingRef.current.setPointerCapture(e.pointerId);
    }
  };

  const handlePointerMove = (e) => {
    if (!isDragging || !floatingRef.current) return;

    e.preventDefault();

    const newX = e.clientX - dragStartPos.current.x;
    const newY = e.clientY - dragStartPos.current.y;

    const rect = floatingRef.current.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    // Constrain so the floating player can't be dragged outside the viewport
    const minX = -(floatingOrigin.x - rect.width / 2);
    const maxX = viewportWidth - floatingOrigin.x - rect.width / 2;
    const minY = -(floatingOrigin.y - rect.height / 2);
    const maxY = viewportHeight - floatingOrigin.y - rect.height / 2;

    const constrainedX = Math.max(minX, Math.min(maxX, newX));
    const constrainedY = Math.max(minY, Math.min(maxY, newY));

    currentDragPos.current = { x: constrainedX, y: constrainedY };
    
    requestAnimationFrame(() => {
      setDragPosition({ x: constrainedX, y: constrainedY });
    });
  };

  const handlePointerUp = (e) => {
    setIsDragging(false);
    if (floatingRef.current) {
      floatingRef.current.releasePointerCapture(e.pointerId);
    }
  };

  const handlePointerCancel = (e) => {
    setIsDragging(false);
    if (floatingRef.current) {
      floatingRef.current.releasePointerCapture(e.pointerId);
    }
  };

  const handleSeek = (e) => {
    if (floatingVideoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const percentage = x / rect.width;
      const duration = floatingVideoRef.current.duration;
      floatingVideoRef.current.currentTime = percentage * duration;
    }
  };

  useEffect(() => {
    if (isFloatingOpen && floatingVideoRef.current) {
      floatingVideoRef.current.muted = true;
      floatingVideoRef.current.play().catch((error) => {
        console.log("Floating video autoplay prevented:", error);
      });
    }
  }, [isFloatingOpen]);

  useEffect(() => {
    currentDragPos.current = dragPosition;
  }, [dragPosition]);

  useEffect(() => {
    if (!isFloatingOpen) return;

    const handleResize = () => {
      // Recalculate origin based on card's new position
      const newOrigin = calculateFloatingPosition();
      setFloatingOrigin(newOrigin);

      if (floatingRef.current) {
        const rect = floatingRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        const currentX = currentDragPos.current.x;
        const currentY = currentDragPos.current.y;

        const minX = -(newOrigin.x - rect.width / 2);
        const maxX = viewportWidth - newOrigin.x - rect.width / 2;
        const minY = -(newOrigin.y - rect.height / 2);
        const maxY = viewportHeight - newOrigin.y - rect.height / 2;

        const constrainedX = Math.max(minX, Math.min(maxX, currentX));
        const constrainedY = Math.max(minY, Math.min(maxY, currentY));

        if (constrainedX !== currentX || constrainedY !== currentY) {
          setDragPosition({ x: constrainedX, y: constrainedY });
          currentDragPos.current = { x: constrainedX, y: constrainedY };
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isFloatingOpen, calculateFloatingPosition]);

  return (
    <>
      <article 
        ref={cardRef}
        className="projects__card projects__card--laptop" 
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div className="laptop-frame">
          <div 
            className="projects__card-screen"
            onClick={handleClick}
            style={{ cursor: 'pointer' }}
          >
            {thumbnail && (!isPlaying || hasError) && (
              <img
                src={thumbnail}
                alt={title}
                className="projects__card-thumbnail"
                loading="lazy"
                width={900}
                height={900}
              />
            )}
            <video
              key={video}
              ref={videoRef}
              src={video}
              className={`projects__card-video ${isPlaying && !hasError ? 'projects__card-video--playing' : ''}`}
              muted
              playsInline
              preload="metadata"
              loop
              onError={handleVideoError}
            />
          </div>
          <div className="laptop-bottom">
            <div className="laptop-notch"></div>
          </div>
        </div>
      </article>

      {isFloatingOpen && createPortal(
        <div 
          ref={floatingRef}
          className={`projectVideo__floating ${isClosing ? 'projectVideo__floating--closing' : ''} ${isDragging ? 'projectVideo__floating--dragging' : ''}`}
          style={{
            '--drag-x': `${dragPosition.x}px`,
            '--drag-y': `${dragPosition.y}px`,
            '--origin-x': `${floatingOrigin.x}px`,
            '--origin-y': `${floatingOrigin.y}px`,
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerCancel}
        >
          <button 
            className="projectVideo__close"
            onClick={handleCloseFloating}
            aria-label="Close video player"
          >
            ✕
          </button>
          <div className="projectVideo__timing">
            <span className="projectVideo__current-time">{currentTime}</span>
            <span className="projectVideo__separator">/</span>
            <span className="projectVideo__total-time">{videoDuration}</span>
          </div>
          <div 
            className="projectVideo__progress"
            onClick={(e) => {
              e.stopPropagation();
              handleSeek(e);
            }}
          >
            <div 
              className="projectVideo__progress-bar"
              style={{ width: floatingVideoRef.current ? `${(floatingVideoRef.current.currentTime / floatingVideoRef.current.duration) * 100}%` : '0%' }}
            />
          </div>
          <video
            ref={floatingVideoRef}
            src={video}
            className="projectVideo__floating-video"
            muted
            playsInline
            autoPlay
            loop
            onLoadedMetadata={handleLoadedMetadata}
            onTimeUpdate={handleTimeUpdate}
          />
        </div>,
        document.body
      )}
    </>
  );
}
