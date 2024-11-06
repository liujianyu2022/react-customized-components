import React, { useState, useEffect, useContext } from "react";
import { MoreOutlined, PlusSquareOutlined, MinusSquareOutlined } from "@ant-design/icons";
import { Input, Popover } from "antd";
import { EditTreeContext } from "../../context/context";

import { SubTreeIProps, TreeIProps, TreeMenuIProps, TreeNodeDataType } from "../../types/TreeEditTypes";

// SubTree 组件
const SubTree: React.FC<SubTreeIProps> = ({ subTreeData }) => {
    const [subMenuOpen, setSubMenuOpen] = useState<{ [key: string]: boolean }>({});
    const [popoverOpen, setPopoverOpen] = useState<{ [key: string]: boolean }>({});
    const { addNextTreeMenu, editTreeMenu, deleteTreeMenu, clickTreeMenu, highLightId, showOperation } = useContext(EditTreeContext);

    useEffect(() => {
        const keys = subTreeData.filter(item => item.children?.length).map(item => item.key);
        const temp = { ...subMenuOpen };
        keys.forEach(key => temp[key] = true);
        setSubMenuOpen(temp);
    }, [subTreeData]);

    const popoverChange = (newOpen: boolean, key: string) => {
        setPopoverOpen(prev => ({ ...prev, [key]: newOpen }));
    };

    const openOrCloseSubMenu = (key: string) => {
        setSubMenuOpen(prev => ({ ...prev, [key]: !prev[key] }));
    };

    const handleMenuClick = (key: string, name: string, event: React.MouseEvent) => {
        
        const icon = (event.target as HTMLElement).getAttribute('data-icon');
        if (icon === "more") return;

        setSubMenuOpen(prev => ({ ...prev, [key]: !prev[key] }));
        clickTreeMenu?.(key, name);
    };

    const content = (key: string, name: string) => (
        <div className="popover-content">
            <div onClick={() => addNextTreeMenu?.(key, name)}>新建下一级</div>
            <div onClick={() => editTreeMenu?.(key, name)}>编辑</div>
            <div onClick={() => deleteTreeMenu?.(key, name)}>删除</div>
        </div>
    );

    return (
        <>
            {subTreeData.map(item => (
                <div key={item.key} className="sub-tree-menu"  style={subMenuOpen ? {} : { display: "none" }}>
                    <div
                        className="sub-tree-menu-content"
                        style={{ backgroundColor: item.key === highLightId ? "#D9DDE0" : "" }}
                        onClick={(e) => handleMenuClick(item.key, item.label, e)}
                    >
                        <div>
                            {item.children && !item.isEntity && (
                                subMenuOpen[item.key] ?
                                    <MinusSquareOutlined className="open-close-menu" onClick={() => openOrCloseSubMenu(item.key)} /> :
                                    <PlusSquareOutlined className="open-close-menu" onClick={() => openOrCloseSubMenu(item.key)} />
                            )}
                            <span className="sub-tree-menu-text">{item.label}</span>
                        </div>

                        {showOperation && !item.isEntity && (
                            <div className="tree-menu-operation">
                                <span>{item.entityCount}</span> &nbsp;
                                <Popover
                                    content={content(item.key, item.label)}
                                    trigger="click"
                                    open={popoverOpen[item.key]}
                                    onOpenChange={(isOpen) => popoverChange(isOpen, item.key)}
                                    placement="bottom"
                                >
                                    <MoreOutlined className="edit-next-level" />
                                </Popover>
                            </div>
                        )}
                    </div>

                    {subMenuOpen[item.key] && item.children && <SubTree subTreeData={item.children} />}
                </div>
            ))}
        </>
    );
};

// Tree 组件
const Tree: React.FC<TreeIProps> = ({ nodeData, handleClick }) => {
    const [popoverOpen, setPopoverOpen] = useState<boolean>(false);
    const [subMenuOpen, setSubMenuOpen] = useState<boolean>(false);
    const { addNextTreeMenu, editTreeMenu, deleteTreeMenu, showOperation } = useContext(EditTreeContext);

    const popoverChange = (newOpen: boolean) => {
        setPopoverOpen(newOpen);
    };

    const openOrCloseSubMenu = (event: any) => {
        // 由于事件冒泡，当点击 右侧三个点 的菜单的时候，也会触发该函数
        const target = event.target
        const icon = target.getAttribute('data-icon')
        if(icon === "more") return

        setSubMenuOpen(prev => !prev);
    };

    const content = (key: string, name: string) => (
        <div className="popover-content">
            <div onClick={() => addNextTreeMenu?.(key, name)}>新建下一级</div>
        </div>
    );

    return (
        <div className="tree-menu">

            <div className="tree-menu-content" onClick={openOrCloseSubMenu} >
                <div  >
                    {subMenuOpen ?
                        <MinusSquareOutlined className="open-close-menu" onClick={openOrCloseSubMenu} /> :
                        <PlusSquareOutlined className="open-close-menu" onClick={openOrCloseSubMenu} />
                    }
                    <span className="tree-menu-text">{nodeData.label}</span>
                </div>

                {!nodeData.isEntity && (
                    <div className="tree-menu-operation">
                        <span>{nodeData.entityCount}</span> &nbsp;
                        <Popover
                            content={content(nodeData.key, nodeData.label)}
                            trigger="click"
                            open={popoverOpen}
                            onOpenChange={popoverChange}
                            placement="bottom"
                        >
                            <MoreOutlined className="edit-next-level" />
                        </Popover>
                    </div>
                )}
            </div>

            {subMenuOpen && nodeData.children && <SubTree subTreeData={nodeData.children} />}
        </div>
    );
};

// EditTree 组件
const TreeMenu: React.FC<TreeMenuIProps> = ({ treeData, handleClick }) => (
    <div className="tree-menus">
        {
            treeData.map(item => <Tree nodeData={item} key={item.key} id={item.key} handleClick={handleClick} />)
        }
    </div>
);

export default TreeMenu;
