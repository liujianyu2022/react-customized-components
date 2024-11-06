import React from "react"
import * as echarts from 'echarts/core';
import { LegendComponent } from 'echarts/components';
import { EChartsType } from 'echarts/core';
import { ECElementEvent } from 'echarts/types/src/util/types';

import {
    BarChart,
    BarSeriesOption,   // 系列类型的定义后缀都为 SeriesOption
    LineChart,
    LineSeriesOption,
    ScatterChart,
    ScatterSeriesOption
} from 'echarts/charts';

import {
    TitleComponent,
    TitleComponentOption,       // 组件类型的定义后缀都为 ComponentOption
    TooltipComponent,
    TooltipComponentOption,
    GridComponent,
    GridComponentOption,
    DataZoomComponent,
    DataZoomComponentOption,
    DatasetComponent,
    DatasetComponentOption,      // 数据集组件
    TransformComponent,
    MarkLineComponent,           // MarkLine相关的组件和option
    MarkLineComponentOption,
    MarkAreaComponent,
    MarkAreaComponentOption,
    MarkPointComponent,
    MarkPointComponentOption,
    ToolboxComponent,
    ToolboxComponentOption,
    BrushComponent,
    BrushComponentOption
} from 'echarts/components';         // 内置数据转换器组件 (filter, sort)

import { LabelLayout, UniversalTransition } from 'echarts/features';
import { CanvasRenderer } from 'echarts/renderers';

// 通过 ComposeOption 来组合出一个只有必须组件和图表的 Option 类型
export type MyEchartsOption = echarts.ComposeOption<
    | BarSeriesOption
    | LineSeriesOption
    | ScatterSeriesOption
    | TitleComponentOption
    | MarkLineComponentOption
    | MarkAreaComponentOption
    | MarkPointComponentOption
    | DataZoomComponentOption
    | TooltipComponentOption
    | GridComponentOption
    | DatasetComponentOption
    | ToolboxComponentOption
    | BrushComponentOption
>;

// 注册必须的组件
echarts.use([
    TitleComponent,
    TooltipComponent,
    GridComponent,
    DatasetComponent,
    TransformComponent,
    DataZoomComponent,
    MarkLineComponent,
    MarkAreaComponent,
    MarkPointComponent,
    BarChart,
    LineChart,
    ScatterChart,
    LabelLayout,
    UniversalTransition,
    CanvasRenderer,
    LegendComponent,
    ToolboxComponent,
    BrushComponent
]);


export interface MyChartProps {
    height: string | number
    minHeight?: string | number
    width: string | number
    option: MyEchartsOption
    merge?: boolean;
    loading?: boolean;
    empty?: React.ReactElement;
    onClick?(event: ECElementEvent, ...args: any[]): void;
    onBrushSelected?: (params: any) => void
    style?: any
}

export interface MyChartRef {
    instance(): EChartsType | undefined;
    resize?: () => void
}


const MyChartInner: React.ForwardRefRenderFunction<MyChartRef, MyChartProps> = (props, ref) => {

    let { option, width, height, loading = false, onClick, onBrushSelected, style, minHeight, } = props

    const cRef = React.useRef<HTMLDivElement>(null);
    const cInstance = React.useRef<EChartsType>();


    // 初始化注册组件，监听 cRef 和 option 变化
    React.useEffect(() => {
        if (cRef.current) {

            // 校验 Dom 节点上是否已经挂载了 ECharts 实例，只有未挂载时才初始化
            cInstance.current = echarts.getInstanceByDom(cRef.current);

            if (!cInstance.current) {
                cInstance.current = echarts.init(cRef.current, undefined, {
                    renderer: 'svg',
                });

                cInstance.current.on('click', (event) => {

                    let horizontalMenuValue = localStorage.getItem("horizontalMenuValue")

                    let resultId = localStorage.getItem("resultId")

                    const ec = event as ECElementEvent;

                    // 这里才是执行回调函数的地方
                    if (ec && onClick) onClick(ec, horizontalMenuValue, resultId);
                });

                cInstance.current.on("mouseover", (event) => {
                    // const ec = event as ECElementEvent;
                    // if (ec && onClick) onClick(ec);
                })

                cInstance.current.on("brushSelected", (event) => {
                    const ec = event as ECElementEvent;
                    if (ec && onBrushSelected) onBrushSelected(ec)
                })

                // cInstance.current.on("dataZoom", (event) => {
                //     if (option && option.xAxis) {

                //         //@ts-ignore 
                //         let startIndex = (option.xAxis.data.length - 1) * event.start * 0.01;
                //         //@ts-ignore 
                //         let endIndex = (option.xAxis.data.length - 1) * event.end * 0.01;

                //         option.dataZoom = { ...option.dataZoom, startValue: startIndex, endValue: endIndex }
                //     }
                // })
            }

            // 设置配置项
            if (option) cInstance.current?.setOption(option);

        }
    }, [cRef, option]);

    // 监听窗口大小变化重绘
    React.useEffect(() => {
        window.addEventListener('resize', resize);
        return () => {
            window.removeEventListener('resize', resize);
        };

    }, [option]);


    // 监听高度变化
    React.useLayoutEffect(() => {
        resize();
    }, [width, height]);


    // 重新适配大小并开启过渡动画
    const resize = () => {
        cInstance.current?.resize({
            animation: { duration: 300 }
        });
    }

    // 获取实例
    const instance = () => {
        return cInstance.current;
    }

    // 对父组件暴露的方法
    React.useImperativeHandle(ref, () => ({
        instance,
        resize
    }));

    return (
        <div ref={cRef} style={{ width, height, minHeight, ...style }} />
    );
};

const MyChart = React.forwardRef(MyChartInner);

export default MyChart;

