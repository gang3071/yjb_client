import * as cc from 'cc';
import { Message } from '../../base/core/MessageMgr';
import { BaseView } from '../../base/frame/BaseView';
import { httpRequest } from '../../NetMgr/HttpRequest';
import { ScrollView } from 'cc';
import { Tools } from '../../base/utils/util/Tools';
import { UserInfo } from '../common/UserInfo';
import { UIMgr } from '../../base/core/UIMgr';
import { UIConfig } from '../../config/UIConfig';
const { ccclass, property } = cc._decorator;

@ccclass('MyPlayer')
export class MyPlayer extends BaseView {
    /** 拥有玩家数 */
    @property(cc.Label)
    labYongYouWanjia:cc.Label = null
    /** 上期玩家贡献 */
    @property(cc.Label)
    labShangQiWanJiaGongXian:cc.Label = null
    /** 待结算玩家贡献 */
    @property(cc.Label)
    labDaiJieSuanWanJiaGongXian:cc.Label = null
    /** 全部玩家贡献分 */
    @property(cc.Label)
    labAllWanJiaGongXianFenCheng:cc.Label = null
    /** 手续费 */
    @property(cc.Label)
    labshouxufei:cc.Label = null
    /** 实际分润 */
    @property(cc.Label)
    labshijifenrun:cc.Label = null
    /** 预制体 */
    @property(cc.Prefab)
    item_player: cc.Prefab = null
    /** grid */
    @property(cc.ScrollView)
    grid_player: cc.ScrollView = null
    /** 备注页面 */
    @property(cc.Node)
    node_remark: cc.Node = null
    /** 确认修改备注 */
    @property(cc.Button)
    btn_Remark: cc.Button = null
    /** 备注名称 */
    @property(cc.EditBox)
    name_Remark: cc.EditBox = null

    /** 当前请求页索引 */
    private _index = 1
    /** 当前选取的备注项 */
    private _remark_item : cc.Node
    /** 当前选取的备注id */
    private _remark_id : number

    start() {
        this._index = 1
        this.reqDat()
    }

    /** 请求下一页 */
    reqNext(){
        this._index++
        this.reqDat()
    }

    reqDat(){
        if (this._index == 1) this.grid_player.content.destroyAllChildren()
        httpRequest.post("api/v1/promotion-player",{page:this._index, size:10},(succ:any) => {
            this.getPromotionPlayerSucc("", succ)
            this.addPlayerInfo(succ)
        })
    }

    /** 添加玩家信息 */
    addPlayerInfo(dat: any){
        for (let i = 0; i < dat.player_list.length; i++) {
            const d = dat.player_list[i];
            const item = Tools.AddChild(this.grid_player.content, this.item_player)

            Tools.SetChildText(item, "Layout/Layout0/labName", d?.remark ? d.remark : d.name)
            Tools.SetChildText(item, "Layout/Layout0/labValue", "(ID:" + d.uuid + ")")
            Tools.SetChildText(item, "Layout/Layout1/labValue", d.recharge_amount)
            Tools.SetChildText(item, "Layout/Layout2/labValue", d.money)
            Tools.SetChildText(item, "Layout1/Layout1/labValue", d.withdraw_amount)
            Tools.SetChildText(item, "Layout1/Layout2/labValue", d.total_score)
            Tools.SetChildText(item, "Layout1/Layout4/labValue", d.promoter_id)
            Tools.ActChild(item, "Layout1/Layout4", d.is_promoter != 0)

            if ((null == UserInfo.recommend_id || 0 == UserInfo.recommend_id) && 1 != d.is_promoter) {
                Tools.GetChildComp(item, "btnSetAgent/Layout/flag", cc.Sprite).color = new cc.Color(255,255,255)
                Tools.GetChildComp(item, "btnSetAgent/Layout/Label", cc.Label).color = new cc.Color(34,122,255)  
                Tools.SetChildTouchEndEvt(item, "btnSetAgent", ()=>{
                    UIMgr.getInstance().openSingleView(UIConfig.SetPromotionTips.path, {data:d})
                })
            }else {
                Tools.GetChildComp(item, "btnSetAgent/Layout/flag", cc.Sprite).color = new cc.Color(133,133,133)
                Tools.GetChildComp(item, "btnSetAgent/Layout/Label", cc.Label).color = new cc.Color(133,133,133)
            }

            Tools.SetChildTouchEndEvt(item, "btnDetail", ()=>{
                UIMgr.getInstance().openSingleView(UIConfig.PromotionYuanDetail.path, {data:d})
            })

            // 设置备注
            Tools.SetChildTouchEndEvt(item, "Layout/Layout0/btn_setNick", ()=>{
                this.openRemark(item, d.id)
            })
        }
    }

    /** 打开设置备注 */
    openRemark(node:any, id:number){
        this.node_remark.active = true
        this._remark_item = node
        this._remark_id = id
        this.name_Remark.string = ""
    }

    closeRemark(){
        this.node_remark.active = false
        this._remark_item = null
        this._remark_id = null
        this.name_Remark.string = ""
    }

    btnRemark(){
        if (this.name_Remark.string == "") return
        Tools.httpReq("set-player-remark", {id: this._remark_id, remark:this.name_Remark.string}, (succ:any)=>{
            Tools.SetChildText(this._remark_item, "Layout/Layout0/labName", this.name_Remark.string)
            this.closeRemark()
        })
    }

    onEnable () {
        Message.on("GetPromotionPlayerSucc", this.getPromotionPlayerSucc, this)
        this.grid_player.node.on(ScrollView.EventType.SCROLL_TO_BOTTOM, this.reqNext, this)
    }

    onDisable () {
        Message.off("GetPromotionPlayerSucc", this.getPromotionPlayerSucc, this)
        this.grid_player.node.off(ScrollView.EventType.SCROLL_TO_BOTTOM, this.reqNext, this)
    }

    /** 设置总信息 */
    getPromotionPlayerSucc (event:string,args:any) {
        this.labYongYouWanjia.string = args.player_num
        this.labShangQiWanJiaGongXian.string = args.total_player_score
        this.labDaiJieSuanWanJiaGongXian.string = args.max_ratio + "%"
        this.labAllWanJiaGongXianFenCheng.string = args.profit_amount
        this.labshouxufei.string = args.commission
        this.labshijifenrun.string = args.real_profit_amount
    }
}