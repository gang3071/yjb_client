import {UITransform,_decorator, screen} from "cc";
import { Component } from "cc";
import { view } from "cc";
const { ccclass, property } = _decorator;

@ccclass
export default class ContentAdapter extends Component {
    onLoad() {
        // console.log("=========",this.node.name,this.node.getComponent(UITransform))
        let nodeWidth = this.node.getComponent(UITransform).width
        let nodeHeight = this.node.getComponent(UITransform).height
        let ss = screen.windowSize
        // 1. 先找到 SHOW_ALL 模式适配之后，本节点的实际宽高以及初始缩放值
        let srcScaleForShowAll = Math.min(ss.width / nodeWidth, ss.height / nodeHeight);
        let realWidth = nodeWidth * srcScaleForShowAll;
        let realHeight = nodeHeight * srcScaleForShowAll;

        // 2. 基于第一步的数据，再做节点宽高适配
        this.node.getComponent(UITransform).width = nodeWidth * (ss.width / realWidth);
        this.node.getComponent(UITransform).height = nodeHeight * (ss.height / realHeight)
    }

}
