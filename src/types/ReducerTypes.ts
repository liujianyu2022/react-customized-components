

export enum AppAction{
    INITIAL = "app-initial",
    CHANGE = "app-change"
}

export interface AppStateType{
    isLoading: boolean
}

export interface AppActionType{
    type: AppAction,
    payload: {
        isLoading: boolean
    }
}