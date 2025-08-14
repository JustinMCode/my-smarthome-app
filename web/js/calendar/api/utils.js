/**
 * API Utilities
 * Shared utilities for calendar API operations
 * 
 * Consolidates common functionality from CalendarsApi and EventsApi
 * to eliminate duplication and provide enterprise-grade API utilities.
 * 
 * @module ApiUtils
 * @author Calendar System
 * @version 1.0.0
 */

/**
 * Default configuration for API operations
 */
export const DEFAULT_API_CONFIG = {
    timeout: 5000,
    retries: 2,
    retryDelay: 1000,
    enableLogging: false,
    enableCaching: false,
    cacheTimeout: 300000 // 5 minutes
};

/**
 * Response cache for performance optimization
 */
const responseCache = new Map();

/**
 * Request timeout controllers for cleanup
 */
const activeRequests = new Set();

/**
 * Parse JSON response safely with comprehensive error handling
 * 
 * This method consolidates the identical _parseJson implementations
 * from both CalendarsApi and EventsApi, providing enhanced error
 * handling and logging capabilities.
 * 
 * @param {Response} response - Fetch response object
 * @param {Object} options - Configuration options
 * @param {boolean} options.enableLogging - Enable debug logging
 * @param {boolean} options.throwOnError - Throw errors instead of returning null
 * @returns {Promise<Object|null>} Parsed JSON data or null on error
 * 
 * @example
 * const response = await fetch('/api/endpoint');
 * const data = await parseJsonResponse(response);
 * if (data) {
 *   // Handle successful parse
 * }
 */
export async function parseJsonResponse(response, options = {}) {
    const config = { ...DEFAULT_API_CONFIG, ...options };
    
    try {
        // Validate response object
        if (!response || typeof response.json !== 'function') {
            if (config.enableLogging) {
                console.warn('API Utils: Invalid response object provided to parseJsonResponse');
            }
            return config.throwOnError ? 
                new Error('Invalid response object') : null;
        }
        
        // Check if response has content
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            if (config.enableLogging) {
                console.warn('API Utils: Response is not JSON format:', contentType);
            }
            return config.throwOnError ? 
                new Error('Response is not JSON format') : null;
        }
        
        // Parse JSON with error handling
        const data = await response.json();
        
        if (config.enableLogging) {
            console.log('API Utils: Successfully parsed JSON response:', {
                status: response.status,
                dataType: typeof data,
                hasData: !!data
            });
        }
        
        return data;
        
    } catch (error) {
        if (config.enableLogging) {
            console.error('API Utils: JSON parse error:', {
                error: error.message,
                status: response?.status,
                url: response?.url
            });
        }
        
        if (config.throwOnError) {
            throw new Error(`Failed to parse JSON response: ${error.message}`);
        }
        
        return null;
    }
}

/**
 * Validate API response structure and status
 * 
 * @param {Response} response - Fetch response object
 * @param {Object} data - Parsed response data
 * @param {Object} options - Validation options
 * @returns {boolean} True if response is valid
 */
export function validateApiResponse(response, data, options = {}) {
    const config = { ...DEFAULT_API_CONFIG, ...options };
    
    // Check HTTP status
    if (!response.ok) {
        if (config.enableLogging) {
            console.warn('API Utils: HTTP error status:', response.status);
        }
        return false;
    }
    
    // Check for API-level errors
    if (data && data.success === false) {
        if (config.enableLogging) {
            console.warn('API Utils: API returned error:', data.error);
        }
        return false;
    }
    
    return true;
}

/**
 * Make HTTP request with timeout, retry logic, and error handling
 * 
 * @param {string} url - Request URL
 * @param {Object} options - Fetch options
 * @param {Object} config - API configuration
 * @returns {Promise<Response>} Fetch response
 */
export async function makeApiRequest(url, options = {}, config = {}) {
    const apiConfig = { ...DEFAULT_API_CONFIG, ...config };
    let lastError;
    
    for (let attempt = 0; attempt <= apiConfig.retries; attempt++) {
        try {
            // Create abort controller for timeout
            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
                controller.abort();
            }, apiConfig.timeout);
            
            // Track active request
            activeRequests.add(controller);
            
            if (apiConfig.enableLogging && attempt > 0) {
                console.log(`API Utils: Retry attempt ${attempt} for ${url}`);
            }
            
            // Make the request
            const response = await fetch(url, {
                ...options,
                signal: controller.signal
            });
            
            // Cleanup
            clearTimeout(timeoutId);
            activeRequests.delete(controller);
            
            if (apiConfig.enableLogging) {
                console.log('API Utils: Request completed:', {
                    url,
                    status: response.status,
                    attempt: attempt + 1
                });
            }
            
            return response;
            
        } catch (error) {
            lastError = error;
            
            if (apiConfig.enableLogging) {
                console.warn('API Utils: Request failed:', {
                    url,
                    error: error.message,
                    attempt: attempt + 1
                });
            }
            
            // Don't retry on abort (timeout) errors if it's the last attempt
            if (error.name === 'AbortError' && attempt === apiConfig.retries) {
                throw new Error(`Request timeout after ${apiConfig.timeout}ms`);
            }
            
            // Wait before retry (except on last attempt)
            if (attempt < apiConfig.retries) {
                await new Promise(resolve => 
                    setTimeout(resolve, apiConfig.retryDelay * (attempt + 1))
                );
            }
        }
    }
    
    // All retries failed
    throw lastError || new Error('Request failed after all retries');
}

/**
 * Enhanced API request with JSON parsing and validation
 * 
 * Combines request making, JSON parsing, and response validation
 * into a single, robust utility function.
 * 
 * @param {string} url - Request URL
 * @param {Object} options - Fetch options
 * @param {Object} config - API configuration
 * @returns {Promise<Object>} Parsed and validated response data
 * 
 * @example
 * const data = await apiRequestWithParsing('/api/calendars');
 * // Automatically handles timeout, retries, parsing, and validation
 */
export async function apiRequestWithParsing(url, options = {}, config = {}) {
    const apiConfig = { ...DEFAULT_API_CONFIG, ...config };
    
    // Check cache first
    if (apiConfig.enableCaching && options.method !== 'POST' && options.method !== 'PUT' && options.method !== 'DELETE') {
        const cacheKey = `${url}_${JSON.stringify(options)}`;
        const cached = getCachedResponse(cacheKey);
        if (cached) {
            if (apiConfig.enableLogging) {
                console.log('API Utils: Returning cached response for:', url);
            }
            return cached;
        }
    }
    
    // Make the request
    const response = await makeApiRequest(url, options, apiConfig);
    
    // Parse JSON response
    const data = await parseJsonResponse(response, apiConfig);
    
    // Validate response
    const isValid = validateApiResponse(response, data, apiConfig);
    if (!isValid) {
        const errorMessage = data?.error || `Request failed with status ${response.status}`;
        throw new Error(errorMessage);
    }
    
    // Cache successful responses
    if (apiConfig.enableCaching && response.ok) {
        const cacheKey = `${url}_${JSON.stringify(options)}`;
        setCachedResponse(cacheKey, data, apiConfig.cacheTimeout);
    }
    
    return data;
}

/**
 * Get cached response if available and not expired
 * 
 * @param {string} key - Cache key
 * @returns {Object|null} Cached data or null
 */
function getCachedResponse(key) {
    const cached = responseCache.get(key);
    if (!cached) return null;
    
    if (Date.now() - cached.timestamp > cached.timeout) {
        responseCache.delete(key);
        return null;
    }
    
    return cached.data;
}

/**
 * Cache response data with timestamp
 * 
 * @param {string} key - Cache key
 * @param {Object} data - Data to cache
 * @param {number} timeout - Cache timeout in ms
 */
function setCachedResponse(key, data, timeout) {
    responseCache.set(key, {
        data,
        timestamp: Date.now(),
        timeout
    });
    
    // Cleanup old cache entries periodically
    if (responseCache.size > 100) {
        cleanupCache();
    }
}

/**
 * Clean up expired cache entries
 */
function cleanupCache() {
    const now = Date.now();
    for (const [key, cached] of responseCache.entries()) {
        if (now - cached.timestamp > cached.timeout) {
            responseCache.delete(key);
        }
    }
}

/**
 * Clear all cached responses
 */
export function clearApiCache() {
    responseCache.clear();
}

/**
 * Get API cache statistics
 * 
 * @returns {Object} Cache statistics
 */
export function getApiCacheStats() {
    const now = Date.now();
    let expired = 0;
    let active = 0;
    
    for (const cached of responseCache.values()) {
        if (now - cached.timestamp > cached.timeout) {
            expired++;
        } else {
            active++;
        }
    }
    
    return {
        total: responseCache.size,
        active,
        expired,
        memoryUsage: JSON.stringify([...responseCache.entries()]).length
    };
}

/**
 * Abort all active requests
 */
export function abortAllRequests() {
    for (const controller of activeRequests) {
        try {
            controller.abort();
        } catch (error) {
            // Ignore errors during abort
        }
    }
    activeRequests.clear();
}

/**
 * Create standardized API error
 * 
 * @param {string} message - Error message
 * @param {number} status - HTTP status code
 * @param {Object} response - Original response data
 * @returns {Error} Standardized error object
 */
export function createApiError(message, status = 500, response = null) {
    const error = new Error(message);
    error.status = status;
    error.response = response;
    error.isApiError = true;
    return error;
}

/**
 * Utility function to handle common API response patterns
 * 
 * @param {Response} response - Fetch response
 * @param {Object} data - Parsed response data
 * @param {string} dataKey - Key to extract from successful response
 * @returns {Object} Extracted data or full response
 */
export function extractApiData(response, data, dataKey = null) {
    if (!validateApiResponse(response, data)) {
        throw createApiError(
            data?.error || `Request failed with status ${response.status}`,
            response.status,
            data
        );
    }
    
    if (dataKey && data && typeof data === 'object') {
        return data[dataKey] || data;
    }
    
    return data;
}

/**
 * Legacy _parseJson method for backward compatibility
 * This is the exact method that was duplicated in CalendarsApi and EventsApi
 * 
 * @deprecated Use parseJsonResponse for enhanced functionality
 * @param {Response} resp - Fetch response object
 * @returns {Promise<Object|null>} Parsed JSON or null
 */
export async function _parseJson(resp) {
    try {
        return await resp.json();
    } catch (_) {
        return null;
    }
}

// Export all utilities as default object for convenience
export default {
    parseJsonResponse,
    validateApiResponse,
    makeApiRequest,
    apiRequestWithParsing,
    clearApiCache,
    getApiCacheStats,
    abortAllRequests,
    createApiError,
    extractApiData,
    _parseJson, // Legacy compatibility
    DEFAULT_API_CONFIG
};
