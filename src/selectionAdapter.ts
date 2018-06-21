module powerbi.extensibility.visual {
    "use strict";

    export class SelectionAdapter{
        private selectionManager:ISelectionManager;
        private nodes:DataNode[];
        private element_from:HTMLSelectElement;
        private element_to:HTMLSelectElement;
        private type:string;

        private indexFrom:number = -1;
        private indexTo:number = -1;

        private settings:settingsHolder = undefined;

        constructor(selectionManager:ISelectionManager,
            nodes:DataNode[],
            element_from:HTMLSelectElement,
            element_to:HTMLSelectElement,
            type:string,
            settings:settingsHolder){
            
            this.selectionManager = selectionManager;
            this.nodes = nodes;
            this.element_from = element_from;
            this.element_to = element_to;
            this.type = type;
            this.settings = settings;

            this.indexFrom = this.settings.propertiesBridge.getFromIndex();
            this.indexTo = this.settings.propertiesBridge.getToIndex();

            
            this.Init_Events();

            
        }

        public update(
            nodes:DataNode[],
            element_from:HTMLSelectElement,
            element_to:HTMLSelectElement,
            type:string)
        {
            this.nodes = nodes;
            this.element_from = element_from;
            this.element_to = element_to;
            this.type = type;

            this.Init_Events();
        }

        private Init_Events(){

            if(this.indexFrom == -1 || this.indexTo == -1 
                || this.indexFrom >= this.element_from.childElementCount || this.indexTo >= this.element_from.childElementCount)
            {
                this.indexFrom = 0; 
                this.settings.propertiesBridge.setFromIndex(this.indexFrom);

                this.indexTo = this.element_from.childElementCount > 1 ? 1:0; 
                this.settings.propertiesBridge.setToIndex(this.indexTo);
            }

            this.element_from.selectedIndex = this.indexFrom; 
            this.element_to.selectedIndex = this.indexTo;

            this.element_from.addEventListener('change',(EVENT)=>this.selectionChanged(EVENT.target as HTMLSelectElement));
            this.element_to.addEventListener('change',(EVENT)=>this.selectionChanged(EVENT.target as HTMLSelectElement));
            
            //Update Selection
            this.selectionChanged(this.element_from);
        }

        private selectionChanged(Element:HTMLSelectElement){


            let fromIdx = parseInt(this.element_from.value);
            let toIdx = parseInt(this.element_to.value);

            if(fromIdx == -1 || toIdx == -1) return;

            let fromVal = this.nodes[fromIdx].Value;
            let toVal = this.nodes[toIdx].Value;

            
            if(this.validate(fromVal,toVal)){
                if(Element == this.element_from){
                    this.indexFrom = Element.selectedIndex;
                    this.settings.propertiesBridge.setFromIndex(this.indexFrom);
                }
                else {
                    this.indexTo = Element.selectedIndex;
                    this.settings.propertiesBridge.setToIndex(this.indexTo);
                }

                //apply Selection
                this.applySelection(fromVal,toVal);
            }
            else { //Recover Valid State
                if(Element == this.element_from)
                    this.element_from.selectedIndex = this.indexFrom;
                else // element_to
                    this.element_to.selectedIndex = this.indexTo;
            }
        }

        private validate(fromVal:Object,toVal:Object):boolean{
            if(this.type == "num")
            return (fromVal as number) <= (toVal as number);
            else //when it is <date>
            return (fromVal as MyDate).compare((toVal as MyDate)) <= 0;
        }

        private applySelection(fromVal:Object,toVal:Object){
            let toSelect:ISelectionId[] = new Array();
            
            for(let node of this.nodes){
                if(this.type == "num"){
                    if((node.Value as number) >= (fromVal as number) && (node.Value as number) <= (toVal as number))
                        toSelect.push(node.Identity);
                }
                else {
                    if((node.Value as MyDate).compare((fromVal as MyDate),this.settings.dateFormat) >= 0 
                    && (node.Value as MyDate).compare((toVal as MyDate),this.settings.dateFormat) <= 0)
                        toSelect.push(node.Identity);
                }
            }
            
            if(toSelect.length > 0){
                this.selectionManager.select(toSelect);
                this.selectionManager.applySelectionFilter();
            }
            else{
                this.selectionManager.clear();
            }
        }

      

        public reset(){
            this.indexFrom = -1; this.settings.propertiesBridge.setFromIndex(-1);
            this.indexTo  = -1; this.settings.propertiesBridge.setToIndex(-1);
        }

        public updateElements(element_from:HTMLSelectElement,element_to:HTMLSelectElement){
            this.element_from = element_from;
            this.element_to = element_to;
        }

    }



}