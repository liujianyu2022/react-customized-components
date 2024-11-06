import React, { Suspense } from "react";
import { Navigate, RouteObject } from "react-router-dom";

const HomePage = React.lazy(()=> import(/* webpackChunkName: "HomePage"  */ "../pages/HomePage/HomePage"))
const TreeMenu = React.lazy(()=> import(/* webpackChunkName: "TreeMenu"  */ "../components/TreeMenu/TreeMenu"))

const routes: Array<RouteObject> = [
    {
        path: "/homepage",
        element: <Suspense><HomePage /></Suspense>,
        children: [
            {
                path: "tree-menu",
                element: <TreeMenu treeData={[]} />
            }
        ]
    },
    {
        path: "/",
        element: <Navigate to="/homepage" />
    },
]


export default routes