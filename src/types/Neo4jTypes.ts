import { SimulationNodeDatum } from "d3";


export interface Node extends SimulationNodeDatum {
    id?: number | string;
    name: string;
    type: string,
    highlight: boolean
    main: boolean

    [key: string]: any;
}

export interface Link extends SimulationNodeDatum {
    id?: number | string;
    source: string | number | SimulationNodeDatum;
    target: string | number | SimulationNodeDatum;
    type: string,
    highlight: boolean

    // relative: string;
    [key: string]: any;
}

export interface Neo4jDataType {
    nodes: Array<Node>
    links: Array<Link>
}

export enum ColorTheme {
    Background = "#e3fdfd",
    Alert = "#f38181",
    Defect = "#fce38a",
    Reason = "#c9d6df",
    Main = "#00adb5",
    HighLight = "#e84545",
    Default = "#C6C9D0",
    Text = "#364f6b",
    Selected = "#30e3ca"
  }
  
