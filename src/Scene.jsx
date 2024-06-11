import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame, extend, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass';
import './App.css';

extend({ EffectComposer, RenderPass, OutlinePass });

const useRaycaster = (camera, interactableObjects, setSelectedObject) => {
  const raycaster = useRef(new THREE.Raycaster());
  const mouse = useRef(new THREE.Vector2());

  const handlePointerDown = (event) => {
    mouse.current.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.current.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.current.setFromCamera(mouse.current, camera);
    const intersects = raycaster.current.intersectObjects(interactableObjects.current, true);

    if (intersects.length > 0) {
      const intersected = intersects[0].object;
      console.log('Clicked object name:', intersected.name);

      if (event.shiftKey) {
        // Handle multi-selection
        setSelectedObject((prevSelected) => {
          if (Array.isArray(prevSelected)) {
            return prevSelected.includes(intersected)
              ? prevSelected.filter((obj) => obj !== intersected)
              : [...prevSelected, intersected];
          } else {
            return [intersected];
          }
        });
      } else {
        setSelectedObject([intersected]);
      }
    }
  };

  useEffect(() => {
    window.addEventListener('pointerdown', handlePointerDown);

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [camera]);
};

const Scene = ({ setSelectedObject, selectedObject, setSceneRef, groupObjects, onHierarchyChange, searchTerm }) => {
  const { camera, gl, scene } = useThree();
  const interactableObjects = useRef([]);
  const composer = useRef();
  const outlinePass = useRef();

  useEffect(() => {
    composer.current = new EffectComposer(gl);
    composer.current.addPass(new RenderPass(scene, camera));
    outlinePass.current = new OutlinePass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      scene,
      camera
    );
    outlinePass.current.edgeStrength = 10;
    outlinePass.current.edgeGlow = 1;
    outlinePass.current.edgeThickness = 1;
    outlinePass.current.visibleEdgeColor.set('#ffff00');
    outlinePass.current.hiddenEdgeColor.set('#190a05');
    composer.current.addPass(outlinePass.current);

    setSceneRef(scene);
    printSceneHierarchy(scene);
  }, [camera, gl, scene, setSceneRef]);

  useFrame(() => {
    composer.current.render();
    if (selectedObject) {
      outlinePass.current.selectedObjects = Array.isArray(selectedObject) ? selectedObject : [selectedObject];
    }
  }, 1);

  useRaycaster(camera, interactableObjects, setSelectedObject);

  const printSceneHierarchy = (object, depth = 0) => {
    console.log(`${' '.repeat(depth * 2)}${object.name || object.type}`);
    object.children.forEach(child => printSceneHierarchy(child, depth + 1));
  };

  useEffect(() => {
    if (groupObjects && Array.isArray(selectedObject) && selectedObject.length > 1) {
      const parent = selectedObject[0];
      const parentWorldPosition = new THREE.Vector3();
      parent.getWorldPosition(parentWorldPosition);

      selectedObject.slice(1).forEach((child) => {
        const childWorldPosition = new THREE.Vector3();
        child.getWorldPosition(childWorldPosition);

        // Detach the child from its current parent and add to the new parent
        scene.attach(child); // Detach from current parent
        parent.add(child); // Add to the new parent

        // Update child's position to the parent's local space
        child.position.copy(parent.worldToLocal(childWorldPosition));
      });

      setSelectedObject([parent]);
      onHierarchyChange();  // Trigger hierarchy update
      printSceneHierarchy(scene);  // Print hierarchy to debug
    }
  }, [groupObjects, selectedObject, scene, onHierarchyChange]);

  // Highlight matching objects based on the search term
  useEffect(() => {
    if (searchTerm) {
      interactableObjects.current.forEach(obj => {
        if (obj.name.toLowerCase().includes(searchTerm.toLowerCase())) {
          obj.material.color.set('#ffdd57'); // Highlight color
        } else {
          obj.material.color.set('orange'); // Default color
        }
      });
    } else {
      // Reset to default color if no search term is provided
      interactableObjects.current.forEach(obj => obj.material.color.set('orange'));
    }
  }, [searchTerm]);

  return (
    <>
      <ambientLight />
      <pointLight position={[10, 10, 10]} />
      <gridHelper args={[100, 10]} />
      <mesh
        position={[0, 0, 0]}
        name="sphere"
        ref={(mesh) => mesh && interactableObjects.current.push(mesh)}
      >
        <sphereGeometry args={[1, 32, 32]} />
        <meshStandardMaterial color="orange" />
      </mesh>
      <mesh
        position={[2, 0, 0]}
        name="cube1"
        ref={(mesh) => mesh && interactableObjects.current.push(mesh)}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="orange" />
      </mesh>
      <mesh
        position={[-2, 0, 0]}
        name="cube2"
        ref={(mesh) => mesh && interactableObjects.current.push(mesh)}
      >
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial color="orange" />
      </mesh>
      <OrbitControls />
    </>
  );
};

export default Scene;
