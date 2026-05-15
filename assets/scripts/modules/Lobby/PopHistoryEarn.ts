import { _decorator, Node, ScrollView } from "cc";
import { BaseView } from "../../base/frame/BaseView";
import { Tools } from "../../base/utils/util/Tools";
const {ccclass, property} = _decorator;
/** 每次请求数量 */
const DEFAULT_REQ_NUM = 12

/** 收益类型 */
const EARN_TYPE = {
    0 : "首充返佣",
    1 : "客损返佣"
}

@ccclass('PopHistoryEarn')
export class PopHistoryEarn extends BaseView {
    /** 预制件 */
    @property(Node)
    item:Node;
    /** 列表展示区域 */
    @property(Node)
    grid:Node;
    @property(ScrollView)
    scroll:ScrollView;

    /** 当前页面 */
    private _page : number;
    /** 是否正在请求数据 */
    private _isLoading : boolean = false

    start() { 
        this._page = 1
        this.reqDat() 
        this.scroll.node.on(ScrollView.EventType.SCROLL_TO_BOTTOM, this.reqAddDat, this)
    }

    /** 二次请求数据 */
    reqAddDat(){
        if (this._isLoading) return
        this._isLoading = true
        this._page += 1
        this.reqDat()
    }

    /** 请求数据 */
    reqDat()
    {
        Tools.httpReq("national-profit-record", {
            page : this._page,
            size : DEFAULT_REQ_NUM
        }, (res : any)=>{
            this._isLoading = false
            if (this._page == 1) this.grid.removeAllChildren()
            this.addHisDat(res)  
        })
    }

    /** 添加历史记录 */
    addHisDat(dat : any)
    {
        for (let i = 0; i < dat.length; i++) {
            const d = dat[i];
            let item = Tools.AddChild(this.grid, this.item)
            Tools.SetChildText(item, "index", d.id)
            Tools.SetChildText(item, "money", d.money)
            Tools.SetChildText(item, "time", d.updated_at)
            Tools.SetChildText(item, "name", d.player.name)
            Tools.SetChildText(item, "type", EARN_TYPE[d.type])
            item.active = true
        }
    }
}