import { _decorator, Component, Button } from 'cc';
import { AlterTipsWrap } from '../../base/utils/view/AlterTipsWrap';
import { LocalizadManager } from '../../base/localized/LocalizedManager';
import { LabelConfig } from '../../config/LabelConfig';
import { httpRequest } from '../../NetMgr/HttpRequest';
const { ccclass, property } = _decorator;

/**
 * 移分OFF按钮 - 调用 slot-action API
 */
@ccclass('MaipaiButtonMoveOff')
export class MaipaiButtonMoveOff extends Component {

    /** 机台ID（从弹窗数据中获取） */
    private machineId: number = 0;

    start() {
        const btn = this.node.getComponent(Button);
        if (btn) {
            btn.node.on(Button.EventType.CLICK, this.onClick, this);
        }

        // 从弹窗根节点获取机台数据
        this.getMachineId();
    }

    /** 从父节点获取机台ID */
    getMachineId() {
        let parent = this.node.parent;
        while (parent) {
            if (parent.name === 'MaipaiDialog') {
                // 从根节点的自定义数据中获取
                const data = (parent as any)._maipaiData;
                if (data && data.machine_id) {
                    this.machineId = data.machine_id;
                }
                break;
            }
            parent = parent.parent;
        }
    }

    onClick() {
        console.log("移分OFF按钮点击");

        if (!this.machineId) {
            console.error("未找到机台ID");
            return;
        }

        // 调用 slot-action API - move_point_off
        httpRequest.post("api/v1/slot-action", {
            machine_id: this.machineId,
            action: "move_point_off"
        }, (succ: any) => {
            console.log("移分OFF成功", succ);

            // 使用 LabelConfig 多语言配置
            const lang = LocalizadManager.getInstance().getLanauge();
            const message = LabelConfig["移分功能开发中..."][lang - 1];

            AlterTipsWrap.show(message);
            this.closeDialog();
        }, (fail: any) => {
            console.error("移分OFF失败", fail);
            this.closeDialog();
        });
    }

    /** 关闭弹窗 */
    closeDialog() {
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
