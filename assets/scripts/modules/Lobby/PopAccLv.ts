import { _decorator, Node, Sprite, Label } from "cc";
import { BaseView } from "../../base/frame/BaseView";
import { Tools } from "../../base/utils/util/Tools";
import { UserInfo } from "../common/UserInfo";
const {ccclass, property} = _decorator;

@ccclass('PopAccLv')
export class PopAccLv extends BaseView {
    /** 当前等级 */
    @property(Label)
    now_lv : Label = null;
    /** 等级ICON */
    @property(Node)
    now_lv_icon : Node = null;
    /** 距离下一等级 */
    @property(Label)
    next_lv_need : Label = null;
    /** 下一等级 */
    @property(Label)
    next_lv : Label = null;
    /** 等级经验 */
    @property(Label)
    pro_exp_num : Label = null;
    /** 等级经验条 */
    @property(Sprite)
    pro_exp_pro: Sprite = null;

    /** 返佣词条 */
    @property(Node)
    fanyong : Node = null;

    start() {
        this.reqDat()
        this.fanyong.active = UserInfo.is_promoter == 0 
    }
    
    /** 请求数据 */
    reqDat()
    {
        Tools.httpReq("national-level", {}, (res : any) => {
            this.initMsg(res)
        })
    }

    /** 初始化数据 */
    initMsg(dat:any)
    {
        UserInfo.national_promoter = dat.national_promoter
        UserInfo.national_level = dat.national_level
        this.now_lv.string = Tools.GetAgentLvLocalized(dat.national_promoter, dat.national_level)
        Tools.SetAgentLvIcon(this.now_lv_icon, dat.national_promoter, dat.national_level)
        this.next_lv_need.string = dat.next_level_need
        this.next_lv.string = "[" + Tools.GetAgentLvLocalized(dat.next_national_promoter, dat.next_national_level) + "]"
        this.pro_exp_num.string = dat.chip_amount + "/" + dat.next_chip_amount
        this.pro_exp_pro.fillRange = dat.chip_amount / dat.next_chip_amount
    }
}