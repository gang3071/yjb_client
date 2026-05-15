import * as cc from 'cc';
const { ccclass, property } = cc._decorator;

@ccclass('AudioPlay')
export class AudioPlay extends cc.Component {

    @property(cc.AudioClip)
    clickHongBao:cc.AudioClip = null

    @property(cc.AudioClip)
    clickQiQiu:cc.AudioClip = null

    @property(cc.AudioClip)
    fengMing:cc.AudioClip = null

    @property(cc.AudioClip)
    huXiao:cc.AudioClip = null

    @property(cc.AudioClip)
    jinbiDown:cc.AudioClip = null

    @property(cc.AudioClip)
    longYing:cc.AudioClip = null

    @property(cc.AudioClip)
    qiuQiuBaoZha:cc.AudioClip = null

    @property(cc.AudioClip)
    shenli:cc.AudioClip = null

    @property(cc.AudioClip)
    shuziTiaoDong:cc.AudioClip = null

    @property(cc.AudioClip)
    xiaoyouxiBg:cc.AudioClip = null

    @property(cc.AudioClip)
    bg:cc.AudioClip = null

    start() {
        
    }



    update(deltaTime: number) {
        
    }
}


