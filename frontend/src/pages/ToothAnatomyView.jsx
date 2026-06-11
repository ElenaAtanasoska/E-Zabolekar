import React, { useState, Suspense } from 'react';
import { FaArrowLeft } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, useGLTF, Stage } from '@react-three/drei';

const ToothModel = ({ url }) => {
  const { scene } = useGLTF(url);
  return <primitive object={scene} />;
};

const ToothAnatomyView = ({ imagePath, toothNumber }) => {
  const navigate = useNavigate();
  const [is3D, setIs3D] = useState(false);

  return (
    <div className="w-[350px] border-r border-gray-200 bg-white flex flex-col items-center py-10 relative flex-shrink-0">
      <button 
        onClick={() => navigate(-1)} 
        className="absolute top-6 left-6 p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors"
      >
        <FaArrowLeft size={20} />
      </button>

      <div className="flex-1 flex flex-col items-center justify-center w-full px-12 text-center">
        <div className="relative w-full h-[400px] mb-8">
          {is3D ? (
            <Canvas dpr={[1, 2]} camera={{ fov: 45 }}>
              <Suspense fallback={null}>
                <Stage environment="city" intensity={0.6}>
                  <ToothModel url={`/teeth-models/${toothNumber}.glb`} />
                </Stage>
              </Suspense>
              <OrbitControls makeDefault />
            </Canvas>
          ) : (
            <img
              src={imagePath}
              alt={`Tooth ${toothNumber}`}
              className="w-full h-full object-contain drop-shadow-xl"
              onError={(e) => { e.target.src = "/teeth-images/18.png"; }}
            />
          )}
        </div>

        
        <button
          onClick={() => setIs3D(!is3D)}
          className="mb-8 px-4 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-full text-xs font-bold uppercase transition-colors"
        >
          {is3D ? "Слика" : "3D"}
        </button>

        <div className="w-full h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-8" />
        
        <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">
          {is3D ? "3D Приказ" : "Анатомски приказ"}
        </p>
      </div>
    </div>
  );
};

export default ToothAnatomyView;