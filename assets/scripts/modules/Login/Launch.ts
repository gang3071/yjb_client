// window.onbeforeunload = () => false;
import { BaseLoader } from './BaseLoader';
import { game, _decorator, resources, Node } from 'cc';
import { Component, Prefab, Enum, profiler, instantiate, director, sys, dynamicAtlasManager, macro } from 'cc';
import { UIConfig } from '../../config/UIConfig';
import { UIMgr } from '../../base/core/UIMgr';
import { PREVIEW } from 'cc/env';
import { assetManager } from 'cc';
const { ccclass, property } = _decorator;
// 开启动态合图
macro.CLEANUP_IMAGE_CACHE = false;
dynamicAtlasManager.enabled = true;

enum ENV {
    DEBUG,
    INNER_TEST,
    OUT_TEST,
    RELEASE,
}

let GAME_ENV : ENV;

@ccclass('Launch')
export class Launch extends Component {
    @property(Prefab)
    launch:Prefab = null
    @property(Node)
    background:Node = null

    @property({
        type : Enum(ENV),
        displayName : "GameEnv",
        tooltip : "游戏发布环境",
    })
    private m_gameEnv : number = ENV.RELEASE;
 
    start () {
        // 设定游戏目标帧率
        game.frameRate = 30;
        // if (this.m_gameEnv != ENV.RELEASE) {
            profiler.hideStats();
        // }
        
        if(sys.isMobile)
        // cc.screen.requestFullScreen()
        console.log("===start=2===")

        // 清除所有资源缓存
        // assetManager.cacheManager.clearCache();

        GAME_ENV = this.m_gameEnv;

        // 预览的话直接进游戏
        if (PREVIEW) {
            this.loadGame()
        }else{
            resources.load("Lobby/prefab/PopPreLoad", ()=>{
                console.log("PopPreLoad done")
                UIMgr.getInstance().openSingleView(UIConfig.PopPreLoad.path, { res:"preLoad", func : this.loadGame.bind(this)})
            })
        }
        
        // BaseLoader.loadBundleArray(["scripts"], ()=>{
            
        // }, ( percent : number)=>{
        //     this.updateProcess(Math.floor(percent*100));
        // })
    }

    loadGame(){
        let resload = new BaseLoader();
        this.background.active = false;
        resload.loadPrefab("preLoad/world/GameWorld", ( err, prefab : Prefab)=>{
            let node = instantiate(prefab);
            let GameWorld : any = node.getComponent("GameWorld");
            // GameWorld.m_loadingBar = this.m_loadingBar;
            // GameWorld.m_lblProcess = this.m_lblProcess;
            GameWorld.m_gameEnv = GAME_ENV;
            director.addPersistRootNode(node);
        })
    }
}
