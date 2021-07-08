import { ComponentClass, ComponentType } from 'react';

export interface ReceiverI<EventData = any, ReceiverResponse = any> {
    (eventName: string, eventData: EventData, stateManager: StateManagerI): ReceiverResponse;
}

export interface EventsReceiverI<EventDataI = any, ReceiverResponseI = any> {
    eventsNames: string[];
    receiver: ReceiverI<EventDataI, ReceiverResponseI>;
    getEventsNames(): string[];
    handleEvent<EventData, ReceiverResponse>(name: string, data: EventData, stateManager: StateManagerI): ReceiverResponse;
}

export interface StateManagerI {
    state: any;
    receivers: {
        [key: string]: EventsReceiverI[]
    };
    eventsEmitter: EventsEmitterI;
    setState<StateValueI>(path: string | undefined | null, value: StateValueI): void;
    getState<StateValueI>(path?: string): StateValueI;
    useReceiver(receiver: EventsReceiverI): void;
    removeReceiver(receiver: EventsReceiverI): void;
    runReceivers<EventDataI>(name: string, data: EventDataI): any;
}

export interface EmitI<EventData = any> {
    (name: string, data?: EventData): Promise<any>;
}

export interface SetStateI<StateI> {
    (state: StateI): void;
}

export interface FetchMethodI {
    (eventData: any, state: any, emit: EmitI<any>): Promise<any>
}

export interface EmitFetchI<EventDataI>{
    (data: EventDataI): Promise<any>;
}

export interface FetchToStateReceiverI {
    (eventName: string | string[], statePath: string, fetchMethod: FetchMethodI): EventsReceiverI;
}

export interface ResolveHandler {
    eventName: string;
    data?: any;
    getData?(response: any, eventData: any): any;
}

export interface FetchHandlerOptions {
    success: ResolveHandler;
    error: ResolveHandler;
}

export interface FetchHandler {
    (fetchMethod: FetchMethodI, { success, error }: FetchHandlerOptions): FetchMethodI;
}

export interface EventrixI {
    listen<EventData = any>(name: string, listener: EventsListenerI<EventData>): void;
    unlisten(name: string, listener: EventsListenerI): void;
    emit<EventData>(name: string, data: EventData): Promise<any>;
    getState<StateI>(path?: string): StateI;
    useReceiver(eventReceiver: EventsReceiverI): void;
    removeReceiver(eventReceiver: EventsReceiverI): void;
}

export interface EmitArgumentsI<EventDataI> {
    eventName: string;
    eventData?: EventDataI;
}

export interface EventFactoryI<EventDataI, EventFactoryDataI> {
    (eventData: EventDataI): [string, EventDataI | EventFactoryDataI];
}

export interface EventrixProviderProps {
    eventrix?: EventrixI;
    children: any;
}

export interface EventrixProvider {
    (props: EventrixProviderProps): any;
}

export interface StateNamesFunction<Props> {
    (props: Props): string | string[];
}

export interface PropsFromState {
    [key: string]: any;
}

export interface MapStateToPropsFunction<Props, State> {
    (state: State, props: Props): PropsFromState;
}

export interface WithEventrixState<Props, State> {
    (
        BaseComponent: ComponentClass | ComponentType,
        stateNames: string | string[] | StateNamesFunction<Props>,
        mapStateToProps?: MapStateToPropsFunction<Props, State>,
        Context?: any
    ): ComponentClass
}

export interface WithEventrix {
    (
        BaseComponent: ComponentClass | ComponentType,
        Context?: any
    ): ComponentClass
}

export interface UseEventrixState {
    (stateName: string, Context?: any): any[];
}

export interface UseEmit {
    (stateName: string, Context?: any): EmitI<any>;
}

export interface EventCallback {
    (eventData: any): void;
}

export interface UseEvent {
    (eventName: string, callback: EventCallback, Context?: any): any[];
}

export interface UseEventState {
    (eventName: string, Context?: any): any[];
}

export interface EmitFetch {
    (data: any): void;
}

export interface UseFetchToState {
    (eventName: string, statePath: string, fetchMethod: FetchMethodI, Context?: any): EmitFetch[];
}

export interface EventsListenerI<EventDataI = any> {
    (eventData?: EventDataI | any, receiversData?: any[]): void;
}

export interface EventsEmitterI {
    listeners: {
        [key: string]: EventsListenerI<any>[];
    };
    errorCallbacks: Set<ErrorCallback>;
    stateManager?: StateManagerI;
    onError(errorCallback: ErrorCallback): void;
    handleError(error: Error, eventName: string, eventData: any, state: any): void;
    emit<EventDataI = any>(eventName: string, eventData?: EventDataI): Promise<any>;
    emitWild<EventDataI = any>(eventName: string, eventData: EventDataI): void;
    listen(eventName: string, listener: EventsListenerI<any>): void;
    unlisten(eventName: string, listener: EventsListenerI<any>): void;
    getEventData<EventDataI>(name: string, eventName: string, data: any): EventDataI;
    runListeners<EventDataI>(name: string, data: EventDataI, receiversData: any[]): void;
    emitWild<EventDataI>(name: string, data: EventDataI): void
    useStore(stateManager: StateManagerI): void;
    onError(errorCallback: ErrorCallback): void;
}

export interface FetchHandlersI<DataI = any, ResponseI = any, EventDataI = any> {
    success: {
        eventName: string;
        data: DataI;
        getData?(response: ResponseI, eventData: EventDataI): DataI;
    };
    error: {
        eventName: string;
        data: DataI;
        getData?(errorResponse: ResponseI, eventData: EventDataI): DataI;
    };
}

export interface EventrixContextI {
    eventrix: EventrixI;
}

export interface DecoratorEventrixStateI {
    statePath: string;
    stateName: string;
}

export interface DecoratorEventrixListenerI {
    eventName: string;
    name: string;
}

export interface ReceiverStatePathI {
    (eventData: any, nextState: any): string;
}

// DECORATORS

export interface DescriptorI {
    (): any | void;
}


// REDUX ADAPTER

export interface ReducerI {
    (state: any, action: any): any
}

export interface ReducersI {
    [key: string]: ReducerI;
}

export interface ActionI {
    [key: string]: any;
}

export interface DispatchI {
    (action: ActionI): void;
}

export interface mapStateToPropsType <StateI = any, ReducedStateI = any>{
    (state: StateI): ReducedStateI;
}

export interface DispatchActionI {
    (data: any): void;
}

export interface mapDispatchToPropsResponseType {
    [key: string]: DispatchActionI;
}

export interface mapDispatchToPropsType <StateI = any, ReducedStateI = any>{
    (dispatch: DispatchI): mapDispatchToPropsResponseType;
}

export interface ErrorCallback<StateI = any> {
    (error: Error, eventName: string, eventData: any, state: StateI): void;
}
