import { Asset, resources, Node } from "cc";
import { Sprite } from "cc";
import { Label } from "cc";

/** 为了解决加载前面时间进度过快 */
const DELAY_TIME = 500

/** AB包加载管理类 */
export class AssetBundleMgr {
    // 全局唯一单例
    public static instance: AssetBundleMgr = null;
    // 私有化构造函数
    private constructor() {}

    private max_pro = 0
    // 保证全局唯一实例
    public static getInstance(): AssetBundleMgr {
        if (AssetBundleMgr.instance === null) {
            AssetBundleMgr.instance = new AssetBundleMgr();
        }
        return AssetBundleMgr.instance;
    }

    /** 加载bundle目录 */
    public loadAssetBundleDir(name: string, callback: Function, bar: Node = null, lab_pro: Node = null) {
        this.max_pro = 0
        let start_time = Date.now();
        let start_show = false
        let before_count = 0
        resources.loadDir(name, (completedCount: number, totalCount: number, item: any) => {
            // 延迟0.2秒更新进度条
            if (Date.now() - start_time > DELAY_TIME && !start_show) {
                start_show = true
                before_count = completedCount
            }
            if (Date.now() - start_time > DELAY_TIME && start_show && totalCount > before_count) {
                const progress = (completedCount - before_count) / (totalCount - before_count);
                this.max_pro = Math.max(this.max_pro, progress)
                if (bar) bar.getComponent(Sprite).fillRange = this.max_pro;
                if (lab_pro) lab_pro.getComponent(Label).string = `Loading ${(this.max_pro * 100).toFixed(2)}%`;
            }
        }, (err: Error | null, assets: Asset[]) => {
            if (err) {
                console.error('加载 Bundle 失败:', err);
                return;
            }
            if (callback) callback(assets);
            // 假设 bundle 是通过 assets 获取的，具体实现可能需要根据实际情况调整
            // const bundle = assetManager.getBundle(name);
            // if (bundle) {
            //     if (callback) callback(bundle);
            // } else {
            //     console.error('未能找到对应的 Bundle');
            // }
        });
    }
}

export const ABMgr = AssetBundleMgr.getInstance();
