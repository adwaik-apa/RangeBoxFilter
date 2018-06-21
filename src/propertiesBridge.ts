module powerbi.extensibility.visual {
    "use strict";
    import DataViewObjectsModule = powerbi.extensibility.utils.dataview.DataViewObjects;

    export class propertiesBridge{

        private def_indexFrom = <DataViewObjectPropertyIdentifier>{ objectName: 'general', propertyName: 'indexFrom' };
        private def_indexTo = <DataViewObjectPropertyIdentifier>{ objectName: 'general', propertyName: 'indexTo' };
        private def_queryName =<DataViewObjectPropertyIdentifier>{ objectName: 'general', propertyName: 'queryName' };
        private objects:DataViewObjects;
        private host:IVisualHost;

        constructor(host:IVisualHost,objects:DataViewObjects){
            this.host = host;
            this.objects = objects;
        }

        public getFromIndex():number{
            return DataViewObjectsModule.getValue<number>(this.objects,this.def_indexFrom,-1);
        }

        public getToIndex():number {
            return DataViewObjectsModule.getValue<number>(this.objects,this.def_indexTo,-1);
        }

        public getQueryName():string {
            return DataViewObjectsModule.getValue<string>(this.objects,this.def_queryName,".");
        }

        public setFromIndex(idx:number) {
            this.host.persistProperties(<VisualObjectInstancesToPersist> {
                merge:[{
                    objectName:"general",
                    selector:null,
                    properties:{
                        indexFrom: idx
                    }
                    }]
                }
            );
        }

        public setToIndex(idx:number){
            this.host.persistProperties(<VisualObjectInstancesToPersist> {
                merge:[{
                    objectName:"general",
                    selector:null,
                    properties:{
                        indexTo: idx
                    }
                    }]
                }
            );
        }

        public setQueryName(q:string){
            this.host.persistProperties(<VisualObjectInstancesToPersist> {
                merge:[{
                    objectName:"general",
                    selector:null,
                    properties:{
                        queryName: q
                    }
                    }]
                }
            );
        }

  
    }

}