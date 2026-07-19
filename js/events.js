// js/events.js
/**
 * A tiny Pub/Sub system for cross-module communication.
 * This decouples modules so they don't have to directly import each other.
 */

const listeners = {};

export const events = {
    /**
     * Subscribe to an event
     * @param {string} eventName The name of the event to listen for
     * @param {Function} callback The function to run when the event occurs
     */
    on(eventName, callback) {
        if (!listeners[eventName]) {
            listeners[eventName] = [];
        }
        listeners[eventName].push(callback);
    },

    /**
     * Unsubscribe from an event
     * @param {string} eventName The name of the event
     * @param {Function} callback The callback to remove
     */
    off(eventName, callback) {
        if (!listeners[eventName]) return;
        listeners[eventName] = listeners[eventName].filter(cb => cb !== callback);
    },

    /**
     * Publish an event to all subscribers
     * @param {string} eventName The name of the event to emit
     * @param {any} data Any data to pass to the callbacks
     */
    emit(eventName, data) {
        if (!listeners[eventName]) return;
        listeners[eventName].forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error(`Error in event listener for ${eventName}:`, error);
            }
        });
    }
};
