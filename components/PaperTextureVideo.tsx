"use client";

import type { ComponentType, RefObject } from "react";
import { useEffect, useMemo, useState } from "react";

type PaperTextureVideoProps = {
  videoRef: RefObject<HTMLVideoElement>;
};

export default function PaperTextureVideo({ videoRef }: PaperTextureVideoProps) {
  const [source, setSource] = useState<HTMLVideoElement | string>("/images/ui/placeholder.png");
  const [ShaderComponent, setShaderComponent] = useState<ComponentType<any> | null>(null);

  useEffect(() => {
    let isMounted = true;
    import("@paper-design/shaders-react")
      .then((mod: any) => {
        const Component = mod.PaperTexture;
        if (isMounted && Component) {
          setShaderComponent(() => Component);
        }
      })
      .catch(() => {
        // Shader not available; render without halftone.
      });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (videoRef.current) {
      setSource(videoRef.current);
    }
  }, [videoRef]);

  useEffect(() => {
    if (!ShaderComponent) return;
    document.documentElement.classList.add("paper-texture-active");
    return () => {
      document.documentElement.classList.remove("paper-texture-active");
    };
  }, [ShaderComponent]);

  const Shader = useMemo(() => ShaderComponent, [ShaderComponent]);

  if (!Shader) {
    return null;
  }

  return (
    <div className="halftone-layer" aria-hidden="true">
      <Shader
        width="100vw"
        height="100vh"
        image={source}
        colorBack="#ffffff"
        colorFront="#9fadbc"
        contrast={0.3}
        roughness={0.4}
        fiber={0.3}
        fiberSize={0.2}
        crumples={0.3}
        crumpleSize={0.35}
        folds={0.65}
        foldCount={5}
        drops={0.2}
        fade={0}
        seed={6}
        scale={0.6}
        fit="cover"
      />
    </div>
  );
}
