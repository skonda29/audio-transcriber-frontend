import './App.css'
import AudioUploader from './AudioUploader'
import {useState} from 'react';
import Welcome from './Welcome';

function App() {
  console.log('App component rendering');
  
  const [showWelcome, setShowWelcome] = useState(true);

  const handleContinue = () => {
    console.log('Switching to AudioUploader');
    setShowWelcome(false);
  }

  console.log('showWelcome:', showWelcome);

  return (
    <>
    {showWelcome ? (<Welcome onContinue={handleContinue}/>) : (<AudioUploader/>)}
      
    </>
  )
}

export default App
