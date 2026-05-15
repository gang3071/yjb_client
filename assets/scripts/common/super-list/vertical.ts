
import * as cc from 'cc';
import { LocalizadManager } from '../../base/localized/LocalizedManager';
import { LabelConfig } from '../../config/LabelConfig';
import { BaseItem } from './baseItem';
import { SuperLayout } from './super-layout';
import { Tools } from '../../base/utils/util/Tools';
const { ccclass, property } = cc._decorator;
@ccclass('Vertical')
export class Vertical extends BaseItem {

    private color1:cc.Color = new cc.Color(65,234,107)
    private color2:cc.Color = new cc.Color(234,65,145)

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
        let labRatio = this.transform.getChildByName("labRatio").getComponent(cc.Label)
        let labId = this.transform.getChildByName("labId").getComponent(cc.Label)
        let labShangFen = this.transform.getChildByName("Layout1").getChildByName("labObject").getComponent(cc.Label)
        let labXiaFen = this.transform.getChildByName("Layout2").getChildByName("labObject").getComponent(cc.Label)
        let labMoney = this.transform.getChildByName("Layout3").getChildByName("labObject").getComponent(cc.Label)
        let labWin = this.transform.getChildByName("Layout4").getChildByName("labObject").getComponent(cc.Label)

        for (let i=0; i<data.game_list.length; i++) {
            if (data.game_id == data.game_list[i].id) {
                labType.string = LabelConfig[data.game_list[i].name][LocalizadManager.getInstance().getLanauge()-1] 
                break
            }
        }

        Tools.SetChildText(this.transform, "Layout5/labObject", data.machine_name)

        labRatio.string = data.odds
        labId.string = data.code

        // let time = data.created_at.split(" ")
        labTime.string = data.updated_at
        
        labShangFen.string = data.open_amount
        labXiaFen.string = data.wash_amount
        // if (0 <= Number(data.wash_amount)) {
        //     // labDianShu.color = this.color1
        //     // labDianShu.string = "+" + utils.keepTwoDecimalStr(Number(labDianShu.string)) 
        // }else {
        //     // labDianShu.color = this.color2
        // }
        labMoney.string = data.after_game_amount
        labWin.string= (Number(data.wash_amount) - Number(data.open_amount)).toString()

            if (0 <= Number(labWin.string)) {
                labWin.color = this.color2
    
                labWin.string = "+"+labWin.string
            }else {
                labWin.color = this.color1
            }

    }
}
