import * as cc from 'cc';
import { Message } from '../../base/core/MessageMgr';
import { BaseView } from '../../base/frame/BaseView';
import { AlterTipsWrap } from '../../base/utils/view/AlterTipsWrap';
import { Tools } from '../../base/utils/util/Tools';
import { EditBox } from 'cc';
import { UrlImageView } from '../../base/gui/urlImageView';
import { Button } from 'cc';
import { Vec3 } from 'cc';
import { Sprite } from 'cc';
import { LabelOutline } from 'cc';
import { Vec2 } from 'cc';
import { MsgBox } from '../../base/utils/view/MsgBox';
import { MsgBoxWrap } from '../../base/utils/view/MsgBoxWrap';
import { UIMgr } from '../../base/core/UIMgr';
const { ccclass, property } = cc._decorator;

/** 二维码提示 */
const QSCODE_TIPS = {
    1 : { title : "请上传您的微信收款码", tips : "请勿上传直接截图的收款码。请在二维码收款界面，点击保存收款码后上传图片。"},
    2 : { title : "请上传您的支付宝收款码", tips : "请勿上传直接截图的收款码。请在二维码收款界面，点击保存收款码后上传图片。"},
    3 : { title : "请上传您的钱包收款码", tips : "请注意查看钱包的网络类型。网络类型错误会造成资产丢失，请务必确认清楚。"}
}

/** 充值类型顶部按钮索引 */
const CHARGE_TYPE_TO_PIC = {
    // USDT
    1 : 3,
    // alipay
    2 : 2,
    // wechat
    3 : 1,
    // bank
    4 : 0,
}

/** 索引对应充值类型 */
const INDEX_TO_CHARGE_TYPE = {
    0 : 4,
    1 : 3,
    2 : 2,
    3 : 1,
}

/** 添加或修改支付方式 */
@ccclass('AddBankCard')
export class AddBankCard extends BaseView {
    /** 顶部按钮 */
    @property([cc.Node])
    btns:cc.Node[] = []
    /** 用户名 */
    @property(cc.Node)   
    userName:cc.Node = null
    /** 银行卡号 */
    @property(cc.Node)   
    card_id:cc.Node = null
    /** 微信号 */
    @property(cc.Node)   
    wx_id:cc.Node = null
    /** 支付宝号 */
    @property(cc.Node)   
    ali_id:cc.Node = null
    /** 开户行 */
    @property(cc.Node)   
    open_bank:cc.Node = null
    /** 钱包地址 */
    @property(cc.Node)   
    wallet_adr:cc.Node = null
    /** 钱包网络 */
    @property(cc.Node)   
    wallet_net:cc.Node = null
    /** 二维码上传 */
    @property(cc.Node)   
    QRcode_up:cc.Node = null
    /** 标题文字 */
    @property(cc.Node)   
    title:cc.Node = null
    /** 银行列表 */
    @property(cc.Node)   
    bank_view:cc.Node = null
    /** 银行列表 */
    @property(cc.Node)   
    bank_list:cc.Node = null
    /** 银行列表item */
    @property(cc.Node)   
    bank_item:cc.Node = null
    /** 关闭银行列表 */
    @property(cc.Node)   
    close_bank:cc.Node = null
    /** 确定按钮 */
    @property(cc.Node)   
    btn_sure:cc.Node = null
    /** 去绑定按钮 */
    @property(cc.Node)   
    btn_go_bind:cc.Node = null
    /** 购宝提示 */
    @property(cc.Node)   
    tips_goubao:cc.Node = null
    /** 顶部按钮 */
    @property(cc.ScrollView)   
    top_btns:cc.ScrollView = null


    /** 当前选择的索引 */
    private _index:number = null
    /** 当前选择的图片 */
    private _base64Img: string
    /** 是修改还是添加 */
    private _isChange:boolean
    /** 银行列表 */
    private _bank_list
    private _bank_items

    start() {
        this.reqBankList()
        // 如果有this.m_uidata.dat数据，说明是修改(暂时不让修改)
        //this._isChange = this.m_uidata?.dat ? true : false
        this._isChange = false

        // 默认点击第一个按钮
        this.onClickTopBtn(null, this.m_uidata?.type ? this.m_uidata.type : 0)
        if (this.m_uidata?.type){
            this.top_btns.scrollTo(new Vec2((this.m_uidata.type + 1) / this.btns.length, 0), 0.1)
        }

        if (this._isChange) {
            for (let index = 0; index < this.btns.length; index++) {
                this.btns[index].active = CHARGE_TYPE_TO_PIC[this.m_uidata.dat.type] == index
            }
        }

        this.checkGouBao()

        // 设置标题
        Tools.SetText(this.title, Tools.GetLocalized(this._isChange ? "修改支付账号" : "添加支付账号"))

        // 设置上传图片回调
        //@ts-ignore
        window.webBase64String = (param: any) => {
            Tools.CompressImageToBase64(param, (p: string) => {
                this._base64Img = p
                Tools.SetBase64Pic(p, this.QRcode_up.getChildByName("btn_add"))
            })
        }
    }

    /** 检查购宝绑定状态 */
    checkGouBao(){
        Tools.httpReq('check-binding', null, (res) => {
            this.btn_go_bind.getComponent(Sprite).grayscale = res.is_bound
            this.btn_go_bind.getComponent(Button).enabled = !res.is_bound
            Tools.SetChildText(this.btn_go_bind, "lab", Tools.GetLocalized(res.is_bound ? "已绑定" : "去绑定"))
            Tools.GetChildComp(this.btn_go_bind, "lab", LabelOutline).enabled = !res.is_bound
        })
    }

    /** 点击绑定按钮 */
    onClickBind(){
        Tools.httpReq('fast-bind', null, (res) => {
            window.open(res.url, '_blank')
            UIMgr.getInstance().openView("preLoad/world/MsgBox", 
                { 
                    content : Tools.GetLocalized("如没有自动跳转，请点击下方按钮在浏览器新窗口打开绑定。"), 
                    confirm : ()=>{ Tools.CopyToClipboard(res.url) }, 
                    cancel : ()=>{}, 
                    autoclose : true, 
                    btnSureName : Tools.GetLocalized("复制下载地址") 
                })
        })
    }

    /** 上传图片 */
    btnUploadImgCall() {
        document.getElementById("file").click();
    }

    /** 查询银行列表 */
    reqBankList(){
        Tools.httpReq("bank-list", {}, (data:any) => {
            this.bank_list.destroyAllChildren()
            this._bank_list = data.bank_list
            this._bank_items = []
            for (let i = 0; i < data.bank_list.length; i++) {
                const d = data.bank_list[i]
                this._bank_items[i] = Tools.AddChild(this.bank_list, this.bank_item, "bank_" + i)
                this._bank_items[i].getComponent(Button).clickEvents[0].customEventData = d.name
                Tools.SetChildRichText(this._bank_items[i], "name", d.name)
                Tools.GetChildComp(this._bank_items[i], "icon", UrlImageView).setUrl(d.pic)
                this._bank_items[i].active = true
            }
        })
    }

    /* 显示银行列表 */
    openBankList(){
        this.bank_view.active = !this.bank_view.active
        this.close_bank.active = !this.close_bank.active
        this.open_bank.getChildByPath("arr_btn/arr").eulerAngles = new Vec3(0, 0, this.bank_view.active ? 0 : 90)
    }

    /** 搜索银行 */
    searchBank(evt, param){
        for (let i = 0; i < this._bank_list.length; i++) {
            const element = this._bank_list[i];
            this._bank_items[i].active = param["_string"] == "" || element.name.indexOf(param["_string"]) > -1
            if (element.name.indexOf(param["_string"]) > -1) {
                Tools.SetChildRichText(this._bank_items[i], "name", this.highlightText(element.name, param["_string"], "8cb7fb"))
            } else {
                Tools.SetChildRichText(this._bank_items[i], "name", element.name)
            }
        }
    }

    /** 指定字体高亮 */
    highlightText(text: string, keyword: string, color: string): string {
        return text.replace(keyword, `<color=#${color}>${keyword}</color>`);
    }

    /** 点击选择银行 */
    selectBank(evt, param){
        this.initInputBoxMsg(this.open_bank, param)
        this.openBankList()
    }

    /** 点击顶部按钮 */
    onClickTopBtn(target:cc.EventTouch, customs:number){
        if (this._index == customs) return
        this._index = customs
        this.initInputBox()
        for (let i = 0; i < this.btns.length; i++) {
            Tools.SetSpriteFrame(this.btns[i], "geren_xuanze_di0" + (i == customs ? 1 : 2), "Lobby/ui/geren")
        }
        Tools.SetChildSprite(this.QRcode_up, "btn_add", "geren_tianjia_btn02", "Lobby/ui/geren")
        this._base64Img = null
    }

    /** 根据类型展示输入框 */
    initInputBox(){
        // 重置输入框，如果是修改则填充数据
        this.userName.active = this._index == 0 || this._index == 1 || this._index == 2
        this.initInputBoxMsg(this.userName, this._isChange ? this.m_uidata.dat.account_name : "")
        this.card_id.active = this._index == 0
        this.initInputBoxMsg(this.card_id, this._isChange ? this.m_uidata.dat.account : "")
        this.open_bank.active = this._index == 0
        this.initInputBoxMsg(this.open_bank, this._isChange ? this.m_uidata.dat.bank_name : "")
        this.wx_id.active = this._index == 1
        this.initInputBoxMsg(this.wx_id, this._isChange ? this.m_uidata.dat.account : "")
        this.ali_id.active = this._index == 2
        this.initInputBoxMsg(this.ali_id, this._isChange ? this.m_uidata.dat.account : "")
        this.wallet_adr.active = this._index == 3
        this.initInputBoxMsg(this.wallet_adr, this._isChange ? this.m_uidata.dat.wallet_address : "")
        this.wallet_net.active = this._index == 3
        // 二维码展示
        this.QRcode_up.active = this._index == 1 || this._index == 2 || this._index == 3
        if (this._index == 1 || this._index == 2 || this._index == 3)
        {
            // 暂时不做修改自动展示之前二维码
            // if (this._isChange && CHARGE_TYPE_TO_PIC[this.m_uidata.dat.type] == this._index) {
            //     this._base64Img = this.m_uidata.dat.qr_code
            //     Tools.GetChildComp(this.QRcode_up, "btn_add", UrlImageView).setUrl(this.m_uidata.dat.qr_code)
            // }
            Tools.SetChildText(this.QRcode_up, "lab", Tools.GetLocalized(QSCODE_TIPS[this._index].title))
            Tools.SetChildText(this.QRcode_up, "tips", Tools.GetLocalized(QSCODE_TIPS[this._index].tips))
        }

        this.btn_sure.active = this._index != 4
        this.btn_go_bind.active = this._index == 4
        this.tips_goubao.active = this._index == 4
    }

    /** 初始化输入框 */
    initInputBoxMsg(node:cc.Node, str:string){
        Tools.GetChildComp(node, "EditBox", EditBox).string = str
    }

    /** 获取输入框内容 */
    getInputBoxMsg(node:cc.Node){
        if (node == null) return ""
        return Tools.GetChildComp(node, "EditBox", EditBox).string
    }

    // 确认上传
    btnSureCall () {    
        // 根据是否是修改，选择不同的参数
        var type = INDEX_TO_CHARGE_TYPE[this._index]
        var str = this.getInputBoxMsg(type == 4? this.card_id : (type == 3 ? this.wx_id : (type == 2 ? this.ali_id : null)))
        var param = this._isChange ? {
            bank_name : this.getInputBoxMsg(this.open_bank),
            // 4:银行卡 3:微信 2:支付宝 1:USDT
            account : str,
            account_name : this.getInputBoxMsg(this.userName),
            type : this.m_uidata.dat.type,
            wallet_address : this.getInputBoxMsg(this.wallet_adr),
            qr_code : this._base64Img ? this._base64Img : "",
            id : this.m_uidata.dat.id.toString(),
        } : {
            bank_name : this.getInputBoxMsg(this.open_bank),
            account : str,
            account_name : this.getInputBoxMsg(this.userName),
            type : type,
            wallet_address : this.getInputBoxMsg(this.wallet_adr),
            qr_code : this._base64Img ? this._base64Img : "",
        }
        // 判断必要条件是否存在
        if ((this._index == 0 && (param.bank_name == "" || param.account == "" || param.account_name == ""))||
            ((this._index == 1 || this._index == 2) && (param.account_name == "" || param.account == "" || param.qr_code == "")) ||
            (this._index == 3 && (param.wallet_address == "" || param.qr_code == ""))
        ){
            AlterTipsWrap.show(Tools.GetLocalized("缺少必要信息"))
            return
        }
        var str = this._isChange ? "edit-bank-card" : "add-bank-card"
        Tools.httpReq(str, param, () => {
            AlterTipsWrap.show(this._isChange ? "修改成功" : "添加成功")
            Message.dispatchEvent("AddBankCardSucc")
            this.close()
        })
    }

    btnCloseCall() { this.close() }
}