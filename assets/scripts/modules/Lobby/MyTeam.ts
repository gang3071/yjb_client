import * as cc from 'cc';
import { Message } from '../../base/core/MessageMgr';
import { UIMgr } from '../../base/core/UIMgr';
import { BaseView } from '../../base/frame/BaseView';
import { LoadingViewWrap } from '../../base/utils/view/LoadingViewWrap';
import { UIConfig } from '../../config/UIConfig';
import { httpRequest } from '../../NetMgr/HttpRequest';
import { Tools } from '../../base/utils/util/Tools';
const { ccclass, property } = cc._decorator;

@ccclass('MyTeam')
export class MyTeam extends BaseView {
    @property(cc.Label)
    labTeamPlayer:cc.Label = null

    @property(cc.Label)
    labShangQiTeamGongXian:cc.Label = null

    @property(cc.Label)
    labDaiJieSuanTeamGongXian:cc.Label = null

    @property(cc.Label)
    labAllTeamGongXian:cc.Label = null

    @property(cc.Label)
    labName:cc.Label = null

    @property(cc.Prefab)
    prefabItem:cc.Prefab = null

    /** 列表 */
    @property(cc.ScrollView)
    list_scroll:cc.ScrollView = null

    /** 当前页 */
    private _page:number = 1
    /** 每次请求数量 */
    private _size:number = 10

    // private labPlaceholder1:string = ""
    private currSeachIndex:number = 1
    private labEdbox:string = ""
    /** 对象管理器 */
    private _item_mgr: { [key: number]: cc.Node } = {};

    start() {
        this.editBoxEndCall()
    }

    reqDat () {
        // 如果是第一页，清理数据
        if (this._page == 1) {
            this.list_scroll.content.removeAllChildren()
            this._item_mgr = {}
        }

        let params:any = {}
        params.page = this._page
        params.size = this._size
        if ("" == this.labEdbox) {
            
        }else if (1 == this.currSeachIndex) {
            params.uuid = Number(this.labEdbox)
        }else if (2 == this.currSeachIndex) {
            params.name = this.labEdbox
        }

        httpRequest.post("api/v1/promotion-team",
            params,
            (succ:any) => {
                this.init_scroll(succ)
            }
        )
    }

    init_scroll(succ){
        this._page += 1
        for (let i=0; i<succ.player_list.length; i++) {
            let data = succ.player_list[i]
            data.maxRatio = Number(succ.max_ratio)
            let item = Tools.AddChild(this.list_scroll.content, this.prefabItem)
            this._item_mgr[data.id] = item
            Tools.SetChildText(item, "Layout/Layout0/labValue", data.promoter_id)
            Tools.SetChildText(item, "Layout/Layout1/labValue", data.team_num)
            Tools.SetChildText(item, "Layout/Layout2/labValue", data.team_withdraw_total_amount)
            Tools.SetChildText(item, "Layout/Layout3/labValue", data.ratio + "%")
            Tools.SetChildText(item, "Layout/Layout4/labValue", String((Number(data.ratio) * Number(data.team_score) / 100).toFixed(2)))
            
            Tools.SetChildText(item, "Layout1/Layout0/labValue", data.name)
            Tools.SetChildText(item, "Layout1/Layout1/labValue", data.team_recharge_total_amount)
            Tools.SetChildText(item, "Layout1/Layout2/labValue", data.team_score)
            Tools.SetChildText(item, "Layout1/Layout3/labValue", Number(data.actual_ratio) + "%")
            Tools.SetChildText(item, "Layout1/Layout4/labValue", String((Number(data.actual_ratio) * Number(data.team_score) / 100).toFixed(2)))

            Tools.SetChildTouchEndEvt(item, "Layout5", () => {
                UIMgr.getInstance().openSingleView(UIConfig.SetPromotionName.path,{data:data})
            })

            Tools.SetChildTouchEndEvt(item, "Layout4", () => {
                UIMgr.getInstance().openSingleView(UIConfig.MyTeamDetail.path, {id:data.id})
            })
        }
    }

    onEnable () {
        Message.on("GetPromotionTeamSucc",this.getPromotionTeamSucc,this)
        Message.on("SetSeach",this.setSeach,this)
        this.list_scroll.node.on("scroll-to-bottom", this.reqDat, this)
        Message.on("SetNameSucc",this.setNameSucc,this)
    }

    onDisable () {
        Message.off("GetPromotionTeamSucc",this.getPromotionTeamSucc,this)
        Message.off("SetSeach",this.setSeach,this)
        this.list_scroll.node.on("scroll-to-bottom", this.reqDat, this)
        Message.off("SetNameSucc", this.setNameSucc, this)
    }

    setNameSucc (event:string,args:any) {
        if (this._item_mgr[args.id]) {
            Tools.SetChildText(this._item_mgr[args.id], "Layout1/Layout0/labValue", args.name)
        }
    }

    setSeach (event:string,args:any) {
        this.currSeachIndex = Number(args)
        this.labName.string = Tools.GetLocalized(Number(args) == 1 ? "推广员ID" : "推广员姓名")
    }

    /** 基础数据 */
    getPromotionTeamSucc (event:string,args:any) {
        this.labTeamPlayer.string = args.team_num
        this.labShangQiTeamGongXian.string = args.total_team_score
        this.labDaiJieSuanTeamGongXian.string = args.max_ratio + "%"
        this.labAllTeamGongXian.string = args.team_profit_amount
    }

    editBoxChangeCall (text:string) {
        this.labEdbox = text
    }

    editBoxEndCall () {
        this._page = 1
        this.reqDat()
    }

    seachCall () {
        LoadingViewWrap.show()
        UIMgr.getInstance().openSingleView(UIConfig.MyTeamSelect.path)
    }
}