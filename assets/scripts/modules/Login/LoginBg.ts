import * as cc from 'cc';
import { BaseView } from '../../base/frame/BaseView';
import { UserInfo } from '../common/UserInfo';
import { audioMgr } from '../common/AudioMgr';
import { LOGO_TYPE, SHOW_LOGO } from '../../config/ServerConfig';
const { ccclass, property } = cc._decorator;

@ccclass('LoginBg')
export class LoginBg extends BaseView {
    @property(cc.Node)
    bg_normal: cc.Node = null;
    @property(cc.Node)
    bg_vip: cc.Node = null;

    start() {
        UserInfo.closeCommonSocket()
        audioMgr.pauseMusic()

        this.bg_normal.active = SHOW_LOGO != LOGO_TYPE.VIP
        this.bg_vip.active = SHOW_LOGO == LOGO_TYPE.VIP
    }
}


