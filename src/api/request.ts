import axios, { AxiosResponse } from "axios";
import store from "../store/store";
import { AppAction } from "../types/ReducerTypes";
import { ResponseType } from "../types/ResponseType";

const request = axios.create({
    baseURL: "*****",
    timeout: 100000
})

request.interceptors.request.use((config)=>{
    store.dispatch({
        type: AppAction.CHANGE,
        payload: {
            isLoading: true
        }
    })
    return config
}, (error)=>{

    store.dispatch({
        type: AppAction.CHANGE,
        payload: {
            isLoading: false
        }
    })
    return Promise.reject(error);
})

request.interceptors.response.use((response: AxiosResponse<ResponseType>)=>{
    store.dispatch({
        type: AppAction.CHANGE,
        payload: {
            isLoading: false
        }
    })

    return response
}, (error)=>{
    store.dispatch({
        type: AppAction.CHANGE,
        payload: {
            isLoading: false
        }
    })
    return Promise.reject(error);
})

export default request
