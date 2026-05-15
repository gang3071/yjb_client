import * as cc from 'cc';
import { Message } from '../../base/core/MessageMgr';
import { BaseView } from '../../base/frame/BaseView';
import { AlterTipsWrap } from '../../base/utils/view/AlterTipsWrap';
import List from '../../common/scroll/List';
import { httpRequest } from '../../NetMgr/HttpRequest';
import { Tools } from '../../base/utils/util/Tools';
const { ccclass, property } = cc._decorator;

@ccclass('ShangFen')
export class ShangFen extends BaseView {

    @property(cc.Node)
    clickNode:cc.Node = null

    @property(cc.Label)
    labDesc:cc.Label = null

    @property(cc.Label)
    labFen:cc.Label = null

    @property(cc.Label)
    labBiLi:cc.Label = null

    @property(cc.Label)
    labBiLiX:cc.Label = null

    @property(cc.Label)
    labBiLiY:cc.Label = null

    @property(cc.Label)
    labBiLiFen:cc.Label = null

    @property(cc.Node)
    nodePuTong:cc.Node = null
    @property(cc.Node)
    nodeZenDian:cc.Node = null
    @property(List)
    zenList:List = null

    @property(cc.Label)
    labKaiFenNums:cc.Label = null

    @property(cc.Node)
    slotNode1:cc.Node = null
    @property(cc.Node)
    slotNode2:cc.Node = null
    @property(cc.Node)
    slotNode3:cc.Node = null

    @property(cc.Node)
    jackNode1:cc.Node = null

    @property(cc.Node)
    jackNode2:cc.Node = null

    @property(cc.Node)
    shuruNode:cc.Node = null

    beishu:number = 0

    gameData:any = null

    currIndex:number = 0
    
    color1:cc.Color = new cc.Color(48,104,209)
    color2:cc.Color = new cc.Color(211,86,42)

    pos1:cc.Vec3 = new cc.Vec3(-166.442,254.375)
    pos2:cc.Vec3 = new cc.Vec3(4.155,8.865)


    start() {
        let succ = this.m_uidata.data
        this.slotNode1.active = false
        this.slotNode2.active = false
        this.slotNode3.active = false
        this.jackNode1.active = false
        if (1 == this.m_uidata.isGzOrSl) {
            this.jackNode2.active = true
            this.labBiLi.string = `${succ.odds_x}:${succ.odds_y}`
            this.labBiLiX.string = succ.odds_x
            this.labBiLiY.string = succ.odds_y

            this.beishu = Number(succ.odds_y)/Number(succ.odds_x)
            // this.shuruNode.setPosition(this.pos1)
            // this.nodeZenDian.setPosition(this.pos2)
        }else if (2 == this.m_uidata.isGzOrSl) {
            this.labBiLi.string = `${succ.odds_x}:${succ.odds_y}`
            this.labBiLiX.string = succ.odds_x
            this.labBiLiY.string = succ.odds_y

            this.beishu = Number(succ.odds_y)/Number(succ.odds_x)
            this.shuruNode.setPosition(cc.v3(this.pos1.x,this.pos1.y+110))
            this.nodeZenDian.setPosition(cc.v3(this.pos2.x,this.pos2.y+110))
            this.nodePuTong.setPosition(cc.v3(this.pos2.x,this.pos2.y+110))
            this.jackNode2.active = false
        }
    }

    btnCloseCall () {
        this.close()
    }

    btnNumCall (target:cc.EventTouch,customs:string) {
        // console.log("===btnNumCall==",target,customs)
        let fun = () => {
            for (let i=0; i<this.clickNode.children.length; i++) {
                let node = this.clickNode.children[i]
                node.getChildByName("img1").active = true
                node.getChildByName("img2").active = false
                // node.getChildByName("img3").active = true
                // node.getChildByName("img4").active = false
            }
        }
        if (100 == Number(customs) || 500 == Number(customs) || 1000 == Number(customs)) {
            if (!this.m_uidata.succ.is_allow_client_give_point) {
                
                if (1 == this.m_uidata.isGzOrSl) {
                    AlterTipsWrap.show("当前机台尚有余分，无法进行开分赠点操作")
                }else if (2 == this.m_uidata.isGzOrSl) {
                    AlterTipsWrap.show("当前机台分数/转数/珠数不为0，无法进行开分赠点操作")
                }
                return
            }
            // this.zenList.numItems = 0
            // this.zenList.updateAll()
            httpRequest.post("api/v1/show_open_point_rule",{
                cate_id:this.m_uidata.data.cate_id,
                machine_id:this.m_uidata.machine_id
                // action:"plc_open_times",
                // open_point:this.labFen.string
                
            },(succ:any) => {
                // AlterTipsWrap.show("上分成功")
                // Message.dispatchEvent("ShangFenSucc")
                // this.close()
                // if (succ.machineCategory.if_se_give_point) {
                //     AlterTipsWrap.show("不能再次开分赠点")
                //     return
                // }else {
                    fun()

                    if (1 == this.m_uidata.isGzOrSl) {
                        this.slotNode1.active = true
                        this.slotNode2.active = true
                        this.slotNode3.active = true
                        this.jackNode1.active = false
                    }else if (2 == this.m_uidata.isGzOrSl) {
                        this.slotNode1.active = false
                        this.slotNode2.active = false
                        this.slotNode3.active = false
                        this.jackNode1.active = true
                        this.jackNode2.active = false
                    }

                    this.currIndex = 0
                    this.labDesc.node.active = true
                    this.labFen.string = "0"
                    this.labBiLiFen.string = "0"
                    this.labFen.node.active = false

                    target.getCurrentTarget().getChildByName("img1").active = false
                    target.getCurrentTarget().getChildByName("img2").active = true

                    this.nodePuTong.active = false
                    this.nodeZenDian.active = true

                    if (this.zenList) {
                        this.labKaiFenNums.string = "0"
                        this.gameData = succ.machineCategory
                        this.zenList.numItems = Math.ceil(succ.machineCategory.machine_category_give_rule.length)
                        this.zenList.updateAll()
                        // this.deskList.scrollTo(0)
                    }
                    if (0 < succ.machineCategory.machine_category_give_rule.length) {
                        let data = succ.machineCategory.machine_category_give_rule[0]
                        // console.log("---------------------",data)
                        this.currIndex = data.id
                        this.labFen.node.active = true
                        this.labDesc.node.active = false
                        this.labFen.string = data.open_num
    
                        this.labKaiFenNums.string = data.condition
                    
                        let resut = data.open_num * this.beishu + data.give_num
                        let isZheng = this.isInteger(resut)
                        if (isZheng) {
                            this.labBiLiFen.string = resut.toString()
                        }else {
                            this.labBiLiFen.string = (Number(resut.toFixed(2))).toString()
                        }
                    }
            //     }
                
            // },(fail:any) => {
                
            })
           
            // this.clickNode.children[1].getChildByName("img2").active = 100 == Number(customs) ? true:false
            // this.clickNode.children[1].getChildByName("img2").active = 500 == Number(customs) ? true:false
            // this.clickNode.children[2].getChildByName("img2").active = 1000 == Number(customs) ? true:false

            

            // this.getZenDianRule()
            
            // this.labDesc.node.active = false
            // this.labFen.node.active = true
            // this.labFen.string = customs

            // let resut = Number(this.labFen.string) * this.beishu
            // let isZheng = this.isInteger(resut)
            // if (isZheng) {
            //     this.labBiLiFen.string = resut.toString()
            // }else {
            //     this.labBiLiFen.string = (Number(resut.toFixed(2))).toString()
            // }

        }else if (-1 == Number(customs)) {
            fun()
            this.slotNode1.active = false
            this.slotNode2.active = false
            this.slotNode3.active = false
            this.jackNode1.active = false
            this.labDesc.node.active = true
            this.labFen.string = "0"
            this.labBiLiFen.string = "0"
            this.labFen.node.active = false
            target.getCurrentTarget().getChildByName("img1").active = false
            target.getCurrentTarget().getChildByName("img2").active = true
            // target.getCurrentTarget().getChildByName("img3").active = false
            // target.getCurrentTarget().getChildByName("img4").active = true

            this.nodePuTong.active = true
            this.nodeZenDian.active = false

        }else {
            this.labDesc.node.active = false
            this.labFen.node.active = true
            if ("0" == customs && "0" == this.labFen.string[0]) {
                this.labFen.string = "0"
                this.labBiLiFen.string = "0"
                return
            }
            if ("0" != customs && "0" == this.labFen.string) {
                this.labFen.string = customs

                let resut = Number(this.labFen.string) * this.beishu
                let isZheng = this.isInteger(resut)
                if (isZheng) {
                    this.labBiLiFen.string = resut.toString()
                }else {
                    this.labBiLiFen.string = (Number(resut.toFixed(2))).toString()
                }

                return
            }
            
            this.labFen.string = this.labFen.string + customs

            let resut = Number(this.labFen.string) * this.beishu
            let isZheng = this.isInteger(resut)
            if (isZheng) {
                this.labBiLiFen.string = resut.toString()
            }else {
                this.labBiLiFen.string = (Number(resut.toFixed(2))).toString()
            }
        }
    }

    btnDeleteCall () {
        if (1 == this.labFen.string.length) {
            this.labFen.string = "0"
            this.labBiLiFen.string = "0"
        }else {
            this.labFen.string = this.labFen.string.substring(0,this.labFen.string.length-1)

            let resut = Number(this.labFen.string) * this.beishu
            let isZheng = this.isInteger(resut)
            if (isZheng) {
                this.labBiLiFen.string = resut.toString()
            }else {
                this.labBiLiFen.string = (Number(resut.toFixed(2))).toString()
            }
        }
    }

    btnShangFenCall () {
        if ("0" == this.labFen.string) {
            AlterTipsWrap.show("分数不能为0")
            return
        }
        let name = ""
        if (1 == this.m_uidata.isGzOrSl) {
            name = "api/v1/slot-action"
        }else if (2 == this.m_uidata.isGzOrSl) {
            name = "api/v1/jackpot-action"
        }
        let params:any = {}
        params.machine_id = this.m_uidata.machine_id
        params.action = "plc_open_times"
        if (this.clickNode.children[1].children[1].active) {
            params.give_rule_id = this.currIndex
            params.open_point = "0.00"
        }else {
            params.give_rule_id = 0
            params.open_point = this.labFen.string
        }
        // if (this.clickNode.children[0].children[0].active) {
            
        // }
        httpRequest.post(name,params,(succ:any) => {
            AlterTipsWrap.show("上分成功")
            Message.dispatchEvent("ShangFenSucc")
            this.close()
        },(fail:any) => {
            
        })
    }

    isInteger (obj: unknown) {
        return typeof obj === 'number' && obj % 1 === 0;
    };

    zenDianItemClick (item: cc.Node, selectedId: number, lastSelectedId: number, val: number) {
        console.log("---zenDianItemClick---")
        let data = this.gameData.machine_category_give_rule[Math.abs(selectedId)]
        let parentcontent = this.zenList.node.getChildByName("view").getChildByName("content")
        for (let i=0; i<parentcontent.children.length; i++) {
            parentcontent.children[i].getChildByName("img1").active = true
            parentcontent.children[i].getChildByName("img2").active = false
            parentcontent.children[i].getChildByName("nums").getComponent(cc.Label).color = this.color1
        }
        item.getChildByName("img1").active = false
        item.getChildByName("img2").active = true
        item.getChildByName("nums").getComponent(cc.Label).color = this.color2

        this.currIndex = data.id
        this.labFen.node.active = true
        this.labDesc.node.active = false
        this.labFen.string = data.open_num

        this.labKaiFenNums.string = data.condition

        let resut = data.open_num * this.beishu + data.give_num
        let isZheng = this.isInteger(resut)
        if (isZheng) {
            this.labBiLiFen.string = resut.toString()
        }else {
            this.labBiLiFen.string = (Number(resut.toFixed(2))).toString()
        }
    }

    zenDianRender (item:cc.Node,idx:number) {
        let index = Math.abs(idx)
        if (null != this.gameData.machine_category_give_rule[index]) {
            // for (let i=0; i<2; i++) {
                let data = this.gameData.machine_category_give_rule[index]
        
                Tools.SetChildText(item, "name", Tools.StringLFormat("开分{0}点送{1}分", data.open_num, data.give_num))
                Tools.SetChildText(item, "nums", Tools.StringLFormat("今日参与次数{0}/{1}", data.used_give_rule_num, data.give_rule_num))


                // item.off(cc.Node.EventType.TOUCH_END)
                // item.on(cc.Node.EventType.TOUCH_END,(target:cc.EventTouch) => {
                //     this.currIndex = data.id
                //     this.labFen.node.active = true
                //     this.labDesc.node.active = false
                //     this.labFen.string = data.open_num

                //     this.labKaiFenNums.string = data.condition

                //     let resut = data.open_num * this.beishu + data.give_num
                //     let isZheng = this.isInteger(resut)
                //     if (isZheng) {
                //         this.labBiLiFen.string = resut.toString()
                //     }else {
                //         this.labBiLiFen.string = (Number(resut.toFixed(2))).toString()
                //     }
                // })
            // }
        }
        // else {
        //     item.getChildByName("item1").active = false
        //     let itemNode = item.getChildByName("item0")

        //     let data = this.gameData.machine_category_give_rule[index*2]
        //     let name = itemNode.getChildByName("name").getComponent(cc.Label)
        //     name.string = "开分" + data.open_num + "点送" + data.give_num + "分"

        //     itemNode.off(cc.Node.EventType.TOUCH_END)
        //     itemNode.on(cc.Node.EventType.TOUCH_END,() => {
        //         this.currIndex = data.id
        //         this.labFen.node.active = true
        //         this.labDesc.node.active = false
        //         this.labFen.string = data.open_num

        //         this.labKaiFenNums.string = data.condition

        //         let resut = data.open_num * this.beishu + data.give_num
        //         let isZheng = this.isInteger(resut)
        //         if (isZheng) {
        //             this.labBiLiFen.string = resut.toString()
        //         }else {
        //             this.labBiLiFen.string = (Number(resut.toFixed(2))).toString()
        //         }
        //     })
        // }
    }

    getZenDianRule () {
        httpRequest.post("api/v1/show_open_point_rule",{
            cate_id:this.m_uidata.data.cate_id,
            // action:"plc_open_times",
            // open_point:this.labFen.string
            
        },(succ:any) => {
            // AlterTipsWrap.show("上分成功")
            // Message.dispatchEvent("ShangFenSucc")
            // this.close()
            if (this.zenList) {
                this.labKaiFenNums.string = "0"
                this.gameData = succ.machineCategory
                this.zenList.numItems = Math.ceil(succ.machineCategory.machine_category_give_rule.length/2)
                this.zenList.updateAll()
                // this.deskList.scrollTo(0)
            }
        },(fail:any) => {
            
        })
    }
}


