import { AppActionType, AppAction, AppStateType } from "../../types/ReducerTypes"

const appReducer = (state: AppStateType = { isLoading: true }, action: AppActionType) => {
    switch (action.type) {
        case AppAction.INITIAL:
            return state
        case AppAction.CHANGE:
            return {...state, isLoading: action.payload.isLoading}
        default:
            return state
    }
}

export default appReducer