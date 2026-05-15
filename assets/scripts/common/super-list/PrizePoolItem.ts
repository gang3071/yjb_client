import * as cc from 'cc';
import { BaseItem } from './baseItem';
import { SuperLayout } from './super-layout';
const { ccclass, property } = cc._decorator;

@ccclass('PrizePoolItem')
export class PrizePoolItem extends BaseItem {
    
    onLoad() {
        
    }
    onInput() {
       
    }
    show(data: any, index: number, callback: Function, layout: SuperLayout) {
        super.show(data, index, callback, layout)
        let labName = this.transform.getChildByName("labName").getComponent(cc.Label)
        let labType = this.transform.getChildByName("labType").getComponent(cc.Label)
        let labMoney = this.transform.getChildByName("labMoney").getComponent(cc.Label)
        let labTime = this.transform.getChildByName("labTime").getComponent(cc.Label)
        let labMachineId = this.transform.getChildByName("labMachineId").getComponent(cc.Label)
        
        labName.string = data.player_name
        if ("" == data.player_name || null == data.player_name) {
            labName.string = data.uuid
        }
        labType.string = data.lottery_name
        labMoney.string = data.amount
        let time = data.created_at.split(" ")
        labTime.string = time[0] + "\n" + time[1]
        labMachineId.string = data.machine_code
    }
}


