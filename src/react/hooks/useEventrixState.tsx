import {
    useState,
    useContext,
    useEffect,
    useCallback,
} from 'react';
import { EventrixContext } from '../context';
import { SetStateI } from "../../interfaces";

function useEventrixState<StateI>(stateName: string, Context? = EventrixContext): [StateI, SetStateI] {
    const { eventrix } = useContext(Context);
    const [state, setState] = useState<StateI>(eventrix.getState<StateI>(stateName));

    const onSetEventrixState = useCallback(
        value => setState(value),
        [setState],
    );

    const setEventrixState = useCallback(
        (value) => { eventrix.emit('setState', { stateName, value }); },
        [eventrix.emit, stateName],
    );

    useEffect(() => {
        const stateEventName = `setState:${stateName}`;
        eventrix.listen(stateEventName, onSetEventrixState);
        onSetEventrixState(eventrix.getState(stateName));
        return () => {
            eventrix.unlisten(stateEventName, onSetEventrixState);
        };
    }, [stateName]);

    return [state, setEventrixState];
}

export default useEventrixState;