import * as cc from 'cc';
import { ResLoader } from '../../base/core/ResLoader';
import { SceneMgr } from '../../base/core/SceneMgr';
import { StoreMgr } from '../../base/core/StoreMgr';
import { UIMgr } from '../../base/core/UIMgr';

import { EventDispatcher, EventListener, EventType, ListenerFunc } from '../../base/frame/EventDispatcher';
import { LANGUAGE_DEFAULT, LocalizadManager } from '../../base/localized/LocalizedManager';
import { utils } from '../../base/utils/utils';
import { ENV, setCurEnv } from '../../config/Env';
import { UIConfig } from '../../config/UIConfig';
import { httpRequest } from '../../NetMgr/HttpRequest';
import { UserInfo } from './UserInfo';
import { LoadingViewWrap } from '../../base/utils/view/LoadingViewWrap';


const { ccclass, property, requireComponent } = cc._decorator;

export const enum GlobalEvent{
    UPDATE_FINISH,
    UPDATE_PROCESS,
    UPDATE_NEED_UPDATE,
    UPDATE_ERROR,
    INIT_UPDATE_MANIFEST,
}



@ccclass('GameWorld')
@requireComponent(cc.AudioSource)
export class GameWorld extends cc.Component {
    private static s_instance : GameWorld | null = null;
    
    public static getInstance() : GameWorld{
        if(this.s_instance == null){
            console.error("GameWorld getInstance null")
        }

        return this.s_instance;
    }

    private m_audioSource : cc.AudioSource | null = null;
    private m_eventDispatcher : EventDispatcher = new EventDispatcher();

    public m_gameEnv : ENV = null!;

    @property({
        displayName : "是否开启广告", 
    })
    private m_openAd : boolean = false;

    @property({
        displayName: "广告跳过提示",
        visible(){
            let obj : any = this;
            return !obj.m_openAd;
        },
    })
    private m_filterAdTips : string = "广告尚未接入，当前直接跳过广告!";


    public m_loadingBar : cc.ProgressBar = null!;
    public m_lblProcess : cc.Label = null!;
    public m_globalResLoader : ResLoader = new ResLoader();

    getAudioSource() : cc.AudioSource | null
    {
        return this.m_audioSource;
    }


    getGlobalResLoader() : ResLoader{
        return this.m_globalResLoader;
    }

    getCurEnv() : ENV{
        return this.m_gameEnv;
    }

    getIsOpenAd():boolean{
        return this.m_openAd;
    }

    getFilterAdTips():string{
        return this.m_filterAdTips;
    }

    initResourceSize(){
        let framesize = cc.screen.windowSize;
        let mysize = cc.size(720, 1280);
        let ftmp = framesize.width/framesize.height;
        let rtmp = mysize.width/mysize.height;

        let resolutionSize = mysize.clone();
        if( ftmp > rtmp ){
            resolutionSize.height = mysize.height;
            resolutionSize.width = resolutionSize.height * framesize.width/framesize.height;
        }else{
            resolutionSize.width = mysize.width;
            resolutionSize.height = resolutionSize.width * framesize.height/framesize.width;  
        }
        cc.view.setDesignResolutionSize(resolutionSize.width, resolutionSize.height, cc.ResolutionPolicy.SHOW_ALL);
    }

    onLoad()
    {
        // this.initResourceSize();
        this.m_audioSource = this.getComponent(cc.AudioSource);
        console.log("GameWorld cur env", this.m_gameEnv);
        setCurEnv(this.m_gameEnv);

        if(GameWorld.s_instance == null)
        {
            GameWorld.s_instance = this;
        }
        else
        {
            console.error("Gameworld is repeat load!");
        }

        cc.game.on(cc.Game.EVENT_HIDE, ()=>{
            
            //游戏切后台
            // console.log("EVENT_GAME_HIDE")            
        })

        cc.game.on(cc.Game.EVENT_SHOW, ()=>{
            
            //游戏切前台
            // console.log("EVENT_GAME_SHOW");
        })

        let index = StoreMgr.getInstance().getIntValue("CURR_LANGUAGE",LANGUAGE_DEFAULT)
        console.log("=======language====",index)
        if (0 != index) {
            LocalizadManager.getInstance().setLanguage(index)
        }
        
    }

    public addListenerOnce(event : EventType,  owner : Object, handler : ListenerFunc,) : EventListener {
        return this.m_eventDispatcher.addListenerOnce(event, owner, handler);
    }

    public addListener( event : EventType, owner : Object, handler : ListenerFunc,  count : number = -1, order : number = 0) : EventListener {
        return this.m_eventDispatcher.addListener(event, owner, handler, count, order);
    }

    public pauseListenerByOwner( owner : Object, event ?: EventType){
        return this.m_eventDispatcher.pauseListenerByOwner(owner, event);
    }
    
    public resumeOwner(owner : Object, event ?: EventType){
        return this.m_eventDispatcher.resumeOwner(owner, event);
    }

    public removeListenerByOwner( owner : Object, event ?: EventType){
        return this.m_eventDispatcher.removeListenerByOwner(owner, event);
    }

    public removeListenerByEvent( event : EventType){
        return this.m_eventDispatcher.removeListenerByEvent(event);
    }

    public removeListener( event : EventType,  owner : Object, handler : ListenerFunc){
        return this.m_eventDispatcher.removeListener(event, owner, handler);
    }

    public dispatch( event : EventType, ...datas : any[]) {
        return this.m_eventDispatcher.dispatch(event, ...datas);
    }

    public addListenerAll(owner : Object, func : ListenerFunc){
        return this.m_eventDispatcher.addListenerAll(owner, func);
    }

    public removeListenerAll(owner : Object, func : ListenerFunc){
        return this.m_eventDispatcher.removeListenerAll(owner, func);
    }

    public initUpdateManifest( doneCallback : ()=>void){
        if( cc.sys.isNative ){
            this.getGlobalResLoader().LoadAsset("project", ( err, asset : cc.Asset )=>{
                console.log("initUpdateManifest result project", );
                this.dispatch(GlobalEvent.INIT_UPDATE_MANIFEST, asset);
                doneCallback()
            })
        }else{
            doneCallback();
        }
    }

    start () {
        httpRequest.post("api/v1/get-channel",null,(succ:any) => {
            let languageParamsArr = ["zh-CN","zh-TW","en","jp"]
            let defaultLan = StoreMgr.getInstance().getIntValue("CURR_LANGUAGE",LANGUAGE_DEFAULT)
            // if (0 == defaultLan) {
                for (let i=0; i<languageParamsArr.length; i++) {
                    if (languageParamsArr[i] == succ.lang) {
                        LocalizadManager.getInstance().switchLanguage(i+1)
                        break
                    }
                }
            // }
            UserInfo.defaultConfig = succ
            this.login()
        })
        // UIMgr.getInstance().openSingleView(UIConfig.HotUpdate.path)
    }

    login () {
        let str = window.location.search.slice(1)
            
        const pairs = str.split('&');
        const params: { [key: string]: string } = {};
        pairs.forEach(pair => {
            const [key, value] = pair.split('=');
            params[decodeURIComponent(key)] = decodeURIComponent(value || '');
        });
        UserInfo.promoter_code = params.promoter_code || ""
        UserInfo.isApp = params.isApp
        UserInfo.lineCode = params.code || ""
        UserInfo.lineState = params.state
        console.log("---hotUpdate----",params)
        // 如果参数带token,直接进入游戏
        if (params.token != null){
            UserInfo.authorization = params.token
            UserInfo.refreshAuthorization = params.token
            StoreMgr.getInstance().setStringValue("ACCESS_TOKEN", params.token)
            StoreMgr.getInstance().setStringValue("REFRESH_TOKEN", params.token)
            LoadingViewWrap.show()
            UIMgr.getInstance().openSingleView(UIConfig.Lobby.path)
            return
        }

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
            })
        }
    }

    preloadRes(){

        // if (this.m_lblProcessDesc.getComponent(LocalizadLabel)) {
        //     this.m_lblProcessDesc.getComponent(LocalizadLabel).string = "加载资源中"
        // }



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

                },(fail:any) => {
                    
                })
            }else {
                UIMgr.getInstance().openSingleView(UIConfig.LoginBg.path,null,UIConfig.LoginBg.zIndex,null,()=>{
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
        
    }
}

