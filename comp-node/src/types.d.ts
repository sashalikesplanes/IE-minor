export interface ImageChunk {
  time: number;
  frame_i: number;
  chunk_nr: number;
  total_chunks: number;
  chunk: string;
}

export interface NanodetDetection {
  label: number;
  score: number;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}
