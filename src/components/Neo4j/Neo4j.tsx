import React, { SyntheticEvent } from "react";
import * as d3 from "d3";
import { sortBy } from "../../tools/utils";
import { ColorTheme, Link, Neo4jDataType, Node } from "../../types/Neo4jTypes";

import { Simulation } from "d3";

const linkArc = (d: any) => {
    const dx = d.target.x - d.source.x;
    const dy = d.target.y - d.source.y;
    const dr = Math.sqrt(dx * dx + dy * dy);
    const unevenCorrection = d.sameUneven ? 0 : 0.5;
    const curvature = 2;
    let arc = (1.0 / curvature) * ((dr * d.maxSameHalf) / (d.sameIndexCorrected - unevenCorrection));
    if (d.sameMiddleLink) {
        arc = 0;
    }
    return `M${d.source.x},${d.source.y}A${arc},${arc} 0 0,${d.sameArcDirection} ${d.target.x},${d.target.y}`;
}

const handleTick = (link: Link, node: Node, img?: any) => {
    if (link) {
        link.selectAll(".outline").attr("d", (d: any) => linkArc(d));
        link.selectAll(".overlay").attr("d", (d: any) => linkArc(d));
    }
    node.attr("transform", (d: any) => `translate(${d.x}, ${d.y})`)
}

const addArrowMarker = (svg: any) => {
    const arrow = svg
        .append("marker")
        .attr("id", "ArrowMarker")
        .attr("markerUnits", "strokeWidth")
        .attr("markerWidth", "10")
        .attr("markerHeight", "10")
        .attr("viewBox", "0 -5 10 10")
        .attr("refX", "23")                      // here should be modified according to the raduis of node
        .attr("refY", "0")
        .attr("orient", "auto");
    const arrowPath = "M0,-4 L10,0 L0,4";
    arrow.append("path").attr("d", arrowPath).attr("fill", "#A5ABB6");
}

const formatLinks = (links: Array<Link>) => {
    if (!links || !(links && links.length > 0)) {
        return [];
    }

    links.forEach((link: any) => {
        const same = links.filter((d) => d.source === link.target && d.target === link.source);
        const sameSelf = links.filter((d) => d.source === link.source && d.target === link.target);
        const all = sameSelf.concat(same);

        all.forEach((item: any, index: number) => {
            item.sameIndex = index + 1;
            item.sameTotal = all.length;
            item.sameTotalHalf = item.sameTotal / 2;
            item.sameUneven = item.sameTotal % 2 !== 0;
            item.sameMiddleLink = item.sameUneven === true && Math.ceil(item.sameTotalHalf) === item.sameIndex;
            item.sameLowerHalf = item.sameIndex <= item.sameTotalHalf;
            item.sameArcDirection = 1;
            item.sameIndexCorrected = item.sameLowerHalf ? item.sameIndex : item.sameIndex - Math.ceil(item.sameTotalHalf);
        });
    });

    const maxSame = links.concat().sort(sortBy("sameTotal")).slice(-1)[0].sameTotal;

    links.forEach((link) => {
        link.maxSameHalf = Math.round(maxSame / 2);
    });

    return links;
}

const wrapText = (text: string) => {
    let lines = [];
    if (text.length > 15) {
        text = text.slice(0, 15) + "...";
    }
    lines.push(text.slice(0, 5));
    lines.push(text.slice(5, 11));
    lines.push(text.slice(11, 15));
    return lines;
};

const addText = (selection: any, text: string) => {
    const lines = wrapText(text);
    selection
        .selectAll("tspan")
        .data(lines)
        .enter()
        .append("tspan")
        .attr("x", 0)
        .attr("y", (d: any, i: number) => i * 10)                       // Adjust the y position for each line (14px per line)
        .attr("dy", (d: any, i: number) => i === 0 ? "0em" : "0.1em") // Adjust the dy for the first line and subsequent lines
        .text((d: any) => d);
};

const getNewNode = (oldNode: Node, newNodes: Array<Node>): Node => {
    const newNode = newNodes.filter(item => item.id === oldNode.id)[0]
    return newNode
}

const getNewLink = (oldLink: Link, newLinks: Array<Link>) => {
    return newLinks.filter(item => item.id === oldLink.id)[0]
}

const updateNodeAndLinkStyles = (newNodes: Array<Node>, newLinks: Array<Link>) => {
    d3
        .selectAll(".node circle")
        .attr("fill", (d: any) => {
            const newNode = getNewNode(d, newNodes)
            return newNode.main ? ColorTheme.Selected :
                newNode.type === "报警" ? ColorTheme.Alert : newNode.type === "原因" ? ColorTheme.Reason : newNode.type === "缺陷" ? ColorTheme.Defect : ""
        })
        .attr("stroke", (d: any) => {
            const newNode = getNewNode(d, newNodes)
            return newNode.highlight ? ColorTheme.HighLight : ColorTheme.Default
        })
        .attr("stroke-width", (d: any) => {
            const newNode = getNewNode(d, newNodes)
            return newNode.highlight ? 6 : 0
        })

    d3
        .selectAll(".link .outline")
        .attr("stroke", (d: any) => {
            const newLink = getNewLink(d, newLinks)
            return newLink.selected ? ColorTheme.Selected : newLink.highlight ? ColorTheme.HighLight : ColorTheme.Default
        })
};

const Neo4j = function (props: { neo4jData: Neo4jDataType, nodeClick?: (node: any) => void, linkClick?: (link: any) => void, shoudRender: boolean }) {
    const { nodes, links } = props.neo4jData
    const { nodeClick, linkClick, shoudRender } = props

    let simulationRef = React.useRef<Simulation<Node, undefined>>(null)
    let divRef = React.useRef<HTMLDivElement>(null)

    React.useEffect(() => {
        if (shoudRender && divRef.current && nodes && links) {
            const element: HTMLElement = divRef.current!                // 清空现有的 svg 元素
            d3.select(element).selectAll("*").remove();
            getNodesAndLinks();
        } else {
            updateNodeAndLinkStyles(nodes, links)
        }

    }, [nodes, links])

    const getNodesAndLinks = async () => {
        const fmtLinks = formatLinks(links)
        initialSimulation(divRef.current!, nodes, fmtLinks)
    }

    const initialSimulation = (element: HTMLElement, nodes: Array<Node>, links: Array<Link>) => {
        if (!element) return;

        const width = element.clientWidth;
        const height = element.clientHeight;

        // @ts-ignore
        simulationRef.current = d3
            .forceSimulation(nodes)
            .force(
                "link",
                d3
                    .forceLink(links)
                    .distance(160)                                      // the distance between each node
                    .id((d: any) => d.id)
            )
            .force("charge", d3.forceManyBody().distanceMax(500).strength(-800))
            .force("collide", d3.forceCollide().strength(-60))
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("mainX", d3.forceX().strength((d: any) => d.main ? 1 : 0).x(width / 2))
            .force("mainY", d3.forceY().strength((d: any) => d.main ? 1 : 0).y(height / 2));

        const svg = d3
            .select("#Neo4jContainer")
            .append("svg")
            .attr("width", "100%")
            .attr("height", "100%");

        onZoom(svg);
        addArrowMarker(svg);

        const link = initLinks(links, svg);
        const node = initNodes(nodes, svg);

        initSvgEvent(svg, node)

        simulationRef.current.on("tick", () => handleTick(link!, node));
        simulationRef.current.alpha(2).restart();
    }

    const onZoom = (svg: any) => {
        svg.call(
            d3.zoom().on("zoom", () => {
                // @ts-ignore
                const { transform } = d3.event;

                if (transform) {
                    const scale = Math.max(10, Math.min(500, transform.k * 100));
                    d3.selectAll("#Neo4jContainer > svg > g")
                        .attr("transform", `translate(${transform.x},${transform.y}) scale(${transform.k})`);
                }
            })
        );
        svg.on("dblclick.zoom", null); // Disable double click zoom
    };

    const initSvgEvent = (svg: any, node: Node) => {
        svg.on("click", (a: any, b: any, c: any, d: any) => {

        })
    }

    const initNodes = (nodes: Array<Node>, svg: any) => {
        const node = svg
            .append("g")
            .attr("class", "layer nodes")
            .selectAll(".node")
            .data(nodes, (d: any) => d);

        return createNode(node);
    }

    const createNode = (node: Node) => {
        node = node
            .enter()
            .append("g")
            .attr("class", "node")
            .attr("style", "cursor: pointer")
            .call(
                d3
                    .drag()
                    .on("start", (d) => onDragStarted(d))
                    .on("drag", (d) => onDragged(d))
                    .on("end", (d) => onDragEnded(d))
            );

        node
            .append("circle")                               // shape of node                
            .attr("r", 30)                                  // radius of node
            .attr("fill", (d: any) => d.main ? ColorTheme.Selected : d.type === "报警" ? ColorTheme.Alert : d.type === "原因" ? ColorTheme.Reason : d.type === "缺陷" ? ColorTheme.Defect : "")
            .attr("stroke", (d: any) => d.highlight ? ColorTheme.HighLight : ColorTheme.Default)
            .attr("stroke-width", (d: any) => d.highlight ? 6 : 0)

        node
            .append("text")
            .attr("dy", 10)
            .attr("fill", ColorTheme.Text)
            .attr("pointer-events", "none")
            .attr("font-size", "10px")
            .attr("text-anchor", "middle")
            .each((d: any, i: number, nodes: any) => {
                const currentNode = nodes[i];  // 获取当前DOM元素
                addText(d3.select(currentNode), d.name || "");
            });

        initNodeEvent(node);            // init node event
        return node;
    }

    const initNodeEvent = (node: Node) => {
        node.on("mouseenter", (d: any, i: number, n: any[]) => {
            const node: any = d3.select(n[i]);
            node
                .select("circle")
                .attr("r", 35)
        });

        node.on("mouseleave", (d: any, i: number, n: any[]) => {
            const node: any = d3.select(n[i]);
            node
                .select("circle")
                .attr("r", 30)
        });

        node.on("click", (d: any, i: number, n: any[]) => {
            //@ts-ignore
            d3.event.stopPropagation();
            // Clear previous selection
            d3
                .selectAll(".node circle")
                .attr("fill", (d: any) => d.type === "报警" ? ColorTheme.Alert : d.type === "原因" ? ColorTheme.Reason : d.type === "缺陷" ? ColorTheme.Defect : "");

            // Highlight the clicked node
            const selectedNode = d3.select(n[i]);
            selectedNode.select("circle").attr("fill", ColorTheme.Selected);

            nodeClick && nodeClick(d)
        });
    }

    const initLinkEvent = (link: Link) => {
        link.on("mouseenter", (d: any, i: number, n: any[]) => {
            const link: any = d3.select(n[i]);

            if (!link._groups[0][0].classList.contains("selected")) {
                link
                    .select(".overlay")
                    .attr("stroke", "#68bdf6")
                    .style("opacity", 1);
            }
        });

        link.on("mouseleave", (d: any, i: number, n: any[]) => {
            const link: any = d3.select(n[i]);

            if (!link._groups[0][0].classList.contains("selected")) {
                link.select(".overlay").style("opacity", 0);
            }
        });

        link.on("click", (d: any, i: number, n: any[]) => {

            //@ts-ignore
            d3.event.stopPropagation();

            d3
                .selectAll(".node circle")
                .attr("fill", (d: any) => d.type === "报警" ? ColorTheme.Alert : d.type === "原因" ? ColorTheme.Reason : d.type === "缺陷" ? ColorTheme.Defect : "");

            // Clear previous selection
            d3.selectAll(".link .outline").attr("stroke", (d: any) => d.highlight ? ColorTheme.HighLight : ColorTheme.Default);

            // Highlight the clicked link
            const selectedLink = d3.select(n[i]);
            selectedLink.select(".outline").attr("stroke", ColorTheme.Selected);


            linkClick && linkClick(d)

            // setSelectedLink(d)
        });

    }

    const createLink = (link: Link) => {

        const svg = d3.select("#Neo4jContainer > svg"); // 获取 svg 对象

        if (!link || (link && !link._enter)) {
            return;
        }

        link = link
            .enter()
            .append("g")
            .attr("class", "link");

        link
            .append("path")
            .attr("id", (d: any, i: number) => `linkPath${i}`)
            .attr("class", "outline")
            .attr("style", "cursor: pointer")
            .attr("stroke", (d: any, i: number) => {
                return d.highlight ? ColorTheme.HighLight : ColorTheme.Default
            })
            .attr("fill", "none")
            .attr("stroke-width", (d: any) => 2)
            .attr("marker-end", "url(#ArrowMarker)")


        link
            .append("text")
            .attr("class", "link-text")
            .attr("fill", "#A5ABB6")
            .append("textPath")
            .attr("pointer-events", "none")
            .attr("href", (d: any, i: number) => `#linkPath${i}`)
            .attr("startOffset", "45%")
            .attr("font-size", 14)
            .attr("text-anchor", "middle")
            .text((d: any) => {
                if (d.type !== "") {
                    return d.type;
                }
            });

        // 鼠标悬停在某个链接（link）上时，可以使用overlay path 来高亮显示该链接。通过设置opacity、stroke-width 或其他CSS样式属性，可以使链接看起来更突出
        link
            .append("path")
            .attr("class", "overlay")
            .attr("fill", "none")
            .attr("stroke-opacity", "0.5")
            .attr("stroke-width", "16")
            .style("opacity", "0")

        initLinkEvent(link);                    // init link event

        return link;
    }

    const initLinks = (links: Array<Link>, svg: any) => {
        const link = svg
            .append("g")
            .attr("class", "layer links")
            .selectAll("path.outline")
            .data(links, (d: any) => d);

        return createLink(link);
    }

    const onDragStarted = (d: any) => {
        // @ts-ignore
        if (!d3.event.active) {
            simulationRef.current?.alphaTarget(0.3).restart();
        }
        d.fx = d.x;
        d.fy = d.y;

        // Disable forces for all nodes except the dragged one
        simulationRef.current?.nodes().forEach((node: any) => {
            if (node !== d) {
                node.fx = node.x;
                node.fy = node.y;
            }
        });
    }

    const onDragged = (d: any) => {
        // @ts-ignore
        d.fx = d3.event.x;
        // @ts-ignore
        d.fy = d3.event.y;
    }

    const onDragEnded = (d: any) => {
        // @ts-ignore
        if (!d3.event.active) {
            simulationRef.current?.alphaTarget(0);
        }
    }

    const restartSimulation = (e: SyntheticEvent) => {
        e.stopPropagation();

        if (!simulationRef.current) return;

        const target = e.target as HTMLElement;             // Check if the target is the SVG element itself and not a node or link

        if (target.tagName.toLowerCase() === 'svg' || target.closest('.link')) {
            return; // Do nothing if the target is the SVG element
        } else {

        }
    }

    return (
        <div className="neo4j">
            <div id="Neo4jContainer" className="visual-editor-container" ref={divRef} onClick={(e: SyntheticEvent) => restartSimulation(e)} />
        </div>
    )
}

export default Neo4j