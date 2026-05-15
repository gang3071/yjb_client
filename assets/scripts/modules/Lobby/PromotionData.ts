import * as cc from 'cc';
import { Message } from '../../base/core/MessageMgr';
import { BaseView } from '../../base/frame/BaseView';
import { httpRequest } from '../../NetMgr/HttpRequest';
import { Tools } from '../../base/utils/util/Tools';
const { ccclass, property } = cc._decorator;

@ccclass('PromotionData')
export class PromotionData extends BaseView {
    @property(cc.Label)
    labWaitMoney:cc.Label = null
    @property(cc.Label)
    labAllMoney:cc.Label = null
    @property(cc.Label)
    labLink:cc.Label = null
    @property(cc.Label)
    labAllJieSuan:cc.Label = null
    @property(cc.Label)
    labSXF:cc.Label = null

    @property(cc.Label)
    labJieRiTime:cc.Label = null
    /** 邀请二维码 */
    @property(cc.Node)
    qrcode:cc.Node;
    /** 邀请大二维码 */
    @property(cc.Node)
    big_qrcode:cc.Node;

    start() {
        httpRequest.post("api/v1/promotion-data",{page:1,size:10},(succ:any) => {
            this.setData(succ)
        })
    }

    openQrCode(){
        this.big_qrcode.parent.active = !this.big_qrcode.parent.active
    }

    onEnable () {
        Message.on("GetPromotionDataSucc",this.getPromotionDataSucc,this)
    }

    onDisable () {
        Message.off("GetPromotionDataSucc",this.getPromotionDataSucc,this)
    }

    getPromotionDataSucc (event:string,args:any) {
        this.setData(args)
    }

    setData(succ){
        this.labWaitMoney.string = succ.profit_amount
        this.labAllMoney.string = succ.total_profit_amount
        this.labLink.string = succ.recommend_code
        Tools.SetQRCode(succ.recommend_code, this.qrcode)
        Tools.SetQRCode(succ.recommend_code, this.big_qrcode)
        this.labAllJieSuan.string = succ.settlement_amount
        this.labJieRiTime.string = succ.settlement_date
        this.labSXF.string = succ.commission_ratio + "%"
    }

    btnCopyCall () {
        Tools.CopyToClipboard(this.labLink.string)
    }
}