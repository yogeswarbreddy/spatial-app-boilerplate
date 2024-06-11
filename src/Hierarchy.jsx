import React, { useState, useEffect } from 'react';

const Hierarchy = ({ scene, setSelectedObject, selectedObject }) => {
  const [hierarchy, setHierarchy] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const getHierarchy = (object) => {
      return {
        id: object.uuid,
        name: object.name || object.type,
        object: object,
        children: object.children.map(child => getHierarchy(child))
      };
    };

    if (scene) {
      const newHierarchy = getHierarchy(scene);
      console.log('Updated hierarchy:', newHierarchy);
      setHierarchy(newHierarchy);
    }
  }, [scene]);

  const renderHierarchy = (node) => {
    if (!node) return null;
    const isHighlighted = searchTerm && node.name.toLowerCase().includes(searchTerm.toLowerCase());
    return (
      <div
        key={node.id}
        onClick={(e) => {
          e.stopPropagation();
          setSelectedObject(node.object);
        }}
        style={{
          paddingLeft: 10,
          cursor: 'pointer',
          backgroundColor: isHighlighted ? '#ffdd57' : (node.object === selectedObject ? '#e0e0e0' : 'transparent')
        }}
      >
        {node.name}
        {node.children.map(child => renderHierarchy(child))}
      </div>
    );
  };

  return (
    <div className="hierarchy">
      <input
        type="text"
        placeholder="Search..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        style={{ width: '100%', marginBottom: '10px' }}
      />
      {renderHierarchy(hierarchy)}
    </div>
  );
};

export default Hierarchy;
