import React from "react";
import { HorizontalMenuIProps } from "../../types/HorizontalMenuTypes";


const HorizontalMenu: React.FC<HorizontalMenuIProps> = (props) => {
    const { menuData, handleClick, showWhichOne } = props

    const [lightIndex, setLightIndex] = React.useState<number>(0)

    // React.useEffect(() => {
    //     if(showWhichOne) setLightIndex(Number(showWhichOne))
    // }, [showWhichOne])

    const onClick = (index: number, value: string) => {
        setLightIndex(index)
        handleClick(value)
    }

    return (
        <div className="horizontal-menu">
            {
                menuData.map((item, index) => {
                    return (
                        <div 
                            key={index}
                            className={ (index === lightIndex ) ? "horizontal-menu-item light" : "horizontal-menu-item"}
                            onClick={() => onClick(index, item.value)}
                        >
                            {item.label}
                        </div>
                    )
                })
            }
        </div>
    )
}

export default HorizontalMenu