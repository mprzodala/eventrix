![Eventrix](logo-md.png)

[![Build Status](https://travis-ci.org/mprzodala/eventrix.svg?branch=master)](https://travis-ci.org/mprzodala/eventrix)
[![Coverage Status](https://coveralls.io/repos/github/mprzodala/eventrix/badge.svg?branch=master)](https://coveralls.io/github/mprzodala/eventrix?branch=master)
[![npm](https://img.shields.io/npm/l/eventrix.svg)](https://npmjs.org/package/eventrix)
[![npm](https://img.shields.io/npm/v/eventrix.svg)](https://npmjs.org/package/eventrix)

1. [Features](#features)
1. [Installation](#installation)
1. [Eventrix](#eventrix)
1. [React HOCs](#react-hocs)
1. [React HOOKS](#react-hooks)
1. [Examples](#examples)
1. [Redux adapter](https://github.com/mprzodala/eventrix/blob/master/docs/reduxAdapter.md)
1. [Contribute](#contribute)
1. [License](#license)

### Features

- StateManager
    - listen on set new state
    - emit events after change state
- EventsEmitter
    - listen on events
    - emit events
- EventsReceiver
    - parse data from events to store

### Installation

```bash
$ npm install eventrix --save
```

### Eventrix

| Method | attributes | description |
|---|---|---|
| constructor | initialState: `any`, eventsReceivers: `EventReceiver[]` | Eventrix class constructor |
| listen | eventName: `string`, listener(eventData, receiversData): void | Subscribe on event emitted |
| unlisten | eventName: `string`, listener(eventData, receiversData): void | Unsubscribe on event |
| emit | eventName: `string`, data: `any` | Emit event for eventrix instance it will run listeners and events receivers |
| getState | path: `string` | Get eventrix state |
| useReceiver | receiver: `EventsReceiver` | Register events receiver in eventrix instance it will be used on events emitted |
| removeReceiver | receiver: `EventsReceiver` | Unregister events receiver from eventrix instance |

##### Basic example

```js
import { Eventrix, EventsReceiver } from 'eventrix'

const usersEventsReceiver = new EventsReceiver(
    'createUserEventName',
    (eventName, eventData, stateManager) => {
        const user = eventData.user;
        const users = stateManager.getState('usersList');
        stateManager.setState('usersList', [user, ...users]);
    }
);

const initialState = {
    usersList: [],
}

const eventsReceivers = [
    usersEventsReceiver,
];

const eventrix = new Eventrix(initialState, eventsReceivers);

export default eventrix;
```

##### fetchToStateReceiver

| Attribute name | Type | description |
|---|---|---|
| eventName | `string` | EventsReceiver event name |
| statePath | `string`,`function(eventData: any, nextState: any): string` | State name or path to state that will be replaced by fetch method response |
| fetchMethod | `function(eventData: any, state: any): Promise` | Fetch method. Method will be called when eventName emitted and must return Promise |


```js
import { fetchToStateReceiver } from 'eventrix';
import axios from 'axios';

const removeUser = (eventData, state) => {
    return axios.delete(`http://somedomain.com/users/${eventData.id}`).then(() => {
        return state.users.filter(item => item.id !== eventData.id);
    });
}
const receiver = fetchToStateReceiver('users:remove', 'users', removeUser);

export default receiver;
```

### React HOCs

##### withEventrix
pass eventrix instance from context to props
    
```jsx
import React from 'react';
import { withEventrix } from 'eventrix/react';

class UsersList extends React.Component {
    render() {
        const { eventrix } = this.props;
        const users = eventrix.getState('users');
        return (
            <div>
                {users.map(user => <div>{user.name}</div>)}
            </div>
        );
    }
}

export default withEventrix(UsersList);
```

##### withEventrixState
rerender component on eventrix state change

```jsx
import React from 'react';
import { withEventrixState } from 'eventrix/react';

class UsersList extends React.Component {
    render() {
        const { users } = this.props;
        return (
            <div>
                {users.map(user => <div>{user.name}</div>)}
            </div>
        );
    }
}

export default withEventrixState(UsersList, ['users']);
```
    
### React HOOKS

##### useEventrixState
return eventrix state and setState method

```jsx
import React from 'react';
import { useEventrixState } from 'eventrix/react';

const UsersList = () => {
    const [users, setUsers] = useEventrixState('users');
    return (
        <div>
            {users.map(user => <div>{user.name}</div>)}
        </div>
    );
}
```

##### useEmit
return eventrix emit method

```jsx
import React from 'react';
import { useEmit } from 'eventrix/react';

const RemoveUserButton = ({ user }) => {
    const emit = useEmit();
    return (
        <button onClick={() => emit('removeUser', user)}>
            Remove user
        </button>
    );
}
```

##### useEvent
save emitted event data in state and return state;

```jsx
import React, { useState } from 'react';
import { useEvent, useEmit } from 'eventrix/react';

const UndoDeleteUserButton = () => {
    const [removedUser, setRemovedUser] = useState();
    const emit = useEmit();
    useEvent('removeUser', (eventData) => {
        const user = eventData;
        setRemovedUser(user);
    });
    
    if (!removedUser) {
        return null;
    }
    return (
        <button onClick={() => emit('addUser', removedUser)}>
            Undo user delete
        </button>
    );
}
```

##### useEventState
save emitted event data in state and return state;

```jsx
import React from 'react';
import { useEventState, useEmit } from 'eventrix/react';

const UndoDeleteUserButton = () => {
    const [eventState, setEventState] = useEventState('removeUser');
    const emit = useEmit();
    return (
        <button onClick={() => emit('addUser', eventState)}>
            Undo user delete
        </button>
    );
}
```

##### useFetchToState
fetch data and put it to state

```jsx
import React from 'react';
import axios from 'axios';
import { useFetchToState } from 'eventrix/react';

const removeUserFetch = (userData, state) => {
    return axios.delete(`http://somedomain.com/users/${userData.id}`).then(() => {
        return state.users.filter(item => item.id !== userData.id);
    });
}

const DeleteUserButton = ({ user }) => {
    const [emitFetch] = useFetchToState('users:remove', 'users', removeUserFetch);
    return (
        <button onClick={() => emitFetch(user)}>
            Remove user
        </button>
    );
}
```

### Examples

[Todo List](https://codesandbox.io/s/eventrix-todo-example-r5qeb) 

[Users List](https://codesandbox.io/s/eventrix-users-example-wepzu)

### Default events

| Name | Description | Example | Event data |
|---|---|---|---|
| `setState:statePath` | state changed event | `setState:users` | state: any |


### Contribute

- use eslint rules
- write clean code
- unit tests (min 85% of your code should be tested)
- [code of conduct](https://github.com/mprzodala/eventrix/blob/master/docs/code_of_conduct.md)

### License

eventrix package are [MIT licensed](https://github.com/mprzodala/eventrix/blob/master/LICENSE)
