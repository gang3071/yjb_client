
import { _decorator, Component, Node } from 'cc';
import { BaseItem } from './baseItem';
import { SuperLayout } from './super-layout';
import { BaseMain } from './baseMain';
const { ccclass, property } = _decorator;

@ccclass('Page')
export class Page extends BaseMain {
    @property(SuperLayout) m_layout!: SuperLayout
    start() {
        for (let i = 0; i < 8; i++) {
            this.datas.push({
                message: i
            })
        }
        this.m_layout.total(this.datas.length)
    }
    onRefreshEvent(item: Node, index: number) {
        item.getComponent(BaseItem)?.show(this.datas[index], index, this.onClickItem.bind(this),this.m_layout)
    }
    onClickItem() {
    }

    onPageEvent(event: any) {
        console.error(this.m_layout.currPageIndex)
    }
}
