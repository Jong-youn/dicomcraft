// DICOM API 응답 타입들
export interface DicomAnalysisResponse {
  fileName: string;
  tags: DicomTag[];
  pixelData: DicomPixelData;
  analysisStatus: string;
  errorMessage?: string;
}

export interface DicomTag {
  id: string;
  name: string;
  vr: string;
  vrDescription?: string;
  value: any;
  children: DicomSequenceItem[];
}

export interface DicomSequenceItem {
  itemNumber: number;
  tags: DicomTag[];
}

export interface DicomPixelData {
  width: number;
  height: number;
  bitsAllocated: number;
  bitsStored: number;
  samplesPerPixel: number;
  photometricInterpretation: string;
  pixelRepresentation: string;
  pixelDataBase64: string;
  hasPixelData: boolean;
  convertedImageBase64?: string;
  hasConvertedImage?: boolean;
}

// DICOM 생성 요청 타입들
export interface DicomGenerationRequest {
  tags: DicomTagRequest[];
  pixelData: DicomPixelDataRequest;
}

export interface DicomTagRequest {
  tagNumber: string;
  tagName: string;
  vr: string;
  value: any;
  children: DicomSequenceItemRequest[];
}

export interface DicomSequenceItemRequest {
  itemNumber: number;
  tags: DicomTagRequest[];
}

export interface DicomPixelDataRequest {
  width: number;
  height: number;
  bitsAllocated: number;
  bitsStored: number;
  samplesPerPixel: number;
  photometricInterpretation: string;
  pixelRepresentation: string;
  pixelDataBase64: string;
}

export interface DicomGenerationResponse {
  fileName: string;
  generatedDicomBase64: string;
  generationStatus: string;
  errorMessage?: string;
  fileSize: number;
}

// Cornerstone.js 타입 정의
declare global {
  interface Window {
    cornerstone: any;
    cornerstoneTools: any;
    cornerstoneMath: any;
  }
}

export interface CornerstoneImage {
  imageId: string;
  minPixelValue: number;
  maxPixelValue: number;
  slope: number;
  intercept: number;
  windowCenter: number;
  windowWidth: number;
  getPixelData: () => Uint8Array | Uint16Array;
  getImageData: () => ImageData;
  getCanvas: () => HTMLCanvasElement;
  getImage: () => HTMLImageElement;
  getRows: () => number;
  getColumns: () => number;
  getNumberOfFrames: () => number;
  getBitsAllocated: () => number;
  getBitsStored: () => number;
  getHighBit: () => number;
  getPixelRepresentation: () => number;
  getSamplesPerPixel: () => number;
  getPhotometricInterpretation: () => string;
  getPlanarConfiguration: () => number;
  getPixelAspectRatio: () => number;
  getImageOrientationPatient: () => number[];
  getImagePositionPatient: () => number[];
  getPixelSpacing: () => number[];
  getFrameTimeVector: () => number[];
  getInstanceNumber: () => number;
  getImageIndex: () => number;
  getImageId: () => string;
  getImagePath: () => string;
  getImageUrl: () => string;
  getImageObject: () => any;
  getImageObjectAsync: () => Promise<any>;
  getImageObjectSync: () => any;
  getImageObjectSyncOrAsync: () => any | Promise<any>;
  getImageObjectSyncOrAsyncOrPromise: () => any | Promise<any>;
  getImageObjectSyncOrAsyncOrPromiseOrCallback: () => any | Promise<any> | Function;
  getImageObjectSyncOrAsyncOrPromiseOrCallbackOrEvent: () => any | Promise<any> | Function | Event;
  getImageObjectSyncOrAsyncOrPromiseOrCallbackOrEventOrError: () => any | Promise<any> | Function | Event | Error;
  getImageObjectSyncOrAsyncOrPromiseOrCallbackOrEventOrErrorOrNull: () => any | Promise<any> | Function | Event | Error | null;
  getImageObjectSyncOrAsyncOrPromiseOrCallbackOrEventOrErrorOrNullOrUndefined: () => any | Promise<any> | Function | Event | Error | null | undefined;
}

export interface CornerstoneEnabledElement {
  element: HTMLElement;
  image: CornerstoneImage;
  canvas: HTMLCanvasElement;
  imageId: string;
  viewport: {
    scale: number;
    translation: {
      x: number;
      y: number;
    };
    voi: {
      windowWidth: number;
      windowCenter: number;
    };
    invert: boolean;
    pixelReplication: boolean;
    rotation: number;
    hflip: boolean;
    vflip: boolean;
    modalityLUT: any;
    voiLUT: any;
    colormap: any;
    labelmap: boolean;
  };
  options: any;
  data: any;
  renderingTools: any[];
  eventListeners: any[];
  imageRendered: boolean;
  invalid: boolean;
  needsRedraw: boolean;
  lastRenderedImageId: string;
  lastRenderedViewport: any;
  lastRenderedCanvas: HTMLCanvasElement;
  lastRenderedImage: CornerstoneImage;
  lastRenderedElement: HTMLElement;
  lastRenderedOptions: any;
  lastRenderedData: any;
  lastRenderedRenderingTools: any[];
  lastRenderedEventListeners: any[];
  lastRenderedImageRendered: boolean;
  lastRenderedInvalid: boolean;
  lastRenderedNeedsRedraw: boolean;
  lastRenderedLastRenderedImageId: string;
  lastRenderedLastRenderedViewport: any;
  lastRenderedLastRenderedCanvas: HTMLCanvasElement;
  lastRenderedLastRenderedImage: CornerstoneImage;
  lastRenderedLastRenderedElement: HTMLElement;
  lastRenderedLastRenderedOptions: any;
  lastRenderedLastRenderedData: any;
  lastRenderedLastRenderedRenderingTools: any[];
  lastRenderedLastRenderedEventListeners: any[];
  lastRenderedLastRenderedImageRendered: boolean;
  lastRenderedLastRenderedInvalid: boolean;
  lastRenderedLastRenderedNeedsRedraw: boolean;
}
