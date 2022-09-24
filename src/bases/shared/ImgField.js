import React from "react";
import * as ConfigConstants from '@constants/ConfigConstants';
import { PhotoProvider, PhotoView } from 'react-photo-view';
export default function ImgField({ src, style, alt, width, height,crossOrigin, props }) {
  return (
    <>
      {src && (
        <PhotoProvider>
          <PhotoView src={ConfigConstants.BASE_URL + "files/" + src}>
           {crossOrigin ? <img
                src={ConfigConstants.BASE_URL + "files/" + src}
                style={style}
                alt={alt}
                width={width}
                height={height}
                crossOrigin="anonymous"
                {...props}
              /> :
              <img
                src={ConfigConstants.BASE_URL + "files/" + src}
                style={style}
                alt={alt}
                width={width}
                height={height}
                {...props}
              />
              }
              

          </PhotoView>
        </PhotoProvider>
      )}
    </>
  );
}
