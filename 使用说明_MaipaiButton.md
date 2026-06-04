# 一键买牌按钮使用说明

## 功能概述

1. **按钮显示控制**：根据机台数据的 `enable_one_key_bet` 字段控制显示
2. **API 调用**：
   - 移分OFF → `slot-action?action=move_point_off`
   - 确定购买 → `slot-action?action=bet`
3. **多语言支持**：支持简体中文、繁体中文、英文、日文
4. **拖动功能**：按钮可拖动到屏幕任意位置

---

## 在 SLGame.ts 中的集成示例

### 1. 导入脚本

```typescript
import { LocalizedMaiPai } from '../../base/localized/LocalizedMaiPai';
```

### 2. 添加属性

```typescript
@property(LocalizedMaiPai)
maipaiButton: LocalizedMaiPai = null;
```

### 3. 在获取机台数据后调用

```typescript
// 在 initData 或其他获取机台数据的地方
initData() {
    let succ = this.m_uidata.machineInfo;
    console.log("machineInfo", succ);

    // ... 其他代码 ...

    // 设置一键买牌按钮数据和显示
    if (this.maipaiButton) {
        this.maipaiButton.setMachineData(succ);
    }
}
```

### 4. 在 WebSocket 更新机台数据时同步

```typescript
// 在 onMachineUpdate 或类似方法中
onMachineUpdate(args: any) {
    if (args.id == this.m_uidata.machineInfo.id) {
        // 更新机台数据
        this.m_uidata.machineInfo.auto = args.machine_info.auto;
        this.m_uidata.machineInfo.enable_one_key_bet = args.machine_info.enable_one_key_bet;
        
        // 同步更新按钮显示
        if (this.maipaiButton) {
            this.maipaiButton.setMachineData(this.m_uidata.machineInfo);
        }
    }
}
```

---

## 在 Cocos Creator 编辑器中的设置

### SLGame.prefab

1. 确保 maipai 按钮节点存在
2. 选中 SLGame 根节点
3. 在属性检查器中找到 `SLGame` 组件
4. 将 maipai 按钮节点拖拽到 `Maipai Button` 字段

---

## 机台数据字段说明

```typescript
interface MachineInfo {
    id: number;                    // 机台ID
    enable_one_key_bet: number;    // 是否显示一键买牌按钮 (0=隐藏, 1=显示)
    // ... 其他字段
}
```

---

## API 说明

### 移分OFF

```
POST /api/v1/slot-action
{
    "machine_id": 123,
    "action": "move_point_off"
}
```

### 确定购买（押分）

```
POST /api/v1/slot-action
{
    "machine_id": 123,
    "action": "bet"
}
```

---

## 多语言配置

已在 `LabelConfig.ts` 中添加：

```typescript
["移分功能开发中..."]: [
    "移分功能开发中...",      // 简体
    "移分功能開發中...",      // 繁体
    "Transfer function under development...",  // 英文
    "移分機能は開発中..."     // 日文
],
["一键买牌功能开发中..."]: [
    "一键买牌功能开发中...",  // 简体
    "一鍵買牌功能開發中...",  // 繁体
    "Auto-buy function under development...",  // 英文
    "ワンクリック購入機能は開発中..."  // 日文
]
```

---

## 测试检查清单

- [ ] 当 `enable_one_key_bet = 1` 时，按钮显示
- [ ] 当 `enable_one_key_bet = 0` 时，按钮隐藏
- [ ] 点击"移分OFF"，调用 `slot-action?action=move_point_off`
- [ ] 点击"确定购买"，调用 `slot-action?action=bet`
- [ ] 多语言切换时，提示文字正确显示
- [ ] 按钮可以拖动，不会拖出屏幕边界
- [ ] 拖动后松开不会触发点击事件

---

## 注意事项

1. **必须先调用 `setMachineData()`** 才能使按钮正常工作
2. **按钮默认隐藏**，需要机台数据中 `enable_one_key_bet = 1` 才显示
3. **API 调用失败时也会关闭弹窗**，避免卡住
4. **机台数据变化时要同步更新**，保持按钮显示状态正确
