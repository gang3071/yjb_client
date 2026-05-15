
import { _decorator, Component, Node, Label, EditBox, Size, math, UITransform } from 'cc';
import { SuperLayout } from './super-layout';

const { ccclass, property } = _decorator;

@ccclass('BaseItem')
export class BaseItem extends Component {

    layout: SuperLayout = null!
    private index!: number
    private clickFunc!: Function
    get transform() {
        // return this.node.getComponent(UITransform)
        return this.node
    }
    show(data: any, index: number, callback: Function, layout: SuperLayout) {
        this.index = index
        // this.label.string = data.message
        this.clickFunc = callback
        this.layout = layout

    }
    onClick() {
        this.clickFunc?.call(this, this.index)
    }

    onInput() {

    }
}

