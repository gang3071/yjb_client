import * as cc from 'cc';
import { BaseView } from '../../base/frame/BaseView';
import { v3, Button, ScrollView, Vec3 } from 'cc';
import { UrlImageView } from '../../base/gui/urlImageView';
import { UIMgr } from '../../base/core/UIMgr';
import { UIConfig } from '../../config/UIConfig';
import { LANGUAGE_EVENT, LocalizadManager } from '../../base/localized/LocalizedManager';
import { httpRequest } from '../../NetMgr/HttpRequest';
import { audioMgr } from '../common/AudioMgr';
import { LoadingViewWrap } from '../../base/utils/view/LoadingViewWrap';
import { LocalizadSprite } from '../../base/localized/LocalizedSprite';
import { Tools } from '../../base/utils/util/Tools';
import { utils } from '../../base/utils/utils';
import { UITransform } from 'cc';
import { Size } from 'cc';
import { math } from 'cc';
import { UserInfo } from '../common/UserInfo';
const { ccclass, property } = cc._decorator;

const ALL_TYPE = { name : "全 部", id : "0"}
@ccclass('DianZiGameNode2')
export class DianZiGameNode2 extends BaseView {
    /** 游戏类型 */
    @property(cc.ScrollView)
    gameTypeScroll: cc.ScrollView = null;
    /** 最近游戏 */
    @property(cc.Node)
    recentGameScroll: cc.Node = null;
    /** 游戏列表 */
    @property(cc.ScrollView)
    gameListScroll: cc.ScrollView = null;
    /** 箭头 */
    @property(cc.Node)
    bottom_arr: cc.Node = null;
    /** 顶部背景 */
    @property(cc.Node)
    top_bg: cc.Node = null;
    /** 按钮箭头 */
    @property(cc.Node)
    recent_arr: cc.Node = null;
    /** 小图标 */
    @property(cc.Node)
    mini_item: cc.Node = null;
    /** 最近游玩小区域 */
    @property(cc.Node)
    mini_grid: cc.Node = null;
    /** 没有最近游玩提示 */
    @property(cc.Node)
    no_recent_game: cc.Node = null;
    /** 平台类型 */
    @property(cc.ScrollView)
    grid_type:cc.ScrollView = null
    /** 平台类型item */
    @property(cc.Node)
    typeItem:cc.Node = null
    /** 箭头 */
    @property(cc.Node)
    type_arr:cc.Node = null
    /** 名称 */
    @property(cc.Node)
    type_name:cc.Node = null

    

    @property(cc.Prefab)
    gameTypePrefab: cc.Prefab = null;
    @property(cc.Node)
    gamePrefab: cc.Node = null;

    gameTypeIconPath = "Localized/third_game_type/"

    /** 当前选择游戏类型 */
    currSelectGameType:number = 0

    page = 1
    lan = 0
    lanArr = ["cn","tw","en","jp"]
    imgArr = ["all_","hot_","slots_","buyu_","qp_","tiyu_","jieji_","caipiao_"]

    idArr = [0,1,7,4,6,9,8,10]

    private cate_id:number
    private is_hot:number
    private is_new:number
    private typeid:string
    
    start() {
        this.lan = LocalizadManager.getInstance().getLanauge() - 1
        this.gameTypeScroll.content.setPosition(v3(0,0,0))
        this.gameListScroll.content.setPosition(v3(0,0,0))

        this.initGameTypeList()
        this.initParam(this.idArr[0],0,0,"0")
        this.reqData()

    }

    protected onEnable(): void {
        LocalizadManager.getInstance().addListener(LANGUAGE_EVENT.UPDATE, this, this.refresh);
        this.gameListScroll.node.on(ScrollView.EventType.SCROLL_TO_BOTTOM, this._onScrolling, this);
    }

    protected onDisable(): void {
        this.gameListScroll.node.off(ScrollView.EventType.SCROLL_TO_BOTTOM, this._onScrolling, this);
        LocalizadManager.getInstance().removeListener(LANGUAGE_EVENT.UPDATE, this, this.refresh);
    }

    _onScrolling () {
        this.page += 1
        this.partReqDat()
    }

    refresh(){
        this.lan = LocalizadManager.getInstance().getLanauge() - 1
        this.page = 1
        this.partReqDat()
    }

    partReqDat(){
        // 热门类型的第一位填0
        if (this.currSelectGameType == this.idArr[1]) {
            this.initParam(0, 1, 0, this.typeid)
        }else {
            this.initParam(this.currSelectGameType,0,0, this.typeid)
        }
        this.reqData()
    }

    initParam(cate_id:number, is_hot:number, is_new:number, type:string){
        this.cate_id = cate_id
        this.is_hot = is_hot
        this.is_new = is_new
        this.typeid = type
    }

    reqData () {
        httpRequest.post("api/v1/game-list",{
            page:this.page,
            size:15,
            type:2,
            cate_id:this.cate_id,
            is_hot:this.is_hot,
            is_new:this.is_new,
            platform_id:this.typeid
        },(succ:any) => {
            // this.data = succ
            if (this.page == 1) {
                this.recentGameScroll.removeAllChildren()
                this.gameListScroll.content.removeAllChildren()
                this.mini_grid.removeAllChildren()
                this.initMiniRecent(succ.recent_games)
                this.addItemNode(succ.recent_games, this.recentGameScroll, new Vec3(0.6, 0.6, 1))
                this.addItemNode(succ.game_list, this.gameListScroll.content)
                this.grid_type.content.destroyAllChildren()
                this.initTypeGrid(succ.list)
            }else {
                // 防止滑动时候切页面报错
                if (this.gameListScroll) this.addItemNode(succ.game_list, this.gameListScroll.content)
            }
        })
    }

    initTypeGrid(dat){
        // 全部按钮添加
        let i = Tools.AddChild(this.grid_type.content, this.typeItem)
        this.initTypeItem(i, ALL_TYPE)
        for (let i=0; i<dat.length; i++) {
            let item = Tools.AddChild(this.grid_type.content, this.typeItem)
            this.initTypeItem(item, dat[i])
        }
    }

    initTypeItem(item, dat){
        item.active = true
        Tools.SetChildText(item, "lab", dat.name)
        if (dat.logo) Tools.GetChildComp(item, "icon", UrlImageView).setUrl(dat.logo)
        item.getComponent(Button).clickEvents[0].customEventData = dat
    }

    onClickType(evt, param){
        this.typeid = param.id
        this.page = 1 
        this.reqData()
        this.switchTypeSelect()
        Tools.SetText(this.type_name, param.name)
    }

    switchTypeSelect(){
        this.grid_type.node.active = !this.grid_type.node.active
        this.type_arr.eulerAngles = new Vec3(0, 0, this.grid_type.node.active ? 0 : 90)
    }

    /** 初始化顶部按钮 */
    initGameTypeList () {
        let content = this.gameTypeScroll.content
        content.removeAllChildren()
        for (let i=0; i<8; i++) {
            let node = Tools.AddChild(content, this.gameTypePrefab)
            Tools.SetChildSprite(node, "s/icon", "icon_s", this.gameTypeIconPath + i)
            Tools.SetChildSprite(node, "u/icon", "icon_u", this.gameTypeIconPath + i)
            Tools.SetChildSprite(node, "img", this.imgArr[i] + this.lanArr[this.lan], this.gameTypeIconPath + i, ()=>{
                if (node) Tools.GetChildComp(node, "img", LocalizadSprite).setFrameName(this.imgArr[i] + this.lanArr[this.lan])
            })
            node.getChildByName("u").active = i != this.currSelectGameType
            node.on(cc.Node.EventType.TOUCH_END,() => {
                if (this.currSelectGameType == this.idArr[i]) {return}
                
                this.currSelectGameType = this.idArr[i]
                for (let j=0; j<content.children.length; j++) {
                    content.children[j].getChildByName("u").active = j != i
                }
                this.page = 1
                this.partReqDat()
            })
        }
    }

    /** 添加节点 */
    addItemNode(data:any, content:cc.Node, scale : Vec3 = new Vec3(1, 1 , 1)){
        if (null == data) {return}
        if (0 < data.length) {
            for (let i=0; i<data.length; i++) {
                if (data[i].game_content != null)
                {
                    let item = Tools.AddChild(content, this.gamePrefab)
                    item.setScale(scale)
                    item.active = true
                    item.getComponent(UrlImageView).setUrl(data[i].game_content.picture)
                    item.getComponent(Button).clickEvents[0].customEventData = data[i]
                }
            }
        }
    }

    /** 初始化最近游玩小图标 */
    initMiniRecent(dat:any){
        // 暂时最多显示5条
        let max = Math.min(dat.length, 5)
        for (let i = 0; i < max; i++) {
            const element = dat[i];
            let item = Tools.AddChild(this.mini_grid, this.mini_item)
            item.getComponent(UrlImageView).setUrl(dat[i].game_content.picture)
            item.active = true
        }
    }

    /** 点击事件 */
    OnClickItemNode(evt , data:any){
        LoadingViewWrap.show()
        //audioMgr.pauseMusic()

        UIMgr.getInstance().openSingleView(UIConfig.PopToGame.path, {callback : ()=>{
            httpRequest.post("api/v1/enter-game",{
                game_id:data.game_content.game_id
            },(succ:any) => {
                if (UserInfo.isApp == "1"){
                    UserInfo.openGame(succ.url + "&display_mode=" + succ.display_mode)
                }else{
                    UIMgr.getInstance().openSingleView(UIConfig.GameViewBG.path,null,1)
                    utils.createGameView(succ.url)
                }
            })
        }})

        // if (IS_CHECK_MODE){
        //     httpRequest.post("api/v1/enter-game",{
        //         game_id:data.game_content.game_id
        //     },(succ:any) => {
        //         if (UserInfo.isApp == "1"){
        //             UserInfo.openGame(succ.url + "&display_mode=" + succ.display_mode)
        //         }else{
        //             UIMgr.getInstance().openSingleView(UIConfig.GameViewBG.path,null,1)
        //             utils.createGameView(succ.url)
        //         }
        //     })
        // }else{
        //     // 先转点再进入游戏
        //     UIMgr.getInstance().openSingleView(UIConfig.DianZiGameZhuanDian.path, {id:data.platform_id, gameId:data.game_content.game_id})
        // }
        
        // 直接进入游戏
        // UIMgr.getInstance().openSingleView(UIConfig.GameViewBG.path)
        // httpRequest.post("api/v1/enter-game",{
        //     game_id:data.id
        // },(succ:any) => {
        //     utils.createGameView(succ.url)
        // },(fail:any) => {
        //     UIMgr.getInstance().closeView(UIConfig.GameViewBG.path)
        //     LoadingViewWrap.close()
        //     audioMgr.replayMusic()
        // })
    }

    /** 打开电子钱包 */
    onClickEWallet(){
        UIMgr.getInstance().openSingleView(UIConfig.PopEWallet.path)
    }

    /** 展示最近游玩 */
    onClickRecent(){
        this.recentGameScroll.active = !this.recentGameScroll.active
        this.bottom_arr.active = this.recentGameScroll.active
        this.top_bg.getComponent(UITransform).setContentSize(new Size(1080, this.recentGameScroll.active ? 400 : 180))
        // 箭头方向
        this.recent_arr.eulerAngles = new Vec3(0, 0, this.recentGameScroll.active ? 0 : 90)
        // 游戏列表移动
        this.gameListScroll.node.setPosition(v3(0,this.recentGameScroll.active ? -320 : -100, 0))
        // 最近游玩小图标
        this.mini_grid.active = !this.recentGameScroll.active
        // 没有最近游玩
        this.no_recent_game.active = this.recentGameScroll.active && this.recentGameScroll.children.length == 0
    }
}