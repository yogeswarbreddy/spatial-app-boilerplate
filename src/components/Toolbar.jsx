import React from 'react';

const Toolbar = ({ addObject }) => {
  return (
    <div style={{ position: 'absolute', top: '10px', left: '10px', zIndex: 1 }}>
      <button onClick={() => addObject('cube')}>Add Cube</button>
      <button onClick={() => addObject('sphere')}>Add Sphere</button>
    </div>
  );
};

export default Toolbar;
