import { _decorator, Component, Node, Sprite, UITransform, EventTouch, Vec3, Vec2, view, Rect, Touch } from 'cc';
import { Tools } from './Tools';
const { ccclass, property } = _decorator;

@ccclass('PinchZoom')
export class PinchZoom extends Component {
    @property(Node)
    private Node: Node = null;

    /** 双指初始距离 */
    private _startDistance = 0;
    /** 当前缩放 */
    private _startScale
    /** 当前双指中心 */
    private _originalRect
    /** 最大缩放 */
    private _maxScale = 3
    /** 最小缩放 */
    private _minScale = 1
    /** 节点UI组件 */
    private _NodeUITransform: UITransform;
    /** 是否开始缩放 */
    private _beginScale = false

    start() {
        this._beginScale = false
        this._NodeUITransform = this.Node.getComponent(UITransform)!;
        this._originalRect = new Rect(this.Node.position.x, this.Node.position.y, this._NodeUITransform.contentSize.width, this._NodeUITransform.contentSize.height);
        this.node.on(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.on(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.on(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.on(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    onDestroy() {
        this.node.off(Node.EventType.TOUCH_START, this.onTouchStart, this);
        this.node.off(Node.EventType.TOUCH_MOVE, this.onTouchMove, this);
        this.node.off(Node.EventType.TOUCH_END, this.onTouchEnd, this);
        this.node.off(Node.EventType.TOUCH_CANCEL, this.onTouchEnd, this);
    }

    onTouchStart(event: EventTouch) {}

    onTouchMove(event:EventTouch){
        const touches = event.getTouches();
        // 单指拖动
        if (touches.length == 1) {
            const p = event.getDelta();
            const op = this.Node.position;
            const pos = new Vec3(op.x + p.x, op.y + p.y, op.z);
            let xy = this.clampPosition(new Vec2(pos.x, pos.y), this.Node.scale.x)
            this.Node.setPosition(new Vec3(xy.x, xy.y, op.z));
        }
        // 双指缩放
        else if (touches.length == 2) {
                if (this._beginScale == false) {
                    this._beginScale = true;
                    this._startDistance = this.getDistance(touches[0], touches[1]);
                    this._startScale = this.Node.scale.x;
                }

                if (this._beginScale == true){
                    const currentDistance = this.getDistance(touches[0], touches[1]);
                    const scaleFactor = currentDistance / this._startDistance;
                    const newScale = this._startScale * scaleFactor;
                    // Clamp the scale between minScale and maxScale
                    const clampedScale = Math.min(this._maxScale, Math.max(this._minScale, newScale));
                    this.Node.setScale(clampedScale, clampedScale, clampedScale);
    
                    // Check if the new image rect is within the screen bounds
                    const clampedPosition = this.clampPosition(new Vec2(this.Node.position.x, this.Node.position.y), clampedScale);
                    this.Node.setPosition(new Vec3(clampedPosition.x, clampedPosition.y, 0));
                }
        }
    }

    private onTouchEnd(event: EventTouch) { 
        this._beginScale = false
    }

    /** 获取两指之间的距离 */
    private getDistance(touch1: Touch, touch2: Touch): number {
        const dx = touch1.getLocation().x - touch2.getLocation().x;
        const dy = touch1.getLocation().y - touch2.getLocation().y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    /** 获取两指之间的中点 */
    private getMidPoint(touch1: Touch, touch2: Touch): Vec2 {
        const x = (touch1.getLocation().x + touch2.getLocation().x) / 2;
        const y = (touch1.getLocation().y + touch2.getLocation().y) / 2;
        return new Vec2(x, y);
    }

    /** 限制位置 */
    private clampPosition(newPosition: Vec2, scale: number): Vec2 {
        const minX = this._originalRect.x  + this._originalRect.width / 2 - this._originalRect.width / 2 * scale
        const minY = this._originalRect.y  + this._originalRect.height / 2 - this._originalRect.height / 2 * scale
        const maxX = this._originalRect.x  + this._originalRect.width / 2 * scale - this._originalRect.width / 2
        const maxY = this._originalRect.y  + this._originalRect.height / 2 * scale - this._originalRect.height / 2

        let clampedX = Tools.MathClamp(newPosition.x, minX, maxX)
        let clampedY = Tools.MathClamp(newPosition.y, minY, maxY);

        return new Vec2(clampedX, clampedY);
    }
}