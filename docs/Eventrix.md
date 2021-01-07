
> eventrix@1.7.0 docs /var/projects/eventrix
> jsdoc2md "src/Eventrix.js"

<a name="Eventrix"></a>

## Eventrix
**Kind**: global class  

* [Eventrix](#Eventrix)
    * [new Eventrix(initialState, eventsReceivers)](#new_Eventrix_new)
    * [.getState(path)](#Eventrix+getState) ⇒ <code>any</code>
    * [.emit(name, value)](#Eventrix+emit) ⇒ <code>Promise.&lt;T&gt;</code> \| <code>Promise.&lt;any&gt;</code>
    * [.listen(name, listener)](#Eventrix+listen)
    * [.unlisten(name, listener)](#Eventrix+unlisten)
    * [.useReceiver(receiver)](#Eventrix+useReceiver)
    * [.removeReceiver(receiver)](#Eventrix+removeReceiver)

<a name="new_Eventrix_new"></a>

### new Eventrix(initialState, eventsReceivers)

| Param | Type |
| --- | --- |
| initialState | <code>object</code> | 
| eventsReceivers | <code>Array.&lt;EventsReceiver&gt;</code> | 

<a name="Eventrix+getState"></a>

### eventrix.getState(path) ⇒ <code>any</code>
Get state from path

**Kind**: instance method of [<code>Eventrix</code>](#Eventrix)  
**Returns**: <code>any</code> - Returns state value  

| Param | Type | Description |
| --- | --- | --- |
| path | <code>string</code> | path to state |

<a name="Eventrix+emit"></a>

### eventrix.emit(name, value) ⇒ <code>Promise.&lt;T&gt;</code> \| <code>Promise.&lt;any&gt;</code>
Emit event with data

**Kind**: instance method of [<code>Eventrix</code>](#Eventrix)  
**Returns**: <code>Promise.&lt;T&gt;</code> \| <code>Promise.&lt;any&gt;</code> - Returns Promise. It will be resolved after all events receivers and listeners invoked  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Emitted event name |
| value | <code>any</code> | Emitted event data |

<a name="Eventrix+listen"></a>

### eventrix.listen(name, listener)
Add listener on event

**Kind**: instance method of [<code>Eventrix</code>](#Eventrix)  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Event name |
| listener | <code>function</code> | This function will be called when event is emitted |

<a name="Eventrix+unlisten"></a>

### eventrix.unlisten(name, listener)
Remove listener on event

**Kind**: instance method of [<code>Eventrix</code>](#Eventrix)  

| Param | Type | Description |
| --- | --- | --- |
| name | <code>string</code> | Event name |
| listener | <code>function</code> | Listener function |

<a name="Eventrix+useReceiver"></a>

### eventrix.useReceiver(receiver)
Use events receiver

**Kind**: instance method of [<code>Eventrix</code>](#Eventrix)  

| Param | Type | Description |
| --- | --- | --- |
| receiver | <code>EventsReceiver</code> | instance of EventsReceiver class |

<a name="Eventrix+removeReceiver"></a>

### eventrix.removeReceiver(receiver)
Remove events receiver

**Kind**: instance method of [<code>Eventrix</code>](#Eventrix)  

| Param | Type | Description |
| --- | --- | --- |
| receiver | <code>EventsReceiver</code> | instance of EventsReceiver class |

