import * as cc from 'cc';
import { Message } from '../../base/core/MessageMgr';
import { UIMgr } from '../../base/core/UIMgr';
import { AlterTipsWrap } from '../../base/utils/view/AlterTipsWrap';
import { LoadingViewWrap } from '../../base/utils/view/LoadingViewWrap';
import { UIConfig } from '../../config/UIConfig';
import { UserInfo } from '../../modules/common/UserInfo';
import { httpRequest } from '../../NetMgr/HttpRequest';
import { BaseItem } from './baseItem';
import { SuperLayout } from './super-layout';
const { ccclass, property } = cc._decorator;

@ccclass('MyPlayerItem')
export class MyPlayerItem extends BaseItem {
    private color1:cc.Color = new cc.Color(65,234,107)
    private color2:cc.Color = new cc.Color(234,65,145)

    private data:any = null

    onLoad() {
        
    }

    onInput() {
       
    }

    onEnable () {
        Message.on("SetPromotionRatioSucc",this.setPromotionTipsSucc,this)
    }

    onDisable () {
        Message.off("SetPromotionRatioSucc",this.setPromotionTipsSucc,this)
    }

    setPromotionTipsSucc (event:string,args:any) {
        console.log("--setPromotionTipsSucc--",args)
        // this.transform.getChildByName("Layout1").getChildByName("Layout3").active = this.data.is_promoter == 1?false:true
        this.transform.getChildByName("Layout1").getChildByName("Layout4").active = this.data.is_promoter == 0?false:true
        if (1 == this.data.is_promoter) {
            this.transform.getChildByName("btnSetAgent").getChildByName("Layout").getChildByName("flag").getComponent(cc.Sprite).color = new cc.Color(133,133,133)
            this.transform.getChildByName("btnSetAgent").getChildByName("Layout").getChildByName("Label").getComponent(cc.Label).color = new cc.Color(133,133,133)
            this.transform.getChildByName("btnSetAgent").off(cc.Node.EventType.TOUCH_END)
        }else {
            this.transform.getChildByName("btnSetAgent").getChildByName("Layout").getChildByName("flag").getComponent(cc.Sprite).color = new cc.Color(255,255,255)
            this.transform.getChildByName("btnSetAgent").getChildByName("Layout").getChildByName("Label").getComponent(cc.Label).color = new cc.Color(34,122,255)
            // this.transform.getChildByName("btnSetAgent").on(cc.Node.EventType.TOUCH_END,(touche:cc.EventTouch) => {
            //     UIMgr.getInstance().openSingleView(UIConfig.SetPromotionTips.path,{data:data})
            // })
        }
    }

    show(data: any, index: number, callback: Function, layout: SuperLayout) {
        super.show(data, index, callback, layout)
        this.data = data
        let id = this.transform.getChildByName("Layout").getChildByName("Layout0").getChildByName("labValue").getComponent(cc.Label)
        let allCZ = this.transform.getChildByName("Layout").getChildByName("Layout1").getChildByName("labValue").getComponent(cc.Label)
        let qbye = this.transform.getChildByName("Layout").getChildByName("Layout2").getChildByName("labValue").getComponent(cc.Label)
        let name = this.transform.getChildByName("Layout").getChildByName("Layout0").getChildByName("labName").getComponent(cc.Label)
        let ztx = this.transform.getChildByName("Layout1").getChildByName("Layout1").getChildByName("labValue").getComponent(cc.Label)
        let dqgx = this.transform.getChildByName("Layout1").getChildByName("Layout2").getChildByName("labValue").getComponent(cc.Label)
        let tgyid = this.transform.getChildByName("Layout1").getChildByName("Layout4").getChildByName("labValue").getComponent(cc.Label)

        id.string = "（ID：" + data.uuid + "）"
        allCZ.string = data.recharge_amount
        qbye.string = data.money
        name.string = data.name
        ztx.string = data.withdraw_amount
        dqgx.string = data.profit_amount
        tgyid.string = data.promoter_id

        if (1 == data.is_promoter) {
            this.transform.getChildByName("btnSetAgent").getChildByName("Layout").getChildByName("flag").getComponent(cc.Sprite).color = new cc.Color(133,133,133)
            this.transform.getChildByName("btnSetAgent").getChildByName("Layout").getChildByName("Label").getComponent(cc.Label).color = new cc.Color(133,133,133)
        }else {
            this.transform.getChildByName("btnSetAgent").getChildByName("Layout").getChildByName("flag").getComponent(cc.Sprite).color = new cc.Color(255,255,255)
            this.transform.getChildByName("btnSetAgent").getChildByName("Layout").getChildByName("Label").getComponent(cc.Label).color = new cc.Color(34,122,255)         
            if (null == UserInfo.recommend_id || 0 == UserInfo.recommend_id) {
                this.transform.getChildByName("btnSetAgent").on(cc.Node.EventType.TOUCH_END,(touche:cc.EventTouch) => {
                    // LoadingViewWrap.show()
                    UIMgr.getInstance().openSingleView(UIConfig.SetPromotionTips.path,{data:data})
                })
            }else {
                this.transform.getChildByName("btnSetAgent").getChildByName("Layout").getChildByName("flag").getComponent(cc.Sprite).color = new cc.Color(133,133,133)
                this.transform.getChildByName("btnSetAgent").getChildByName("Layout").getChildByName("Label").getComponent(cc.Label).color = new cc.Color(133,133,133)
            }
            
        }

        this.transform.getChildByName("btnDetail").on(cc.Node.EventType.TOUCH_END,(touche:cc.EventTouch) => {
            // LoadingViewWrap.show()
            UIMgr.getInstance().openSingleView(UIConfig.PromotionYuanDetail.path,{data:data})
        })

        // this.transform.getChildByName("Layout1").getChildByName("Layout3").active = data.is_promoter == 1?false:true
        this.transform.getChildByName("Layout1").getChildByName("Layout4").active = data.is_promoter == 0?false:true

        // this.transform.getChildByName("Layout1").getChildByName("Layout3").on(cc.Node.EventType.TOUCH_END,(touche:cc.EventTouch) => {
            
        //     UIMgr.getInstance().openSingleView(UIConfig.SetPromotionTips.path,{data:data})
        // })

    }
}


