import * as cc from 'cc';
import { Message } from '../../base/core/MessageMgr';
import { UIMgr } from '../../base/core/UIMgr';
import { BaseView } from '../../base/frame/BaseView';
import { UrlImageView } from '../../base/gui/urlImageView';
import { LocalizadManager } from '../../base/localized/LocalizedManager';
import { utils } from '../../base/utils/utils';
import { AlterTipsWrap } from '../../base/utils/view/AlterTipsWrap';
import { LoadingViewWrap } from '../../base/utils/view/LoadingViewWrap';
import { LabelConfig } from '../../config/LabelConfig';
import { UIConfig } from '../../config/UIConfig';
import { UserInfo } from '../common/UserInfo';
import { SERVER_LIST } from '../../config/ServerConfig';
import { getCurEnv } from '../../config/Env';
import { Tools } from '../../base/utils/util/Tools';
import { StoreMgr } from '../../base/core/StoreMgr';
const { ccclass, property } = cc._decorator;

@ccclass('UserDataInfoNode')
export class UserDataInfoNode extends BaseView {

    @property(cc.Label)
    labName:cc.Label = null

    @property(cc.Label)
    labUid:cc.Label = null

    @property(cc.Label)
    labDianShu:cc.Label = null

    @property(cc.Label)
    labPhone:cc.Label = null

    @property(cc.Label)
    labRecommend:cc.Label = null

    @property(cc.Label)
    labPwd:cc.Label = null

    @property(cc.Button)
    btnTiXian:cc.Button = null

    @property(cc.Button)
    btnZhuanDian:cc.Button = null

    @property(cc.Node)
    btnYhk:cc.Node = null

    @property(cc.Node)
    btnPromotion:cc.Node = null

    @property(cc.Sprite)
    imgAvatar:cc.Sprite = null

    @property(cc.Button)
    btnBindPhone:cc.Button = null

    @property(cc.Button)
    btnZhuanDianPwd:cc.Button = null
    /** vip图标 */
    @property(cc.Node)
    vipIcon:cc.Node = null
    /** vip等级 */
    @property(cc.Label)
    labVipLevel:cc.Label = null
    /** 用户等级 */
    @property(cc.Node)
    itemUserLv:cc.Node = null


    start() {
        this.initEventListen()
        this.initData()
    }

    onDisable() {
        this.cancelEventListen()
    }

    initEventListen () {
        Message.on("SetPayPwdSucc",this.setPayPwdSucc,this)
        Message.on("UpdatePhoneSucc",this.updatePhoneSucc,this)
        Message.on("UpdateMoney",this.updateMoney,this)
        Message.on("ChangeNameSucc",this.changeNameSucc,this)
        Message.on("ChangeAvatarSucc",this.changeAvatarSucc,this)
        Message.on("ResetPwdSucc",this.resetPwdSucc,this)
    }
    
    cancelEventListen () {
        Message.off("SetPayPwdSucc",this.setPayPwdSucc,this)
        Message.off("UpdatePhoneSucc",this.updatePhoneSucc,this)
        Message.off("UpdateMoney",this.updateMoney,this)
        Message.off("ChangeNameSucc",this.changeNameSucc,this)
        Message.off("ChangeAvatarSucc",this.changeAvatarSucc,this)
        Message.off("ResetPwdSucc",this.resetPwdSucc,this)
    }

    initData () {
        // VIP等级显示
        if (UserInfo.national_promoter != "" && UserInfo.national_level != ""){
            Tools.SetAgentLvIcon(this.vipIcon, UserInfo.national_promoter, Number(UserInfo.national_level))
            this.labVipLevel.string = Tools.GetAgentLvLocalized(UserInfo.national_promoter, Number(UserInfo.national_level))
        }
        // 代理不显示等级
        this.itemUserLv.active = UserInfo.national_promoter != "" && UserInfo.national_level != ""
        // 支付管理显示
        this.btnYhk.active = UserInfo.defaultConfig.withdraw_status && UserInfo.switch_shop == 1
        
        this.btnTiXian.node.active = UserInfo.defaultConfig.withdraw_status && UserInfo.switch_shop == 1
        // if (UserInfo.defaultConfig.coin_status) {
        //     this.btnZhuanDian.node.active = true
        // }
        this.btnZhuanDian.node.active = UserInfo.defaultConfig.coin_status
        if (UserInfo.defaultConfig.coin_status || UserInfo.defaultConfig.withdraw_status) {
            this.labPwd.node.parent.active = true
        }else {
            this.labPwd.node.parent.active = false
        }
        
        if (1 == UserInfo.defaultConfig.promotion_status && UserInfo.is_promoter) {
            this.btnPromotion.active = true
        }

        this.labName.string = utils.sliceStr(UserInfo.cname)
        this.labUid.string = UserInfo.uuid
        this.labDianShu.string = UserInfo.wallet_list.money
        if ("" == UserInfo.phone) {
            this.labPhone.string = ""
            this.btnBindPhone.node.getChildByName("img1").active = false
            this.btnBindPhone.node.getChildByName("img2").active = true
        }else {
            this.labPhone.string = "+" + UserInfo.country_code + "  " + UserInfo.phone
            this.btnBindPhone.node.getChildByName("img1").active = true
            this.btnBindPhone.node.getChildByName("img2").active = false
        }
        this.labRecommend.string = utils.sliceStr(UserInfo.recommend_player_uuid) 
        if (UserInfo.has_set_play_password) {
            this.labPwd.string = LabelConfig["已设置"] ? LabelConfig["已设置"][LocalizadManager.getInstance().getLanauge()-1]:"已设置"
        }else {
            this.labPwd.string = LabelConfig["未设置"] ? LabelConfig["未设置"][LocalizadManager.getInstance().getLanauge()-1]:"未设置"
        }

        if ("" != UserInfo.avatar) {
            if (UserInfo.avatar.indexOf("http") !== -1) {
                this.imgAvatar.getComponent(UrlImageView).setUrl(UserInfo.avatar)
            }else {
                this.imgAvatar.getComponent(UrlImageView).setUrl(SERVER_LIST[getCurEnv()]+UserInfo.avatar)
            }
        }
    }

    resetPwdSucc () {

    }

    changeAvatarSucc () {
        if ("" == UserInfo.avatar) {return}
        if (UserInfo.avatar.indexOf("http") !== -1) {
            this.imgAvatar.getComponent(UrlImageView).setUrl(UserInfo.avatar)
        }else {
            this.imgAvatar.getComponent(UrlImageView).setUrl(SERVER_LIST[getCurEnv()]+UserInfo.avatar)
        }
    }

    changeNameSucc () {
        this.labName.string = utils.sliceStr(UserInfo.cname) 
    }

    updateMoney () {
        this.labDianShu.string = UserInfo.wallet_list.money
    }

    updatePhoneSucc () {
        this.labPhone.string = "+" + UserInfo.country_code + "  " + UserInfo.phone
        this.btnBindPhone.node.getChildByName("img1").active = true
        this.btnBindPhone.node.getChildByName("img2").active = false
    }

    setPayPwdSucc () {
        this.labPwd.string = LabelConfig["已设置"] ? LabelConfig["已设置"][LocalizadManager.getInstance().getLanauge()-1]:"已设置"
    }

    btnChangeNameCall () {
        console.log("btnChangeNameCall")
        // LoadingViewWrap.show()
        UIMgr.getInstance().openSingleView(UIConfig.ChangeName.path)
    }

    btnChangeAvatarCall () {
        // LoadingViewWrap.show()
        UIMgr.getInstance().openSingleView(UIConfig.ChangeAvatar.path)
    }

    btnBankCardMgrCall () {
        // LoadingViewWrap.show()
        UIMgr.getInstance().openSingleView(UIConfig.BankCardMgr.path)
    }


    btnSetPayPwdCall () {
        if ("" == UserInfo.phone) {
            AlterTipsWrap.show("请绑定手机号")
            return
        }
        // LoadingViewWrap.show()
        UIMgr.getInstance().openSingleView(UIConfig.SetPayPwd.path)
    }

    btnResetPwdCall () {
        // LoadingViewWrap.show()
        UIMgr.getInstance().openSingleView(UIConfig.ResetPwd.path)
    }
    
    btnExitLoginCall () {
        // let str = window.location.search.slice(1)
        // let arr2 = str.split("=")
        // console.log("-------",decodeURIComponent(arr2[1]))
        // if (null != arr2[1]) {
        //     UserInfo.finish()
        //     return
        // }
        UIMgr.getInstance().closeAll()
        // LoadingViewWrap.show()
        UIMgr.getInstance().openSingleView(UIConfig.LoginBg.path,null,UIConfig.LoginBg.zIndex,null,()=>{
            UIMgr.getInstance().openSingleView(UIConfig.AccLogin.path,null,UIConfig.AccLogin.zIndex)
        })

        // 登出清理token
        StoreMgr.getInstance().setStringValue("ACCESS_TOKEN", "")
        StoreMgr.getInstance().setStringValue("REFRESH_TOKEN", "")
    }

    btnPromotionCall () {
        // LoadingViewWrap.show()
        UIMgr.getInstance().openSingleView(UIConfig.CheckPwd.path)
    }

    btnXiuGaiCall () {
        if ("" == UserInfo.phone) {
            // AlterTipsWrap.show("请绑定手机号")
            LoadingViewWrap.show()
            UIMgr.getInstance().openSingleView(UIConfig.BindPhone.path,{bind:true})
            return
        }
        // LoadingViewWrap.show()
        UIMgr.getInstance().openSingleView(UIConfig.ChangePhone.path)
    }

    btnZhuanDianCall () {
        if (!UserInfo.has_set_play_password) {
            AlterTipsWrap.show("请设置支付密码")
            return
        }
        // LoadingViewWrap.show()
        UIMgr.getInstance().openSingleView(UIConfig.ZhuanDian.path)
    }

    btnTiXianCall () {
        if (!UserInfo.has_set_play_password) {
            AlterTipsWrap.show("请设置支付密码")
            return
        }
        Tools.httpReq("check-bind-bankcard", null, (res) => {
            UIMgr.getInstance().openSingleView(UIConfig.TakeMoney.path)
        }, (res)=>{
            AlterTipsWrap.show("请先绑定银行卡")
        })
        // LoadingViewWrap.show()
    }

    /** VIP详情按钮 */
    btnVipMsgCall () {
        UIMgr.getInstance().openSingleView(UIConfig.PopAccLv.path)
    }

    btnCopyCall () {
        let str = this.labUid.string
        var input = str + '';
        const el = document.createElement('textarea');
        el.value = input;
        el.setAttribute('readonly', '');
        el.style.contain = 'strict';
        el.style.position = 'absolute';
        el.style.left = '-9999px';
        el.style.fontSize = '12pt'; // Prevent zooming on iOS
    
        const selection = getSelection();
        var originalRange = null;
        if (selection.rangeCount > 0) {
            originalRange = selection.getRangeAt(0);
        }
        document.body.appendChild(el);
        el.select();
        el.selectionStart = 0;
        el.selectionEnd = input.length;
    
        var success = false;
        try {
            success = document.execCommand('copy');
        } catch (err) {}
    
        document.body.removeChild(el);
    
        if (originalRange) {
            selection.removeAllRanges();
            selection.addRange(originalRange);
        }
        AlterTipsWrap.show("复制成功")
        return success;
    }
}


