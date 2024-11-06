import { Button, Spin } from "antd";
import React from "react";
import { useRoutes } from "react-router-dom";
import routes from "./router/router";
import { useSelector } from "react-redux";
import { StoreType } from "./store/store";
import { AppStateType } from "./types/ReducerTypes";
import { LoadingOutlined, MinusCircleOutlined, PlusCircleOutlined } from "@ant-design/icons";


function App() {
    const elements = useRoutes(routes)
    const antIcon = <LoadingOutlined style={{ fontSize: 24 }} spin />
    const { isLoading } = useSelector<StoreType, AppStateType>(store => store.appReducer)

    // React.useEffect(() => {
    //     // 嵌入平台页面的缩放适配 
    //     let screenWidth = window.screen.width
    //     let iframeWidth = window.innerWidth
    //     if (iframeWidth > screenWidth * 0.8) {
    //         let width = Math.min(iframeWidth, screenWidth)
    //         let standWidth = 1920
    //         let Zoom = width / standWidth
    //         // @ts-ignore 
    //         document.body.style.zoom = Zoom.toFixed(2);
    //     }
    // }, [])

    // console.log("process --- ", process)

    return (
        <div className="App">
            {/* <Spin tip="加载中，请稍候..." indicator={antIcon} spinning={isLoading}> */}
                {
                    elements
                }
            {/* </Spin> */}
        </div>
    )
}

export default App