import * as cc from 'cc';
import { BaseView } from '../../base/frame/BaseView';
import { Tools } from '../../base/utils/util/Tools';
import { UIMgr } from '../../base/core/UIMgr';
import { UIConfig } from '../../config/UIConfig';
const { ccclass, property } = cc._decorator;

@ccclass('MyTeamDetail')
export class MyTeamDetail extends BaseView {
    @property(cc.Node)
    item:cc.Node = null
    /** 列表 */
    @property(cc.ScrollView)
    sv:cc.ScrollView = null

    private _teamId:number = 0
    private _page:number = 1
    start() {
        this._page = 1
        this._teamId = this.m_uidata.id
        this.reqDat()
        this.sv.node.on(cc.ScrollView.EventType.SCROLL_TO_BOTTOM, this.nextPage, this)
    }

    protected onDisable(): void {
        this.sv.node.off(cc.ScrollView.EventType.SCROLL_TO_BOTTOM, this.nextPage, this)
    }

    nextPage(){
        this._page++
        this.reqDat()
    }

    reqDat(){
        Tools.httpReq("promotion-team-player", {
            page:this._page,
            size:10,
            id:this._teamId
        },(res)=>{
            if (this._page == 1) this.sv.content.removeAllChildren()
            for (let i = 0; i < res.length; i++) {
                const d = res[i];
                let item = Tools.AddChild(this.sv.content, this.item)
                item.active = true
                Tools.SetChildText(item, "Layout/Layout0/labName", d?.remark ? d.remark : d.name)
                Tools.SetChildText(item, "Layout/Layout0/labValue", "（ID：" + d.uuid + "）")
                Tools.SetChildText(item, "Layout/Layout1/labValue", d.recharge_amount)
                Tools.SetChildText(item, "Layout/Layout2/labValue", d.money)
                Tools.SetChildText(item, "Layout1/Layout1/labValue", d.withdraw_amount)
                Tools.SetChildText(item, "Layout1/Layout2/labValue", d.total_score)
                Tools.SetChildTouchEndEvt(item, "btnDetail", ()=>{
                    UIMgr.getInstance().openSingleView(UIConfig.PromotionYuanDetail.path,{data:d})
                })
            }
        })
    }
}