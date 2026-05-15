import * as cc from 'cc';
import { BaseView } from '../../base/frame/BaseView';
import { httpRequest } from '../../NetMgr/HttpRequest';
import { AlterTipsWrap } from '../../base/utils/view/AlterTipsWrap';
import { UserInfo } from '../common/UserInfo';
import { LoadingViewWrap } from '../../base/utils/view/LoadingViewWrap';
import { UIMgr } from '../../base/core/UIMgr';
import { UIConfig } from '../../config/UIConfig';
import { Tools } from '../../base/utils/util/Tools';
import { sys } from 'cc';
const { ccclass, property } = cc._decorator;

/** 充值类型对应的图标编号,充值类型固定死的，可以后续添加 */
const CHARGE_TYPE_TO_PIC = {
    // USDT
    1 : "4" ,
    // alipay
    2 : "3",
    // wechat
    3 : "2",
    // bank
    4 : "1",
    // goubao
    5 : "5",
}

@ccclass('ChongZhi')
export class ChongZhi extends BaseView {
    /** 币种 */
    @property(cc.Node)
    moneyType:cc.Node = null
    /** 需要支付金额 */
    @property(cc.Label)
    labXuZhiFu:cc.Label = null
    /** 充值方式 */
    @property(cc.Label)
    labChongZhiFangShi:cc.Label = null
    /** 充值方式Icon */
    @property(cc.Node)
    chargeIcon:cc.Node = null
    /** 充值方式下拉菜单 */
    @property(cc.Node)
    typeLayout:cc.Node = null
    /** 充值方式预制件 */
    @property(cc.Prefab)
    itemPrefab:cc.Prefab = null
    /** 充值点数 */
    @property(cc.Label)
    labInput:cc.Label = null
    /** 充值点数提示 */
    @property(cc.Label)
    labInputDesc:cc.Label = null
    /** TRC20网络 */
    @property(cc.Node)
    net:cc.Node = null
    
    /** 充值金额 */
    private labChongZhiJinE:string = ""
    /* 选择充值方式文字颜色 */ 
    private color1:cc.Color = new cc.Color(148, 142, 208)
    private color2:cc.Color = new cc.Color(255, 155, 11)
    /** 当前选择充值方式 */
    private czFangShi:any = null

    private _type:number

    start() {
        this.reqData(Number(this.m_uidata.succ.money) * Number(this.m_uidata.succ.currency.ratio))
    }

    /** 
     * 获取充值方式
     * amount:当前充值点数
     *  */
    reqData(amount:number) {
        httpRequest.post("api/v1/get-recharge-method", { amount:amount }, (succ:any) => {
            this.initLayout(succ)
            this.typeLayout.active = false
            this.labChongZhiJinE = (Number(succ.money)*Number(succ.currency.ratio)).toString()
            this.labXuZhiFu.string = succ.money
            this.m_uidata.amount = (Number(succ.money)*Number(succ.currency.ratio)).toString()
        })
    }

    /** 初始化充值方式 */
    initLayout(succ:any) {
        this.typeLayout.destroyAllChildren()
        const mthd = succ.recharge_method
        for (let i=0; i<mthd.length; i++) {
            let item = Tools.AddChild(this.typeLayout, this.itemPrefab)
            Tools.SetChildText(item, "name", Tools.GetLocalized(mthd[i].name));
            Tools.SetTouchEndEvt(item, () => {
                this.setChargeType(mthd[i])
                this._type = mthd[i].type
                for (let j=0; j<this.typeLayout.children.length; j++) {
                    this.setSelectNode(this.typeLayout.children[j], mthd[j].type, i == j)
                }
                this.btnSelectTypeCall()
            })
            this.setSelectNode(item, mthd[i].type, 0 == i)
        }
        this.setChargeType(mthd[0])
    }

    /** 设置选择充值方式节点 */
    setSelectNode(item:cc.Node, type:number, b:boolean)
    {
        item.getChildByName("img2").active = b
        item.getChildByName("name").getComponent(cc.Label).color = b ? this.color2 : this.color1
        var pic = "chongzhi_icon0" + CHARGE_TYPE_TO_PIC[type] + (b ? "b" : "a")
        Tools.SetChildSprite(item, "icon", pic, "Lobby/ui/chongzhi")
    }

    /** 选择支付方式后改变显示 */
    setChargeType(data:any) {
        this.czFangShi = data
        this.labChongZhiFangShi.string = Tools.GetLocalized(data.name)
        // type=1:USDT
        this.net.active = data.type == 1
        Tools.SetChildText(this.moneyType, "lab", Tools.GetLocalized(data.type == 1 ? "今日汇率" : "币种"))
        Tools.SetChildText(this.moneyType, "lab_type", data.type == 1 ? this.m_uidata.succ.usdt_rate : this.m_uidata.succ.currency.identifying)
        Tools.SetSpriteFrame(this.chargeIcon, "chongzhi_icon0" + CHARGE_TYPE_TO_PIC[data.type] + "c", "Lobby/ui/chongzhi")
        this.labXuZhiFu.string = this.getNeedPay(this.labChongZhiJinE)
    }

    /** 充值金额输入框改变 */
    chongZhiMoneyEditboxChange(text:string) {
        this.labChongZhiJinE = text
        this.m_uidata.amount = text
        this.labXuZhiFu.string = this.getNeedPay(text)
    }

    /** 根据汇率算之际支付 */
    getNeedPay(text : any)
    {
        text = Number(text)
        var n = text/Number(this.m_uidata.succ.currency.ratio)/(this.czFangShi.type == 1 ? this.m_uidata.succ.usdt_rate : 1)
        return parseFloat(n.toFixed(2)).toString();
    }

    /** 充值 */
    btnCZCall() {
        if ("" == this.labInput.string) {
            AlterTipsWrap.show("请输入充值点数")
            return
        }
        
        //超过限额 (amount_limit 0:不限制, 1:限制)
        if (this.czFangShi.amount_limit==1 && (Number(this.labChongZhiJinE)>Number(this.czFangShi.max) || Number(this.labChongZhiJinE)<Number(this.czFangShi.min))) {
            var str = Number(this.labChongZhiJinE)>Number(this.czFangShi.max) ? "最大" : "最小"
            AlterTipsWrap.show(Tools.GetLocalized(str) + " " + (str == "最大" ? this.czFangShi.max : this.czFangShi.min))
            return
        }

        // 如果是购宝
        if (this._type == 5){
            // 先判断是否绑定
            Tools.httpReq('check-binding', null, (res) => {
                if (res.is_bound){
                    //检查授权情况
                    Tools.httpReq("check-verify", null, (succ:any) => {
                        // 已授权
                        if (succ.is_verify) {
                            UIMgr.getInstance().openSingleView(UIConfig.PopGouBaoCharge.path, 
                                {id:succ.player_bank.gb_nickname, point:this.labInput.string, money:this.labChongZhiJinE, charge_id:this.czFangShi.id })
                            this.close()
                        // 未授权
                        }else {
                            // 发起授权
                            Tools.httpReq("verify-user", {}, ()=>{
                                UIMgr.getInstance().openSingleView(UIConfig.PopGouBaoVerify.path)
                                this.close()
                            })
                        }
                    })
                }else{
                    UIMgr.getInstance().openSingleView(UIConfig.AddBankCard.path, {type : 4})
                    this.close()
                }
            })
            return
        }

        httpRequest.post("api/v1/player-recharge", {
            amount:this.m_uidata.amount,
            method_id:this.czFangShi.id
        }, (succ:any) => {
            // 支付宝修改
            if (this._type == 2){
                //window.open(succ.casher_url, '_blank')
                Tools.OpenWeb(succ.casher_url)
                this.close()
                return
            }
            LoadingViewWrap.show()
            UIMgr.getInstance().openSingleView(UIConfig.ChongZhiDetail.path,{succ:succ})
            this.close()
        })
    }

    /** 下拉框显示 */
    btnSelectTypeCall() { this.typeLayout.active = !this.typeLayout.active }

    btnCloseCall() { this.close() }

    btnKeFuCall() { UserInfo.getKeFuLink(360, 748) }

    /** 数字按钮点击 */
    btnNumCall(target:cc.EventTouch, customs:string) {
        this.labInputDesc.node.active = false
        // 数字按钮
        if ("10" != customs) {
            if ("0" == customs && "" == this.labInput.string) {
                this.labInputDesc.node.active = true
            }else {
                this.labInput.string = this.labInput.string + customs
                this.m_uidata.amount = this.labInput.string
                this.labChongZhiJinE = this.labInput.string
                this.labXuZhiFu.string = this.getNeedPay(this.labInput.string)
            }
        // 删除按钮
        }else {
            if (1 == this.labInput.string.length) {
                this.labInput.string = ""
                this.m_uidata.amount = "0"
                this.labChongZhiJinE = "0"
                this.labXuZhiFu.string = "0"
                this.labInputDesc.node.active = true
            }else if (0 == this.labInput.string.length) {
                this.labInputDesc.node.active = true
            }else {
                this.labInput.string = this.labInput.string.substring(0,this.labInput.string.length-1)
                this.m_uidata.amount = this.labInput.string
                this.labChongZhiJinE = this.labInput.string
                this.labXuZhiFu.string = this.getNeedPay(this.labInput.string)
            }
        }
    }
}