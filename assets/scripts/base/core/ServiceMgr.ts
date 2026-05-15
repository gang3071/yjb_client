import * as cc from "cc"

const {ccclass, property} = cc._decorator;
type CLS_NEW<T> =  new()=>T;

export class ServiceMgr {
    private static m_services : Map<string, any> = new Map;

    public static getService<T>( name : string, cls : CLS_NEW<T>) : T{
        let instance = this.m_services.get(name)
        if(instance == null){
            instance = new cls();
            instance.start();
            this.m_services.set(name, instance);
        }

        return instance;
    }
    
    public static stop(){
        this.m_services.forEach(( service )=>{
            service.stop();
        })
    }
}
