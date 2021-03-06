import * as React from 'react';
import { EventrixContext } from '../context';
import {EventrixContextI, EventsListenerI} from "../../interfaces";

interface StateNamesMethodI {
    (props: any): string[];
}

interface PropsI {
    [key: string]: any;
}

interface StateI {
    [key: string]: any;
}

interface ListenersI {
    [key: string]: EventsListenerI;
}

interface MapStateToPropsI {
    (state: StateI, props: PropsI): StateI;
}

const withEventrixState = <P extends PropsI>(
    BaseComponent: React.ComponentType<P>,
    stateNames: StateNamesMethodI | string[] | string,
    mapStateToProps?: MapStateToPropsI,
    Context = EventrixContext,
): React.ComponentType<PropsI> =>
    class WithEventrixState extends React.Component<P, StateI> {
        static contextType = Context;
        context: EventrixContextI;
        state: StateI = {};
        stateNames: string[] = [];
        listeners: ListenersI = {};

        constructor(props: P, context: EventrixContextI) {
            super(props, context);
            this.onStateUpdate = this.onStateUpdate.bind(this);
            this.getStateNames().forEach((stateName) => {
                this.state[stateName] = context.eventrix.getState(stateName) || '';
                this.listeners[stateName] = state => this.onStateUpdate(stateName, state);
            });
        }
        componentDidMount() {
            this.getStateNames().forEach((stateName) => {
                this.context.eventrix.listen(`setState:${stateName}`, this.listeners[stateName]);
            });
            this.refreshState();
        }
        componentWillUnmount() {
            this.getStateNames().forEach((stateName) => {
                this.context.eventrix.unlisten(`setState:${stateName}`, this.listeners[stateName]);
            });
        }
        onStateUpdate(stateName: string, state: any) {
            return this.setState({ [stateName]: state });
        }
        getStateNames(): string[] {
            if (typeof stateNames === 'function') {
                return stateNames(this.props);
            }
            if (Array.isArray(stateNames)) {
                return stateNames;
            }
            if (typeof stateNames === 'string') {
                return [stateNames];
            }
            return [];
        }
        getStateForProps(): StateI {
            if (mapStateToProps && typeof mapStateToProps === 'function') {
                return mapStateToProps(this.state, this.props);
            }
            return this.state;
        }
        refreshState(): void {
            let shouldRefreshState = false;
            const stateToRefresh: StateI = {};
            this.getStateNames().forEach((stateName) => {
                const currentState = this.context.eventrix.getState(stateName);
                if (this.state[stateName] !== currentState) {
                    shouldRefreshState = true;
                    stateToRefresh[stateName] = currentState;
                }
            });
            if (shouldRefreshState) {
                this.setState(stateToRefresh);
            }
        }
        render() {
            return <BaseComponent {...this.props} {...this.getStateForProps()} />;
        }
    };

export default withEventrixState;
