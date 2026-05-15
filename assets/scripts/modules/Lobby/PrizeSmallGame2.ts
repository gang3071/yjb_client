import * as cc from 'cc';
import { Message } from '../../base/core/MessageMgr';
import { UIMgr } from '../../base/core/UIMgr';
import { BaseView } from '../../base/frame/BaseView';
import { LoadingViewWrap } from '../../base/utils/view/LoadingViewWrap';
import { UIConfig } from '../../config/UIConfig';
import { UserInfo } from '../common/UserInfo';
import { audioMgr } from '../common/AudioMgr';
const { ccclass, property } = cc._decorator;

@ccclass('PrizeSmallGame2')
export class PrizeSmallGame2 extends BaseView {

    @property(cc.Prefab)
    hongbao:cc.Prefab = null

    @property(cc.Prefab)
    prizeScore:cc.Prefab = null

    @property(cc.Label)
    labTime:cc.Label = null

    @property(cc.Label)
    labMoney:cc.Label = null

    // @property(cc.Node)
    // titleNode:cc.Node = null

    scaleArr:number[] = [1.15,1.3,1.45,1.6,1.75]

    defaluClickNums:number = 0

    hongbaoArr:cc.Node[] = []

    hongbaoFun:any = null
    timeFun:any = null

    monArr:any[] = []

    start() {
        // this.btnStart.on(cc.Node.EventType.TOUCH_START,() => {
            
        // },this)
        // this.btnStart.on(cc.Node.EventType.TOUCH_END,() => {
            
        // },this)
        
        if (0 == this.m_uidata.flag) {
            let left = (Math.random() * 0.5 * this.m_uidata.data.lottery_record.amount).toFixed(2)
            let mon = (this.m_uidata.data.lottery_record.amount - Number(left)).toFixed(2)
            this.monArr = this.randAlloc(Number(mon),40)

            // this.titleNode.getChildByName("img1").active = false
            // this.titleNode.getChildByName("img2").active = true
            
        }else if (1 == this.m_uidata.flag) {
            let left = (Math.random() * 0.5 * this.m_uidata.data.lottery_record.amount).toFixed(2)
            let mon = (this.m_uidata.data.lottery_record.amount - Number(left)).toFixed(2)
            this.monArr = this.randAlloc(Number(mon),80)
            if (null != this.hongbaoFun) {
                clearInterval(this.hongbaoFun)
            }
            this.hongbaoFun = setInterval(() => {
                this.startHongBaoGame()
            },500)

            // this.titleNode.getChildByName("img1").active = true
            // this.titleNode.getChildByName("img2").active = false
        }

        if (null != this.timeFun) {
            clearInterval(this.timeFun)
        }
        let time = 30
        this.labTime.string = "30"
        
        this.timeFun = setInterval(() => {
            time -= 1
            this.labTime.string = time.toString() + ""
            if (Number(time) == 0) {
                this.labTime.string = "0"

                if (null != this.hongbaoFun) {
                    clearInterval(this.hongbaoFun)
                }
                
                if (null != this.timeFun) {
                    clearInterval(this.timeFun)
                    this.timeFun = null
                }
                LoadingViewWrap.show()
                UIMgr.getInstance().openSingleView(UIConfig.PrizeForm.path,{flag:this.m_uidata.flag,data:this.m_uidata.data,isclose:false,money:Number(this.labMoney.string)},1,null,() => {
                    this.defaluClickNums = 0
                })
            }
        }, 1000);

    }

    onEnable () {
        Message.on("PrizeFormSure",this.onPrizeFormSure,this)
        //audioMgr.pauseMusic()
        this.node.getChildByName("audioXiaoYouBg").getComponent(cc.AudioSource).play()
    }

    onDisable () {
        Message.off("PrizeFormSure",this.onPrizeFormSure,this)
        if (null != this.hongbaoFun) {
            clearInterval(this.hongbaoFun)
        }
        if (null != this.timeFun) {
            clearInterval(this.timeFun)
        }

        if (UserInfo.isOpenBgAudio) {
            //audioMgr.playMusic("common/audio/bg")
        }
        
        this.node.getChildByName("audioXiaoYouBg").getComponent(cc.AudioSource).pause()
    }

    onPrizeFormSure () {
        this.close()
    }

    startHongBaoGame () {
        let x = this.getRandom(-400,400)
        let y = this.node.getComponent(cc.UITransform).height/2
        // console.log("----",x)
        let node = cc.instantiate(this.hongbao)
        this.hongbaoArr.push(node)
        node.setPosition(cc.v3(x,y-150))
        node.parent = this.node
        node.on(cc.Node.EventType.TOUCH_END,(target:cc.EventTouch) => {
            node.off(cc.Node.EventType.TOUCH_END)
            cc.Tween.stopAllByTarget(target.getCurrentTarget())
            node.getChildByName("hongbao_kai").active = true
            node.getChildByName("ef_click_redbag").active = true
            let lab = node.getChildByName("hongbao_kai").getChildByName("Label").getComponent(cc.Label)
            let lizi = node.getChildByName("ef_click_redbag").getChildByName("ani").getChildByName("dot").getComponent(cc.ParticleSystem)
            let lizi1 = node.getChildByName("ef_click_redbag").getChildByName("ani").getChildByName("dot").getChildByName("glow").getComponent(cc.ParticleSystem)
            let lizi2 = node.getChildByName("ef_click_redbag").getChildByName("ani").getChildByName("dot").getChildByName("glow-001").getComponent(cc.ParticleSystem)
            
            lizi.stop()
            lizi1.stop()
            lizi2.stop()
            lizi.play()
            lizi1.play()
            lizi2.play()
            audioMgr.playEffect("common/audio/clickHongBao")
            let mon = this.monArr.shift()
            if (mon) {
                lab.string = mon
                this.labMoney.string = (Number(this.labMoney.string) + mon).toFixed(2)
            }
            
            cc.tween(target.getCurrentTarget().getComponent(cc.UIOpacity))
                .to(2,{opacity: 0})
                .start()
        },this)
        
        cc.tween(node)
            .to(3,{position:cc.v3(x,-y-200)})
            .start()
    }

    btnCloseCall () {
        let time = Number(this.labTime.string)
        if (0 < time) {
            if (null != this.hongbaoFun) {
                clearInterval(this.hongbaoFun)
            }
            
            if (null != this.timeFun) {
                clearInterval(this.timeFun)
                this.timeFun = null
            }
            LoadingViewWrap.show()
            UIMgr.getInstance().openSingleView(UIConfig.PrizeForm.path,{flag:this.m_uidata.flag,data:this.m_uidata.data,isclose:true,money:Number(this.labMoney.string)},1,null,() => {
                this.defaluClickNums = 0
            })
        }else {
            this.close()
        }
    }

    getRandom (min:number, max:number) {
        return Math.round(Math.random() * (max - min)) + min
    }

    randAlloc(total,num) {
        let imp = 0;
        let imparr = [];
        let account = 0;
        for(let i=0;i<num;i++) {
            let ac = Number(parseInt((Math.random()*100).toString()));
            imparr.push(ac);
            imp += ac;
        }
        return imparr.map((item, index)=>{
            if(index===imparr.length - 1){
                return Math.round(total*100 - account)/100;
            }else{
                let lo = Number(parseInt((item/imp*total*100).toString())) / 100 || 0.01;
                account = account + lo*100;
                return lo
            }
        })
    }
}


