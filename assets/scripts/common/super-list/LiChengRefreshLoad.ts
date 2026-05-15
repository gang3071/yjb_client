
import { _decorator, Node, Tween, Vec3, Label, Layout, CCObject, v3, Color, EventTouch } from 'cc';
import { Message } from '../../base/core/MessageMgr';
import { AlterTipsWrap } from '../../base/utils/view/AlterTipsWrap';
import { httpRequest } from '../../NetMgr/HttpRequest';
import { BaseMain } from './baseMain';
const { ccclass, property } = _decorator;

@ccclass('LiChengRefreshLoad')
export class LiChengRefreshLoad extends BaseMain {
    @property(Node) header!: Node
    @property(Node) footer!: Node

    @property(Layout)
    typeLayout:Layout = null

    page:number = 1
    size:number = 10

    currType:string = "all"
    currSelectIndex:number = 0

    color1:Color = new Color(255,255,255)
    color2:Color = new Color(163,157,228)

    listData:any = null

    onLoad() {
        this.header.setScale(new Vec3(1, 0, 1))
        this.footer.setScale(new Vec3(1, 0, 1))
    }

    onEnable () {
        for (let i=0; i<this.typeLayout.node.children.length; i++) {
            let node = this.typeLayout.node.children[i]
            node.getChildByName("name").getComponent(Label).color = this.color2
            node.getChildByName("img1").active = false
            node.on(Node.EventType.TOUCH_END,(target:EventTouch) => {
                if (i == this.currSelectIndex) {return}
                this.currSelectIndex = i
                for (let j=0; j<this.typeLayout.node.children.length; j++) {
                    let node = this.typeLayout.node.children[j]
                    node.getChildByName("name").getComponent(Label).color = this.color2
                    node.getChildByName("img1").active = false
                }

                let currTarget = target.getCurrentTarget()
                currTarget.getChildByName("name").getComponent(Label).color = this.color1
                currTarget.getChildByName("img1").active = true

                this.page = 1
                this.datas = []
                this.reqListData(this.listData.bill_type[i].type)
            })

            if (0 == i) {
                node.getChildByName("name").getComponent(Label).color = this.color1
                node.getChildByName("img1").active = true
            }
        }
        this.reqListData(this.currType)
    }

    onDisable () {
        this.page = 1
        this.datas = []
        this.scheduleOnce(() => this.layout.total(this.datas.length), 0.2)
    }

    reqListData (type:string) {
        httpRequest.post("api/v1/player-billing-record",
            {bill_type:type,page:this.page,size:this.size},
            (succ:any) => {
                this.listData = succ
                if (0 < succ.list.length) {
                    this.page += 1
                }
                for (let i=0; i<succ.list.length; i++) {
                    succ.list[i].currSelectIndex = this.currSelectIndex
                    this.datas.push(succ.list[i])
                }
                if (0 < this.datas.length) {
                    this.scheduleOnce(() => this.layout.total(this.datas.length), 0.2)
                }
                if (0 == this.datas.length && 0 == succ.list.length) {
                    this.datas = []
                    this.scheduleOnce(() => this.layout.total(this.datas.length), 0.2)
                    // this.layout.updateItems()
                    AlterTipsWrap.show("暂无数据")
                }
            },(fail:any) => {

            }
        )
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
            this.reqListData(this.currType)
        }
    }
}