import * as cc from 'cc';
import { Message } from '../../base/core/MessageMgr';
import { BaseView } from '../../base/frame/BaseView';
import { LocalizadLabel } from '../../base/localized/LocalizedLabel';
import { AlterTipsWrap } from '../../base/utils/view/AlterTipsWrap';
import { httpRequest } from '../../NetMgr/HttpRequest';
import { UserInfo } from '../common/UserInfo';
const { ccclass, property } = cc._decorator;

@ccclass('BindPhone')
export class BindPhone extends BaseView {

    @property(cc.Button)
    btnGetCode:cc.Button = null

    @property(cc.Node)
    oriNode:cc.Node = null

    @property(cc.Node)
    bindNode:cc.Node = null

    private labAcc:string = ""
    private labVerify:string = ""

    private timeFun:any = null

    start() {
        if (this.m_uidata && this.m_uidata.bind) {
            this.btnSureCall()
        }
    }

    onDisable() {
        if (null != this.timeFun) {
            clearInterval(this.timeFun)
            this.timeFun = null
        }
    }

    accEditBoxChangeCall (text:string) {
        this.labAcc = text
    }

    verifyEditBoxChangeCall (text:string) {
        this.labVerify = text
    }

    btnBindSureCall () {
        if ("" == this.labAcc) {
            AlterTipsWrap.show("请输入手机号")
            return
        }
        if ("" == this.labVerify) {
            AlterTipsWrap.show("请输入验证码")
            return
        }

        httpRequest.post("api/v1/bind-new-phone",{
            phone:this.labAcc,
            code:this.labVerify,
            country_code:UserInfo.defaultAreaNum,
        },(succ:any) => {
            UserInfo.phone = this.labAcc
            UserInfo.country_code = UserInfo.defaultAreaNum
            AlterTipsWrap.show("绑定成功")
            Message.dispatchEvent("UpdatePhoneSucc")
            this.close()
        },(fail:any) => {
            
        })
    }

    btnCancelCall () {
        this.close()
    }

    btnSureCall () {
        this.oriNode.active = false
        this.bindNode.active = true
    }

    btnGetVerifyCall () {
        if ("" == this.labAcc) {
            AlterTipsWrap.show("请输入手机号")
            return
        }
        httpRequest.post("api/v1/send-code",{
            phone:this.labAcc,
            type:6,
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

    
}


