import React from "react"
import { useLocation, useNavigate, useParams } from "react-router-dom"
import { RouteIProps } from "../../types/WithRouterType";

const withRouter = <P extends RouteIProps>(Component: React.ComponentClass<P>) =>{

    return (props: Omit<P, keyof RouteIProps>)=>{
        const location = useLocation()
        const navigate = useNavigate()
        const params = useParams()

        return (
            <Component 
                {...props as P}
                navigate={navigate}
                location={location}
            />
        )
    }
}

export default withRouter