import React, { useState, useCallback, useEffect } from 'react';
import Experience from './components/Experience';
import GestureController from './components/GestureController';
import UIOverlay from './components/UIOverlay';
import { AppState, HandGesture } from './types';

const App: React.FC = () => {
  const [appState, setAppState] = useState<AppState>(AppState.CLOSED);
  const [photos, setPhotos] = useState<string[]>([]);
  const [sensitivity, setSensitivity] = useState<number>(1.0);
  const [currentGesture, setCurrentGesture] = useState<HandGesture>({
    isFist: false,
    isOpen: false,
    isPinch: false,
    isVictory: false,
    isOne: false,
    rotation: { x: 0, y: 0 },
    detected: false
  });

  // Handle Photo Uploads
  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      // Explicitly type file as File to avoid 'unknown' type error in URL.createObjectURL
      const newPhotos = Array.from(e.target.files).map((file: File) => URL.createObjectURL(file));
      setPhotos(prev => [...prev, ...newPhotos].slice(-10)); // Max 10 photos
    }
  };

  // Handle Gesture Logic state transitions
  const handleGestureUpdate = useCallback((gesture: HandGesture) => {
    setCurrentGesture(gesture);
    
    // Debounce or threshold could be added here for stability, 
    // but React state updates are batched enough for this frame rate.
    
    if (!gesture.detected) return;

    if (gesture.isFist) {
      // Prioritize Close
      setAppState(AppState.CLOSED);
    } else if (gesture.isOpen) {
      // Prioritize Open / Scatter
      // Only switch if currently closed (to allow Focus state to persist unless explicitly opened)
      // Or if we want "Open" to always mean "Scatter" (exiting Focus).
      if (appState !== AppState.SCATTERED) {
          setAppState(AppState.SCATTERED);
      }
    }
    
    // Pinch/Victory/One logic handled inside Experience
  }, [appState]);

  // Default photos if none uploaded
  useEffect(() => {
    if (photos.length === 0) {
        setPhotos([
            'https://picsum.photos/400/400?random=1',
            'https://picsum.photos/400/400?random=2',
            'https://picsum.photos/400/400?random=3'
        ]);
    }
  }, [photos]);

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black selection:bg-metalGold selection:text-white">
      <Experience 
        appState={appState} 
        setAppState={setAppState}
        photos={photos}
        gesture={currentGesture}
      />
      
      <UIOverlay 
        appState={appState} 
        onUpload={handleUpload} 
        photoCount={photos.length}
        sensitivity={sensitivity}
        setSensitivity={setSensitivity}
      />
      
      <GestureController 
        onGestureUpdate={handleGestureUpdate} 
        sensitivity={sensitivity}
      />
    </div>
  );
};

export default App;