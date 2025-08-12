/**
 * Event Cache Component
 * Handles caching of event data for improved performance
 * 
 * Provides functionality for:
 * - Caching event data with TTL
 * - Cache invalidation strategies
 * - Cache statistics and monitoring
 * - Memory management
 */
export class EventCache {
    constructor(options = {}) {
        this.options = {
            defaultTTL: 5 * 60 * 1000, // 5 minutes default
            maxCacheSize: 1000,         // Maximum number of cached items
            enableCompression: false,   // Enable data compression
            ...options
        };
        
        this.cache = new Map();
        this.stats = {
            hits: 0,
            misses: 0,
            sets: 0,
            deletes: 0,
            size: 0
        };
        
        // Start cleanup interval
        this.cleanupInterval = setInterval(() => {
            this.cleanup();
        }, 60000); // Cleanup every minute
    }

    /**
     * Set a value in the cache
     * @param {string} key - Cache key
     * @param {*} value - Value to cache
     * @param {Object} options - Cache options
     */
    set(key, value, options = {}) {
        const {
            ttl = this.options.defaultTTL,
            compress = this.options.enableCompression
        } = options;
        
        // Check cache size limit
        if (this.cache.size >= this.options.maxCacheSize) {
            this.evictOldest();
        }
        
        const cacheEntry = {
            value: compress ? this.compress(value) : value,
            timestamp: Date.now(),
            ttl,
            compressed: compress
        };
        
        this.cache.set(key, cacheEntry);
        this.stats.sets++;
        this.stats.size = this.cache.size;
    }

    /**
     * Get a value from the cache
     * @param {string} key - Cache key
     * @returns {*} Cached value or null if not found/expired
     */
    get(key) {
        const entry = this.cache.get(key);
        
        if (!entry) {
            this.stats.misses++;
            return null;
        }
        
        // Check if expired
        if (Date.now() - entry.timestamp > entry.ttl) {
            this.delete(key);
            this.stats.misses++;
            return null;
        }
        
        this.stats.hits++;
        return entry.compressed ? this.decompress(entry.value) : entry.value;
    }

    /**
     * Check if a key exists in cache and is not expired
     * @param {string} key - Cache key
     * @returns {boolean} True if key exists and is valid
     */
    has(key) {
        const entry = this.cache.get(key);
        
        if (!entry) return false;
        
        // Check if expired
        if (Date.now() - entry.timestamp > entry.ttl) {
            this.delete(key);
            return false;
        }
        
        return true;
    }

    /**
     * Delete a key from cache
     * @param {string} key - Cache key
     * @returns {boolean} True if key was deleted
     */
    delete(key) {
        const deleted = this.cache.delete(key);
        if (deleted) {
            this.stats.deletes++;
            this.stats.size = this.cache.size;
        }
        return deleted;
    }

    /**
     * Clear all cache entries
     */
    clear() {
        const size = this.cache.size;
        this.cache.clear();
        this.stats.deletes += size;
        this.stats.size = 0;
    }

    /**
     * Get cache statistics
     * @returns {Object} Cache statistics
     */
    getStats() {
        const hitRate = this.stats.hits + this.stats.misses > 0 
            ? this.stats.hits / (this.stats.hits + this.stats.misses) 
            : 0;
        
        return {
            ...this.stats,
            hitRate: Math.round(hitRate * 100) / 100,
            size: this.cache.size,
            maxSize: this.options.maxCacheSize
        };
    }

    /**
     * Clean up expired entries
     * @returns {number} Number of entries cleaned up
     */
    cleanup() {
        const now = Date.now();
        let cleanedCount = 0;
        
        for (const [key, entry] of this.cache.entries()) {
            if (now - entry.timestamp > entry.ttl) {
                this.cache.delete(key);
                cleanedCount++;
            }
        }
        
        this.stats.deletes += cleanedCount;
        this.stats.size = this.cache.size;
        
        return cleanedCount;
    }

    /**
     * Evict oldest entries when cache is full
     * @param {number} count - Number of entries to evict
     */
    evictOldest(count = 1) {
        const entries = Array.from(this.cache.entries())
            .sort(([, a], [, b]) => a.timestamp - b.timestamp)
            .slice(0, count);
        
        entries.forEach(([key]) => {
            this.delete(key);
        });
    }

    /**
     * Generate cache key for event data
     * @param {Date} date - Date for events
     * @param {Object} options - Query options
     * @returns {string} Cache key
     */
    generateKey(date, options = {}) {
        const dateStr = date.toISOString().split('T')[0];
        const optionsStr = JSON.stringify(options);
        return `events_${dateStr}_${this.hashString(optionsStr)}`;
    }

    /**
     * Simple string hash function
     * @param {string} str - String to hash
     * @returns {string} Hash value
     */
    hashString(str) {
        let hash = 0;
        for (let i = 0; i < str.length; i++) {
            const char = str.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash; // Convert to 32-bit integer
        }
        return Math.abs(hash).toString(36);
    }

    /**
     * Compress data (simple implementation)
     * @param {*} data - Data to compress
     * @returns {string} Compressed data
     */
    compress(data) {
        // Simple compression - in production, consider using a proper compression library
        return JSON.stringify(data);
    }

    /**
     * Decompress data
     * @param {string} compressedData - Compressed data
     * @returns {*} Decompressed data
     */
    decompress(compressedData) {
        try {
            return JSON.parse(compressedData);
        } catch (error) {
            console.warn('Failed to decompress cache data:', error);
            return null;
        }
    }

    /**
     * Update cache options
     * @param {Object} newOptions - New options
     */
    updateOptions(newOptions) {
        this.options = { ...this.options, ...newOptions };
    }

    /**
     * Get cache size in bytes (approximate)
     * @returns {number} Approximate size in bytes
     */
    getSizeInBytes() {
        let size = 0;
        for (const [key, entry] of this.cache.entries()) {
            size += key.length;
            size += JSON.stringify(entry.value).length;
        }
        return size;
    }

    /**
     * Destroy cache instance
     */
    destroy() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
            this.cleanupInterval = null;
        }
        this.clear();
    }
}
