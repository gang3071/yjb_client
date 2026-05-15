import * as cc from 'cc';
import { UITransform } from 'cc';
import { Prefab } from 'cc';
const { ccclass, property } = cc._decorator;

@ccclass('PageViewEx')
export class PageViewEx extends cc.Component {

    @property(Prefab)
    item:Prefab = null;

    start() {
        for (let i=0; i<3; i++) {
            let itemNode = cc.instantiate(this.item);
            itemNode.getComponent(UITransform).width = this.node.getComponent(cc.PageView).node.getComponent(UITransform).width
            itemNode.getComponent(UITransform).height = this.node.getComponent(cc.PageView).node.getComponent(UITransform).height
            this.node.getComponent(cc.PageView).addPage(itemNode)
            // itemNode.parent = this.node.getComponent(cc.PageView).content
            // this.node.getComponent(cc.PageView).
        }
    }

    
}


