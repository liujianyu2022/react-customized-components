import React from "react"
import ReactDOM from "react-dom/client"

import { BrowserRouter, HashRouter } from "react-router-dom"

import App from "./App"
import "./styles/index.less"
import { ConfigProvider } from "antd"
import { Provider } from "react-redux"
import store from "./store/store"
import zh_CN from 'antd/lib/locale-provider/zh_CN';


const root = ReactDOM.createRoot(document.getElementById("root") as HTMLElement)

root.render(
    <ConfigProvider locale={zh_CN}>
        <Provider store={store}>
            <HashRouter>
                <App />
            </HashRouter>
        </Provider>
    </ConfigProvider>
)