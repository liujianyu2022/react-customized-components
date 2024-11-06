import { NavigateFunction } from "react-router-dom"

export interface RouteIProps<Params = any, State = any> {
    location: State
    navigate: NavigateFunction
    params: Params
}