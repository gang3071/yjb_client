import {UITransform, _decorator } from "cc";
import { Component, screen} from "cc";
import { view } from "cc";
const { ccclass, property } = _decorator;

@ccclass
export default class BackgroundAdapter extends Component {
    onLoad() {
        let nodeWidth = this.node.getComponent(UITransform).width
        let nodeHeight = this.node.getComponent(UITransform).height
        let srcScaleForShowAll = Math.min(screen.windowSize.width / nodeWidth, screen.windowSize.height / nodeHeight);
        let realWidth = nodeWidth * srcScaleForShowAll;
        let realHeight = nodeHeight * srcScaleForShowAll;

        
        // 2. 基于第一步的数据，再做缩放适配
        let scaleValue = Math.max(screen.windowSize.width / realWidth, screen.windowSize.height / realHeight);
        this.node.setScale(scaleValue,scaleValue)
    }

}
