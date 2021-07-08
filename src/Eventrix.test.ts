import Eventrix from './Eventrix';
import EventsReceiver from "./EventsReceiver";
import {EventsReceiverI} from "./interfaces";

describe('Eventrix', () => {
    let initialState: any;
    let mockListener = () => {};
    let mockReceiver;
    let eventsReceivers: EventsReceiverI[];
    let eventrix = new Eventrix();
    beforeEach(() => {
        initialState = {
            foo: {
                bar: 'foo',
            },
            bar: {
                foo: 'bar',
            },
        };
        mockReceiver = jest.fn(() => 'testReceiverData');
        eventsReceivers = [
            new EventsReceiver('getFoo', mockReceiver)
        ];
        mockListener = jest.fn();
        eventrix = new Eventrix(initialState, eventsReceivers);
    });
    it('should getState from store', () => {
        expect(eventrix.getState('foo.bar')).toEqual('foo');
    });
    it('should call listener on emit event', () => {
        const eventName = 'getFoo';
        eventrix.listen(eventName, mockListener);
        eventrix.emit(eventName, 'test');
        expect(mockListener).toHaveBeenCalledWith('test', ['testReceiverData']);
    });
    it('should map emit arguments and emit event', () => {
        const eventName = 'getFoo';
        const getFooEvent = <EventDataI>(eventData: EventDataI): [string, EventDataI] => {
            return [eventName, eventData];
        };
        eventrix.listen(eventName, mockListener);
        eventrix.emit(getFooEvent<string>('test'));
        expect(mockListener).toHaveBeenCalledWith('test', ['testReceiverData']);
    });
    it('should not call event listener after unlisten', () => {
        const eventName = 'getFoo';
        eventrix.listen(eventName, mockListener);
        eventrix.unlisten(eventName, mockListener);
        eventrix.emit(eventName, 'test');
        expect(mockListener).not.toHaveBeenCalled();
    });
    it('should call listener with bar data from store returned by receiver', () => {
        const eventName = 'getFoo';
        const eventsReceiver = new EventsReceiver('getFoo', (name, data, store) => {
            return store.getState('foo');
        });
        eventrix.useReceiver(eventsReceiver);
        eventrix.listen(eventName, mockListener);
        eventrix.emit(eventName, 'test');
        expect(mockListener).toHaveBeenCalledWith('test', ['testReceiverData', initialState.foo]);
    });
    it('should call listener on emit event without receiver response', () => {
        const eventName = 'getFoo';
        eventrix.removeReceiver(eventsReceivers[0]);
        eventrix.listen(eventName, mockListener);
        eventrix.emit(eventName, 'test');
        expect(mockListener).toHaveBeenCalledWith('test', []);
    });
    it('should event receiver update store on emit event', () => {
        const eventName = 'setBar';
        const newbarState = { foo1: 'barbar' };
        const eventsReceiver = new EventsReceiver(eventName, (name, data, store) => {
            store.setState('bar', newbarState);
        });
        eventrix.useReceiver(eventsReceiver);
        eventrix.listen(eventName, mockListener);
        eventrix.emit(eventName, 'test');
        expect(mockListener).toHaveBeenCalledWith('test', []);
        expect(eventrix.getState('bar')).toEqual(newbarState);
    });
    it('should run error callback when emit catch error on receiver failed', () => {
        const eventName = 'setBar';
        const eventData = 'test';
        const eventsReceiver = new EventsReceiver(eventName, (name, data, store) => {
            throw 'failedReceiver';
        });
        const errorCallback = jest.fn();
        eventrix.onError(errorCallback);
        eventrix.useReceiver(eventsReceiver);
        eventrix.emit(eventName, eventData);
        expect(errorCallback).toHaveBeenCalledWith('failedReceiver', eventName, eventData, initialState);
        expect(eventrix.getState()).toEqual(initialState);
    });

    it('should run error callback when emit catch error on listener failed', () => {
        const eventName = 'setBar';
        const eventData = 'test';

        const failedListener = () => {
            throw 'failedListener';
        };
        const errorCallback = jest.fn();
        eventrix.onError(errorCallback);
        eventrix.listen(eventName, failedListener);
        eventrix.emit(eventName, eventData);
        expect(errorCallback).toHaveBeenCalledWith('failedListener', eventName, eventData, initialState);
        expect(eventrix.getState()).toEqual(initialState);
    });
});
