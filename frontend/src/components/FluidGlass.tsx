/* eslint-disable react/no-unknown-property */
import * as THREE from 'three';
import React, { useRef, useState, useEffect, memo } from 'react';
import { Canvas, createPortal, useFrame, useThree } from '@react-three/fiber';
import {
  useFBO,
  MeshTransmissionMaterial
} from '@react-three/drei';
import { easing } from 'maath';

export default function FluidGlass({ mode = 'lens', lensProps = {}, barProps = {}, cubeProps = {} }: { mode?: string; text?: string; lensProps?: any; barProps?: any; cubeProps?: any }) {
  const Wrapper = ModeWrapper;
  const rawOverrides = mode === 'bar' ? barProps : mode === 'cube' ? cubeProps : lensProps;

  return (
    <div style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
      <Canvas camera={{ position: [0, 0, 20], fov: 15 }} gl={{ alpha: true }}>
        <Wrapper modeProps={rawOverrides} />
      </Canvas>
    </div>
  );
}

const ModeWrapper = memo(function ModeWrapper({
  children,
  followPointer = true,
  modeProps = {},
  ...props
}: { children?: React.ReactNode; text?: string; followPointer?: boolean; modeProps?: any }) {
  const ref = useRef<THREE.Mesh>(null!);
  const buffer = useFBO();
  const { viewport: vp } = useThree();
  const [scene] = useState(() => new THREE.Scene());

  useFrame((state, delta) => {
    const { gl, viewport, pointer, camera } = state;
    const v = viewport.getCurrentViewport(camera, [0, 0, 15]);

    const destX = followPointer ? (pointer.x * v.width) / 2 : 0;
    const destY = followPointer ? (pointer.y * v.height) / 2 : 0;
    if (ref.current) {
      easing.damp3(ref.current.position, [destX, destY, 15], 0.15, delta);
    }

    gl.setRenderTarget(buffer);
    gl.render(scene, camera);
    gl.setRenderTarget(null);
  });

  const { scale, ior, thickness, anisotropy, chromaticAberration, ...extraMat } = modeProps;

  return (
    <>
      {createPortal(
        <group>
          {children}
        </group>,
        scene
      )}
      <mesh scale={[vp.width, vp.height, 1]}>
        <planeGeometry />
        <meshBasicMaterial map={buffer.texture} transparent opacity={0.8} />
      </mesh>
      <mesh ref={ref} scale={scale ?? 0.35} rotation-x={Math.PI / 2} {...props}>
        <cylinderGeometry args={[2.5, 2.5, 0.6, 32]} />
        <MeshTransmissionMaterial
          buffer={buffer.texture}
          ior={ior ?? 1.2}
          thickness={thickness ?? 3}
          anisotropy={anisotropy ?? 0.05}
          chromaticAberration={chromaticAberration ?? 0.15}
          transmission={1}
          roughness={0}
          {...extraMat}
        />
      </mesh>
    </>
  );
});
