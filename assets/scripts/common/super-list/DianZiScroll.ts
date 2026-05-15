import * as cc from 'cc';
import { BaseMain } from './baseMain';
import { Vec3, Node } from 'cc';
import { EventTouch } from 'cc';
import { httpRequest } from '../../NetMgr/HttpRequest';
import { AlterTipsWrap } from '../../base/utils/view/AlterTipsWrap';
import { Tween } from 'cc';
import { Label } from 'cc';
import { UrlImageView } from '../../base/gui/urlImageView';
const { ccclass, property } = cc._decorator;

@ccclass('DianZiScroll')
export class DianZiScroll extends BaseMain {
    @property(Node) header!: Node
    @property(Node) footer!: Node

    @property(cc.ScrollView)
    scroll2: cc.ScrollView = null;
    @property(cc.Prefab)
    item2: cc.Prefab = null;

    page:number = 1
    size:number = 16

    currSelectPlatfor = 0

    onLoad() {
        this.header.setScale(new Vec3(1, 0, 1))
        this.footer.setScale(new Vec3(1, 0, 1))
        this.requestData(0)
    }

     
    requestData (platform_id:number) {
        console.log("----------什么路子----------",platform_id)
        httpRequest.post("api/v1/game-list",
            {type:2,platform_id:platform_id,page:this.page,size:this.size},
            (succ:any) => {
                this.initGamePlatform(succ.list)
                if (0 < succ.game_list.length) {
                    this.page += 1
                }
                for (let i=0; i<succ.game_list.length; i++) {
                    this.datas.push(succ[i])
                }

                if (0 < this.datas.length) {
                    this.scheduleOnce(() => this.layout.total(this.datas.length), 0.2)
                }
                if (0 == this.datas.length && 0 == succ.length) {
                    AlterTipsWrap.show("暂无数据")
                }
            },(fail:any) => {

            }
        )
    }

    initGamePlatform (data:any) {
        if (this.scroll2.content.children.length > 0) {
            return
        }
        let view = this.scroll2.node.getChildByName("view")
        this.scroll2.content.setPosition(cc.v3(0,0))
        
        if (0 < data.length) {
            for (let i=0; i<data.length; i++) {
                let node = cc.instantiate(this.item2)
                node.getChildByName("icon").getComponent(UrlImageView).setUrl(data[i].logo)
                node.getChildByName("s").active = 0 == i ? true : false
                node.parent = this.scroll2.content
                
                node.on(cc.Node.EventType.TOUCH_END, () => {
                    if (i != this.currSelectPlatfor) {
                        this.page = 1
                        this.datas = []
                        this.requestData(data[i].id)
                        this.currSelectPlatfor = data[i].id
                        for (let j=0; j<this.scroll2.content.children.length; j++) {
                            let item = this.scroll2.content.children[j]
                            item.getChildByName("s").active = false
                        }
                        node.getChildByName("s").active = true
                        
                    }
                })
            }
        }
    }
    
    private headerTween!: Tween<Node>
    private footerTween!: Tween<Node>
    onHeader(scrollView: any, event: any) {
        return
        if (event.progress > 2) {
            if (!(this.header as any)['playing']) {
                this.headerTween = new Tween(this.header!);
                this.headerTween.to(0.518, {
                    scale: new Vec3(1, 1, 1),
                }, {
                    easing: "elasticOut"
                });
                this.headerTween.start();
                (this.header as any)['playing'] = true
            }
        } else {
            this.headerTween?.stop();
            (this.header as any)['playing'] = false
            this.header.setScale(new Vec3(1, event.progress, 1))
        }

        let label = this.header.getComponentInChildren(Label)!
        if (event.stage == "touch") {
            label.string = "↓ 继续下拉"
        }
        if (event.stage == "wait") {
            label.string = "↑ 松开刷新"
        }
        if (event.stage == "lock") {
            label.string = this.datas.length == 0 ? "没有数据" : "刷新中..."
        }
        if (event.stage == 'release') {
            label.string = ""
        }
        if (event.action) {
            this.scheduleOnce(() => this.layout.total(this.datas.length), 1)
        }
    }
    onFooter(scrollView: any, event: any) {
        if (event.progress > 2) {
            if (!(this.footer as any)['playing']) {
                this.footerTween = new Tween(this.footer!);
                this.footerTween.to(0.518, {
                    scale: new Vec3(1, 1, 1),
                }, {
                    easing: "elasticOut"
                });
                this.footerTween.start();
                (this.footer as any)['playing'] = true
            }
        } else {
            this.footerTween?.stop();
            (this.footer as any)['playing'] = false
            this.footer.setScale(new Vec3(1, event.progress, 1))
        }

        let label = this.footer.getComponentInChildren(Label)!
        if (event.stage == "touch") {
            label.string = "↑ 继续上拉"
        }
        if (event.stage == "wait") {
            label.string = "↓ 松开加载"
        }
        if (event.stage == "lock") {
            label.string = "加载中..."
        }
        if (event.stage == 'release') {
            label.string = ""
        }
        // console.log("=====",event,this.datas)
        if (event.action) {
            
            // for (let i = 0; i < 6; i++) {
            //     this.datas.push({
            //         message: `${this.datas.length}`
            //     })
            // }
            // this.scheduleOnce(() => this.layout.total(this.datas.length), 1)
            this.requestData(this.currSelectPlatfor)
        }
    }
}


