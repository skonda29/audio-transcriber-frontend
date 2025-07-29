import './App.css'
import AudioUploader from './AudioUploader'
import {useState} from 'react';
import Welcome from './Welcome';

function App() {
  const [showWelcome, setShowWelcome] = useState(true);

  const handleContinue = () => {
    setShowWelcome(false);
  }

  return (
    <>
    {showWelcome ? (<Welcome onContinue={handleContinue}/>) : (<AudioUploader/>)}
      
    </>
  )
}

export default App
