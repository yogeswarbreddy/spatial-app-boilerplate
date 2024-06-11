import React, { useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import Scene from './Scene';
import Hierarchy from './Hierarchy';
import './App.css';

const App = () => {
  const [selectedObject, setSelectedObject] = useState([]);
  const [scene, setScene] = useState(null);
  const [groupObjects, setGroupObjects] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const setSceneRef = (scene) => {
    setScene(scene);
  };

  const handleGroup = () => {
    setGroupObjects(true);
  };

  useEffect(() => {
    if (groupObjects) {
      setGroupObjects(false);
    }
  }, [groupObjects]);

  const handleHierarchyChange = () => {
    if (scene) {
      setScene(scene => ({ ...scene }));
    }
  };

  return (
    <div className="container">
      <div className="sidebar">
        <Hierarchy
          scene={scene}
          setSelectedObject={setSelectedObject}
          selectedObject={selectedObject}
          searchTerm={searchTerm} // Pass search term to the Hierarchy
        />
        <button onClick={handleGroup}>Group Selected</button>
      </div>
      <div className="canvas-container">
        <Canvas camera={{ position: [2, 2, 2] }}>
          <Scene
            selectedObject={selectedObject}
            setSelectedObject={setSelectedObject}
            setSceneRef={setSceneRef}
            groupObjects={groupObjects}
            onHierarchyChange={handleHierarchyChange}
            searchTerm={searchTerm} // Pass search term to the Scene
          />
        </Canvas>
      </div>
    </div>
  );
};

export default App;
