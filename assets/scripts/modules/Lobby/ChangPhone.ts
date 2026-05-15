import * as cc from 'cc';
import { Message } from '../../base/core/MessageMgr';
import { BaseView } from '../../base/frame/BaseView';
import { AlterTipsWrap } from '../../base/utils/view/AlterTipsWrap';
import { httpRequest } from '../../NetMgr/HttpRequest';
import { UserInfo } from '../common/UserInfo';
const { ccclass, property } = cc._decorator;

@ccclass('ChangPhone')
export class ChangPhone extends BaseView {

    @property(cc.Button)
    btnGetCode:cc.Button = null

    @property(cc.Button)
    btnGetCode2:cc.Button = null


    @property(cc.Label)
    labPhone:cc.Label = null

    @property(cc.Node)
    newPhoneNode:cc.Node = null

    @property(cc.Node)
    node1:cc.Node = null

    @property(cc.Node)
    node2:cc.Node = null

    private timeFun:any = null
    private timeFun2:any = null
    private labNewPhone:string = ""

    private labVerify:string = ""
    private labVerify2:string = ""


    start() {
        this.initData()
    }

    onDisable() {
        if (null != this.timeFun) {
            clearInterval(this.timeFun)
            this.timeFun = null
        }
        if (null != this.timeFun2) {
            clearInterval(this.timeFun2)
            this.timeFun2 = null
        }
    }

    initData() {
        this.labPhone.string = "+" + UserInfo.country_code + "  " + UserInfo.phone
    }

    phoneEditBoxChangeCall (text:string) {
        this.labNewPhone = text
    }

    verifyEditBoxChangeCall (text:string) {
        this.labVerify = text
    }

    verifyEditBoxChangeCall2 (text:string) {
        this.labVerify2 = text
    }

    btnGetVerifyCall () {
        httpRequest.post("api/v1/player-send-code",{
            type:5,
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
                labTime.string = "0"
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

    btnGetVerifyCall2 () {
        if ("" == this.labNewPhone) {
            AlterTipsWrap.show("请输入手机号")
            return
        }
        httpRequest.post("api/v1/send-code",{
            phone:this.labNewPhone,
            type:6,
            country_code:UserInfo.defaultAreaNum
        },(succ:any) => {
            AlterTipsWrap.show("验证码获取成功")
        },(fail:any) => {
            // AlterTipsWrap.show("验证码获取失败")
        })


        console.log("bususu")

        if (null != this.timeFun2) {
            clearInterval(this.timeFun2)
            this.timeFun2 = null
        }

        this.btnGetCode2.interactable = false
        this.btnGetCode2.node.getChildByName("img1").active = false
        this.btnGetCode2.node.getChildByName("Layout").active = true
        let labTime = this.btnGetCode2.node.getChildByName("Layout").getChildByName("time").getComponent(cc.Label)
        let time = 60
        labTime.string = "60"
        
        this.timeFun2 = setInterval(() => {
            time -= 1
            labTime.string = time.toString() + ""
            if (Number(time) == 0) {
                labTime.string = "0"
                this.btnGetCode2.interactable = true
                this.btnGetCode2.node.getChildByName("img1").active = true
                this.btnGetCode2.node.getChildByName("Layout").active = false

                if (null != this.timeFun2) {
                    clearInterval(this.timeFun2)
                    this.timeFun2 = null
                }
            }
        }, 1000);
    }

    btnNextCall() {
        if ("" == this.labVerify) {
            AlterTipsWrap.show("请输入验证码")
            return
        }
        httpRequest.post("api/v1/check-phone-code",
            {type:5,code:this.labVerify},
        (succ:any) => {
            this.node1.active = false
            this.node2.active = true
        },(fail:any) => {

        })
        
    }

    btnSureCall() {
        if ("" == this.labNewPhone) {
            AlterTipsWrap.show("请输入手机号")
            return
        }
        if ("" == this.labVerify) {
            AlterTipsWrap.show("请输入验证码")
            return
        }

        httpRequest.post("api/v1/bind-new-phone",
            {phone:this.labNewPhone,code:this.labVerify2,country_code:UserInfo.defaultAreaNum},
        (succ:any) => {
            AlterTipsWrap.show("修改成功")
            UserInfo.phone = this.labNewPhone
            Message.dispatchEvent("UpdatePhoneSucc")
            this.close()
        },(fail:any) => {

        })
    }

    btnCloseCall() {
        this.close()
    }
}


