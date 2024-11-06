import React from "react";
import { HomepageIProps } from "../../types/HomepageTypes";


import TreeMenu from "../../components/TreeMenu/TreeMenu";
import treeMenuData from "../../testJson/treeMenu.json"

import HorizontalMenu from "../../components/HorizontalMenu/HorizontalMenu";
import { HorizontalMenuDataType } from "../../types/HorizontalMenuTypes";

import Neo4j from "../../components/Neo4j/Neo4j";
import neo4jData from "../../testJson/neo4j.json"

const HomePage: React.FC<HomepageIProps> = (props) => {

    const [activeMenu, setActiveMenu] = React.useState<string>("tree menu")

    const menuData: Array<HorizontalMenuDataType> = [
        { label: "tree menu", value: "tree menu" },
        { label: "neo4j", value: "neo4j" },
    ]

    const nodeClick = (node: any) => {
        console.log("you can do something, node = ", node)
    }
    const linkClick = (link: any) => {
        console.log("you can do something, link = ", link)
    }


    return (
        <div className="homepage">
            <div className="horizontal-menu-part">
                <HorizontalMenu
                    menuData={menuData}
                    handleClick={(value) => setActiveMenu(value)}
                />
            </div>

            {
                activeMenu === "tree menu" && <div className="tree-menu-part">
                    <TreeMenu treeData={treeMenuData} />
                </div>
            }

            {
                activeMenu === "neo4j" && <div className="neo4j-part">
                    <Neo4j neo4jData={neo4jData} shoudRender={true} nodeClick={nodeClick} linkClick={linkClick} />
                </div>
            }

        </div>
    )
}

export default HomePage