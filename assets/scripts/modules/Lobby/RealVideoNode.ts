import * as cc from 'cc';
import { BaseView } from '../../base/frame/BaseView';
import { httpRequest } from '../../NetMgr/HttpRequest';
import { UrlImageView } from '../../base/gui/urlImageView';
import { UIMgr } from '../../base/core/UIMgr';
import { UIConfig } from '../../config/UIConfig';
import { UserInfo } from '../common/UserInfo';
import { AlterTipsWrap } from '../../base/utils/view/AlterTipsWrap';
import { audioMgr } from '../common/AudioMgr';
import { utils } from '../../base/utils/utils';
const { ccclass, property } = cc._decorator;

@ccclass('RealVideoNode')
export class RealVideoNode extends BaseView {
    @property(cc.ScrollView)
    scroll: cc.ScrollView = null;
    @property(cc.Prefab)
    item: cc.Prefab = null;

    data:any = null

    currSelectPlatfor = 0

    page = 1

    start() {
        this.reqData(0)
        // this.scroll.node.on('scrolling', this._onScrolling, this);
    }

    _onScrolling () {
        let maxOffset = this.scroll.getMaxScrollOffset()
        let offset = this.scroll.getScrollOffset()
        let contenLen = this.scroll.content.children.length
        if (0 < contenLen) {
            let num = 0
            for (let i=0; i<this.scroll.content.children[contenLen-1].children.length; i++) {
                if (this.scroll.content.children[contenLen-1].children[i].active) {
                    num++
                }
            }
            let len = (this.scroll.content.children.length - 1) * 4 + num
    
            if (offset.y >= maxOffset.y * 0.7 && len == this.page * 20) {
                this.page += 1
                this.reqData(this.data.list[this.currSelectPlatfor].id)
            }
        }
    }

    reqData (platform_id:number) {
        httpRequest.post("api/v1/game-list",{
            page:this.page,
            size:30,
            type:1,
            cate_id:platform_id
        },(succ:any) => {
            if (this.page == 1) {
                // this.getPlarformDianShu(platform_id == 0 ? succ.list[0].id : platform_id)
            }
            
            this.data = succ
            this.initGamePlatform(succ.list)
            
        })
    }

    getPlarformDianShu (platform_id:number) {
        httpRequest.post("api/v1/get-balance",{
            game_platform_id:platform_id
        },(succ:any) => {
            
        })
    }

    initGamePlatform (data:any) {
        if (this.scroll.content.children.length > 0) {
            return
        }
        let view = this.scroll.node.getChildByName("view")
        this.scroll.content.setPosition(cc.v3(0,0))
        
        if (0 < data.length) {
            for (let i=0; i<data.length; i++) {
                let node = cc.instantiate(this.item)
                node.getChildByName("bg").getComponent(UrlImageView).setUrl(data[i].picture)
                node.parent = this.scroll.content

                node.on(cc.Node.EventType.TOUCH_START, (target:cc.EventTouch) => {
                    let obj = target.getCurrentTarget() as cc.Node
                    obj.setScale(0.96,0.96,0.96)
                })

                node.on(cc.Node.EventType.TOUCH_MOVE, (target:cc.EventTouch) => {
                    let obj = target.getCurrentTarget() as cc.Node
                    obj.setScale(0.96,0.96,0.96)
                })

                node.on(cc.Node.EventType.TOUCH_CANCEL, (target:cc.EventTouch) => {
                    let obj = target.getCurrentTarget() as cc.Node
                    obj.setScale(1,1,1)
                })

                node.on(cc.Node.EventType.TOUCH_END, (target:cc.EventTouch) => {
                    let obj = target.getCurrentTarget() as cc.Node
                    obj.setScale(1,1,1)
                    
                    UIMgr.getInstance().openSingleView(UIConfig.PopToGame.path, {callback : ()=>{
                        httpRequest.post("api/v1/lobby-login",{
                                game_platform_id:data[i].id
                            },(succ:any) => {
                                if (UserInfo.isApp == "1"){
                                    UserInfo.openGame(succ.lobby_url)
                                }else{
                                    UIMgr.getInstance().openSingleView(UIConfig.GameViewBG.path,null,1)
                                    utils.createGameView(succ.lobby_url)
                                }
                            })
                        }
                    })

                    

                    //audioMgr.stopMusic()
                    // httpRequest.post("api/v1/lobby-login",{
                    //     game_platform_id:data[i].id
                    // },(succ:any) => {
                    //     utils.createGameView(succ.lobby_url)
                    // },(fail:any) => {
                    //     UIMgr.getInstance().closeView(UIConfig.GameViewBG.path)
                    //     LoadingViewWrap.close()
                    //     audioMgr.replayMusic()
                    // })
                })
            }
        }
    }

    btnZhuanHuiAllCall() {
        httpRequest.post("api/v1/fast-transfer",{},(succ:any) => {
            UserInfo.requestUserInfo()
            AlterTipsWrap.show("操作成功")
        })
    }

    btnZhuanDianCall () {
        UIMgr.getInstance().openSingleView(UIConfig.DianZiGameZhuanDian.path,this.data.list[this.currSelectPlatfor])
    }

    /** 打开电子钱包 */
    onClickEWallet(){
        UIMgr.getInstance().openSingleView(UIConfig.PopEWallet.path)
    }
}