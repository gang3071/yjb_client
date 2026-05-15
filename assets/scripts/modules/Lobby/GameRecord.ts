import * as cc from 'cc';
import { BaseView } from '../../base/frame/BaseView';
import { utils } from '../../base/utils/utils';
import { AlterTipsWrap } from '../../base/utils/view/AlterTipsWrap';
import List from '../../common/scroll/List';
import { httpRequest } from '../../NetMgr/HttpRequest';
const { ccclass, property } = cc._decorator;

@ccclass('GameRecord')
export class GameRecord extends BaseView {

    @property(cc.Node)
    typeLayoutNode:cc.Node = null

    @property(List)
    recordList:List = null

    @property(cc.Layout)
    typeLayout:cc.Layout = null

    @property(cc.Prefab)
    itemPrefab:cc.Prefab = null

    @property(cc.Label)
    labItemName:cc.Label = null

    private recordListData:any = null

    private color1:cc.Color = new cc.Color(65,234,107)
    private color2:cc.Color = new cc.Color(234,65,145)
    private color3:cc.Color = new cc.Color(163,157,228)
    private color4:cc.Color = new cc.Color(255,155,11)

    start() {
        this.reqListData("0")
    }

    reqListData (type:string) {
        // httpRequest.post("api/v1/game-record",
        //     {game_id:type,page:1,size:100},
        //     (succ:any) => {
        //         this.typeLayoutNode.active = false
        //         this.recordListData = succ
        //         this.recordList.numItems = succ.list.length
        //         this.recordList.updateAll()
        //         // this.initLayout()
        //         if (0 == succ.list.length) {
        //             AlterTipsWrap.show("暂无数据")
        //         }
        //     },(fail:any) => {

        //     }
        // )
    }

    initLayout () {
        if (0 < this.typeLayout.node.children.length) {
            return
        }
        for (let i=0; i<this.recordListData.game_list.length; i++) {
            let item = cc.instantiate(this.itemPrefab)
            item.getChildByName("name").getComponent(cc.Label).string = this.recordListData.game_list[i].name
            item.on(cc.Node.EventType.TOUCH_END,(target:cc.EventTouch) => {
                if (null != this.recordListData) {
                    this.reqListData(this.recordListData.game_list[i].id)
                    this.labItemName.string = this.recordListData.game_list[i].name
                    for (let j=0; j<this.typeLayout.node.children.length; j++) {
                        let node = this.typeLayout.node.children[j]
                        node.getChildByName("img1").active = true
                        node.getChildByName("img2").active = false
                        node.getChildByName("name").getComponent(cc.Label).color = this.color3
                    }
                    
                    target.getCurrentTarget().getChildByName("img1").active = false
                    target.getCurrentTarget().getChildByName("img2").active = true
                    target.getCurrentTarget().getChildByName("name").getComponent(cc.Label).color = this.color4
                }
            },this)
            this.typeLayout.node.addChild(item)
            item.getChildByName("img1").active = true
            item.getChildByName("img2").active = false
            item.getChildByName("name").getComponent(cc.Label).color = this.color3
            if (0 == i) {
                item.getChildByName("img1").active = false
                item.getChildByName("img2").active = true
                item.getChildByName("name").getComponent(cc.Label).color = this.color4
            }
        }
        this.labItemName.string = this.recordListData.game_list[0].name
    }

    btnSelectTypeCall () {
        this.typeLayoutNode.active = !this.typeLayoutNode.active
    }

    typeItemCall (target:cc.Button,customs:string) {
        if (null != this.recordListData) {
            this.reqListData(this.recordListData.bill_type[Number(customs)])
        }
    }

    listItemCall () {
        this.selectTypeCall()
    }

    recordListRender (item: cc.Node, idx: number) {

        let labTime = item.getChildByName("labTime").getComponent(cc.Label)
        let labType = item.getChildByName("labType").getComponent(cc.Label)
        let labRatio = item.getChildByName("labRatio").getComponent(cc.Label)
        let labId = item.getChildByName("labId").getComponent(cc.Label)
        let labShangFen = item.getChildByName("Layout1").getChildByName("labObject").getComponent(cc.Label)
        let labXiaFen = item.getChildByName("Layout2").getChildByName("labObject").getComponent(cc.Label)
        let labMoney = item.getChildByName("Layout3").getChildByName("labObject").getComponent(cc.Label)
        let labWin = item.getChildByName("Layout4").getChildByName("labObject").getComponent(cc.Label)


        let data = this.recordListData.list[Math.abs(idx)]

        for (let i=0; i<this.recordListData.game_list.length; i++) {
            if (data.game_id == this.recordListData.game_list[i].id) {
                labType.string = this.recordListData.game_list[i].name
                break
            }
        }

        labRatio.string = data.odds
        labId.string = data.code

        let time = data.created_at.split(" ")
        // labTime.string = time[0] + "  " + time[1]

        labTime.string = data.updated_at
        
        labShangFen.string = data.open_amount
        labXiaFen.string = data.wash_amount
        if (0 <= Number(data.wash_amount)) {
            // labDianShu.color = this.color1
            // labDianShu.string = "+" + utils.keepTwoDecimalStr(Number(labDianShu.string)) 
        }else {
            // labDianShu.color = this.color2
        }
        labMoney.string = data.after_game_amount
    }

    selectTypeCall () {
        if (this.typeLayoutNode.active) {
            this.typeLayoutNode.active = false
        }
    }

    btnCloseCall() {
        this.close()
    }

}


