import React, { useState, useEffect } from "react";
import ImageContext from "./ImageContext";

const initialData = { allImages: [] }; // Initial data if localStorage is empty

const DataProvider = (props) => {
  const [imageState, setImageState] = useState(initialData);

  const addToAllImagesHandler = () => {};
  const setAllTemplatesHandler = () => {};
  const removeFromAllImagesHandler = () => {};
  const modifyFromAllImagesHandler = () => {};
  const imageContext = {
    allImages: imageState.allImages,
    addToAllImages: addToAllImagesHandler,
    setAllTemplates: setAllTemplatesHandler,
    removeFromAllImages: removeFromAllImagesHandler,
    modifyFromAllImages: modifyFromAllImagesHandler,
  };
  return (
    <ImageContext.Provider value={imageContext}>
      {props.children}
    </ImageContext.Provider>
  );
};
