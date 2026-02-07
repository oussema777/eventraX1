// src/data/palletDimensions.ts

export interface PalletDimensions {
  length: number; // in cm
  width: number;  // in cm
  height: number; // in cm
}

export const EURO_PALLET_DIMENSIONS: PalletDimensions = {
  length: 120,
  width: 80,
  height: 144, // Assuming a common height for a stacked pallet
};

export const STANDARD_PALLET_DIMENSIONS: PalletDimensions = {
  length: 120,
  width: 100,
  height: 144, // Assuming a common height for a stacked pallet
};

// You can add more pallet types here if needed
