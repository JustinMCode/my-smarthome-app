/**
 * Layout Components Index
 * 
 * Exports layout-related components only.
 * Factory functions have been moved to the centralized factory system.
 * 
 * @module LayoutComponents
 */

// Export layout components
export { GridLayoutEngine } from './GridLayoutEngine.js';
export { OverlapDetector } from './OverlapDetector.js';
export { ResponsiveLayout } from './ResponsiveLayout.js';

// Note: Factory functions are now available from:
// import { createLayoutManager } from '../utils/factory/index.js';
