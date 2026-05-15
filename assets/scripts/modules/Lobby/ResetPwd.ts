import * as cc from 'cc';
import { Message } from '../../base/core/MessageMgr';
import { StoreMgr } from '../../base/core/StoreMgr';
import { UIMgr } from '../../base/core/UIMgr';
import { BaseView } from '../../base/frame/BaseView';
import { LocalizadLabel } from '../../base/localized/LocalizedLabel';
import { AlterTipsWrap } from '../../base/utils/view/AlterTipsWrap';
import { UIConfig } from '../../config/UIConfig';
import { httpRequest } from '../../NetMgr/HttpRequest';
import { UserInfo } from '../common/UserInfo';
const { ccclass, property } = cc._decorator;

@ccclass('ResetPwd')
export class ResetPwd extends BaseView {
    @property(cc.Button)
    btnGetCode:cc.Button = null

    private labPhone:string = ""
    private labVerify:string = ""
    private labpwd:string = ""
    private labSurePwd:string = ""

    private timeFun:any = null

    start() {
        
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

    pwdEditBoxChangeCall (text:string) {
        this.labpwd = text
    }

    surePwdEditBoxChangeCall (text:string) {
        this.labSurePwd = text
    }

    btnGetVerifyCall () {
        if ("" == this.labPhone) {
            AlterTipsWrap.show("请输入手机号")
            return
        }
        httpRequest.post("api/v1/send-code",{
            phone:this.labPhone,
            type:3,
            country_code:UserInfo.defaultAreaNum
        },(succ:any) => {
            AlterTipsWrap.show("验证码获取成功")
        },(fail:any) => {
            // AlterTipsWrap.show("验证码获取失败")
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

    btnSureCall () {
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
        }else if (this.labpwd != this.labSurePwd) {
            AlterTipsWrap.show("请输入相同的密码")
            return
        }else if (6 > this.labpwd.length) {
            AlterTipsWrap.show("密码长度最低六位")
            return
        }

        httpRequest.post("api/v1/change-password",{
            phone:this.labPhone,
            code:this.labVerify,
            password:this.labpwd,
            re_password:this.labSurePwd,
            country_code:UserInfo.defaultAreaNum
        },(succ:any) => {
            AlterTipsWrap.show("密码修改成功")
            StoreMgr.getInstance().setStringValue("Pwd",this.labpwd)
            this.close()
            Message.dispatchEvent("ResetPwdSucc")
        },(fail:any) => {
        })
    }

    btnLoginCall () {
        this.close()
        UIMgr.getInstance().openView(UIConfig.AccLogin.path)
    }

    btnCloseCall () {
        this.close()
    }

    update(deltaTime: number) {
        
    }
}


