import * as cc from 'cc';
import { BaseItem } from '../../common/super-list/baseItem';
import { SuperLayout } from '../../common/super-list/super-layout';
const { ccclass, property } = cc._decorator;

@ccclass('PromotionYuanDetailItem')
export class PromotionYuanDetailItem extends BaseItem {

    private color1:cc.Color = new cc.Color(27,31,73)
    private color2:cc.Color = new cc.Color(33,37,80)

    onLoad() {
        
    }

    onInput() {
       
    }

    show(data: any, index: number, callback: Function, layout: SuperLayout) {
        super.show(data, index, callback, layout)
        if (0 ==  index%2) {
            this.transform.getChildByName("bg").getComponent(cc.Sprite).color = this.color2
        }else {
            this.transform.getChildByName("bg").getComponent(cc.Sprite).color = this.color1
        }
        this.transform.getChildByName("Node0").getChildByName("Label").getComponent(cc.Label).string = data.source
        this.transform.getChildByName("Node1").getChildByName("Label").getComponent(cc.Label).string = data.amount
        this.transform.getChildByName("Node2").getChildByName("Label").getComponent(cc.Label).string = data.amount_after
        this.transform.getChildByName("Node3").getChildByName("Label").getComponent(cc.Label).string = data.created_at
    }
}


