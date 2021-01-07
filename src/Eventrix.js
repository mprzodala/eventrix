import StateManager from './StateManager';
import EventsEmitter from './EventsEmitter';

class Eventrix {
    /**
     * @param initialState {object}
     * @param eventsReceivers {Array<EventsReceiver>}
     */
    constructor(initialState, eventsReceivers) {
        this.eventsEmitter = new EventsEmitter();
        this.stateManager = new StateManager(this.eventsEmitter, initialState, eventsReceivers);

        this.getState = this.getState.bind(this);
        this.emit = this.emit.bind(this);
        this.listen = this.listen.bind(this);
        this.unlisten = this.unlisten.bind(this);
        this.useReceiver = this.useReceiver.bind(this);
        this.removeReceiver = this.removeReceiver.bind(this);
    }

    /**
     * Get state from path
     * @param path {string} path to state
     * @return {any} Returns state value
     */
    getState(path) {
        return this.stateManager.getState(path);
    }

    /**
     * Emit event with data
     * @param name {string} Emitted event name
     * @param value {any} Emitted event data
     * @return {Promise<T>|Promise<any>} Returns Promise. It will be resolved after all events receivers and listeners invoked
     */
    emit(name, value) {
        return this.eventsEmitter.emit(name, value);
    }

    /**
     * Add listener on event
     * @param name {string} Event name
     * @param listener {function} This function will be called when event is emitted
     */
    listen(name, listener) {
        this.eventsEmitter.listen(name, listener);
    }

    /**
     * Remove listener on event
     * @param name {string} Event name
     * @param listener {function} Listener function
     */
    unlisten(name, listener) {
        this.eventsEmitter.unlisten(name, listener);
    }

    /**
     * Use events receiver
     * @param receiver {EventsReceiver} instance of EventsReceiver class
     */
    useReceiver(receiver) {
        this.stateManager.useReceiver(receiver);
    }

    /**
     * Remove events receiver
     * @param receiver {EventsReceiver} instance of EventsReceiver class
     */
    removeReceiver(receiver) {
        this.stateManager.removeReceiver(receiver);
    }
}

export default Eventrix;
