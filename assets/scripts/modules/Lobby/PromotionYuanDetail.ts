import * as cc from 'cc';
import { Message } from '../../base/core/MessageMgr';
import { BaseView } from '../../base/frame/BaseView';
import { httpRequest } from '../../NetMgr/HttpRequest';
import { LoadingViewWrap } from '../../base/utils/view/LoadingViewWrap';
const { ccclass, property } = cc._decorator;

@ccclass('PromotionYuanDetail')
export class PromotionYuanDetail extends BaseView {

    @property(cc.Label)
    labName:cc.Label = null

    @property(cc.Label)
    labId:cc.Label = null

    @property(cc.Label)
    labPormoteId:cc.Label = null

    @property(cc.Node)
    nodeTime:cc.Node = null

    @property(cc.Node)
    nodeTimeLayout1:cc.Node = null

    @property(cc.Node)
    nodeTimeLayout2:cc.Node = null

    @property(cc.Label)
    labChuZhang:cc.Label = null

    @property(cc.Label)
    labRuZhang:cc.Label = null

    @property(cc.Label)
    labChongZhi:cc.Label = null

    @property(cc.Label)
    labTiXian:cc.Label = null

    userId:number = 0

    labNameArr:string[] = ["今日","本周","本月","上月"]
    type:string[] = ["today","week","month","sub_month"]

    currSelectTimeIndex = 0

    onLoad () {
        LoadingViewWrap.close()
        this.nodeTimeLayout1.getChildByName("Label").getComponent(cc.Label).string = "今日"
        console.log("--PromotionYuanDetail-----",this.m_uidata.data)
        this.userId =  this.m_uidata.data.id
        
        if ("" == this.m_uidata.data.name || null == this.m_uidata.data.name) {
            this.labName.string = this.m_uidata.data.uuid
        }else {
            this.labName.string = this.m_uidata.data.name
        }
        this.labId.string = "（ID:" + this.m_uidata.data.id +"）" 
        this.labPormoteId.string = this.m_uidata.data.promoter_id
    }

    onEnable () {
        Message.on("GetPlayerRecordSucc",this.getPlayerRecordSucc,this)
    }

    onDisable () {
        Message.off("GetPlayerRecordSucc",this.getPlayerRecordSucc,this)
    }

    getPlayerRecordSucc (event:string,args:any) {
        console.log("---是个啥----",args)
        this.nodeTimeLayout2.getChildByName("Label").getComponent(cc.Label).string = this.labNameArr[this.currSelectTimeIndex]
        this.nodeTimeLayout2.getChildByName("Label2").getComponent(cc.Label).string ="（" + args.date_type[this.type[this.currSelectTimeIndex]] + "）"
        this.labChuZhang.string = args.total_data.total_out || 0
        this.labRuZhang.string = args.total_data.total_in || 0
        this.labChongZhi.string = args.total_data.total_recharge || 0
        this.labTiXian.string = args.total_data.total_withdrawal || 0
    }

    btnTimeLayoutCall () {
        this.nodeTime.active = !this.nodeTime.active
    }

    start() {
        
    }

    btnTimeSelctCall (target:cc.EventTouch,index:string) {
        console.log("------",index)
        this.currSelectTimeIndex = Number(index)
        Message.dispatchEvent("ChangePlayerRecordType",Number(index))
        this.nodeTime.active = !this.nodeTime.active
    }

    btnCloseCall () {
        this.close()
    }

    update(deltaTime: number) {
        
    }
}


