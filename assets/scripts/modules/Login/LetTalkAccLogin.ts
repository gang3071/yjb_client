import * as cc from 'cc';
import { StoreMgr } from '../../base/core/StoreMgr';
import { UIMgr } from '../../base/core/UIMgr';
import { BaseView } from '../../base/frame/BaseView';
import { LocalizadLabel } from '../../base/localized/LocalizedLabel';
import { AlterTipsWrap } from '../../base/utils/view/AlterTipsWrap';
import { LoadingViewWrap } from '../../base/utils/view/LoadingViewWrap';
import { UIConfig } from '../../config/UIConfig';
import { httpRequest } from '../../NetMgr/HttpRequest';
import { UserInfo } from '../common/UserInfo';
const { ccclass, property } = cc._decorator;

@ccclass('LetTalkAccLogin')
export class LetTalkAccLogin extends BaseView {
    @property(cc.Button)
    btnGetCode:cc.Button = null

    @property(cc.EditBox)
    phoneEditbox:cc.EditBox = null

    @property(cc.EditBox)
    verifyEditbox:cc.EditBox = null

    @property(cc.Node)
    btnSure:cc.Node = null

    private labAcc:string = ""
    private labPwd:string = ""
    private labVerify:string = ""


    private timeFun:any = null

    start() {
        // let acc = StoreMgr.getInstance().getStringValue("Acc","")

        // this.phoneEditbox.string = acc
   

        // this.labAcc = acc


        // this.phoneEditbox.node.parent.getChildByName("btnGetVerifyCode").active = false


        
    }

    onDisable () {
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



    btnGetVerifyCall () {
        if ("" == this.labAcc) {
            AlterTipsWrap.show("请输入手机号")
            return
        }
        httpRequest.post("api/v1/send-code",{
            phone:this.labAcc,
            type:7,
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



    btnLoginCall () {
        if ("" == this.labAcc) {
            AlterTipsWrap.show("请输入手机号")
            return
        }
        if ("" == this.labVerify) {
            AlterTipsWrap.show("请输入验证码")
            return
        }

        httpRequest.post("api/auth/bind-talk-profile",{
            type:"bind",
            userUid:UserInfo.LetTalkData.userUid,
            phone:this.labAcc,
            code:this.labVerify,
            country_code:UserInfo.defaultAreaNum,
            nickname:UserInfo.LetTalkData.nickname,
            avatar:UserInfo.LetTalkData.avatar
        },(succ:any) => {
            UserInfo.authorization = succ.token.access_token
            UserInfo.refreshAuthorization = succ.token.refresh_token

            // UserInfo.authorization = succ.access_token
            // UserInfo.refreshAuthorization = succ.refresh_token
            LoadingViewWrap.show()
            UIMgr.getInstance().openSingleView(UIConfig.Lobby.path)
            this.close()
            UIMgr.getInstance().clearView(UIConfig.LoginBg.path)
        },(fail:any) => {
            
        })

        
        
        // SceneMgr.getInstance().loadRunScene("modules/Lobby#Lobby")
        console.log("==btnLoginCall==",this.labAcc,this.labPwd)
        // this.login()
        // UIMgr.getInstance(UIConfig.lo)
    }

    btnCurrAccRegisterCall () {
        httpRequest.post("api/auth/bind-talk-profile",{
            type:"register",
            userUid:UserInfo.LetTalkData.userUid,
            nickname:UserInfo.LetTalkData.nickname,
            avatar:UserInfo.LetTalkData.avatar,
            talk_phone:UserInfo.LetTalkData.phone,
            talk_country_code:UserInfo.LetTalkData.country_code,
        },(succ:any) => {
            UserInfo.authorization = succ.token.access_token
            UserInfo.refreshAuthorization = succ.token.refresh_token

            // UserInfo.authorization = succ.access_token
            // UserInfo.refreshAuthorization = succ.refresh_token
            LoadingViewWrap.show()
            UIMgr.getInstance().openSingleView(UIConfig.Lobby.path)
            this.close()
            UIMgr.getInstance().clearView(UIConfig.LoginBg.path)
        },(fail:any) => {
            
        })
    }
}


