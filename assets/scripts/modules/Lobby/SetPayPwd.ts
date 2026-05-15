import * as cc from 'cc';
import { Message } from '../../base/core/MessageMgr';
import { BaseView } from '../../base/frame/BaseView';
import { LocalizadLabel } from '../../base/localized/LocalizedLabel';
import { AlterTipsWrap } from '../../base/utils/view/AlterTipsWrap';
import { httpRequest } from '../../NetMgr/HttpRequest';
import { UserInfo } from '../common/UserInfo';
const { ccclass, property } = cc._decorator;

@ccclass('SetPayPwd')
export class SetPayPwd extends BaseView {

    private labPwd:string = ""
    private sureLabPwd:string = ""
    private labVerify:string = ""

    @property(cc.Button)
    btnGetCode:cc.Button = null

    @property(cc.Node)
    node1:cc.Node = null

    @property(cc.Node)
    node2:cc.Node = null

    @property(cc.Label)
    labPhone:cc.Label = null

    @property([cc.Sprite])
    labPwdArr:cc.Sprite[] = []

    private inputNum:string = ""
    private pwdNumLen:number = 6

    private timeFun:any = null

    private inputPwdNums:number = 0

    start() {
        this.labPhone.string = "+" + UserInfo.country_code + "  " +UserInfo.phone
    }

    onDisable() {
        if (null != this.timeFun) {
            clearInterval(this.timeFun)
            this.timeFun = null
        }
    }

    btnNextCall () {
        if ("" == this.labVerify) {
            AlterTipsWrap.show("请输入验证码")
            return
        }
        httpRequest.post("api/v1/check-phone-code",
            {type:4,code:this.labVerify},
        (succ:any) => {
            this.node1.active = false
            this.node2.active = true
        },(fail:any) => {

        })
        
    }



    verifyEditBoxChangeCall (text:string) {
        this.labVerify = text
    }


    setSixNum (target:cc.Button,customs:string) {
        if (12 == this.inputPwdNums) {return}
        this.labPwd += customs
        
        this.inputPwdNums += 1
        this.labPwdArr[this.inputPwdNums -1].node.active = true
    }

    btnDeleteCall () {
        if (0 == this.inputPwdNums) {return}
        this.labPwd = this.labPwd.slice(0,this.labPwd.length-1)
        
        this.inputPwdNums -= 1
        this.labPwdArr[this.inputPwdNums].node.active = false
    }

    btnSureCall () {
        
        if ("" == this.labVerify) {
            AlterTipsWrap.show("请输入验证码")
            return
        }

        if (0 == this.labPwd.length) {
            AlterTipsWrap.show("请输入密码")
            return
        }

        let pwd1 = ""
        let pwd2 = ""
        if (0 < this.labPwd.length) {
            pwd1 = this.labPwd.slice(0,6)
            pwd2 = this.labPwd.slice(6)
        }

        
        if (pwd1 != pwd2) {
            AlterTipsWrap.show("请输入相同的密码")
            return
        }
        httpRequest.post("api/v1/change-play-password",{
            code:this.labVerify,
            play_password:pwd1,
            re_play_password:pwd2,
        },(succ:any) => {
            UserInfo.has_set_play_password = true
            Message.dispatchEvent("SetPayPwdSucc")
            AlterTipsWrap.show("设置成功")
            this.close()
        },(fail:any) => {
            
        })
    }

    btnGetVerifyCall () {
        if (UserInfo.phone == "") {
            AlterTipsWrap.show("请绑定手机号")
            return
        }
        httpRequest.post("api/v1/player-send-code",{
            type:4,
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

    btnNumCall (target:cc.Button,customs:string) {
        console.log("===btnNumCall==",target,customs)
        
        
        // if ("0" == customs && "0" == this.labFen.string[0]) {
        //     this.labFen.string = "0"
        //     return
        // }

        // if ("0" != customs && "0" == this.labFen.string) {
        //     this.labFen.string = customs
        //     return
        // }
        
        // this.labFen.string = this.labFen.string + customs
        
    }


    btnCloseCall () {
        this.close()
    }

}


