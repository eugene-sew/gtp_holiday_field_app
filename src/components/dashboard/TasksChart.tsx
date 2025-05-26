import { useEffect, useRef } from 'react';
import Card from '../ui/Card';

// Simplified chart component
const TasksChart = ({ data }: { data: { name: string; value: number; color: string }[] }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    
    // Calculate total value
    const total = data.reduce((sum, item) => sum + item.value, 0);
    if (total === 0) return;
    
    // Draw pie chart
    let startAngle = 0;
    data.forEach(item => {
      const sliceAngle = (2 * Math.PI * item.value) / total;
      
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2, canvas.height / 2);
      ctx.arc(
        canvas.width / 2,
        canvas.height / 2,
        Math.min(canvas.width, canvas.height) / 2 - 10,
        startAngle,
        startAngle + sliceAngle
      );
      ctx.closePath();
      
      ctx.fillStyle = item.color;
      ctx.fill();
      
      startAngle += sliceAngle;
    });
  }, [data]);
  
  return (
    <Card title="Task Status Distribution" className="h-full">
      <div className="h-64 flex flex-col items-center">
        <div className="relative w-full h-48">
          <canvas ref={canvasRef} className="w-full h-full"></canvas>
        </div>
        <div className="flex justify-center items-center space-x-4 mt-4">
          {data.map(item => (
            <div key={item.name} className="flex items-center">
              <div 
                className="w-3 h-3 rounded-full mr-2" 
                style={{ backgroundColor: item.color }}
              ></div>
              <span className="text-sm text-gray-600">{item.name}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
};

export default TasksChart;