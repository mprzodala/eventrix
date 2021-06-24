import get from 'lodash/get';
import { isPromise } from './helpers';
import {EventsEmitterI, EventsListenerI, StateManagerI} from "./interfaces";

class EventsEmitter implements EventsEmitterI {
    listeners: {
        [key: string]: EventsListenerI[];
    };
    stateManager?: StateManagerI;

    constructor() {
        this.listeners = {};
        this.emit = this.emit.bind(this);
        this.emitWild = this.emitWild.bind(this);
    }

    useStore(stateManager: StateManagerI): void {
        this.stateManager = stateManager;
    }

    listen(name: string, listener: EventsListenerI): void {
        if (!this.listeners[name]) {
            this.listeners[name] = [];
        }
        if (typeof listener !== 'function') {
            console.warn(`EventsEmitter->listen - "${name}" listener is not a function`);
            return;
        }
        if (this.listeners[name].indexOf(listener) > -1) {
            console.warn(`EventsEmitter->listen - "${name}" events listener is already registered`);
            return;
        }
        this.listeners[name].push(listener);
    }

    unlisten(name: string, listener: EventsListenerI): void {
        if (!this.listeners[name]) {
            console.warn(`EventsEmitter->unlisten - "${name}" event not registered`);
            return;
        }
        if (this.listeners[name].length === 0) {
            console.warn(`EventsEmitter->unlisten - "${name}" event dont have registered listener`);
            return;
        }
        const index = this.listeners[name].indexOf(listener);
        if (index < 0) {
            console.warn(`EventsEmitter->unlisten - "${name}" listener not exists`);
            return;
        }
        this.listeners[name].splice(index, 1);
    }

    getEventData<EventDataI>(name: string, eventName: string, data: EventDataI): EventDataI {
        if (name === eventName) {
            return data;
        }
        const path = eventName.slice(name.length, eventName.length);
        const hasDotAsFirstChar = path.indexOf('.') === 0;
        return path ? get(data, hasDotAsFirstChar ? path.slice(1, path.length) : path) : data;
    }

    runListeners<EventDataI>(name: string, data: EventDataI, receiversData: any[]): void {
        if (this.listeners[name] && Array.isArray(this.listeners[name])) {
            this.listeners[name].forEach(listener => listener(data, receiversData));
        }
    }

    emitWild<EventDataI>(name: string, data: EventDataI): void {
        const listenEvents = Object.keys(this.listeners);
        const matchedEvents = listenEvents.filter((eventName) => eventName.indexOf(name) === 0);
        return matchedEvents.forEach(eventName => {
            if(this.listeners[eventName] && Array.isArray(this.listeners[eventName])) {
                this.listeners[eventName].forEach(listener => listener(this.getEventData(name, eventName, data), []));
            }
        });
    }

    emit<EventDataI = any>(name: string, data: EventDataI): Promise<any> {
        const receiversResponse = this.stateManager?.runReceivers<EventDataI>(name, data);
        if (isPromise(receiversResponse)) {
            return receiversResponse.then((receiversData: any) => {
                this.runListeners(name, data, receiversData);
            })
        }
        this.runListeners(name, data, receiversResponse);
        return Promise.resolve(receiversResponse);
    }
}

export default EventsEmitter;
