import { _decorator, Node, Tween, Vec3, Label } from 'cc';
import { Message } from '../../base/core/MessageMgr';
import { BaseMain } from '../../common/super-list/baseMain';
import { httpRequest } from '../../NetMgr/HttpRequest';
import { PromotionYuanDetail } from './PromotionYuanDetail';
const { ccclass, property } = _decorator;

@ccclass('PromotionYuanDetailRefresh')
export class PromotionYuanDetailRefresh extends BaseMain {
    @property(Node) header!: Node
    @property(Node) footer!: Node

    page:number = 1
    size:number = 10

    labNameArr:string[] = ["今日","本周","本月","上月"]
    type:string[] = ["today","week","month","sub_month"]

    defaultType = "today"

    onLoad() {
        this.header.setScale(new Vec3(1, 0, 1))
        this.footer.setScale(new Vec3(1, 0, 1))
        
    }

    onEnable () {
        this.page = 1
        this.datas = []
        this.requestData()

        Message.on("GetPlayerRecordSucc",this.getPlayerRecordSucc,this)
        Message.on("ChangePlayerRecordType",this.changePlayerRecordType,this)
    }

    getPlayerRecordSucc (event:string,args:any) {

    }

    changePlayerRecordType (event:string,args:any) {
        console.log("-----changePlayerRecordType---",args)
        this.defaultType = this.type[args]
        this.page = 1
        this.requestData()
        this.datas = []
        this.scheduleOnce(() => this.layout.total(this.datas.length), 0.2)
    }

    onDisable () {
        this.page = 1
        this.datas = []
        this.scheduleOnce(() => this.layout.total(this.datas.length), 0.2)
        Message.off("GetPlayerRecordSucc",this.getPlayerRecordSucc,this)
        Message.off("ChangePlayerRecordType",this.changePlayerRecordType,this)
    }

    requestData (callback?:any) {
        httpRequest.post("api/v1/player-delivery-record",
            {page:this.page,size:this.size,id:this.node.parent.getComponent(PromotionYuanDetail).userId,type:this.defaultType},
            (succ:any) => {
                Message.dispatchEvent("GetPlayerRecordSucc",succ)
                if (0 < succ.list.length) {
                    this.page += 1
                }
                for (let i=0; i<succ.list.length; i++) {
                    this.datas.push(succ.list[i])
                }
                if (0 < this.datas.length) {
                    this.scheduleOnce(() => this.layout.total(this.datas.length), 0.2)
                }
                if (0 == this.datas.length && 0 == succ.list.length) {
                    // AlterTipsWrap.show("暂无数据")
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


