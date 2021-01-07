class EventsReceiver {
    /**
     * EventsReceiver constructor
     * @param eventsNames {string|string<string>}
     * @param receiver {function}
     */
    constructor(eventsNames, receiver) {
        this.eventsNames = Array.isArray(eventsNames) ? eventsNames : [eventsNames];
        this.receiver = receiver;
    }

    /**
     * Get event names of events receiver. This events will invoke handleEvent method.
     * @returns {Array<string>} array of event names.
     */
    getEventsNames() {
        return this.eventsNames;
    }

    /**
     * This method invoke receiver when event was emitted.
     * @param name {string} Emitted event name
     * @param data {any} Emitted event data
     * @param stateManager {StateManager} State manager have access to store, eventsEmitter and eventrix instance.
     * @returns {any|Promise<any>} receiver function data or Promise.
     */
    handleEvent(name, data, stateManager) {
        return this.receiver(name, data, stateManager);
    }
}

/**
 * This method handle error and success response of fetchMethod and emit events.
 * @name fetchHandler
 * @param fetchMethod {function} Fetch data method
 * @param events {object} Describe success events and error event
 * @param events.success {object} Success event params
 * @param events.success.eventName {string} This event will be called on success response.
 * @param events.success.data {any} Success event data.
 * @param events.success.getData {function} This method prepares data for success event from response and eventData.
 * @param events.error {object} Error event params
 * @param events.error.eventName {string} This event will be called on error response.
 * @param events.error.data {any} Error event data.
 * @param events.error.getData {function} This method prepares data for error event from response and eventData.
 * @returns {function(eventData, state, emit): Promise<any>}
 */
export const fetchHandler = (fetchMethod, events) => {
    return (eventData, state, emit) =>
        fetchMethod(eventData, state, emit)
            .then((response) => {
                const { eventName, data, getData } = events.success;
                const successEventData = (getData && typeof getData === 'function') ? getData(response, eventData) : data;
                emit(eventName, successEventData);
                return response;
            })
            .catch((errorResponse) => {
                const { eventName, data, getData } = events.error;
                const errorEventData = (getData && typeof getData === 'function') ? getData(errorResponse, eventData) : data;
                emit(eventName, errorEventData);
            });
};

/**
 * This method create EventsReceiver to update state after fetch data
 * @name fetchToStateReceiver
 * @param eventName {string} Event name for run fetchMethod
 * @param statePath {string} State path to update
 * @param fetchMethod {function(name, eventData, stateManager): Promise<any>} Method to fetch data and returns new state
 * @returns {EventsReceiver} instance of EventsReceiver
 */
export const fetchToStateReceiver = (eventName, statePath, fetchMethod) => {
    return new EventsReceiver(eventName, (name, eventData, stateManager) => {
        const state = stateManager.getState();
        const emit = stateManager.eventsEmitter.emit;
        return fetchMethod(eventData, state, emit).then((nextState) => {
            if (nextState !== undefined) {
                const path =
                    typeof statePath === "function"
                        ? statePath(eventData, nextState)
                        : statePath;
                stateManager.setState(path, nextState);
                return nextState;
            }
        });
    });
};

export default EventsReceiver;
