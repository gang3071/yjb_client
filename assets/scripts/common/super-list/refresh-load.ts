
import { _decorator, Node, Tween, Vec3, Label } from 'cc';
import { Message } from '../../base/core/MessageMgr';
import { AlterTipsWrap } from '../../base/utils/view/AlterTipsWrap';
import { httpRequest } from '../../NetMgr/HttpRequest';
import { BaseMain } from './baseMain';
const { ccclass, property } = _decorator;

@ccclass('RefreshLoad')
export class RefreshLoad extends BaseMain {
    @property(Node) header!: Node
    @property(Node) footer!: Node

    page:number = 1
    size:number = 10

    onLoad() {
        this.header.setScale(new Vec3(1, 0, 1))
        this.footer.setScale(new Vec3(1, 0, 1))
        this.requestData()
    }

    requestData (callback?:any) {
        httpRequest.post("api/v1/game-record",
            {game_id:"0",page:this.page,size:this.size},
            (succ:any) => {
                if (0 < succ.list.length) {
                    this.page += 1
                }
                for (let i=0; i<succ.list.length; i++) {
                    succ.list[i].game_list = succ.game_list
                    this.datas.push(succ.list[i])
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
            this.requestData()
        }
    }
}