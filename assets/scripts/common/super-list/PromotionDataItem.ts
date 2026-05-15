
import * as cc from 'cc';
import { BaseItem } from './baseItem';
import { SuperLayout } from './super-layout';
const { ccclass, property } = cc._decorator;
@ccclass('PromotionDataItem')
export class PromotionDataItem extends BaseItem {

    private color1:cc.Color = new cc.Color(27,31,73)
    private color2:cc.Color = new cc.Color(33,37,80)

    onLoad() {
        
    }
    onInput() {
       
    }
    show(data: any, index: number, callback: Function, layout: SuperLayout) {
        super.show(data, index, callback, layout)
        let bg = this.transform.getChildByName("bg")
        if (0 != index) {
            if (1 == (index%2)) {
                bg.getComponent(cc.Sprite).color = this.color2
                this.transform.getChildByName("Node0").getChildByName("line").active = false
                this.transform.getChildByName("Node1").getChildByName("line").active = false
            }else {
                bg.getComponent(cc.Sprite).color = this.color1
                this.transform.getChildByName("Node0").getChildByName("line").active = true
                this.transform.getChildByName("Node1").getChildByName("line").active = true
            }
        }
        
        let id = this.transform.getChildByName("Node0").getChildByName("Label").getComponent(cc.Label)
        let money = this.transform.getChildByName("Node1").getChildByName("Label").getComponent(cc.Label)
        let time = this.transform.getChildByName("Node2").getChildByName("Label").getComponent(cc.Label)

        id.string = data.id
        money.string = data.total_profit_amount
        time.string = data.created_at

    }
}
