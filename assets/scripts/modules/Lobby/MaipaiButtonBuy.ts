import { _decorator, Component, Button } from 'cc';
import { AlterTipsWrap } from '../../base/utils/view/AlterTipsWrap';
import { LocalizadManager } from '../../base/localized/LocalizedManager';
import { LabelConfig } from '../../config/LabelConfig';
import { httpRequest } from '../../NetMgr/HttpRequest';
const { ccclass, property } = _decorator;

/**
 * 确定购买按钮 - 调用 slot-action API
 */
@ccclass('MaipaiButtonBuy')
export class MaipaiButtonBuy extends Component {

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
        console.log("确定购买按钮点击");

        if (!this.machineId) {
            console.error("未找到机台ID");
            return;
        }

        // 调用 slot-action API - bet
        httpRequest.post("api/v1/slot-action", {
            machine_id: this.machineId,
            action: "bet"
        }, (succ: any) => {
            console.log("购买API返回完整数据:", JSON.stringify(succ));

            // 处理服务端返回的消息
            if (succ) {
                const lang = LocalizadManager.getInstance().getLanauge();
                let message: string;

                // 根据 code 判断是否成功
                if (succ.code === 200) {
                    message = LabelConfig["操作成功"][lang - 1];
                } else {
                    // 失败时显示服务端返回的错误信息，如果没有则显示"操作失败"
                    message = succ.msg || LabelConfig["操作失败"][lang - 1];
                }

                AlterTipsWrap.show(message);
            }

            this.closeDialog();
        }, (fail: any) => {
            console.error("确定购买失败", fail);
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
