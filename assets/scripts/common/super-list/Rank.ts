import * as cc from 'cc';
import { BaseMain } from './baseMain';
import { Vec3, Node } from 'cc';
import { EventTouch } from 'cc';
import { httpRequest } from '../../NetMgr/HttpRequest';
import { Tween } from 'cc';
import { Label } from 'cc';
import { AlterTipsWrap } from '../../base/utils/view/AlterTipsWrap';
import { v3 } from 'cc';
import { UrlImageView } from '../../base/gui/urlImageView';
import { Sprite } from 'cc';
const { ccclass, property } = cc._decorator;

@ccclass('Rank')
export class Rank extends BaseMain {
    @property(Node) header!: Node
    @property(Node) footer!: Node

    @property(cc.Prefab)
    item2:cc.Prefab = null

    page:number = 1
    size:number = 50

    posArr:Vec3[] = [v3(0,420.039+175,0),v3(-224.494,384.604 + 175,0),v3(216.886,364.54 + 175,0)]

    onLoad() {
        this.header.setScale(new Vec3(1, 0, 1))
        this.footer.setScale(new Vec3(1, 0, 1))
        this.requestData()
    }

    requestData (callback?:any) {
        httpRequest.post("api/v1/ranking-list",
            {page:this.page,size:this.size},
            (succ:any) => {
                if (0 < succ.list.length) {
                    // this.page += 1
                }

                this.node.getChildByName("bgg").getChildByName("labMoney").getComponent(Label).string = succ.my_ranking.money
                this.node.getChildByName("bgg").getChildByName("labFlag").getComponent(Label).string = succ.my_ranking.ranking
                this.node.getChildByName("bgg").getChildByName("labName").getComponent(Label).string = succ.my_ranking.name
                this.node.getChildByName("bgg").getChildByName("avatar").getChildByName("img").getComponent(UrlImageView).setUrl(succ.my_ranking.avatar)

                let fun = () => {
                    let parentNode = this.node.getChildByName("beijingtankuang_n")
                    for (let i=0; i<3; i++) {
                        if (!parentNode.getChildByName("RankNode_" + i)) {
                            let item = cc.instantiate(this.item2)
                            item.name = "RankNode_" + i
                            item.setPosition(v3(this.posArr[i].x,this.posArr[i].y))
                            item.parent = parentNode
                            item.getChildByName("labMoney").getComponent(Label).string = succ.list[i].money
                            item.getChildByName("labName").getComponent(Label).string = succ.list[i].name == "" ? succ.list[i].uuid:succ.list[i].name
                            item.getChildByName("avatar").getChildByName("img").getComponent(UrlImageView).setUrl(succ.list[i].avatar)
                        }
                    }
                }
                if (3 < succ.list.length) {
                    fun()
                    for (let i=3; i<succ.list.length; i++) {
                        this.datas.push(succ.list[i])
                    }
                }else {
                    fun()
                }
                
                
                if (0 < this.datas.length) {
                    this.scheduleOnce(() => this.layout.total(this.datas.length), 0.2)
                }
                if (0 == this.datas.length && 0 == succ.list.length) {
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
        return
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
            // this.requestData()
        }
    }
}


