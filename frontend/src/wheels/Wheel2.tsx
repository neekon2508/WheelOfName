import { useEffect, useRef, useState } from "react";
import { Howl } from "howler";
import { Box, Center } from "@chakra-ui/react";
import { getBoyMap } from "../utils";
import { STT } from "../constants";



interface WheelProps {
  names: string[];
  setNames: (names: string[]) => void;
  onSelectWinner?: (winner: string) => void;
}

const spinSound = new Howl({ src: ["/wheel-of-names/sounds/spin.wav"], preload: true });
const winSound = new Howl({ src: ["/wheel-of-names/sounds/win.wav"], preload: true });

export const Wheel: React.FC<WheelProps> = ({ names, setNames, onSelectWinner }) => {
// --- DỮ LIỆU CẤU HÌNH ---
// Nếu bạn muốn ép lượt quay thứ 1 ra kết quả cụ thể
const array = localStorage.getItem('wheel-history');
const TARGET_TURN = array ? Number(JSON.parse(array)[STT-1]) : 0; 
const TARGET_KEY = 11;   // Key trong boyMap muốn thắng
  const [spinCount, setSpinCount] = useState(0);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [angle, setAngle] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const slowSpinIntervalRef = useRef<number | null>(null);

  const drawWheel = (ctx: CanvasRenderingContext2D, size: number) => {
    const numSlices = names.length;
    if (numSlices === 0) return;

    const arc = (2 * Math.PI) / numSlices;
    const centerX = size / 2;
    const centerY = size / 2;
    const wheelRadius = size / 2 - 20; 
    ctx.clearRect(0, 0, size, size);
    
    // 1. Vẽ bóng đổ
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, wheelRadius, 0, 2 * Math.PI);
    ctx.fillStyle = "#fff";
    ctx.shadowColor = "rgba(0,0,0,0.15)";
    ctx.shadowBlur = 30; // Tăng độ nhòe bóng đổ
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.rotate(angle);

    names.forEach((name, i) => {
      const sliceAngle = i * arc;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, wheelRadius, sliceAngle, sliceAngle + arc);
      ctx.fillStyle = `hsl(${(i * 360) / numSlices}, 75%, 70%)`;
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.5)";
      ctx.lineWidth = 2; // Nét vẽ dày hơn cho vòng quay lớn
      ctx.stroke();

      // 3. Văn bản (Phóng to font chữ)
      ctx.save();
      ctx.rotate(sliceAngle + arc / 2);
      ctx.textAlign = "right";
      ctx.fillStyle = "#333";
      // Tăng size font: từ 14 lên 28 (gấp đôi)
      const fontSize = Math.max(12, 28 - numSlices / 3); 
      ctx.font = `bold ${fontSize}px Arial`;
      
      const displayName = name.length > 20 ? name.slice(0, 17) + "..." : name;
      ctx.fillText(displayName, wheelRadius - 40, fontSize / 3);
      ctx.restore();
    });
    ctx.restore();

    // 4. Trục giữa (Phóng to pin)
    ctx.beginPath();
    ctx.arc(centerX, centerY, 25, 0, 2 * Math.PI); // Tăng từ 15 -> 25
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.strokeStyle = "#bbb";
    ctx.lineWidth = 3;
    ctx.stroke();

    // 5. Kim chỉ (Phóng to Pointer)
    ctx.beginPath();
    ctx.fillStyle = "#e74c3c";
    // Tăng kích thước tam giác kim chỉ
    ctx.moveTo(centerX - 25, 5); 
    ctx.lineTo(centerX + 25, 5);
    ctx.lineTo(centerX, 50); 
    ctx.closePath();
    ctx.fill();
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      const parent = canvas.parentElement;
      if (!parent) return;
      
      // THAY ĐỔI TẠI ĐÂY: Nâng giới hạn từ 600 lên 1200
      const size = Math.min(parent.offsetWidth, 1200); 
      const dpr = window.devicePixelRatio || 1;
      
      canvas.width = size * dpr;
      canvas.height = size * dpr;
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
      
      ctx.scale(dpr, dpr);
      drawWheel(ctx, size);
    };

    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
  }, [names, angle]);

  // Hiệu ứng quay chậm lúc chờ
  useEffect(() => {
    slowSpinIntervalRef.current = window.setInterval(() => {
      if (!isSpinning) setAngle((prev) => prev + 0.002);
    }, 30);
    return () => clearInterval(slowSpinIntervalRef.current!);
  }, [isSpinning]);

  const spinWheel = () => {
    if (isSpinning || names.length < 2) return;
    const currentTurn = spinCount + 1;
    setSpinCount(currentTurn);


    setIsSpinning(true);
    spinSound.play();
    
    const duration = 6000;
    const segmentSize = (2 * Math.PI) / names.length;
    const startAngle = angle;
    
    // Mặc định: Ngẫu nhiên
    let targetFinalAngle = Math.random() * (2 * Math.PI);

   // 3. KIỂM TRA LƯỢT ÉP KẾT QUẢ
    if (currentTurn === TARGET_TURN) {
      const boyMap = getBoyMap();
      const targetName = boyMap.get(TARGET_KEY); // TARGET_KEY = 11 là "đạt"
      
      // Tìm vị trí của "đạt" (không phân biệt hoa thường, khoảng trắng)
      const targetIdx = names.findIndex(
        n => n.trim().toLowerCase() === targetName.toLowerCase()
      );

      if (targetIdx !== -1) {
        // Tính toán để targetIdx dừng lại ở đỉnh 12h
        const stopAngle = (1.5 * Math.PI) - (targetIdx * segmentSize) - (segmentSize / 2);
        targetFinalAngle = (stopAngle % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI);
        
        console.log(`HACK: Lượt quay thứ ${currentTurn} của Vòng 2 khớp với kết quả Vòng 1. Người thắng: ${targetName}`);
      }
    }

    const totalRotation = (10 * 2 * Math.PI) + targetFinalAngle;
    const startTimestamp = performance.now();

    const animate = (now: number) => {
      const elapsed = now - startTimestamp;
      const progress = Math.min(elapsed / duration, 1);
      
      // Easing: Out Cubic
      const easedProgress = 1 - Math.pow(1 - progress, 4);
      setAngle(startAngle + totalRotation * easedProgress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setIsSpinning(false);
        spinSound.stop();
        winSound.play();
        
        // Xác định người thắng để báo về Page1
        const finalAngleNorm = (startAngle + totalRotation) % (2 * Math.PI);
        const pointerAngle = (1.5 * Math.PI); // Đỉnh 12h
        let winnerIdx = Math.floor((pointerAngle - finalAngleNorm) / segmentSize) % names.length;
        if (winnerIdx < 0) winnerIdx += names.length;
        
        onSelectWinner?.(names[winnerIdx]);
      }
    };

    requestAnimationFrame(animate);
  };

return (
  <Center width="full" p={4}>
    <Box 
      position="relative" 
      onClick={spinWheel} 
      cursor={isSpinning ? "not-allowed" : "pointer"}
      transition="transform 0.2s"
      _hover={{ transform: isSpinning ? "none" : "scale(1.01)" }}
      // Thêm chiều rộng 100% và maxWidth đồng bộ với logic resize
      width="100%"
      maxW="1200px" 
    >
      <canvas 
        ref={canvasRef} 
        style={{ 
          width: "100%", 
          height: "auto", // Để canvas tự tính chiều cao theo chiều rộng
          display: "block" 
        }} 
      />
    </Box>
  </Center>
);
};