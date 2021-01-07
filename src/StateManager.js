import get from 'lodash/get';
import set from 'lodash/set';
import { isPromise } from "./helpers";
import EventsReceiver from './EventsReceiver';

class StateManager {
    /**
     *
     * @param eventsEmitter {EventsEmitter} EventsEmitter instance
     * @param initialState {object} Initial state of state manager
     * @param eventsReceivers {Array<EventsReceiver>} Initial events receivers
     */
    constructor(eventsEmitter, initialState, eventsReceivers) {
        this.eventsEmitter = eventsEmitter;
        this.state = initialState || {};
        this.receivers = {};
        this.eventsEmitter.useStore(this);
        if (eventsReceivers && Array.isArray(eventsReceivers)) {
            eventsReceivers.forEach(receiver => {
                this.useReceiver(receiver);
            });
        }
        this.useReceiver(new EventsReceiver('setState', (name, data, store) => {
            const { stateName, value } = data;
            store.setState(stateName, value);
        }));
    }

    /**
     *
     * @param receiver {EventsReceiver}
     */
    useReceiver(receiver) {
        const eventsNames = receiver.getEventsNames();
        eventsNames.forEach(
            eventName => this.registerReceiver(eventName, receiver)
        );
    }

    /**
     *
     * @param receiver {EventsReceiver}
     */
    removeReceiver(receiver) {
        const eventsNames = receiver.getEventsNames();
        eventsNames.forEach(
            eventName => this.unregisterReceiver(eventName, receiver)
        );
    }

    /**
     *
     * @param name {string} Event name
     * @param receiver
     */
    registerReceiver(name, receiver) {
        if (!this.receivers[name]) {
            this.receivers[name] = [];
        }
        if (typeof receiver.handleEvent !== 'function') {
            console.warn(`Store->registerReceiver - "${name}" receiver is not a function`);
            return;
        }
        if (this.receivers[name].indexOf(receiver) > -1) {
            console.warn(`Store->registerReceiver - "${name}" events receiver is already registered`);
            return;
        }
        this.receivers[name].push(receiver);
    }

    unregisterReceiver(name, receiver) {
        if (!this.receivers[name]) {
            console.warn(`Store->unregisterReceiver - "${name}" event not registered`);
            return;
        }
        if (this.receivers[name].length === 0) {
            console.warn(`Store->unregisterReceiver - "${name}" event dont have registered receiver`);
            return;
        }
        const index = this.receivers[name].indexOf(receiver);
        if (index < 0) {
            console.warn(`Store->unregisterReceiver - "${name}" receiver not exists`);
            return;
        }
        this.receivers[name].splice(index, 1);
    }

    runReceivers(name, data) {
        const promisesList = [];
        const receiversData = [];
        if (this.receivers[name] && Array.isArray(this.receivers[name])) {
            this.receivers[name].forEach(receiver => {
                const receiverData = receiver.handleEvent(name, data, this);
                if (isPromise(receiverData)) {
                    return promisesList.push(receiverData);
                }
                if (receiverData) {
                    receiversData.push(receiverData);
                }
            });
        }
        if (promisesList.length) {
            return Promise.all(promisesList).then(receiversResponse => [...receiversResponse, ...receiversData]);
        }
        return receiversData;
    }

    setState(path, value) {
        if (path) {
            set(this.state, path, value);
            this.emitEvents(path, true);
            return;
        }
        this.state = value;
    }

    emitEvents(path, isFullPath) {
        const pathElements = path.split('.');
        const value = this.getState(path);
        this.eventsEmitter.emit(`setState:${path}`, value);
        if (pathElements.length > 1) {
            this.emitEvents(this.getParentPath(path));
        }
        if (isFullPath) {
            this.eventsEmitter.emit('setState:*', this.getState());
            this.eventsEmitter.emitWild(`setState:${path}.`, value);
        }
    }

    getParentPath(path) {
        const pathElements = path.split('.');
        if (pathElements.length === 1) {
            return;
        }
        pathElements.pop();
        return pathElements.join('.');
    }

    getState(path) {
        if (!path) {
            return this.state;
        }
        return get(this.state, path);
    }
}

export default StateManager;