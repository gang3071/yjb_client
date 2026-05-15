import * as cc from 'cc';
import { UIMgr } from '../../base/core/UIMgr';
import { BaseView } from '../../base/frame/BaseView';
import { AlterTipsWrap } from '../../base/utils/view/AlterTipsWrap';
import { LoadingViewWrap } from '../../base/utils/view/LoadingViewWrap';
import { UIConfig } from '../../config/UIConfig';
import { httpRequest } from '../../NetMgr/HttpRequest';
import { UserInfo } from '../common/UserInfo';
import { Tools } from '../../base/utils/util/Tools';
import { UrlImageView } from '../../base/gui/urlImageView';
const { ccclass, property } = cc._decorator;

const CHARGE_TYPE ={
    1 : "USDT充值",
    2 : "支付宝充值",
    3 : "微信充值",
    4 : "银行卡充值"
}

@ccclass('ChongZhiDetail')
export class ChongZhiDetail extends BaseView {
    /** 订单金额 */
    @property(cc.Label)
    labDingDanJinE:cc.Label = null
    /** 带支付金额 */
    @property(cc.Label)
    labDaiZhiFu:cc.Label = null

    @property(cc.Label)
    labDingDanHao:cc.Label = null

    @property(cc.Label)
    labBankName:cc.Label = null

    @property(cc.Label)
    labOpenBankName:cc.Label = null

    @property(cc.Label)
    labHuMing:cc.Label = null

    @property(cc.Label)
    labBankNumber:cc.Label = null

    /** 微信号  */
    @property(cc.Label)
    wechatID:cc.Label = null
    /** 支付宝号 */
    @property(cc.Label)
    alipayId:cc.Label = null
    /** 名称 */
    @property(cc.Label)
    labName:cc.Label = null
    /** 钱包地址 */
    @property(cc.Label)
    walletAddress:cc.Label = null
    /** 钱包网络 */
    @property(cc.Node)
    netType:cc.Node = null
    /** 二维码地址 */
    @property(cc.Node)
    QRCode:cc.Node = null
    /** 二维码地址 */
    @property(cc.Node)
    bigQRCode:cc.Node = null
    /** 收款标题 */
    @property(cc.Label)
    getTitle:cc.Label = null
    /** 收款类型 */
    @property(cc.Label)
    chargeType:cc.Label = null


    @property(cc.Label)
    labTime:cc.Label = null

    @property(cc.Layout)
    wanChengLayout:cc.Layout = null

    @property(cc.Node)
    nodeTime:cc.Node = null

    private dingDanData:any = null

    dingDanTime:any = null

    start() {
        console.log("-----------------",this.m_uidata)
        // if (1 == this.m_uidata.succ.showNode) {
        //     this.reqData(Number(this.m_uidata.succ.money) * Number(this.m_uidata.succ.currency.ratio))
        // }else if (2 == this.m_uidata.succ.showNode) {
            LoadingViewWrap.close()
            this.dingDanData = this.m_uidata.succ

            var dat = this.dingDanData.recharge_setting

            // 根据类型显示文字
            this.labBankName.node.parent.active = this.dingDanData.type == 4
            this.labOpenBankName.node.parent.active = this.dingDanData.type == 4
            this.labHuMing.node.parent.active = this.dingDanData.type == 4
            this.labBankNumber.node.parent.active = this.dingDanData.type == 4
            this.wechatID.node.parent.active = this.dingDanData.type == 3
            this.alipayId.node.parent.active = this.dingDanData.type == 2
            this.labName.node.parent.active = this.dingDanData.type == 3 || this.dingDanData.type == 2
            this.walletAddress.node.parent.active = this.dingDanData.type == 1
            this.netType.active = this.dingDanData.type == 1
            this.QRCode.active = this.dingDanData.type != 4

            // 信息展示
            var str = this.m_uidata.succ.money + "  " + this.m_uidata.succ.currency 
            this.labDingDanJinE.string = str
            this.labDaiZhiFu.string = str
            this.labDingDanHao.string = this.m_uidata.succ.tradeno

            this.labBankName.string = this.dingDanData.bank_name
            this.labOpenBankName.string = this.dingDanData.sub_bank
            this.labHuMing.string = this.dingDanData.name
            this.labBankNumber.string = this.dingDanData.account
            this.wechatID.string = this.dingDanData.account
            this.alipayId.string = this.dingDanData.account
            this.labName.string = this.dingDanData.name
            this.walletAddress.string = this.dingDanData.wallet_address
            this.QRCode.getComponent(UrlImageView).setUrl(this.dingDanData.qr_code)
            Tools.GetChildComp(this.bigQRCode, "qrcode", UrlImageView).setUrl(this.dingDanData.qr_code)

            this.getTitle.string = Tools.GetLocalized(this.dingDanData.type == 1 ? "钱包地址" : "收款信息")
            this.chargeType.string = Tools.GetLocalized(CHARGE_TYPE[this.dingDanData.type])

            this.startTime(this.dingDanData.created_at)
        // }

        for (let i=0; i<this.wanChengLayout.node.children.length; i++) {
            let node = this.wanChengLayout.node.children[i]
            node.on(cc.Node.EventType.TOUCH_END,(target:cc.EventTouch) => {
                if (0 == i) {
                    this.btnCancelCZCall()
                }
                if (1 == i) {
                    //this.btnCopyCall()
                }
                if (2 == i) {
                    this.btnFinishPayCall()
                }
            })
        }
        
        // this.initData()
        // this.reqData()
    }

    /** 复制户名 */
    btnCopyBankName() {
        Tools.CopyToClipboard(this.labHuMing.string)
    }

    /** 复制卡号 */
    btnCopyBankCardId() {
        Tools.CopyToClipboard(this.labBankNumber.string)
    }

    /** 复制微信号 */
    btnCopyWxID() {
        Tools.CopyToClipboard(this.wechatID.string)
    }

    /** 复制姓名 */
    btnCopyName() {
        Tools.CopyToClipboard(this.labName.string)
    }

    /** 复制支付宝号 */
    btnCopyAliID() {
        Tools.CopyToClipboard(this.alipayId.string)
    }

    /** 复制钱包地址 */
    btnCopyWalletAddress() {
        Tools.CopyToClipboard(this.walletAddress.string)
    }

    initData () { }

    onDisable () {
        if (this.dingDanTime) {
            clearInterval(this.dingDanTime)
        }
    }

    reqData (amount:number) {
        httpRequest.post("api/v1/get-recharge-method",{
            amount:amount,
        },(succ:any) => {
            if (0 < succ.recharge_method.length) {
            }
        },(fail:any) => {
            
        })
    }

    reqKeFuChongZhiInfo () {
        // httpRequest.post("",{
        
        // },(succ:any) => {
            
        // },(fail:any) => {
            
        // })
    }

    btnCloseCall () {
        this.close()
    }

    btnCancelCZCall () {
        let id = this.dingDanData.id
        httpRequest.post("api/v1/cancel-recharge",{
            id:id
        },(succ:any) => {
            AlterTipsWrap.show("取消成功")
            this.close()
            if (2 == this.m_uidata.succ.showNode) {
                this.reqData(this.m_uidata.succ.point)
            }else if (1 == this.m_uidata.succ.showNode) {
            }
        })
    }

    onClickQrcode(){
        this.bigQRCode.active = !this.bigQRCode.active
    }

    btnKeFuCall () {
        UserInfo.getKeFuLink(360,748)
    }

    btnFinishPayCall () {
        let id = this.dingDanData.id

        LoadingViewWrap.show()
        UIMgr.getInstance().openSingleView(UIConfig.UploadImg.path,{id:id})
    }

    startTime (time:number) {
        if (0 == UserInfo.recharge_order_expiration || null == UserInfo.recharge_order_expiration) {
            this.nodeTime.active = false
            return
        }
        if (this.dingDanTime) { clearInterval(this.dingDanTime) }

        let currTime = parseInt((new Date().getTime()/1000).toString())
        let s = currTime - Number(time)
        let leftSec = Number(UserInfo.recharge_order_expiration * 60) - s

        var min = Math.floor(leftSec/60) % 60
        var sec = leftSec % 60
        
        let t = ""
        if(min < 10){ t += "0" }
        t += min + ":"
        if(sec < 10){ t += "0" }
        t += sec
        if(leftSec > -1){
            this.labTime.string = t
        }

        this.dingDanTime = setInterval(() => {
            leftSec -= 1
            var t = '';
            if(leftSec > -1){
                var min = Math.floor(leftSec/60) % 60
                var sec = leftSec % 60
                if(min < 10){ t += "0" }
                t += min + ":"
                if(sec < 10){ t += "0" }
                t += sec
                this.labTime.string = t
            }else {
                if (this.dingDanTime) {
                    clearInterval(this.dingDanTime)
                }
                AlterTipsWrap.show("时间已到，订单取消")
                this.close()
            }
        },1000)
    }
}


