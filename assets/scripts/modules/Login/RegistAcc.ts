import * as cc from 'cc';
import { StoreMgr } from '../../base/core/StoreMgr';
import { UIMgr } from '../../base/core/UIMgr';
import { BaseView } from '../../base/frame/BaseView';
import { LocalizadLabel } from '../../base/localized/LocalizedLabel';
import { AlterTipsWrap } from '../../base/utils/view/AlterTipsWrap';
import { UIConfig } from '../../config/UIConfig';
import { httpRequest } from '../../NetMgr/HttpRequest';
import { UserInfo } from '../common/UserInfo';
const { ccclass, property } = cc._decorator;

@ccclass('RegistAcc')
export class RegistAcc extends BaseView {

    @property(cc.Button)
    btnGetCode:cc.Button = null

    @property(cc.EditBox)
    promotionEditBox:cc.EditBox = null

    private labPhone:string = ""
    private labVerify:string = ""
    private labpwd:string = ""
    private labSurePwd:string = ""
    private labRecommend:string = ""


    private timeFun:any = null

    start() {
        console.log("------start-------",this.m_uidata)
        if (this.m_uidata && "" != this.m_uidata.value) {
            this.promotionEditBox.string = this.m_uidata.value
            this.labRecommend = this.m_uidata.value
            this.promotionEditBox.enabled = false
        }
        this.labRecommend = UserInfo.promoter_code
        if ("" != this.labRecommend) {
            this.promotionEditBox.string = this.labRecommend
            this.promotionEditBox.enabled = false
        }
    }

    onDisable () {
        if (null != this.timeFun) {
            clearInterval(this.timeFun)
            this.timeFun = null
        }
    }

    phoneEditBoxChangeCall (text:string) {
        this.labPhone = text
    }

    verifyEditBoxChangeCall (text:string) {
        this.labVerify = text
    }

    recommendEditBoxChangeCall (text:string) {
        this.labRecommend = text
    }

    pwdEditBoxChangeCall (text:string) {
        this.labpwd = text
    }

    surePwdEditBoxChangeCall (text:string) {
        this.labSurePwd = text
    }


    btnGetVerifyCall () {
        if ("0" != this.labPhone[0]) {
            AlterTipsWrap.show("手机号格式不正确")
            return
        }
        if ("" == this.labPhone) {
            AlterTipsWrap.show("请输入手机号")
            return
        }
        httpRequest.post("api/v1/send-code",{
            phone:this.labPhone,
            type:2,
            country_code:UserInfo.defaultAreaNum
        },(succ:any) => {
            AlterTipsWrap.show("验证码获取成功")
        },(fail:any) => {
            
        })

        if (null != this.timeFun) {
            clearInterval(this.timeFun)
            this.timeFun = null
        }

        this.btnGetCode.interactable = false
        this.btnGetCode.node.getChildByName("img1").active = false
        this.btnGetCode.node.getChildByName("Layout").active = true
        let labTime = this.btnGetCode.node.getChildByName("Layout").getChildByName("time").getComponent(cc.Label)
        let time = 60
        labTime.string = "60"
        
        this.timeFun = setInterval(() => {
            time -= 1
            labTime.string = time.toString() + ""
            if (Number(time) == 0) {
                labTime.string = "获取验证码"
                if (labTime.getComponent(LocalizadLabel)) {
                    labTime.getComponent(LocalizadLabel).string = "获取验证码"
                }
                this.btnGetCode.interactable = true
                this.btnGetCode.node.getChildByName("img1").active = true
                this.btnGetCode.node.getChildByName("Layout").active = false

                if (null != this.timeFun) {
                    clearInterval(this.timeFun)
                    this.timeFun = null
                }
            }
        }, 1000);
        
    }

    btnRegistCall () {
        if ("" == this.labPhone) {
            AlterTipsWrap.show("请输入手机号")
            return
        }else if ("" == this.labVerify) {
            AlterTipsWrap.show("请输入验证码")
            return
        }else if ("" == this.labpwd) {
            AlterTipsWrap.show("请输入密码")
            return
        }else if ("" == this.labSurePwd) {
            AlterTipsWrap.show("请输入密码")
            return
        // }else if ("" == this.labRecommend) {
        //     AlterTipsWrap.show("请输入推荐码")
        //     return
        }else if (this.labpwd != this.labSurePwd) {
            AlterTipsWrap.show("请输入相同的密码")
            return
        }else if (6 > this.labpwd.length) {
            AlterTipsWrap.show("密码长度最低六位")
            return
        }
        // httpRequest.getWithParams("api/v1/register",{
        //     phone:this.labPhone,
        //     code:this.labVerify,
        //     password:this.labpwd,
        //     re_password:this.labSurePwd,
        //     recommended_code:this.labRecommend,
        //     country_code:"+86"
        // },(succ:any) => {

        // },(fail:any) => {
            
        // })

        httpRequest.post("api/v1/register",{
            phone:this.labPhone,
            code:this.labVerify,
            password:this.labpwd,
            re_password:this.labSurePwd,
            recommended_code:this.labRecommend,
            country_code:UserInfo.defaultAreaNum
        },(succ:any) => {
            StoreMgr.getInstance().setStringValue("Acc",this.labPhone)
            StoreMgr.getInstance().setStringValue("Pwd",this.labpwd)
            this.btnAccLoginCall()
        },(fail:any) => {
            
        })
    }

    btnAccLoginCall () {
        UIMgr.getInstance().openView(UIConfig.AccLogin.path)
        this.close()
    }
}


