import StateManager from './StateManager';
import EventsEmitter from './EventsEmitter';
import {
    EventrixI,
    EventsEmitterI,
    StateManagerI,
    EventsListenerI,
    EventsReceiverI,
    EmitArgumentsI,
    ErrorCallback,
} from "./interfaces";

class Eventrix<InitialStateI = any> implements EventrixI {
    eventsEmitter: EventsEmitterI;
    stateManager: StateManagerI;

    constructor(initialState?: InitialStateI, eventsReceivers?: EventsReceiverI[]) {
        this.eventsEmitter = new EventsEmitter();
        this.stateManager = new StateManager(this.eventsEmitter, initialState, eventsReceivers);

        this.getState = this.getState.bind(this);
        this.emit = this.emit.bind(this);
        this.listen = this.listen.bind(this);
        this.unlisten = this.unlisten.bind(this);
        this.useReceiver = this.useReceiver.bind(this);
        this.removeReceiver = this.removeReceiver.bind(this);
        this.onError = this.onError.bind(this);
    }
    getState<StateI>(path?: string): StateI {
        return this.stateManager.getState(path);
    }
    mapEmitArguments<EventDataI>(name: string | [string, EventDataI], value?: EventDataI): EmitArgumentsI<EventDataI> {
        if (Array.isArray(name)) {
            const [eventName, eventData] = name;
            return { eventName, eventData };
        }
        return { eventName: name, eventData: value };
    }
    emit<EventDataI = any>(name: string | [string, EventDataI] , value?: EventDataI): Promise<any> {
        const { eventName, eventData } = this.mapEmitArguments<EventDataI>(name, value);
        return this.eventsEmitter.emit<EventDataI>(eventName, eventData);
    }
    listen<EventData = any>(name: string, listener: EventsListenerI<EventData>): void {
        this.eventsEmitter.listen(name, listener);
    }
    unlisten(name: string, listener: EventsListenerI): void {
        this.eventsEmitter.unlisten(name, listener);
    }
    useReceiver(receiver: EventsReceiverI): void {
        this.stateManager.useReceiver(receiver);
    }
    removeReceiver(receiver: EventsReceiverI): void {
        this.stateManager.removeReceiver(receiver);
    }
    onError(errorCallback: ErrorCallback<InitialStateI>) {
        this.eventsEmitter.onError(errorCallback);
    }
}

export default Eventrix;
