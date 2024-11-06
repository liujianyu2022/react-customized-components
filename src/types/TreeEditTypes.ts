
// 规定树形组件的数据格式  <Tree />
export interface TreeNodeDataType{
    key: string
    label: string
    value: string
    entityCount: number
    isEntity: boolean
    children?: TreeNodeDataType[]
}

// 用于SubTree组件 <SubTree />
export interface SubTreeIProps {
    subTreeData: Array<TreeNodeDataType>
}

// 用于单个的树形组件  <Tree />
export interface TreeIProps{
    nodeData: TreeNodeDataType
    key: string
    id: string
    handleClick?: (key: string | number)=>void
}

// 用于遍历生成总体的树形组件的  <TreeMenu />
export interface TreeMenuIProps{
    treeData: Array<TreeNodeDataType>
    handleClick?: (key: string | number)=> void
}




