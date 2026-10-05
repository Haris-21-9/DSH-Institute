import { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import './ProjectVideo.css';

export default function FloatingProjectScreen({ project, onClose }) {
  const [isClosing, setIsClosing] = useState(false);
  const [videoDuration, setVideoDuration] = useState('0:00');
  const [currentTime, setCurrentTime] = useState('0:00');
  const [isDragging, setIsDragging] = useState(false);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [floatingOrigin, setFloatingOrigin] = useState({ x: 0, y: 0 });

  const floatingRef = useRef(null);
  const floatingVideoRef = useRef(null);
  const imgRef = useRef(null);
  const animationRef = useRef(null);
  const scrollPos = useRef(0);
  const dragStartPos = useRef({ x: 0, y: 0 });
  const currentDragPos = useRef({ x: 0, y: 0 });

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const calculateFloatingPosition = useCallback(() => {
    const floatingWidth = 300;
    const floatingHeight = Math.min(window.innerHeight * 0.85, window.innerHeight - 40);
    const margin = 20;

    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;

    x = Math.max(floatingWidth / 2 + margin, Math.min(window.innerWidth - floatingWidth / 2 - margin, x));
    y = Math.max(floatingHeight / 2 + margin, Math.min(window.innerHeight - floatingHeight / 2 - margin, y));

    return { x, y };
  }, []);

  useEffect(() => {
    setFloatingOrigin(calculateFloatingPosition());
  }, [calculateFloatingPosition]);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 150);
  };

  const handlePointerDown = (e) => {
    if (e.target.closest('.projectVideo__close') || e.target.closest('.projectVideo__progress') || e.target.closest('.projectVideo__timing')) return;

    setIsDragging(true);
    dragStartPos.current = {
      x: e.clientX - currentDragPos.current.x,
      y: e.clientY - currentDragPos.current.y
    };

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

    const minX = -(floatingOrigin.x - rect.width / 2);
    const maxX = window.innerWidth - floatingOrigin.x - rect.width / 2;
    const minY = -(floatingOrigin.y - rect.height / 2);
    const maxY = window.innerHeight - floatingOrigin.y - rect.height / 2;

    const constrainedX = Math.max(minX, Math.min(maxX, newX));
    const constrainedY = Math.max(minY, Math.min(maxY, newY));

    currentDragPos.current = { x: constrainedX, y: constrainedY };
    requestAnimationFrame(() => setDragPosition({ x: constrainedX, y: constrainedY }));
  };

  const handlePointerUp = (e) => {
    setIsDragging(false);
    if (floatingRef.current) {
      floatingRef.current.releasePointerCapture(e.pointerId);
    }
  };

  const handleSeek = (e) => {
    if (project.type === 'video' && floatingVideoRef.current) {
      const rect = e.currentTarget.getBoundingClientRect();
      const percentage = (e.clientX - rect.left) / rect.width;
      floatingVideoRef.current.currentTime = percentage * floatingVideoRef.current.duration;
    }
  };

  useEffect(() => {
    if (project.type === 'website' && imgRef.current) {
      const img = imgRef.current;
      const speed = 0.6;
      let imgHeight = 0;
      let containerHeight = 0;
      let maxScroll = 0;

      const checkReady = () => {
        imgHeight = img.naturalHeight * (img.clientWidth / img.naturalWidth);
        containerHeight = img.parentElement.clientHeight;
        maxScroll = imgHeight - containerHeight;
        if (maxScroll > 0) animate();
      };

      const animate = () => {
        scrollPos.current += speed;
        if (scrollPos.current >= maxScroll) scrollPos.current = 0;
        img.style.transform = `translateY(-${scrollPos.current}px)`;
        animationRef.current = requestAnimationFrame(animate);
      };

      if (img.complete) {
        checkReady();
      } else {
        img.onload = checkReady;
      }

      return () => {
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
      };
    }
  }, [project]);

  return createPortal(
    <div
      ref={floatingRef}
      className={`projectVideo__floating ${isClosing ? 'is-closing' : ''} ${isDragging ? 'is-dragging' : ''}`}
      style={{
        '--drag-x': `${dragPosition.x}px`,
        '--drag-y': `${dragPosition.y}px`,
        '--origin-x': `${floatingOrigin.x}px`,
        '--origin-y': `${floatingOrigin.y}px`,
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      <button className="projectVideo__close" onClick={handleClose}>x</button>

      {project.type === 'video' ? (
        <>
          <div className="projectVideo__timing">
            <span>{currentTime}</span> / <span>{videoDuration}</span>
          </div>
          <div className="projectVideo__progress" onClick={(e) => { e.stopPropagation(); handleSeek(e); }}>
            <div
              className="projectVideo__progress-bar"
              style={{
                width: floatingVideoRef.current
                  ? `${(floatingVideoRef.current.currentTime / floatingVideoRef.current.duration) * 100}%`
                  : '0%'
              }}
            />
          </div>
          <video
            ref={floatingVideoRef}
            src={project.video}
            className="projectVideo__floating-video"
            muted playsInline autoPlay loop
            onLoadedMetadata={() => setVideoDuration(formatDuration(floatingVideoRef.current.duration))}
            onTimeUpdate={() => setCurrentTime(formatDuration(floatingVideoRef.current.currentTime))}
          />
        </>
      ) : (
        <div
          style={{ width: '100%', height: '100%', overflow: 'hidden', cursor: 'pointer' }}
          onClick={() => window.open(project.url, '_blank', 'noopener,noreferrer')}
          title="Visit Website"
        >
          <img
            ref={imgRef}
            src={project.image}
            alt={project.title}
            style={{ width: '100%', height: 'auto', willChange: 'transform' }}
          />
        </div>
      )}
    </div>,
    document.body
  );
}