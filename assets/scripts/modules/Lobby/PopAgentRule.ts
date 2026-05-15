import { _decorator, Node, EventTouch, Label } from "cc";
import { BaseView } from "../../base/frame/BaseView";
import { Tools } from "../../base/utils/util/Tools";
import { UITransform } from "cc";
import { Vec3 } from "cc";
const {ccclass, property} = _decorator;

@ccclass('PopAgentRule')
export class PopAgentRule extends BaseView {
    /** 预制件 */
    @property(Node)
    item:Node;
    /** 列表展示区域 */
    @property(Node)
    grid:Node;

    start() {
        this.reqDat()
    }

    /** 请求数据 */
    reqDat()
    {
        Tools.httpReq("national-promoter-rules", {}, (res : any) => {
            this.initMsg(res)
        })
    }
 
    /** 初始化列表 */
    initMsg(dat:any)
    {
        for (let i = 0; i < dat.length; i++) {
            const d = dat[i];
            let item = Tools.AddChild(this.grid, this.item)
            Tools.SetChildText(item, "lab_lv", Tools.GetAgentLvLocalized(d.national_level.name, d.level))
            Tools.SetChildAgentLvIcon(item, "icon", d.national_level.name, d.level)
            Tools.SetChildText(item, "per_1", d.damage_rebate_ratio + "%")
            Tools.SetChildText(item, "per_2", d.recharge_ratio)
            item.active = true
        }
    }
}