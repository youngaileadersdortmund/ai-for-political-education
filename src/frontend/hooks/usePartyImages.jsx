import { useState, useEffect } from "react";

export const usePartyImages = (metadata, lang = "de", shuffle = true) => {
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchImages = async () => {
      setIsLoading(true);
      const imagesArr = [];
      try {
        const paths = metadata.paths || {};
        const parties = metadata.parties || {};
        for (const partyKey in parties) {
          const partyData = parties[partyKey];
          const name = partyData.name ?? partyKey;
          const url = partyData.url ?? partyKey;
          // Build the points file path using metadata
          const pointsFile = `${paths.base}/${partyKey}/${paths.program}/${paths[lang]?.prompt}`;
          let points = [];
          let pointsFileExists = false;
          try {
            const response = await fetch(pointsFile);
            if (response.ok) {
              const text = await response.text();
              if (!text.trim().startsWith('<!doctype html>') && !text.trim().startsWith('<html')) {
                points = text.split(',').map(s => s.trim()).filter(Boolean);
                pointsFileExists = points.length > 0;
              }
            }
          } catch {}
          if (pointsFileExists) {
            for (let i = 0; i < 5; i++) {
              imagesArr.push({
                id: `${partyKey}-${i}`,
                partyKey,
                partyName: name,
                partyURL: url,
                index: i,
                src: `${paths.base}/${partyKey}/${paths.program}/${paths.images}/0_${i}.png`,
                alt: `${name} - Image ${i + 1}`,
                visualImpactPoints: points,
                pointForImage: points[i] ?? null,
              });
            }
          }
        }
        if (shuffle) {
          for (let i = imagesArr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [imagesArr[i], imagesArr[j]] = [imagesArr[j], imagesArr[i]];
          }
        }
        if (!cancelled) setImages(imagesArr);
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    };
    fetchImages();
    return () => {
      cancelled = true;
    };
  }, [lang, shuffle, metadata]);

  return { images, isLoading };
};
