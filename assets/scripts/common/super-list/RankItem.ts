import * as cc from 'cc';
import { BaseItem } from './baseItem';
import { SuperLayout } from './super-layout';
import { UrlImageView } from '../../base/gui/urlImageView';
const { ccclass, property } = cc._decorator;

@ccclass('RankItem')
export class RankItem extends BaseItem {
    onLoad() {
        // this.input.placeholder = this.transform?.height.toString()!
    }
    onInput() {
        // let height = Number(this.input.string)
        // if (isNaN(height)) return
        // if (height < 100) {
        //     return
        // }
        // this.transform?.setContentSize(new Size(this.transform.contentSize.width, height))
        // this.layout.updateItemSize(this.node, this.transform?.contentSize!)
    }
    show(data: any, index: number, callback: Function, layout: SuperLayout) {
        super.show(data, index, callback, layout)
        let labMoney = this.transform.getChildByName("labMoney").getComponent(cc.Label)
        let labFlag = this.transform.getChildByName("labFlag").getComponent(cc.Label)
        let labName = this.transform.getChildByName("labName").getComponent(cc.Label)
        let img = this.transform.getChildByName("avatar").getChildByName("img").getComponent(UrlImageView)
        labMoney.string = data.money
        labFlag.string = (index + 4).toString()
        labName.string = data.name == "" ? data.uuid:data.name
        img.setUrl(data.avatar)
    }
}


