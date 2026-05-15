import * as cc from 'cc';
import { Message } from '../../base/core/MessageMgr';
import { UIMgr } from '../../base/core/UIMgr';
import { BaseView } from '../../base/frame/BaseView';
import { LoadingViewWrap } from '../../base/utils/view/LoadingViewWrap';
import { UIConfig } from '../../config/UIConfig';
import { UserInfo } from '../common/UserInfo';
import { audioMgr } from '../common/AudioMgr';
const { ccclass, property } = cc._decorator;

@ccclass('PrizeSmallGame')
export class PrizeSmallGame extends BaseView {

    @property(cc.Node)
    anim0:cc.Node = null

    @property(cc.Node)
    anim1:cc.Node = null

    @property(cc.Node)
    btnStart:cc.Node = null

    @property(cc.ParticleSystem)
    ParticleSystem0:cc.ParticleSystem = null

    @property(cc.ParticleSystem)
    ParticleSystem1:cc.ParticleSystem = null

    @property(cc.ParticleSystem)
    ParticleSystem2:cc.ParticleSystem = null

    @property(cc.Prefab)
    prizeScore:cc.Prefab = null

    @property(cc.Node)
    paipaiNode:cc.Node = null

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
            this.paipaiNode.active = true
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
                    this.anim0.setScale(1,1,1)
                    this.defaluClickNums = 0
                })
            }
        }, 1000);

        let anim = this.anim1.getChildByName("animator").getComponent(cc.Animation)
        anim.on(cc.Animation.EventType.PLAY,() => {
            let mon = this.monArr.shift()
            let score = cc.instantiate(this.prizeScore)
            score.parent = this.node
            score.setPosition(cc.v3(0,100))
            score.getComponent(cc.Label).string = mon
            cc.tween(score)
                .to(0.5,{position:cc.v3(0,200)})
                .removeSelf()
                .start()
            
            
            if (mon != null) {
                this.labMoney.string = (Number(this.labMoney.string) + mon).toFixed(2)
            }
        })
        anim.on(cc.Animation.EventType.FINISHED,() => {
            this.anim0.active = true
            this.anim1.active = false
        })
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

        // if (UserInfo.isOpenBgAudio) {
        //     audioMgr.playMusic("common/audio/bg")
        // }
        
        this.node.getChildByName("audioXiaoYouBg").getComponent(cc.AudioSource).pause()
    }

    onPrizeFormSure () {
        this.close()
    }

    btnStartClickCall () {
        this.ParticleSystem0.stop()
        this.ParticleSystem1.stop()
        this.ParticleSystem2.stop()
        this.ParticleSystem0.play()
        this.ParticleSystem1.play()
        this.ParticleSystem2.play()
        audioMgr.playEffect("common/audio/clickQiQiu")
        let scaleValue = this.scaleArr[this.defaluClickNums]
        this.anim0.setScale(scaleValue,scaleValue,scaleValue)
        this.defaluClickNums += 1
        if (this.defaluClickNums == this.scaleArr.length) {
            this.anim0.active = false
            this.anim1.active = true
            this.anim1.getChildByName("animator").getComponent(cc.Animation).play()
            this.anim0.setScale(1,1,1)
            this.defaluClickNums = 0
            this.node.getChildByName("audioQiuQiuBaoZha").getComponent(cc.AudioSource).play()
            // this.scheduleOnce(() => {
            //     let mon = this.monArr.shift()
            //     let score = cc.instantiate(this.prizeScore)
            //     score.parent = this.node
            //     score.setPosition(cc.v3(0,100))
            //     score.getComponent(cc.Label).string = mon
            //     cc.tween(score)
            //         .to(1,{position:cc.v3(0,200)})
            //         .removeSelf()
            //         .start()
            //     this.anim0.active = true
            //     this.anim1.active = false
                
            //     if (mon != null) {
            //         this.labMoney.string = (Number(this.labMoney.string) + mon).toFixed(2)
            //     }
                
            // },0.3)
        }
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
                this.anim0.setScale(1,1,1)
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


