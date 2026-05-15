import * as cc from 'cc';
import { UIMgr } from '../../base/core/UIMgr';
import { BaseView } from '../../base/frame/BaseView';
import { LocalizadManager } from '../../base/localized/LocalizedManager';
import { AlterTipsWrap } from '../../base/utils/view/AlterTipsWrap';
import { LoadingViewWrap } from '../../base/utils/view/LoadingViewWrap';
import { LabelConfig } from '../../config/LabelConfig';
import { UIConfig } from '../../config/UIConfig';
import { httpRequest } from '../../NetMgr/HttpRequest';
import { UserInfo } from '../common/UserInfo';
const { ccclass, property } = cc._decorator;

@ccclass('KeFuSaveMoney')
export class KeFuSaveMoney extends BaseView {

    @property(cc.Node)
    targetNode1:cc.Node = null

    @property(cc.Node)
    targetNode2:cc.Node = null

    @property(cc.Label)
    labBiZhong:cc.Label = null

    @property(cc.Label)
    labXuZhiFu:cc.Label = null

    @property(cc.Label)
    labChongZhiFangShi:cc.Label = null

    @property(cc.Label)
    labDingDanJinE:cc.Label = null

    @property(cc.Label)
    labDingDanHao:cc.Label = null

    @property(cc.Label)
    labBankName:cc.Label = null

    @property(cc.Label)
    labOpenBankName:cc.Label = null

    @property(cc.Label)
    labHuMing:cc.Label = null

    @property(cc.Label)
    labBankNumber:cc.Label = null

    @property(cc.Label)
    labTime:cc.Label = null

    @property(cc.EditBox)
    moneyEditBox:cc.EditBox = null

    @property(cc.Layout)
    typeLayout:cc.Layout = null

    @property(cc.Prefab)
    itemPrefab:cc.Prefab = null

    @property(cc.Layout)
    wanChengLayout:cc.Layout = null

    @property(cc.Node)
    nodeTime:cc.Node = null

    private labChongZhiJinE:string = ""

    private czTypeData:any = null

    private color1:cc.Color = new cc.Color(148,142,208)
    private color2:cc.Color = new cc.Color(255,155,11)

    private czFangShiIndex:number = -1
    private dingDanData:any = null

    dingDanTime:any = null

    start() {
        
        this.targetNode1.active = false
        this.targetNode2.active = false
        if (1 == this.m_uidata.succ.showNode) {
            this.reqData(Number(this.m_uidata.succ.money) * Number(this.m_uidata.succ.currency.ratio))
        }else if (2 == this.m_uidata.succ.showNode) {

            this.dingDanData = this.m_uidata.succ
            this.setNodeShow(false)

            this.labDingDanJinE.string = this.m_uidata.succ.money
            this.labDingDanHao.string = this.m_uidata.succ.tradeno

            this.labBankName.string = this.m_uidata.succ.bank_name
            this.labOpenBankName.string = this.m_uidata.succ.sub_bank
            this.labHuMing.string = this.m_uidata.succ.name
            this.labBankNumber.string = this.m_uidata.succ.account

            this.startTime(this.dingDanData.created_at)
        }

        this.targetNode2.on(cc.Node.EventType.ACTIVE_IN_HIERARCHY_CHANGED,() => {
            if (!this.targetNode2.active) {
                if (this.dingDanTime) {
                    clearInterval(this.dingDanTime)
                }
            }
        })

        for (let i=0; i<this.wanChengLayout.node.children.length; i++) {
            let node = this.wanChengLayout.node.children[i]
            node.on(cc.Node.EventType.TOUCH_END,(target:cc.EventTouch) => {
                if (0 == i) {
                    this.btnCancelCZCall()
                }
                if (1 == i) {
                    this.btnCopyCall()
                }
                if (2 == i) {
                    this.btnFinishPayCall()
                }
            })
        }
        
        // this.initData()
        // this.reqData()
    }

    initData () {
    
    }

    onDisable () {
        if (this.dingDanTime) {
            clearInterval(this.dingDanTime)
        }
    }

    reqData (amount:number) {
        httpRequest.post("api/v1/get-recharge-method",{
            amount:amount,
        },(succ:any) => {
            this.czTypeData = succ
            this.initLayout(succ)
            this.typeLayout.node.active = false
            this.moneyEditBox.string = (Number(succ.money)*Number(succ.currency.ratio)).toString()
            this.labChongZhiJinE = this.moneyEditBox.string
            this.labBiZhong.string = succ.currency.identifying
            this.labXuZhiFu.string = succ.money
            this.m_uidata.amount = this.moneyEditBox.string
            if (0 < succ.recharge_method.length) {
                this.czFangShiIndex = succ.recharge_method[0].id
            }
            this.setNodeShow(true)
        },(fail:any) => {
            
        })
    }

    initLayout (succ:any) {
        if (0 < this.typeLayout.node.children.length) {
            return
        }
        for (let i=0; i<succ.recharge_method.length; i++) {
            let item = cc.instantiate(this.itemPrefab)
            item.getChildByName("name").getComponent(cc.Label).string = succ.recharge_method[i].name
            item.on(cc.Node.EventType.TOUCH_END,(target:cc.EventTouch) => {

                
                    this.czFangShiIndex = succ.recharge_method[i].id
                    this.labChongZhiFangShi.string = succ.recharge_method[i].name
                    for (let j=0; j<this.typeLayout.node.children.length; j++) {
                        let node = this.typeLayout.node.children[j]
                        node.getChildByName("img1").active = true
                        node.getChildByName("img2").active = false
                        node.getChildByName("name").getComponent(cc.Label).color = this.color1
                    }
                    
                    target.getCurrentTarget().getChildByName("img1").active = false
                    target.getCurrentTarget().getChildByName("img2").active = true
                    target.getCurrentTarget().getChildByName("name").getComponent(cc.Label).color = this.color2
                
            },this)
            this.typeLayout.node.addChild(item)
            item.getChildByName("img1").active = true
            item.getChildByName("img2").active = false
            item.getChildByName("name").getComponent(cc.Label).color = this.color1
            if (0 == i) {
                item.getChildByName("img1").active = false
                item.getChildByName("img2").active = true
                item.getChildByName("name").getComponent(cc.Label).color = this.color2
            }
        }
        this.labChongZhiFangShi.string = succ.recharge_method[0].name
    }

    setNodeShow (show:boolean) {
        this.targetNode1.active = show
        this.targetNode2.active = !show
    }

    chongZhiMoneyEditboxChange (text:string) {
        this.labChongZhiJinE = text
        this.m_uidata.amount = text
        this.labXuZhiFu.string = (Number(text)/Number(this.m_uidata.succ.currency.ratio)).toString()
    }

    btnCZCall () {
        if ("" == this.labChongZhiJinE) {
            AlterTipsWrap.show("请输入充值点数")
            return
        }
        for (let i=0; i<this.czTypeData.recharge_method.length; i++) {
            if (this.czFangShiIndex == this.czTypeData.recharge_method[i].id) {
                if (Number(this.labChongZhiJinE) > Number(this.czTypeData.recharge_method[i].max)) {
                    let str = LabelConfig["最大"]?LabelConfig["最大"][LocalizadManager.getInstance().getLanauge()-1]:"最大"
                    AlterTipsWrap.show(str+" "+this.czTypeData.recharge_method[i].max)
                    return
                }
                if (Number(this.labChongZhiJinE) < Number(this.czTypeData.recharge_method[i].min)) {
                    let str = LabelConfig["最小"]?LabelConfig["最小"][LocalizadManager.getInstance().getLanauge()-1]:"最小"
                    AlterTipsWrap.show(str+" "+this.czTypeData.recharge_method[i].min)
                    return
                }
            }
        }

        httpRequest.post("api/v1/player-recharge",{
            amount:this.m_uidata.amount,
            method_id:this.czFangShiIndex
        },(succ:any) => {
            this.dingDanData = succ
            this.setNodeShow(false)

            this.labDingDanJinE.string = succ.money
            this.labDingDanHao.string = succ.tradeno

            this.labBankName.string = succ.recharge_setting.bank_name
            this.labOpenBankName.string = succ.recharge_setting.sub_bank
            this.labHuMing.string = succ.recharge_setting.name
            this.labBankNumber.string = succ.recharge_setting.account

            this.startTime(this.dingDanData.created_at)
        },(fail:any) => {
            
        })
    }

    btnSelectTypeCall () {
        this.typeLayout.node.active = !this.typeLayout.node.active
    }

    selectTypeCall () {
        if (this.typeLayout.node.active) {
            this.typeLayout.node.active = false
        }
    }
    
    reqKeFuChongZhiInfo () {
        // httpRequest.post("",{
        
        // },(succ:any) => {
            
        // },(fail:any) => {
            
        // })
    }

    btnCloseCall () {
        this.close()
    }

    btnCancelCZCall () {
        let id = 0
        if (2 == this.m_uidata.succ.showNode) {
            id = this.dingDanData.id
        }else if (1 == this.m_uidata.succ.showNode) {
            id = this.dingDanData.order_id
        }
        httpRequest.post("api/v1/cancel-recharge",{
            id:id
        },(succ:any) => {
            AlterTipsWrap.show("取消成功")
            if (2 == this.m_uidata.succ.showNode) {
                this.reqData(this.m_uidata.succ.point)
                this.setNodeShow(true)
            }else if (1 == this.m_uidata.succ.showNode) {
                this.setNodeShow(true)
            }
            
        },(fail:any) => {
            
        })
    }



    btnCopyCall () {
        let str = this.labBankName.string + "\n" + this.labOpenBankName.string + "\n" + this.labHuMing.string + "\n" + this.labBankNumber.string
        var input = str + '';
        const el = document.createElement('textarea');
        el.value = input;
        el.setAttribute('readonly', '');
        el.style.contain = 'strict';
        el.style.position = 'absolute';
        el.style.left = '-9999px';
        el.style.fontSize = '12pt'; // Prevent zooming on iOS
    
        const selection = getSelection();
        var originalRange = null;
        if (selection.rangeCount > 0) {
            originalRange = selection.getRangeAt(0);
        }
        document.body.appendChild(el);
        el.select();
        el.selectionStart = 0;
        el.selectionEnd = input.length;
    
        var success = false;
        try {
            success = document.execCommand('copy');
        } catch (err) {}
    
        document.body.removeChild(el);
    
        if (originalRange) {
            selection.removeAllRanges();
            selection.addRange(originalRange);
        }
        AlterTipsWrap.show("复制成功")
        return success;
    }

    btnKeFuCall () {
        UserInfo.getKeFuLink(360,748)
    }

    btnFinishPayCall () {
        let id = 0
        if (2 == this.m_uidata.succ.showNode) {
            id = this.dingDanData.id
        }else if (1 == this.m_uidata.succ.showNode) {
            id = this.dingDanData.order_id
        }
        LoadingViewWrap.show()
        UIMgr.getInstance().openSingleView(UIConfig.UploadImg.path,{id:id})
    }

    startTime (time:number) {
        if (0 == UserInfo.recharge_order_expiration || null == UserInfo.recharge_order_expiration) {
            this.nodeTime.active = false
            return
        }
        if (this.dingDanTime) {
            clearInterval(this.dingDanTime)
        }

        // let s = parseInt((new Date().getTime()/1000).toString())

        let currTime = parseInt((new Date().getTime()/1000).toString())
        let s = currTime - Number(time)
        let leftSec = Number(UserInfo.recharge_order_expiration * 60) - s

        var min = Math.floor(leftSec/60) % 60
        var sec = leftSec % 60
        
        let t = ""
        if(min < 10){
            t += "0"
        }

        t += min + ":"

        if(sec < 10){
            t += "0"
        }
        t += sec

        if(leftSec > -1){
            this.labTime.string = t
        }

        
        this.dingDanTime = setInterval(() => {
            
            leftSec -= 1

            var t = '';
            if(leftSec > -1){
                var hour = Math.floor(s/3600)
                var min = Math.floor(leftSec/60) % 60
                var sec = leftSec % 60
                // if(hour < 10) {
                //     t = '0'+ hour + ":"
                // } else { 
                //     t = hour + ":"
                // }
                if(min < 10){
                    t += "0"
                }

                t += min + ":"

                if(sec < 10){
                    t += "0"
                }

                t += sec
                this.labTime.string = t
            }else {
                if (this.dingDanTime) {
                    clearInterval(this.dingDanTime)
                }
                AlterTipsWrap.show("时间已到，订单取消")
                this.close()
            }

        },1000)
        
    }

}


