import './App.css'
import AudioUploader from './AudioUploader'
import {useState} from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Sphere, Box } from '@react-three/drei';
import Welcome from './Welcome';

function App() {
  const [showWelcome, setShowWelcome] = useState(true);

  const handleContinue = () => {
    setShowWelcome(false);
  }

  return (
    <>
    {showWelcome ? (<Welcome onContinue={handleContinue}/>) : (< AudioUploader/>)}
      
    </>
  )
}

export default App
