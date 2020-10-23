# Getting Started with Eventrix
Eventrix is events and state management system which gives you tools to connect your UI with JS bussines logic. 
Component can send events to another components or JS bussines logic which give you posibility to send some XHR to get data from server. 
Eventrix also give you posibility to store some data in eventrix state. You can share this state with Your components and JS bussines logic part.

### Events management
Eventrix class instance is something like store in Redux but not the same.
```js
import { Eventrix } from 'eventrix';

const initialState = { foo: 'title' };
const eventsReceiver = [];

const eventrix = new Eventrix(initialState, eventsReceiver);
```
Eventrix class receive initial state and events receivers to handle events and to do someting with event data.
Eventrix instance has events managament system and state manager inside. When You emit some event by

```js
eventrix.emit('someEventName', anyEventData)
```

then all listeners and events receivers will be invoked.
```js
const fooListener = (eventData) => { // do something with eventData };
eventrix.listen('fooEvent', fooListener);

eventrix.emit('fooEvent', { foo: 'Some text' });
// after call emit fooListener will be called with { title: 'Some title' } as eventData
```
### State management
Now we know how to listen on events and emit events. But what about state? Where is it? If we want to change state, we need to use events receiver
```js
import { EventsReceiver } from 'eventrix';

const fooReceiver = new EventsReceiver('fooEvent', (eventName, eventData, stateManager) => {
  const currentFooState = stateManager.getState('foo');
  if (currentFooState !== eventData) {
    stateManager.setState('foo', eventData);  
  }
});

eventrix.useReceiver(fooReceiver);
```
If you use `EventsReceiver` in eventrix instance, it will get access to stateManager when event will be called. State manager can set new state or get any state which you need.

Eventrix has one default events receiver on event `setState`. When you emit this event with

```js
{ stateName: 'foo', value: { foo: 'new title' } }
```

it will set state `foo` to

```js
{ foo: 'new title' }
```

```js
eventrix.emit('setState', { stateName: 'foo', value: { foo: 'new title' } });
// after call emit stateManager will set new value to state `foo` 
```

### Fetch with Eventrix
If you want to use `fetch` or `axios` with eventrix you can do this with EventsReceiver and emit
```js
import { EventsReceiver } from 'eventrix';
import axios from 'axios';

const fetchReceiver = new EventsReceiver('fetchUsers', (eventName, eventData, stateManager) => {
  return axios.get(https://somedomain.com/users, { params: eventData })
              .then((users) => {
                stateManager.setState('users', users);
                eventrix.emit('fetchUsers.success', users);
              })
              .catch((error) => {
                eventrix.emit('fetchUsers.error', error);
              });
});

eventrix.useReceiver(fetchReceiver);

eventrix.emit('fetchUsers', { search: 'johny' });
// after emit `fetchUsers` event `fetchReceiver` will get users data from server and put it to `users` state
```
When you want to fetch some data and put it to state, you can also use special helper function called `fetchToStateReceiver`
```js
import { fetchToStateReceiver } from 'eventrix';
import axios from 'axios';

const fetchReceiver = fetchToStateReceiver('fetchUsers', 'users', (eventData, eventrixState) => {
  return axios.get(https://somedomain.com/users, { params: eventData })
              .then((users) => {
                eventrix.emit('fetchUsers.success', users);
                return users
              })
              .catch((error) => {
                eventrix.emit('fetchUsers.error', error);
              });
});

eventrix.useReceiver(fetchReceiver);

eventrix.emit('fetchUsers', { search: 'johny' });
```
Hmmm what is the difference ? You define state path and promise must return new state. Take a look on more complex example with users manage class.
```js
import { fetchToStateReceiver } from 'eventrix';

class usersService {
  constructor(axios, eventrix) {
    this.axios = axios;
    this.eventrix = eventrix;
    
    this.getUsers = this.getUsers.bind(this);
    this.create = this.create.bind(this);
    
    this.eventrix.useReceiver(fetchToStateReceiver('users:getUsers', 'users', this.getUsers));
    this.eventrix.useReceiver(fetchToStateReceiver('users:create', 'users', this.create));
  }
  getUsers(filters) {
    return axios.get('https://somedomain.com/users', { params: filters })
                .then(({ data }) => {
                  this.eventrix.emit('users:getUsers.success', data.users);
                  return data.users
                })
                .catch(error => this.eventrix.emit('users:getUsers.error', error));
  }
  create(user, state) {
    return axios.post('https://somedomain.com/users', user)
                .then(({ data }) => {
                  this.eventrix.emit('users:create.success', data);
                  return [data, ...state.users];
                })
                .catch(error => this.eventrix.emit('users:getUsers.error', error));
  }
}
```
### React
Now we know how to send events, manage state and send requests to server with Eventrix. What about React and components? Eventrix has `react` section which gives us react context, provider, hocs and hooks.
```js
import {
// react context stuff
EventrixContext,
EventrixProvider,
// HOCs
withEventrixState,
withEventrix,
// hooks
useEventrixState,
useEmit,
useEvent,
useEventState,
useFetchToState
} from 'eventrix/react';
```
If you want to use Eventrix in Your react project you must use `EventrixProvider` on the top of the project components tree.
```jsx
import React from "react";
import ReactDOM from "react-dom";
import { EventrixProvider } from 'eventrix/react';

import eventrix from './eventrix';
import App from "./App";

const rootElement = document.getElementById("root");
ReactDOM.render(
  <EventrixProvider eventrix={eventrix}>
    <App />
  </EventrixProvider>,
  rootElement
);

```
When we have EventrixProvider all of HOCs and hooks can be used in project.

### HOCs
Eventrix has two HOCs `withEventrix` and `withEventrixState`. First HOC pass eventrix instance to props.
```jsx
import React from 'react';
import { withEventrix } from 'eventrix/react';

class UsersList extends React.Component {
  removeUser = (user) => {
    this.props.eventrix.emit('removeUser', user);
  }
  render() {
    const { users } = this.props;
    return (
      <div>
        {users.map(user => 
          <div>
            {user.name} <button onClick={() => this.removeUser(user)}>remove user</button>
          </div>
        )}
      </div>
    )
  } 
}

export default withEventrix(UsersList);
```
Second HOC give you posibility to listen on selected state change and pass this state to props. Component will be rerender when state will be changed.
```jsx
import React from 'react';
import { withEventrixState } from 'eventrix/react';

class UsersList extends React.Component {
  render() {
    const { users } = this.props;
    return (
      <div>
        {users.map(user => 
          <div>
            {user.name}
          </div>
        )}
      </div>
    )
  } 
}

export default withEventrixState(UsersList, ['users']);
```
If you want to map state to props You can use third argument `mapStateToProps`.
```jsx
export default withEventrixState(UsersList, ['users'], (state, props) => { usersList: state.users });
```
What can I do when I need data from props to define `stateNames`? You can pass function as a second argument.
```jsx
export default withEventrixState(
  UsersDetails,
  (props) => [`usersById.${props.userId}`],
  (state, props) => { userData: state[`usersById.${props.userId}`] }
);
```
### Hooks
Eventrix gives us special react hooks for state and events management. For example if You want to rerender component when some state will be changed, you can use `useEventrixState` hook.
```jsx
import React from 'react';
import { useEventrixState } from 'eventrix/react';

const UsersList = () => {
  const [users, setUsers] = useEventrixState('users');
  return (
    <div>
      {users.map(user => 
        <div>
          {user.name}
        </div>
      )}
    </div>
  );
}
```
`useEventrixState` hook also give you posibility to update used state. This hook is similar to `useState` but don't have initial value. Remember, this is eventrix state and you can share this state with other component in Your app.

These two components use the same state
```jsx
import React from 'react';
import { useEventrixState } from 'eventrix/react';

const UsersList = () => {
  const [users, setUsers] = useEventrixState('users');
  return (
    <div>
      {users.map(user => 
        <div>
          {user.name}
        </div>
      )}
    </div>
  );
}
```
```jsx
import React from 'react';
import { useEventrixState } from 'eventrix/react';

const UsersCounter = () => {
  const [users] = useEventrixState('users');
  return (
    <div>
      {users.length}
    </div>
  );
}
```
When we need to listen on some event and do some action, we can use `useEvent` hook.
```jsx
import React from 'react';
import Loader from './Loader';
import { useEvent, useEventrixState } from 'eventrix/react';

const UsersList = () => {
  const [users] = useEventrixState('users');
  const [isLoading, setIsLoading]useState(false);
  useEvent('users:load', (eventData) => setIsLoading(true));
  useEvent('users:load,success', (eventData) => setIsLoading(false));
  if (isLoading) {
    return <Loader />;
  }
  return (
    <div>
      {users.map(user => 
        <div>
          {user.name}
        </div>
      )}
    </div>
  );
}
```
This example showed us two situations: 
- displaying loader when users list is loading
- removing loader when users list is loaded successfully.

Sometimes we need to emit some events from components. For this purpose Eventrix has `useEmit` hook that gives you access to `eventrix.emit` method.
```jsx
import React from 'react';
import Loader from './Loader';
import { useEmit, useEventrixState } from 'eventrix/react';

const UsersList = () => {
  const [users] = useEventrixState('users');
  const emit = useEmit();
  if (isLoading) {
    return <Loader />;
  }
  return (
    <div>
      {users.map(user => 
        <div>
          {user.name} <button onClick={() => emit('removeUser', user)}>remove user</button>
        </div>
      )}
    </div>
  );
}
```