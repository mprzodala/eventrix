
> eventrix@1.7.0 docs /var/projects/eventrix
> jsdoc2md "src/EventsReceiver.js"

## Classes

<dl>
<dt><a href="#EventsReceiver">EventsReceiver</a></dt>
<dd></dd>
</dl>

## Members

<dl>
<dt><a href="#fetchHandler">fetchHandler</a> ⇒ <code>function</code></dt>
<dd><p>This method handle error and success response of fetchMethod and emit events.</p>
</dd>
<dt><a href="#fetchToStateReceiver">fetchToStateReceiver</a> ⇒ <code><a href="#EventsReceiver">EventsReceiver</a></code></dt>
<dd><p>This method create EventsReceiver to update state after fetch data</p>
</dd>
</dl>

<a name="EventsReceiver"></a>

## EventsReceiver
**Kind**: global class  

* [EventsReceiver](#EventsReceiver)
    * [new EventsReceiver(eventsNames, receiver)](#new_EventsReceiver_new)
    * [.getEventsNames()](#EventsReceiver+getEventsNames) ⇒ <code>Array.&lt;string&gt;</code>
    * [.handleEvent(name, data, stateManager)](#EventsReceiver+handleEvent) ⇒ <code>any</code> \| <code>Promise.&lt;any&gt;</code>

<a name="new_EventsReceiver_new"></a>

### new EventsReceiver(eventsNames, receiver)
EventsReceiver constructor


| Param | Type |
| --- | --- |
| eventsNames | <code>string</code> \| <code>string.&lt;string&gt;</code> | 
| receiver | <code>function</code> | 

<a name="EventsReceiver+getEventsNames"></a>

### eventsReceiver.getEventsNames() ⇒ <code>Array.&lt;string&gt;</code>
Get event names of events receiver. This events will invoke handleEvent method.

**Kind**: instance method of [<code>EventsReceiver</code>](#EventsReceiver)  
**Returns**: <code>Array.&lt;string&gt;</code> - array of event names.  
<a name="EventsReceiver+handleEvent"></a>

### eventsReceiver.handleEvent(name, data, stateManager) ⇒ <code>any</code> \| <code>Promise.&lt;any&gt;</code>
This method invoke receiver when event was emitted.

**Kind**: instance method of [<code>EventsReceiver</code>](#EventsReceiver)  
**Returns**: <code>any</code> \| <code>Promise.&lt;any&gt;</code> - receiver function data or Promise.  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Emitted event name |
| data | <code>any</code> | Emitted event data |
| stateManager | <code>StateManager</code> | State manager have access to store, eventsEmitter and eventrix instance. |

<a name="fetchHandler"></a>

## fetchHandler ⇒ <code>function</code>
This method handle error and success response of fetchMethod and emit events.

**Kind**: global variable  

| Param | Type | Description |
| --- | --- | --- |
| fetchMethod | <code>function</code> | Fetch data method |
| events | <code>object</code> | Describe success events and error event |
| events.success | <code>object</code> | Success event params |
| events.success.eventName | <code>string</code> | This event will be called on success response. |
| events.success.data | <code>any</code> | Success event data. |
| events.success.getData | <code>function</code> | This method prepares data for success event from response and eventData. |
| events.error | <code>object</code> | Error event params |
| events.error.eventName | <code>string</code> | This event will be called on error response. |
| events.error.data | <code>any</code> | Error event data. |
| events.error.getData | <code>function</code> | This method prepares data for error event from response and eventData. |

<a name="fetchToStateReceiver"></a>

## fetchToStateReceiver ⇒ [<code>EventsReceiver</code>](#EventsReceiver)
This method create EventsReceiver to update state after fetch data

**Kind**: global variable  
**Returns**: [<code>EventsReceiver</code>](#EventsReceiver) - instance of EventsReceiver  

| Param | Type | Description |
| --- | --- | --- |
| eventName | <code>string</code> | Event name for run fetchMethod |
| statePath | <code>string</code> | State path to update |
| fetchMethod | <code>function</code> | Method to fetch data and returns new state |

