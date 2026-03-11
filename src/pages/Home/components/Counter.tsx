import { useEffect, useState } from 'react';

interface CounterProps {
  target: number | undefined;
}
function Counter({ target }: CounterProps) {
  const [count, setCount] = useState<number>(0);

  useEffect(() => {
    if (target) {
      let start = 0;
      const duration = 1200; // 动画总时长
      const frameRate = 1000 / 60; // 60 fps
      const totalFrames = Math.round(duration / frameRate);
      const increment = target / totalFrames; // 每帧增量

      const timer = setInterval(() => {
        start += increment;
        if (start >= target) {
          setCount(target);
          clearInterval(timer);
        } else {
          setCount(Math.ceil(start));
        }
      }, frameRate);

      return () => clearInterval(timer);
    } // 组件卸载时清定时器
  }, [target]);

  return <>{count.toLocaleString()}</>;
}

export default Counter;
