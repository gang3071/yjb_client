
import * as cc from 'cc';
import { LocalizadManager } from '../../base/localized/LocalizedManager';
import { LabelConfig } from '../../config/LabelConfig';
import { BaseItem } from './baseItem';
import { SuperLayout } from './super-layout';
const { ccclass, property } = cc._decorator;
@ccclass('LiChengItem')
export class LiChengItem extends BaseItem {

    private color1:cc.Color = new cc.Color(65,234,107)
    private color2:cc.Color = new cc.Color(234,65,145)

    private typeNameArr:string[] = ["","修改金额","玩家赠送转入","玩家赠送转出","机台上分","机台下分","Q点转入","Q点转出","","","","系统赠点","","彩金派彩"]

    onLoad() {
        // this.input.placeholder = this.transform?.height.toString()!
    }
    onInput() {
        // let height = Number(this.input.string)
        // if (isNaN(height)) return
        // if (height < 100) {
        //     return
        // }
        // this.transform?.setContentSize(new Size(this.transform.contentSize.width, height))
        // this.layout.updateItemSize(this.node, this.transform?.contentSize!)
    }
    show(data: any, index: number, callback: Function, layout: SuperLayout) {
        super.show(data, index, callback, layout)

        let labTime = this.transform.getChildByName("labTime").getComponent(cc.Label)
        let labType = this.transform.getChildByName("labType").getComponent(cc.Label)
        let labObject = this.transform.getChildByName("Layout3").getChildByName("labObject").getComponent(cc.Label)
        let ly3Desc = this.transform.getChildByName("Layout3").getChildByName("desc").getComponent(cc.Label)
        let labDianShu = this.transform.getChildByName("Layout1").getChildByName("labDianShu").getComponent(cc.Label)
        let labMoney = this.transform.getChildByName("Layout2").getChildByName("labMoney").getComponent(cc.Label)

        if (data.type == 2 || data.type == 3) {
            ly3Desc.string = LabelConfig["赠送对象"][LocalizadManager.getInstance().getLanauge()-1]
        }else if (data.type == 4 || data.type == 5) {
            ly3Desc.string = LabelConfig["机器编号"][LocalizadManager.getInstance().getLanauge()-1]
        }else if (data.type == 6 || data.type == 7 || data.type == 9 || data.type == 14 || data.type == 15) {
            ly3Desc.string = LabelConfig["转移对象"][LocalizadManager.getInstance().getLanauge()-1]
        }else if (data.type == 1 || data.type == 8 || data.type == 10 || data.type == 11 || data.type == 12 || data.type == 13) {
            ly3Desc.string = LabelConfig["操作对象"][LocalizadManager.getInstance().getLanauge()-1]
        }

        labTime.string = data.updated_at
        // labType.string = LabelConfig[this.typeNameArr[Number(data.type)]] ? LabelConfig[this.typeNameArr[Number(data.type)]][LocalizadManager.getInstance().getLanauge()-1]:this.typeNameArr[Number(data.type)]
        // if ("" == data.code) {
        //     labObject.string = LabelConfig[data.source] ? LabelConfig[data.source][LocalizadManager.getInstance().getLanauge()-1]:data.source
        // }else {
        //     let str1 = LabelConfig[data.source] ? LabelConfig[data.source][LocalizadManager.getInstance().getLanauge()-1]:data.source
        //     labObject.string = str1 + "  " + data.code
        // }

        labType.string = data.target
        labObject.string = data.source
        
        labDianShu.string = data.amount
        // if (0 <= Number(data.amount)) {
        //     labDianShu.color = this.color1
        //     labDianShu.string = "+" + labDianShu.string
        // }else {
        //     labDianShu.color = this.color2
        // }
        labMoney.string = data.amount_after
    }
}
