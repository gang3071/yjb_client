import { _decorator, Component, Button } from 'cc';
const { ccclass } = _decorator;

/**
 * 关闭按钮
 */
@ccclass('MaipaiButtonClose')
export class MaipaiButtonClose extends Component {
    start() {
        const btn = this.node.getComponent(Button);
        if (btn) {
            btn.node.on(Button.EventType.CLICK, this.onClick, this);
        }
    }

    onClick() {
        console.log("关闭按钮点击");
        // 向上查找 MaipaiDialog 节点并销毁
        let parent = this.node.parent;
        while (parent) {
            if (parent.name === 'MaipaiDialog') {
                parent.destroy();
                return;
            }
            parent = parent.parent;
        }
    }
}
