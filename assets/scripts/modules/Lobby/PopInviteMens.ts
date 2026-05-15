import { _decorator, Node, EventTouch, Label } from "cc";
import { BaseView } from "../../base/frame/BaseView";
import { Tools } from "../../base/utils/util/Tools";
const {ccclass, property} = _decorator;

@ccclass('PopInviteMens')
export class PopInviteMens extends BaseView {
    /** 预制件 */
    @property(Node)
    item:Node;
    /** 列表展示区域 */
    @property(Node)
    grid:Node;

    start() { this.reqDat() }

    /** 请求数据 */
    reqDat() {
        Tools.httpReq("national-invite-rules", null, (res : any)=>{
            this.initdata(res)
        })
    }

    /** 初始化数据 */
    initdata(dat:any)
    {
        this.grid.destroyAllChildren()
        let n = 1
        for (let i = 0; i < dat.length; i++) {
            const d = dat[i];
            let item = Tools.AddChild(this.grid, this.item)
            Tools.SetChildText(item, "index", String(n++))
            Tools.SetChildText(item, "msg", Tools.StringFormat(Tools.GetLocalized("邀请奖励信息"), d.min, d.max, d.interval, d.money))
            item.active = true
        }
    }
}