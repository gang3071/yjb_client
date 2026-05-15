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
import { sys } from 'cc';
import { LINE_ID, LINE_URL, LOGO_TYPE, NOW_SERVER_EREA, SERVER_EREA, SHOW_LOGO } from '../../config/ServerConfig';
import { audioMgr } from '../common/AudioMgr';
import { Tools } from '../../base/utils/util/Tools';

//import CryptoES from 'crypto-es';

const { ccclass, property } = cc._decorator;

@ccclass('AccLogin')
export class AccLogin extends BaseView {

    @property(cc.Button)
    btnGetCode:cc.Button = null

    @property(cc.EditBox)
    phoneEditbox:cc.EditBox = null
    @property(cc.EditBox)
    pwdEditbox:cc.EditBox = null
    @property(cc.EditBox)
    verifyEditbox:cc.EditBox = null

    @property(cc.EditBox)
    invitEditbox:cc.EditBox = null

    @property(cc.Node)
    btnVerifyNode:cc.Node = null

    /** Line登录按钮 */
    @property(cc.Node)
    btnLine:cc.Node = null
    /** logo */
    @property(cc.Node)
    logo_yjb:cc.Node = null
    /** logo */
    @property(cc.Node)
    logo_qql:cc.Node = null
    /** logo */
    @property(cc.Node)
    logo_bl:cc.Node = null
    /** logo */
    @property(cc.Node)
    logo_vip:cc.Node = null
    /** 大背景 */
    @property(cc.Node)
    bg:cc.Node = null


    // @property(cc.Toggle)
    // qiDayCheck:cc.Toggle = null

    @property(cc.Node)
    btnSure:cc.Node = null

    private labAcc:string = ""
    private labPwd:string = ""
    private labVerify:string = ""
    private labInvit:string = ""

    private QiLogin:boolean = false
    private loginType:number = 2

    private timeFun:any = null

    kefuTime = 0

    start() {
        //Line登录按钮不在大陆版本显示
        this.btnLine.active = UserInfo.defaultConfig.line_login_status
        //logo 显示
        this.logo_yjb.active = SHOW_LOGO == LOGO_TYPE.YJB
        this.logo_qql.active = SHOW_LOGO == LOGO_TYPE.QQL
        this.logo_bl.active = SHOW_LOGO == LOGO_TYPE.BL
        this.logo_vip.active = SHOW_LOGO == LOGO_TYPE.VIP
        
        const iframe = document.getElementById('chat-widget-container')
        if (iframe) {
            // iframe.style.width = "10px"
            // iframe.style.height = "10px"
            // iframe.style.removeProperty("position")
        }
        let acc = StoreMgr.getInstance().getStringValue("Acc","")
        let pwd = StoreMgr.getInstance().getStringValue("Pwd","")
        this.phoneEditbox.string = acc
        this.pwdEditbox.string = pwd

        this.labAcc = acc
        this.labPwd = pwd

        this.phoneEditbox.node.parent.getChildByName("btnGetVerifyCode").active = false
        UserInfo.line_group = ""

        let access_token = StoreMgr.getInstance().getStringValue("ACCESS_TOKEN", null)
        let refresh_token = StoreMgr.getInstance().getStringValue("REFRESH_TOKEN", null)
        if (access_token || refresh_token){
            UserInfo.authorization = access_token
            // 测试接口
            httpRequest.post("api/v1/player-info",{},(succ:any) => {
                this.succLogin(access_token, refresh_token)
            },(fail:any) => {
                if (refresh_token == "") return
                UserInfo.authorization = refresh_token
                Tools.httpReq("refresh", null, (succ)=>{
                    this.succLogin(succ.token.access_token, succ.token.refresh_token)
                },()=>{
                    this.bg.active = true
                })
            }) 
        }
        else
        {
            this.bg.active = true
        }
        // let isChecked = StoreMgr.getInstance().getBoolValue("QiDayLogin",false)
        // this.qiDayCheck.isChecked = isChecked
        
        if (UserInfo.promoter_code != "" && UserInfo.need_jump_reg) {
            this.btnRegistAccCall()
            UserInfo.need_jump_reg = false
        }
        UserInfo.closeCommonSocket()
        audioMgr.pauseMusic()
    }

    /** 获取token后直接登录 */
    succLogin(acc : string, ref : string){
        UserInfo.authorization = acc
        UserInfo.refreshAuthorization = ref
        StoreMgr.getInstance().setStringValue("ACCESS_TOKEN", acc)
        StoreMgr.getInstance().setStringValue("REFRESH_TOKEN", ref)
        LoadingViewWrap.show()
        UIMgr.getInstance().openSingleView(UIConfig.Lobby.path)
        this.close()
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

    pwdEditBoxChangeCall (text:string) {
        this.labPwd = text
    }

    verifyEditBoxChangeCall (text:string) {
        this.labVerify = text
    }

    invitEditBoxChangeCall (text:string) {
        this.labInvit = text
    }

    btnSelectVerifyCall () {
        if (!this.verifyEditbox.node.parent.active) {
            this.loginType = 1
            this.pwdEditbox.node.parent.active = false
            this.verifyEditbox.node.parent.active = true
            // this.btnVerifyNode.active = true
            this.btnVerifyNode.getComponent(cc.Label).string = "切换密码登录"
            if (this.btnVerifyNode.getComponent(LocalizadLabel)) {
                this.btnVerifyNode.getComponent(LocalizadLabel).string = "切换密码登录"
            }

            this.phoneEditbox.node.parent.getChildByName("btnGetVerifyCode").active = true
            this.btnGetCode.interactable = true
            this.btnGetCode.node.getChildByName("img1").active = true
            this.btnGetCode.node.getChildByName("Layout").active = false
            if (null != this.timeFun) {
                clearInterval(this.timeFun)
                this.timeFun = null
            }
        }else {
            this.loginType = 2
            this.pwdEditbox.node.parent.active = true
            this.verifyEditbox.node.parent.active = false
            // this.btnVerifyNode.active = false
            this.btnVerifyNode.getComponent(cc.Label).string = "切换验证码登录"
            if (this.btnVerifyNode.getComponent(LocalizadLabel)) {
                this.btnVerifyNode.getComponent(LocalizadLabel).string = "切换验证码登录"
            }

            this.phoneEditbox.node.parent.getChildByName("btnGetVerifyCode").active = false
        }
    }

    btnRegistAccCall () {
        LoadingViewWrap.show()
        UIMgr.getInstance().openSingleView(UIConfig.RegistAcc.path,{value:UserInfo.promoter_code})
        this.close()
    }

    btnForgetPwdCall () {
        LoadingViewWrap.show()
        UIMgr.getInstance().openSingleView(UIConfig.ForgetPwd.path)
        this.close()
    }

    btnGetVerifyCall () {
        httpRequest.post("api/v1/send-code",{
            phone:this.labAcc,
            type:1,
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

    setQiRiLoginCall (toggle:cc.EventTouch) {
        let target = toggle.currentTarget
        let isChecked = target.getComponent(cc.Toggle).isChecked
        if (target.getComponent(cc.Toggle).isChecked) {
            StoreMgr.getInstance().setBoolValue("QiDayLogin",false)
        }else {
            StoreMgr.getInstance().setBoolValue("QiDayLogin",true)
        }
        console.log("=====",target.getComponent(cc.Toggle).isChecked)
    }

    btnLoginCall () {

        

        
        // window.Tawk_API.showWidget();
        
        // console.log("----------",window.Tawk_API,CryptoES)

        // window.Tawk_API.start({
        //     showWidget : true
        // });

        // return
        // utils.setOrientation("H")
        // var d1=document.getElementById("d1");
        
        let arr = []
        let arr1 = {}
        // UIMgr.getInstance().openSingleView(UIConfig.PrizeSmallGame.path,{flag:1})
        
        // let str1 = "恭喜你获得固定彩金jp4，点击\n\n确定进入小游戏领取奖励"
        // MsgBoxWrap.showConfirmCancel(str1,() => {

        // },null)
        // return
        if ("" == this.labAcc) {
            AlterTipsWrap.show("请输入手机号")
            return
        }

        if (2 == this.loginType) {
            if ("" == this.labPwd) {
                AlterTipsWrap.show("请输入密码")
                return
            }else if (6 > this.labPwd.length) {
                AlterTipsWrap.show("密码长度最低六位")
                return
            }
        }else {
            if ("" == this.labVerify) {
                AlterTipsWrap.show("请输入验证码")
                return
            }
        }

        httpRequest.post("api/v1/login",{
            phone:this.labAcc,
            password:this.labPwd,
            code:this.labVerify,
            login_type:this.loginType,
            country_code:UserInfo.defaultAreaNum
        },(succ:any) => {
            UserInfo.activityReward = succ.player_activity_phase

            this.succLogin(succ.token.access_token, succ.token.refresh_token)

            // UserInfo.authorization = succ.access_token
            // UserInfo.refreshAuthorization = succ.refresh_token
            StoreMgr.getInstance().setStringValue("Acc",this.labAcc)
            StoreMgr.getInstance().setStringValue("Pwd",this.labPwd)
        },(fail:any) => {
            
        })

        
        
        // SceneMgr.getInstance().loadRunScene("modules/Lobby#Lobby")
        console.log("==btnLoginCall==",this.labAcc,this.labPwd)
        // this.login()
        // UIMgr.getInstance(UIConfig.lo)
    }



    login () {
        // return new Promise<void>((resolve, reject) => {
        //     httpRequest.getWithParams("login",{account:this.labAcc,password:this.labPwd,sign:UserInfo.sign},(succ:any) => {
        //         console.log("=login=succ==",succ)
        //         // UserInfo.sign = succ.sign
        //         // httpRequest.setUrl(succ.halladdr)
        //         UserInfo.setInfo(succ)
        //         SceneMgr.getInstance().loadRunScene("modules/Lobby#Lobby")
        //         resolve()
        //     },(fail:any) => {
        //         console.log("=login=fail==")
        //         reject()
        //     })
        // })
        
    }

    btnKeFuCall () {
        UserInfo.getKeFuLink(360,748)
    }

    btnLineCall () {
        let lineConfig:any = {
            response_type: 'code',
            client_id: LINE_ID ,
            redirect_uri: encodeURIComponent(LINE_URL),
            scope: 'profile openid',
        }

        console.log(`---code = ${UserInfo.lineCode}`)
        if ("" == UserInfo.lineCode) {
            const state = Math.random().toString(36).substring(2)
            const params = {
                    ...lineConfig,
                    state,
            }
            // uni.setStorageSync('_state',state)
            let p = this.getParamString(params)
            console.log("==btnLineCall==",p)
            if (sys.browserType == "safari") {
                window.location.href = `https://access.line.me/oauth2/v2.1/authorize?${p}`
            }else {
                sys.openURL(`https://access.line.me/oauth2/v2.1/authorize?${p}`)
            }
        }else {
            httpRequest.post("api/v1/line-login",{
                code:UserInfo.lineCode,
            },(succ:any) => {
                
            },(fail:any) => {
                
            })
        }
    }

    private getParamString(params: any) {
        var result = "";
        for (var name in params) {
            let data = params[name];
            if (data instanceof Object) {
                for (var key in data)
                    result += `${key}=${data[key]}&`;
            }
            else {
                result += `${name}=${data}&`;
            }
        }

        return result.substring(0, result.length - 1);
    }

    public update(dt: number): void {
        // this.kefuTime += dt
        // if (this.kefuTime > 0.3) {
        //     this.kefuTime = 0
        //     const iframe = document.getElementById('chat-widget-container')
        //     if (iframe) {
        //         iframe.style.width = "10px"
        //         iframe.style.height = "10px"
        //     }
        // }
    }
}


