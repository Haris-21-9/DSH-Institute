import { useEffect, useRef } from "react";
import roboHead from "@/assets/robo_3d_head.png";
import roboBody from "@/assets/robo_3d_body.png";
import "./RoboMascot.css";

export default function RoboMascot() {
  const mascotRef = useRef(null);
  const headRef = useRef(null);
  const glowRef = useRef(null);
  const target = useRef({ x: 0, y: 0 });
  const current = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // Dynamic tracking relative to the robot's actual position on screen
    const handleMouseMove = (e) => {
      let normX = 0;
      let normY = 0;

      if (mascotRef.current) {
        const rect = mascotRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height * 0.44; // Head / neck level

        const dx = e.clientX - centerX;
        const dy = e.clientY - centerY;

        // Reach expressive full turn within 360px horizontally and 260px vertically
        normX = Math.max(-1, Math.min(1, dx / 360));
        normY = Math.max(-1, Math.min(1, dy / 260));
      } else {
        normX = (e.clientX / window.innerWidth) * 2 - 1;
        normY = (e.clientY / window.innerHeight) * 2 - 1;
      }

      target.current.x = normX;
      target.current.y = normY;
    };

    window.addEventListener("mousemove", handleMouseMove, { passive: true });

    let animId;

    // High-performance continuous animation loop (60-120 FPS direct DOM update)
    const update = () => {
      // Snappy and smooth spring interpolation
      current.current.x += (target.current.x - current.current.x) * 0.12;
      current.current.y += (target.current.y - current.current.y) * 0.12;

      const x = current.current.x;
      const y = current.current.y;

      // Unmistakable 3D head turning angles left & right
      const rotateY = x * 36;  // Up to 36 degrees turn left & right
      const rotateX = -y * 14; // Up to 14 degrees pitch up & down
      const rollZ = x * 4.5;   // 4.5 degrees natural head tilt
      const shiftX = x * 8;    // 8px mechanical neck pivot parallax
      const shiftY = y * 4;

      if (headRef.current) {
        headRef.current.style.transform = `perspective(700px) rotateY(${rotateY.toFixed(2)}deg) rotateX(${rotateX.toFixed(2)}deg) rotateZ(${rollZ.toFixed(2)}deg) translate3d(${shiftX.toFixed(2)}px, ${shiftY.toFixed(2)}px, 0)`;
      }

      if (glowRef.current) {
        glowRef.current.style.transform = `translate3d(${(x * 16).toFixed(2)}px, ${(y * 10).toFixed(2)}px, 0)`;
      }

      animId = requestAnimationFrame(update);
    };

    animId = requestAnimationFrame(update);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      cancelAnimationFrame(animId);
    };
  }, []);

  return (
    <div className="robo-3d-mascot" ref={mascotRef}>
      {/* 3D Stage Container */}
      <div className="robo-3d-stage">
        {/* Soft Ambient Ground Shadow */}
        <div className="robo-3d-shadow" />

        {/* Robot Body (Stationary sitting cross-legged) */}
        <div className="robo-3d-body-wrap">
          <img
            src={roboBody}
            alt="3D Robot Body"
            className="robo-3d-img robo-3d-body-img"
            draggable={false}
          />
        </div>

        {/* Robot Head (Rotates Left & Right directly driven by cursor) */}
        <div className="robo-3d-head-wrap" ref={headRef}>
          <img
            src={roboHead}
            alt="3D Robot Head"
            className="robo-3d-img robo-3d-head-img"
            draggable={false}
          />

          {/* CRT Screen Reflection Highlight */}
          <div className="robo-3d-screen-glow" ref={glowRef} />
        </div>
      </div>
    </div>
  );
}
