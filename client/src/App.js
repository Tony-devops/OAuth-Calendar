import { useEffect, useState } from 'react';
import './App.css';

function App() {
  const [url, setUrl] = useState("");

  useEffect(() => {
    fetch("http://localhost:3030/login")
      .then(res => res.json())
      .then(data => setUrl(data))
      .catch(err => console.error(err))
  }, []);

  return (
    <div className="App">
      <button onClick={() => window.open(url, '_blank', 'width=400,height=300,left=400,top=200')}>Login</button>
    </div >
  );
}

export default App;
