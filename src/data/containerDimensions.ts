// src/data/containerDimensions.ts

export interface ContainerDimensions {
  length: number; // in cm (internal)
  width: number;  // in cm (internal)
  height: number; // in cm (internal)
}

export const _20STD_CONTAINER_DIMENSIONS: ContainerDimensions = {
  length: 590,
  width: 235,
  height: 239,
};

export const _40STD_CONTAINER_DIMENSIONS: ContainerDimensions = {
  length: 1203,
  width: 235,
  height: 239,
};

export const _40HC_CONTAINER_DIMENSIONS: ContainerDimensions = {
  length: 1203,
  width: 235,
  height: 269,
};

export const CONTAINER_DIMENSIONS_MAP: Record<string, ContainerDimensions> = {
  '20std': _20STD_CONTAINER_DIMENSIONS,
  '40std': _40STD_CONTAINER_DIMENSIONS,
  '40hc': _40HC_CONTAINER_DIMENSIONS,
};
