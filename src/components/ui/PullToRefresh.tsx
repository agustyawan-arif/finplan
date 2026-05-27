'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';

interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  isLoading?: boolean;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({
  children,
  onRefresh,
  isLoading = false,
}) => {
  const [pullDistance, setPullDistance] = useState(0);
  const [refreshing, setRefreshing] = useState(isLoading);
  const [activePulling, setActivePulling] = useState(false);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const startY = useRef(0);
  const isPullingRef = useRef(false);
  const threshold = 60; // drag distance required to trigger refresh
  const maxPull = 120; // maximum drag distance allowed

  // Sync refreshing state with isLoading prop
  useEffect(() => {
    setRefreshing(isLoading);
    if (!isLoading) {
      setPullDistance(0);
    }
  }, [isLoading]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleTouchStart = (e: TouchEvent) => {
      // Only allow pull-to-refresh if we are at the top of the container scroll
      const isAtTop = container.scrollTop === 0;
      
      // Also ensure we aren't inside any other scrolling parent that has scrollTop > 0
      let parent = e.target as HTMLElement | null;
      let allParentsAtTop = true;
      while (parent && parent !== container) {
        if (parent.scrollTop > 0) {
          allParentsAtTop = false;
          break;
        }
        parent = parent.parentElement;
      }

      if (isAtTop && allParentsAtTop && !refreshing) {
        startY.current = e.touches[0].clientY;
        isPullingRef.current = true;
        setActivePulling(true);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (!isPullingRef.current) return;

      const currentY = e.touches[0].clientY;
      const dragDistance = currentY - startY.current;

      if (dragDistance > 0) {
        // Prevent default scrolling behavior when actively pulling down at the top
        if (e.cancelable) {
          e.preventDefault();
        }

        // Apply a resistance curve to the pull distance
        const resistance = 0.45;
        const calculatedPull = Math.min(maxPull, dragDistance * resistance);
        setPullDistance(calculatedPull);
      } else {
        isPullingRef.current = false;
        setActivePulling(false);
        setPullDistance(0);
      }
    };

    const handleTouchEnd = () => {
      if (!isPullingRef.current) return;
      isPullingRef.current = false;
      setActivePulling(false);

      if (pullDistance >= threshold) {
        triggerRefresh();
      } else {
        // Reset smoothly if threshold not met
        setPullDistance(0);
      }
    };

    const triggerRefresh = async () => {
      setRefreshing(true);
      setPullDistance(threshold); // Hold spinner at threshold height during refresh
      try {
        await onRefresh();
        // Add a satisfying 600ms visual delay once loading completes before retracting
        await new Promise((resolve) => setTimeout(resolve, 600));
      } catch (err) {
        console.error('Pull-to-refresh failed', err);
      } finally {
        // Smoothly retract
        setRefreshing(false);
        setPullDistance(0);
      }
    };

    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd);

    return () => {
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
    };
  }, [pullDistance, refreshing, onRefresh]);

  // Calculate spinner rotation based on pull distance
  const rotation = refreshing ? 'animate-spin' : '';
  const pullProgress = Math.min(1, pullDistance / threshold);
  
  // Custom styles for elastic pull effect on the child elements
  const translateStyle = pullDistance > 0 
    ? { 
        transform: `translateY(${pullDistance}px)`,
        transition: activePulling ? 'none' : 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)' 
      }
    : {};

  return (
    <div 
      ref={containerRef} 
      className="flex-1 flex flex-col overflow-y-auto no-scrollbar relative select-none h-full"
    >
      {/* Loading Spinner Header (Instagram Style Glassmorphic Indicator) */}
      {/* perfectly centered using flexbox (left-0 right-0 justify-center) */}
      <div 
        className="absolute top-4 left-0 right-0 z-40 pointer-events-none flex justify-center transition-all duration-300"
        style={{
          opacity: pullDistance > 10 || refreshing ? 1 : 0,
          transform: `translateY(${pullDistance - 40}px) scale(${0.6 + pullProgress * 0.4})`,
          transition: activePulling ? 'none' : 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.2s'
        }}
      >
        <div className="w-9 h-9 rounded-full bg-white/80 backdrop-blur-md border border-slate-100/60 shadow-ambient flex items-center justify-center text-slate-800">
          <Loader2 
            size={18} 
            className={`${rotation}`}
            style={{
              transform: refreshing ? undefined : `rotate(${pullProgress * 360}deg)`,
              transition: refreshing ? undefined : 'transform 0.1s linear'
            }}
          />
        </div>
      </div>

      {/* Main child viewport being pulled down */}
      <div className="flex-1 flex flex-col" style={translateStyle}>
        {children}
      </div>
    </div>
  );
};

export default PullToRefresh;
