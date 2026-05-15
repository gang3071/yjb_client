import * as cc from 'cc';
import { Message } from '../../base/core/MessageMgr';
import { UIMgr } from '../../base/core/UIMgr';
import { UIConfig } from '../../config/UIConfig';
import { BaseItem } from './baseItem';
import { SuperLayout } from './super-layout';
import { Tools } from '../../base/utils/util/Tools';
const { ccclass, property } = cc._decorator;

@ccclass('MyTeamItem')
export class MyTeamItem extends BaseItem {
    private color1:cc.Color = new cc.Color(65,234,107)
    private color2:cc.Color = new cc.Color(234,65,145)

    private data:any = null

    onLoad() {}

    onEnable () {
        Message.on("SetNameSucc",this.setNameSucc,this)
        Message.on("SetPromotionRatioSucc",this.setRatioSucc,this)
    }

    onDisable () {
        Message.off("SetNameSucc",this.setNameSucc,this)
        Message.off("SetPromotionRatioSucc",this.setRatioSucc,this)
    }

    setNameSucc (event:string,args:any) {
        if (args == this.data.id) {
            this.transform.getChildByName("Layout1").getChildByName("Layout0").getChildByName("labValue").getComponent(cc.Label).string = this.data.name
        }
    }

    setRatioSucc (event:string,args:any) {
        if (args == this.data.id) {
            this.transform.getChildByName("Layout1").getChildByName("Layout3").getChildByName("labValue").getComponent(cc.Label).string = this.data.ratio
        }
    }

    onInput() {}
    show(data: any, index: number, callback: Function, layout: SuperLayout) {
        super.show(data, index, callback, layout)
        this.data = data

        Tools.SetChildText(this.transform, "Layout/Layout0/labValue", data.promoter_id)
        Tools.SetChildText(this.transform, "Layout/Layout1/labValue", data.team_num)
        Tools.SetChildText(this.transform, "Layout/Layout2/labValue", data.team_withdraw_total_amount)
        Tools.SetChildText(this.transform, "Layout/Layout3/labValue", data.ratio + "%")
        
        Tools.SetChildText(this.transform, "Layout1/Layout0/labValue", data.name)
        Tools.SetChildText(this.transform, "Layout1/Layout1/labValue", data.team_recharge_total_amount)
        Tools.SetChildText(this.transform, "Layout1/Layout2/labValue", data.team_score)
        Tools.SetChildText(this.transform, "Layout1/Layout3/labValue", Number(data.actual_ratio) + "%")
        Tools.SetChildText(this.transform, "Layout1/Layout4/labValue", String((Number(data.actual_ratio) * Number(data.team_score) / 100).toFixed(2)))


        Tools.SetChildTouchEndEvt(this.transform, "Layout5", () => {
            UIMgr.getInstance().openSingleView(UIConfig.SetPromotionName.path,{data:data})
        })

        Tools.SetChildTouchEndEvt(this.transform, "Layout4", () => {
            UIMgr.getInstance().openSingleView(UIConfig.MyTeamDetail.path, {id:data.id})
        })
    }
}