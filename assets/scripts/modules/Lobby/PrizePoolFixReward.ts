import * as cc from 'cc';
import { UIMgr } from '../../base/core/UIMgr';
import { BaseView } from '../../base/frame/BaseView';
import { UIConfig } from '../../config/UIConfig';
import { UserInfo } from '../common/UserInfo';
import { audioMgr } from '../common/AudioMgr';
import { Vec3 } from 'cc';
import { Tools } from '../../base/utils/util/Tools';
const { ccclass, property } = cc._decorator;

@ccclass('PrizePoolFixReward')
export class PrizePoolFixReward extends BaseView {

    // @property(cc.sp.Skeleton)
    // bgSpine:cc.sp.Skeleton = null

    @property(cc.sp.Skeleton)
    animBg0:cc.sp.Skeleton = null
    // @property(cc.sp.Skeleton)
    // animBg1:cc.sp.Skeleton = null

    // @property([cc.sp.Skeleton])
    // spineArr:cc.sp.Skeleton[] = []
    
    @property(cc.Label)
    labMoney:cc.Label = null

    @property(cc.Button)
    bntSure:cc.Button = null

    @property(cc.Node)
    animParent:cc.Node = null

    time:number = 0
    add:boolean = true
    indexNum = 0

    animPos:Vec3 = new Vec3(8.256, -40.345, 0)

    animPath = ["Lobby/anim/qinglong","Lobby/anim/zhuque","Lobby/anim/xuanwu","Lobby/anim/baihu"]

    start() {
        console.log("=PrizePoolFixReward====")
        this.bntSure.node.active = false
        // for (let i=0; i<this.spineArr.length; i++) {
        //     this.spineArr[i].node.active = false
        // }
        // this.spineArr[this.m_uidata.data.lottery_record.lottery_sort-1].node.active = true
        // this.labMoney.string = this.m_uidata.data.lottery_record.amount
        
        // if (0 == this.m_uidata.data.lottery_record.lottery_sort-1) {
        //     audioMgr.playEffect("common/audio/longYing")
        // }else if (1 == this.m_uidata.data.lottery_record.lottery_sort-1) {
        //     audioMgr.playEffect("common/audio/fengMing")
        // }else if (2 == this.m_uidata.data.lottery_record.lottery_sort-1) {
            
        // }else if (3 == this.m_uidata.data.lottery_record.lottery_sort-1) {
        //     audioMgr.playEffect("common/audio/huXiao")
        // }
        let num = (this.m_uidata.data.lottery_record.lottery_sort-1) % this.animPath.length
        this.m_resLoader.loadPrefab(this.animPath[num],(err:Error,prefab:cc.Prefab) => {
            let animNode = cc.instantiate(prefab)
            animNode.setPosition(this.animPos)
            this.animParent.addChild(animNode)
        })

        this.animBg0.setCompleteListener(() => {
            // this.animBg1.node.active = false
            // this.animBg0.node.active = true
            this.animBg0.setAnimation(0,"animation2",true)
        })

        // this.animBg0.setCompleteListener(() => {
        //     this.animBg0.setAnimation(0,"animation2")
        // })

        this.indexNum = (parseInt((Number(this.m_uidata.data.lottery_record.amount)/600).toString())) + 1
    }

    onEnable () {
        //audioMgr.pauseMusic()
        this.scheduleOnce(() => {
            this.node.getChildByName("audioShenLi").getComponent(cc.AudioSource).play()
        },0.2)
        this.node.getChildByName("audioXiaoYouBg").getComponent(cc.AudioSource).play()
        this.node.getChildByName("audioJinBiDown").getComponent(cc.AudioSource).play()
    }

    onDisable () {
        // if (UserInfo.isOpenBgAudio) {
        //     audioMgr.playMusic("common/audio/bg")
        // }
        this.node.getChildByName("audioXiaoYouBg").getComponent(cc.AudioSource).pause()
        this.node.getChildByName("audioJinBiDown").getComponent(cc.AudioSource).pause()
        // this.node.getChildByName("audioLongYing").getComponent(cc.AudioSource).pause()
        // this.node.getChildByName("audioFengMing").getComponent(cc.AudioSource).pause()
        // this.node.getChildByName("audioHuXiao").getComponent(cc.AudioSource).pause()
        this.node.getChildByName("audioShenLi").getComponent(cc.AudioSource).pause()
    }

    btnSureCall () {
        this.close()
    }

    btnSkipAnimCall () {
        this.add = false
        this.labMoney.string = this.m_uidata.data.lottery_record.amount
        this.bntSure.node.active = true
    }

    update(deltaTime: number) {
        if (this.add) {
            this.time += deltaTime
            this.labMoney.string = (Number(this.labMoney.string) + this.indexNum).toString()
            if (this.m_uidata.data.lottery_record.amount < Number(this.labMoney.string)) {
                this.add = false
                this.labMoney.string = this.m_uidata.data.lottery_record.amount
                this.bntSure.node.active = true
            }
        }
    }
}