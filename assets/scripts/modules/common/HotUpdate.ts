import * as cc from 'cc';
import { BaseView } from '../../base/frame/BaseView';
import { UIMgr } from '../../base/core/UIMgr';
import { UIConfig } from '../../config/UIConfig';
import {StoreMgr} from "../../base/core/StoreMgr"
import { UserInfo } from './UserInfo';
import { httpRequest } from '../../NetMgr/HttpRequest';
import { LocalizadLabel } from '../../base/localized/LocalizedLabel';
import { LabelConfig } from '../../config/LabelConfig';
import { LocalizadManager } from '../../base/localized/LocalizedManager';
import { AlterTipsWrap } from '../../base/utils/view/AlterTipsWrap';
const { ccclass, property } = cc._decorator;

const preloadPrefab:string[] = [
    // UIConfig.LoginBg.path,
    // UIConfig.AccLogin.path,
    // UIConfig.RegistAcc.path,
    // UIConfig.ForgetPwd.path,
    // UIConfig.PrizePoolFixReward.path,
    UIConfig.Lobby.path,
    // UIConfig.SelectMachine.path,
    // UIConfig.UserData.path,
]

@ccclass('HotUpdate')
export class HotUpdate extends BaseView {
    @property(cc.ProgressBar)
    m_loadingBar:cc.ProgressBar = null

    @property(cc.Label)
    m_lblProcessDesc:cc.Label = null

    @property(cc.Label)
    m_lblProcess:cc.Label = null

    start() {
        this.checkUpdate()
    }

    checkUpdate () {
        this.m_lblProcessDesc.node.active = true
        this.m_lblProcessDesc.string = "正在检查更新"
        if (this.m_lblProcessDesc.getComponent(LocalizadLabel)) {
            this.m_lblProcessDesc.getComponent(LocalizadLabel).string = "正在检查更新"
        }

        let str = window.location.search.slice(1)
            
        const pairs = str.split('&');
        const params: { [key: string]: string } = {};
        pairs.forEach(pair => {
            const [key, value] = pair.split('=');
            params[decodeURIComponent(key)] = decodeURIComponent(value || '');
        });
        UserInfo.promoter_code = params.promoter_code || ""
        UserInfo.lineCode = params.code || ""
        UserInfo.lineState = params.state
        console.log("---hotUpdate----",params)
        if ("" != UserInfo.promoter_code) {
            StoreMgr.getInstance().setStringValue("PromoterCode",UserInfo.promoter_code)
        }
        let tempLineCode = StoreMgr.getInstance().getStringValue("LineCode","")
        if ("" == UserInfo.lineCode || UserInfo.lineCode == tempLineCode) {
            UserInfo.lineCode = ""
            // this.scheduleOnce(() => {
                this.preloadRes()
            // },0.5)
        }else {
            httpRequest.post("api/v1/line-login",{
                code:UserInfo.lineCode,
            },(succ:any) => {
                // UIMgr.getInstance().openSingleView(UIConfig.LoginBg.path,null,UIConfig.LoginBg.zIndex)
                // UIMgr.getInstance().openSingleView(UIConfig.AccLogin.path,null,UIConfig.AccLogin.zIndex)
                UserInfo.activityReward = succ.player_activity_phase
                UserInfo.authorization = succ.token.access_token
                UserInfo.refreshAuthorization = succ.token.refresh_token

                // UserInfo.authorization = succ.access_token
                // UserInfo.refreshAuthorization = succ.refresh_token
                UIMgr.getInstance().openSingleView(UIConfig.Lobby.path)
                this.close()
            })
        }
        
    }

    preloadRes(){
        this.m_lblProcessDesc.node.active = true
        this.m_loadingBar.node.active = true
        this.m_loadingBar.progress = 0;
        this.m_lblProcessDesc.string = LabelConfig["资源加载中"][LocalizadManager.getInstance().getLanauge()-1]
        // if (this.m_lblProcessDesc.getComponent(LocalizadLabel)) {
        //     this.m_lblProcessDesc.getComponent(LocalizadLabel).string = "加载资源中"
        // }
        this.m_lblProcess.string = "0%"

        this.m_resLoader.loadArray(preloadPrefab, ( error: Error | null, assets: cc.Asset | cc.Asset[] | null | any )=>{
            console.log("----------url--------",window.location.search)
            
            if ("" != UserInfo.lineCode) {
                httpRequest.post("api/v1/line-login",{
                    code:UserInfo.lineCode,
                },(succ:any) => {
                    // UIMgr.getInstance().openSingleView(UIConfig.LoginBg.path,null,UIConfig.LoginBg.zIndex)
                    // UIMgr.getInstance().openSingleView(UIConfig.AccLogin.path,null,UIConfig.AccLogin.zIndex)
                    UserInfo.activityReward = succ.player_activity_phase
                    UserInfo.authorization = succ.token.access_token
                    UserInfo.refreshAuthorization = succ.token.refresh_token

                    // UserInfo.authorization = succ.access_token
                    // UserInfo.refreshAuthorization = succ.refresh_token
                    UIMgr.getInstance().openSingleView(UIConfig.Lobby.path)
                    this.close()
                },(fail:any) => {
                    
                })
            }else {
                // 防止加载顺序错误
                UIMgr.getInstance().openSingleView(UIConfig.LoginBg.path,null,UIConfig.LoginBg.zIndex, null, ()=>{
                    UIMgr.getInstance().openSingleView(UIConfig.AccLogin.path,null,UIConfig.AccLogin.zIndex)
                })
                // UIMgr.getInstance().openSingleView(UIConfig.RegistAcc.path,{value:""},UIConfig.RegistAcc.zIndex)
            }
            
            // UserInfo.isPhoneAppLogin = arr2[1]
            // if (null == arr2[1] || "promoter_code" == arr2[0]) {
            //     UIMgr.getInstance().openSingleView(UIConfig.LoginBg.path,null,UIConfig.LoginBg.zIndex)
            //     if ("" == StoreMgr.getInstance().getStringValue("Acc","") || "promoter_code" == arr2[0]) {
            //         if (StoreMgr.getInstance().getBoolValue("QiDayLogin",false)) {
            //             UIMgr.getInstance().openSingleView(UIConfig.Lobby.path)
            //         }else {
            //             UserInfo.promoter_code = arr2[1]
            //             UIMgr.getInstance().openSingleView(UIConfig.RegistAcc.path,{value:arr2[1] || ""},UIConfig.RegistAcc.zIndex)
            //         }
                    
            //     }else {
            //         UIMgr.getInstance().openSingleView(UIConfig.AccLogin.path,null,UIConfig.AccLogin.zIndex)
            //     }
            // }else {
            //     UserInfo.authorizeCode = Number(decodeURIComponent(arr2[1]))
            //     UserInfo.authorizeKey = decodeURIComponent(arr2[0])
            //     httpRequest.post("api/auth/get-talk-profile",{authorizeCode:UserInfo.authorizeCode},(succ:any) => {
            //         if (null != succ.token.access_token) {
            //             UserInfo.authorization = succ.token.access_token
            //             UserInfo.refreshAuthorization = succ.token.refresh_token

            //             // UserInfo.authorization = succ.access_token
            //             // UserInfo.refreshAuthorization = succ.refresh_token

            //             UIMgr.getInstance().openSingleView(UIConfig.Lobby.path)
            //         }else {
            //             // UserInfo.LetTalkData.userUid = succ.userUid
            //             // UserInfo.LetTalkData.nickname = succ.nickname
            //             // UserInfo.LetTalkData.avatar = succ.avatar
            //             // UserInfo.LetTalkData.phone = succ.phone
            //             // UserInfo.LetTalkData.country_code = succ.country_code
            //             // UIMgr.getInstance().openSingleView(UIConfig.LoginBg.path,null,null,null,() => {
            //             //     UIMgr.getInstance().openSingleView(UIConfig.LetTalkAccLogin.path,null,UIConfig.LetTalkAccLogin.zIndex)
            //             // })
            //         }
            //     })
            // }
            this.close()
        },(percent:number) => {
            this.m_loadingBar.progress = percent;
            this.m_lblProcess.string = `${Math.floor(percent*1000)/10}%`
        })
        
    }
}


