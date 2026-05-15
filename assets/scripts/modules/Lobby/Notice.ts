import * as cc from 'cc';
import { Message } from '../../base/core/MessageMgr';
import { BaseView } from '../../base/frame/BaseView';
import { AlterTipsWrap } from '../../base/utils/view/AlterTipsWrap';
import { httpRequest } from '../../NetMgr/HttpRequest';
const { ccclass, property } = cc._decorator;

@ccclass('Notice')
export class Notice extends BaseView {

    @property(cc.Node)
    item1:cc.Node = null

    @property(cc.Node)
    item2:cc.Node = null

    @property(cc.Layout)
    layoutItem:cc.Layout = null

    @property(cc.Node)
    touchNode:cc.Node = null

    @property(cc.Node)
    mailNode:cc.Node = null

    @property(cc.Node)
    clickNode:cc.Node = null

    //上下滑动方向
    directionNum:number = null

    //是否有滑动
    isMove:boolean = false

    private touchNodeHeigth:number = 0

    private itemHeight:number = 122

    private noticeData:any = null
    private detailData:any = null

    private clickIndex:number = -1
    private insertIndex:number = -1

    private isCanClick:boolean = true

    start() {
        // this.reqData()
        this.touchNodeHeigth = this.touchNode.getComponent(cc.UITransform).height
        this.touchNode.on(cc.Node.EventType.TOUCH_START,this.touchStart,this)
        this.touchNode.on(cc.Node.EventType.TOUCH_MOVE,this.touchMove,this)
        this.touchNode.on(cc.Node.EventType.TOUCH_CANCEL,this.touchCancel,this)
        this.touchNode.on(cc.Node.EventType.TOUCH_END,this.touchEnd,this)

        this.touchNode.active = false
        this.mailNode.active = true

    }

    reqData () {
        httpRequest.post("api/v1/announcement-list",{
            page:1,
            size:20
        },(succ:any) => {
            if (0 == succ.list.length) {
                AlterTipsWrap.show("暂无数据")
                return
            }
            this.noticeData = succ
            this.initList()
        },(fail:any) => {
            
        })
    }

    reqDetail (index:number,callback:any) {
        httpRequest.post("api/v1/announcement-info",{
            announcement_id:index,
        },(succ:any) => {
            this.detailData = succ
            if (callback) {
                callback(succ)
            }
        },(fail:any) => {
            if (callback) {
                callback(null)
            }
        })
    }

    initList () {
        this.layoutItem.node.removeAllChildren()
        for (let i=0; i<this.noticeData.list.length; i++) {
            let node = cc.instantiate(this.item1)
            node.getChildByName("labTime").getComponent(cc.Label).string = this.noticeData.list[i].push_time
            node.getChildByName("labDesc").getComponent(cc.Label).string = this.noticeData.list[i].title
            node.getChildByName("img2").active = false
            node.getChildByName("img3").active = true
            this.layoutItem.node.addChild(node)
        }
    }

    touchStart (target:cc.EventTouch) {
        if (0 == this.layoutItem.node.children.length) {return}
        // console.log("touchStart")
    }

    touchMove (target:cc.EventTouch) {
        // console.log("touchMove",target.getDeltaY())
        if (0 == this.layoutItem.node.children.length) {return}
        
        if (0 != target.getDeltaY()) {
            this.isMove = true
        }

        this.directionNum = target.getDeltaY()
        if (target.getDeltaY() >= 0) {
            let posY = 0.8*target.getDeltaY() + this.layoutItem.node.getPosition().y
            let posX = this.layoutItem.node.getPosition().x

            this.layoutItem.node.setPosition(posX,posY)

        }else {
            let posY = 0.8*target.getDeltaY() + this.layoutItem.node.getPosition().y
            let posX = this.layoutItem.node.getPosition().x
            this.layoutItem.node.setPosition(posX,posY)
        }
    }

    touchCancel (target:cc.EventTouch) {
        if (0 == this.layoutItem.node.children.length) {return}
        // console.log("touchCancel")
        this.touchEnd(target)
    }

    touchEnd (target:cc.EventTouch) {
        // console.log("===touchEnd====",this.directionNum,this.isMove,this.isCanClick,this.clickIndex,this.insertIndex)
        if (0 == this.layoutItem.node.children.length) {return}
        if (!this.isCanClick){return}
        
        let height1 = this.layoutItem.node.getComponent(cc.UITransform).height
        let height2 = this.touchNode.getComponent(cc.UITransform).height

        let item2Pos = this.layoutItem.node.children[this.layoutItem.node.children.length-1].getPosition()
        let item2WorldPos = this.layoutItem.node.children[this.layoutItem.node.children.length-1].parent.getComponent(cc.UITransform).convertToWorldSpaceAR(item2Pos)
        let item2LocalPos = this.layoutItem.node.parent.getComponent(cc.UITransform).convertToNodeSpaceAR(item2WorldPos)


        let layoutPos = this.layoutItem.node.getPosition()
        // console.log("==什么意思==",height1,height2,this.touchNodeHeigth,layoutPos,item2LocalPos)
        // if (0 != this.directionNum) {
            if (this.touchNodeHeigth/2 > layoutPos.y) {
                this.layoutItem.node.setPosition(new cc.Vec3(0,this.touchNodeHeigth/2))
                if (this.isMove){
                    this.isMove = false
                }
                this.directionNum = 0
                return
            }
    
            if (this.touchNodeHeigth/2 < layoutPos.y && height1 < height2) {
                this.layoutItem.node.setPosition(new cc.Vec3(0,this.touchNodeHeigth/2))
                if (this.isMove){
                    this.isMove = false
                }
                this.directionNum = 0
                return
            }
    
            if ((height2/2+(height1-height2)) <= layoutPos.y && height1 > height2) {

                this.layoutItem.node.setPosition(new cc.Vec3(0,height2/2+(height1-height2)))
                if (this.isMove){
                    this.isMove = false
                }
                this.directionNum = 0
                return
            }
        // }
        
        
        if (this.isMove){
            this.isMove = false
            this.directionNum = 0
            return
        }
        
        if (!this.isMove) {
            this.isMove = false
            let touchPos = target.getUILocation()
            let localPos = this.layoutItem.node.getComponent(cc.UITransform).convertToNodeSpaceAR(new cc.Vec3(touchPos.x,touchPos.y))
            
            for (let i=0; i<this.layoutItem.node.children.length; i++) {
                let childrenNode = this.layoutItem.node.children[i]
                
                // console.log("===i==",i,this.noticeData.list)
                let pos = childrenNode.getPosition()
                if (pos.y-this.itemHeight/2 <= localPos.y && pos.y+this.itemHeight/2 >= localPos.y) {
                    
                    let fun = (succ:any) => {
                        // console.log("===1==",succ,i,this)

                        if (null == succ) {
                            this.isCanClick = true
                            return
                        }

                        if (-1 != this.insertIndex) {
                            this.layoutItem.node.children[this.insertIndex].removeFromParent()
                            this.noticeData.list.splice(this.insertIndex,1)
                        }

                        if (-1 != this.clickIndex && i > this.insertIndex) {
                            this.clickIndex = i - 1
                            this.insertIndex = i
                        }else {
                            this.clickIndex = i
                            this.insertIndex = i + 1
                        }
                        

                        
                        this.noticeData.list.splice(this.insertIndex,0,null)

                        if (childrenNode.getChildByName("img2")) {
                            childrenNode.getChildByName("img2").active = false
                            childrenNode.getChildByName("img3").active = true
                        }
                        // console.log("====相似===",this.clickIndex,this.insertIndex,this.layoutItem.node.children)
                        this.isCanClick = true
                        let clickNode = this.layoutItem.node.children[this.clickIndex]
                        clickNode.getChildByName("img2").active = true
                        clickNode.getChildByName("img3").active = false
                        let node = cc.instantiate(this.item2)
                        node.getComponent(cc.UIOpacity).opacity = 0
                        node.getChildByName("labConten").getComponent(cc.Label).string = succ[0].content
                        this.layoutItem.node.insertChild(node,this.insertIndex)
                        this.scheduleOnce(() => {
                            node.getComponent(cc.UIOpacity).opacity = 255
                        },0.1)
                    }
                    if (this.insertIndex == i) {
                        // if (childrenNode.getChildByName("img2")) {
                        //     childrenNode.getChildByName("img2").active = true
                        //     childrenNode.getChildByName("img3").active = false
                        // }
                        return
                    }
                    
                    if (-1 == this.clickIndex) {
                        this.isCanClick = false
                        this.reqDetail(this.noticeData.list[i].announcement_id,fun)
                        return
                    }
                    if (this.clickIndex == i) {
                        this.layoutItem.node.children[this.insertIndex].removeFromParent()
                        this.noticeData.list.splice(this.insertIndex,1)
                        this.clickIndex = -1
                        this.insertIndex = -1
                        if (childrenNode.getChildByName("img2")) {
                            childrenNode.getChildByName("img2").active = false
                            childrenNode.getChildByName("img3").active = true
                        }
                    }else {
                        // this.clickIndex = i
                        // this.layoutItem.node.children[this.insertIndex].removeFromParent()
                        // this.noticeData.list.splice(this.insertIndex,1)
                        // this.clickIndex = i-1
                        // this.insertIndex = i

                        // if (-1 == this.clickIndex) {
                        //     this.clickIndex = 0
                        //     this.insertIndex = 1
                        // }
                        if (-1 != this.clickIndex){return}
                        this.isCanClick = false
                        this.reqDetail(this.noticeData.list[i].announcement_id,fun)
                    }
                    return
                }
            }
        }
        this.isMove = false
        
        if (0 == Math.abs(this.directionNum)) {

        }else if (0 < this.directionNum) {
            // let endPosY:number = 0
            // cc.tween(this.layoutItem.node)
            //     .to(0.3,{position:new cc.Vec3(layoutPos.x,layoutPos.y + 100)})
            //     .start()
        }else if (0 > this.directionNum) {
            // cc.tween(this.layoutItem.node)
            //     .to(0.3,{position:new cc.Vec3(layoutPos.x,layoutPos.y - 100)})
            //     .start()
        }
    }

    btnAddItem1Call () {
        let node = cc.instantiate(this.item1)
        this.layoutItem.node.addChild(node)
    }

    btnAddItem2Call (event:cc.EventTouch,customs:string) {
        let index = Number(customs)
        let node = cc.instantiate(this.item2)
        this.layoutItem.node.insertChild(node,1)
    }

    btnCloseCall () {
        this.close()
    }

    btnNumCall (target:cc.EventTouch,customs:string) {
        for (let i=0; i<this.clickNode.children.length; i++) {
            let node = this.clickNode.children[i]
            node.getChildByName("img1").active = true
            node.getChildByName("img2").active = false
        }
        let index = Number(customs)
        let node2 = this.clickNode.children[index]
        node2.getChildByName("img1").active = false
        node2.getChildByName("img2").active = true
        if (0 == index) {
            // Message.dispatchEvent("GetMail")
            this.touchNode.active = false
            this.mailNode.active = true
        }else if (1 == index) {
            this.touchNode.active = true
            this.mailNode.active = false
            this.reqData()
        }
    }


}


