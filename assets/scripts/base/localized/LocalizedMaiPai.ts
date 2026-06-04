import { _decorator, Component, Button, instantiate, Prefab, find, EventTouch, Vec3, UITransform, view, Node } from 'cc';
const { ccclass, property } = _decorator;

/**
 * 一键买牌按钮 - 支持拖动
 * 根据 enable_one_key_bet 字段控制显示
 */
@ccclass('LocalizedMaiPai')
export class LocalizedMaiPai extends Component {

    @property(Prefab)
    dialogPrefab: Prefab = null;  // 在编辑器中拖入 MaipaiDialog.prefab

    private isDragging: boolean = false;
    private startPos: Vec3 = new Vec3();
    private slGameComponent: any = null;  // SLGame 组件引用

    start() {
        const btn = this.node.getComponent(Button);
        if (btn) {
            btn.node.on(Button.EventType.CLICK, this.onClick, this);
        }

        // 注册拖动事件
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);

        // 查找 SLGame 组件
        this.findSLGameComponent();

        // 初始隐藏，通过 schedule 定时检查显示状态
        this.node.active = false;
        this.schedule(this.checkVisibility, 0.5);
    }

    onDestroy() {
        this.unschedule(this.checkVisibility);
        this.node.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    /** 向上查找 SLGame 组件 */
    findSLGameComponent() {
        let parent = this.node.parent;
        while (parent) {
            const slGame = parent.getComponent('SLGame');
            if (slGame) {
                this.slGameComponent = slGame;
                console.log("找到 SLGame 组件");
                break;
            }
            parent = parent.parent;
        }

        if (!this.slGameComponent) {
            console.warn("未找到 SLGame 组件");
        }
    }

    /** 检查显示状态 */
    checkVisibility() {
        if (!this.slGameComponent) {
            this.findSLGameComponent();
            return;
        }

        const machineInfo = this.slGameComponent.m_uidata?.machineInfo;
        if (machineInfo) {
            // 根据 enable_one_key_bet 控制显示
            const shouldShow = machineInfo.enable_one_key_bet === 1;
            if (this.node.active !== shouldShow) {
                this.node.active = shouldShow;
                console.log("一键买牌按钮显示状态:", shouldShow, "enable_one_key_bet:", machineInfo.enable_one_key_bet);
            }
        }
    }

    /** 获取机台数据 */
    getMachineInfo() {
        if (this.slGameComponent && this.slGameComponent.m_uidata) {
            return this.slGameComponent.m_uidata.machineInfo;
        }
        return null;
    }

    onTouchStart(event: EventTouch) {
        this.isDragging = false;
        this.startPos.set(this.node.position);
    }

    onTouchMove(event: EventTouch) {
        this.isDragging = true;
        const delta = event.getUIDelta();
        const pos = this.node.position;
        this.node.setPosition(pos.x + delta.x, pos.y + delta.y, pos.z);

        // 限制在屏幕范围内
        this.clampPosition();
    }

    onTouchEnd(event: EventTouch) {
        // 如果拖动了，就不触发点击
        if (this.isDragging) {
            this.isDragging = false;
            return;
        }
    }

    /** 限制按钮在屏幕范围内 */
    clampPosition() {
        const uiTransform = this.node.getComponent(UITransform);
        if (!uiTransform) return;

        const visibleSize = view.getVisibleSize();
        const halfWidth = uiTransform.width / 2;
        const halfHeight = uiTransform.height / 2;

        const pos = this.node.position;
        const x = Math.max(-visibleSize.width / 2 + halfWidth,
                          Math.min(pos.x, visibleSize.width / 2 - halfWidth));
        const y = Math.max(-visibleSize.height / 2 + halfHeight,
                          Math.min(pos.y, visibleSize.height / 2 - halfHeight));

        this.node.setPosition(x, y, pos.z);
    }

    onClick() {
        // 如果是拖动，不触发点击
        if (this.isDragging) {
            return;
        }

        console.log("一键买牌按钮被点击了！");
        this.showDialog();
    }

    showDialog() {
        if (!this.dialogPrefab) {
            console.error("请先在 Inspector 中关联弹窗预制体！");
            return;
        }

        const machineInfo = this.getMachineInfo();
        if (!machineInfo) {
            console.error("机台数据未找到");
            return;
        }

        console.log("开始实例化弹窗预制体");

        // 直接 instantiate，不使用 UIMgr
        const dialogNode = instantiate(this.dialogPrefab);

        // 将机台数据传递给弹窗
        (dialogNode as any)._maipaiData = {
            machine_id: machineInfo.id || machineInfo.machine_id
        };

        const canvas = find('Canvas');

        if (canvas) {
            canvas.addChild(dialogNode);
            // 设置到最上层
            dialogNode.setSiblingIndex(9999);
            console.log("弹窗已添加到 Canvas，机台ID:", machineInfo.id || machineInfo.machine_id);
        } else {
            console.error("找不到 Canvas 节点");
        }
    }
}
