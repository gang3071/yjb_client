import * as cc from 'cc';
import { BaseView } from '../../base/frame/BaseView';
import { UrlImageView } from '../../base/gui/urlImageView';
const { ccclass, property } = cc._decorator;

/** 活动详细信息页面 */
@ccclass('ActivityDetail')
export class ActivityDetail extends BaseView {
    /** 活动描述 */
    @property(cc.RichText)
    labDetail:cc.RichText = null
    /** 活动参与条件 */
    @property(cc.Label)
    labJoinCondition:cc.Label = null
    /** 奖励领取方式 */
    @property(cc.Label)
    labGetRewardWay:cc.Label = null
    /** 活动开放时间 */
    @property(cc.Label)
    labTime:cc.Label = null
    // 活动图片
    @property(cc.Node)
    actPic:cc.Node = null

    start() {
        // 顶部图片显示
        this.actPic.active = this.m_uidata.picture != ""
        this.actPic.getComponent(UrlImageView).setUrl(this.m_uidata.picture)
        // 活动描述
        this.labDetail.string = "<color=#9EAAC8>" + this.m_uidata.description + "</color>"
        // 活动参与条件
        this.labJoinCondition.string = this.m_uidata.join_condition
        // 奖励领取方式
        this.labGetRewardWay.string = this.m_uidata.get_way
        // 活动开放时间
        this.labTime.string = this.m_uidata.start_time + "-" + this.m_uidata.end_time
    }

    btnCloseCall() { this.close() }
}