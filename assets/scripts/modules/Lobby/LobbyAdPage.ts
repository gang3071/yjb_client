import * as cc from 'cc';
import { UrlImageView } from '../../base/gui/urlImageView';
import { httpRequest } from '../../NetMgr/HttpRequest';
import { UITransform, Prefab, Node } from 'cc';
import { LoadingViewWrap } from '../../base/utils/view/LoadingViewWrap';
import { UIMgr } from '../../base/core/UIMgr';
import { UIConfig } from '../../config/UIConfig';
import { Tools } from '../../base/utils/util/Tools';
const { ccclass, property } = cc._decorator;

@ccclass('LobbyAdPage')
export class LobbyAdPage extends cc.Component {
    @property(cc.PageView)
    pg: cc.PageView = null
    @property(Prefab)
    pgItem: cc.Prefab = null

    @property(cc.Label)
    labNotice:cc.Label = null

    startPos = new cc.Vec3(3,0,0)
    endPos = new cc.Vec3(850,0,0)

    msgArr:string[] = []
    
    /**pageview  自动滚动定时器 */
    autoScrollFun:any = null
    pageViewDate:any = null
    pageForward:boolean = true
    pageBack:boolean = false
    pageNum:number = 0

    data:any = null
 
    onLoad() {
        httpRequest.post("api/v1/home-page-ads",
            {},
            (succ:any) => {
                this.data = succ
                this.msgArr.push(succ.marquee)
                this.getMsg()
                if (0 != succ.slider_list.length) {
                    for (let i=0; i < succ.slider_list.length; i++) {
                        let item = cc.instantiate(this.pgItem)
                        const d = succ.slider_list[i]
                        item.getComponent(UITransform).width = this.pg.node.getComponent(UITransform).width
                        item.getComponent(UITransform).height = this.pg.node.getComponent(UITransform).height
                        item.getChildByName("img").getComponent(UrlImageView).setUrl(d.picture_url)
                        // 如果是活动，点击跳转详情页面
                        item.off(Node.EventType.TOUCH_END)
                        if (d.activity_id != null) item.on(Node.EventType.TOUCH_END, ()=>{
                            Tools.httpReq("activity-info", { activity_id:d.activity_id }, (succ:any) => {
                                LoadingViewWrap.show()
                                UIMgr.getInstance().openSingleView(UIConfig.ActivityDetail.path, succ)
                            })
                        }, this)
                        this.pg.addPage(item)
                    }
                    
                    this.autoScrollFun = setInterval(() => {
                        let index = this.pg.curPageIdx
                        if (this.pageForward) {
                            if (index+1 <= this.data.slider_list.length-1) {
                                this.pg.scrollToPage(index+1,2)
                            }
                        }else if (this.pageBack) {
                            if (index-1 >= 0) {
                                this.pg.scrollToPage(index-1,2)
                            }
                        }

                        if (0 == this.pg.curPageIdx) {
                            this.pageForward = true
                            this.pageBack = false
                        }else if (this.data.slider_list.length-1 == this.pg.curPageIdx) {
                            this.pageForward = false
                            this.pageBack = true
                        }
                    }, 3000)
                }
            })
    }

    onDisable () {
        if (this.autoScrollFun) {
            clearInterval(this.autoScrollFun)
        }
    }

    onListPageChange(pageNum: number) {
        // cc.log('当前是第' + pageNum + '页');
        if (0 == pageNum) {
            this.pageForward = true
            this.pageBack = false
        }else if (this.data.slider_list.length-1 == pageNum) {
            this.pageForward = false
            this.pageBack = true
        }
        this.pageNum = pageNum
    }

    getMsg () {
        // let msg = this.msgArr.shift()
        // if (msg) {
        //     this.doAction(msg)
        // }
        if (this.msgArr[0]) {
            let msg = this.msgArr[0]
            this.doAction(msg)
        }
    }

    /** 轮播图移动 */
    doAction (str:string) {
        this.labNotice.string = str
        this.labNotice.node.setPosition(this.endPos)
        this.scheduleOnce(() => {
            cc.tween(this.labNotice.node)
                .delay(0.2)
                .to(10,{position:cc.v3(-this.labNotice.node.getComponent(cc.UITransform).width,this.startPos.y,this.startPos.z)})
                .call(() => {
                    this.getMsg()
                })
                .start()
        }, 0.1)
    }
}