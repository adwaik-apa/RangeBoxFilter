/*
 *  Power BI Visual CLI
 *
 *  Copyright (c) Microsoft Corporation
 *  All rights reserved.
 *  MIT License
 *
 *  Permission is hereby granted, free of charge, to any person obtaining a copy
 *  of this software and associated documentation files (the ""Software""), to deal
 *  in the Software without restriction, including without limitation the rights
 *  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 *  copies of the Software, and to permit persons to whom the Software is
 *  furnished to do so, subject to the following conditions:
 *
 *  The above copyright notice and this permission notice shall be included in
 *  all copies or substantial portions of the Software.
 *
 *  THE SOFTWARE IS PROVIDED *AS IS*, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 *  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 *  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 *  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 *  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 *  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 *  THE SOFTWARE.
 */

module powerbi.extensibility.visual {
    "use strict";

    export interface DataNode {
        Identity:ISelectionId,
        Title:string,
        Value:Object
    }

    export interface settingsHolder{
        startTitle:string,
        endTitle:string,
        fontSize:number,
        boxBackground:string,
        boxTextColor:string,
        dateFormat:string,
        dateSeparator:string,
        propertiesBridge:propertiesBridge,
        queryName:string
    }


    export class Visual implements IVisual {
        private target: HTMLElement;
        private host: IVisualHost;
        private settings: VisualSettings;
        private selectionManager: ISelectionManager;
        private selectionAdapter:SelectionAdapter
        private settingsHolder:settingsHolder;

        

        constructor(options: VisualConstructorOptions) {
            this.target = options.element;
            this.host = options.host;
            this.selectionManager = this.host.createSelectionManager();

            this.settingsHolder = {
                boxBackground:"",
                boxTextColor:"",                
                endTitle:"",
                startTitle:"",
                fontSize:14,
                dateFormat:"D-M-Y",
                dateSeparator:"-",
                propertiesBridge:undefined,
                queryName:""
            };
        }

        public update(options: VisualUpdateOptions) {
            this.settings = Visual.parseSettings(options && options.dataViews && options.dataViews[0]);
            var dv = options.dataViews;

            //Update PropertyBridge
            this.settingsHolder.propertiesBridge = new propertiesBridge(this.host,dv[0].metadata.objects);

            let formatSettingsChanged = this.getFormatSettings() && this.target.childElementCount != 0;
            let styleSettingsChanged  = this.getStyleSettings() && this.target.childElementCount != 0 ;
            let queryNameChanged = this.getQueryNamesettings(dv[0].categorical.categories[0].source);
            
            if(!dv || !dv[0] || !dv[0].categorical || !dv[0].categorical.categories[0] 
                || !dv[0].categorical.categories[0].values || dv[0].categorical.categories[0].values.length == 0
                || !(dv[0].metadata.columns[0].type.dateTime || dv[0].metadata.columns[0].type.numeric)){
                
                while(this.target.firstChild) 
                this.target.removeChild(this.target.firstChild);

                if(this.selectionAdapter != undefined ) this.selectionAdapter.reset();
            }
            else if(styleSettingsChanged || formatSettingsChanged || this.target.childElementCount == 0 || queryNameChanged )
            {    

                
                let category = dv[0].categorical.categories[0];
                let values = category.values;
                let type =  (dv[0].metadata.columns[0].type.dateTime?"date":"num");
                let nodes = this.getDataNodes(category,values, type);

                if(queryNameChanged || formatSettingsChanged){
                    this.selectionAdapter?this.selectionAdapter.reset():null;
                }
               
                while(this.target.firstChild) this.target.removeChild(this.target.firstChild);

                this.InitView(nodes,type);
                
            }

        }

        private getStyleSettings():boolean{
            let res:boolean = false;

            if(this.settings.dataPoint.boxBackground != this.settingsHolder.boxBackground) 
            {
                res = true;
                this.settingsHolder.boxBackground = this.settings.dataPoint.boxBackground
            }
            if(this.settings.dataPoint.boxTextColor != this.settingsHolder.boxTextColor) 
            {
                res = true;
                this.settingsHolder.boxTextColor = this.settings.dataPoint.boxTextColor
            }
            if(this.settings.dataPoint.startTitle != this.settingsHolder.startTitle) 
            {
                res = true;
                this.settingsHolder.startTitle = this.settings.dataPoint.startTitle
            }
            if(this.settings.dataPoint.endTitle != this.settingsHolder.endTitle)
            {
                res = true;
                this.settingsHolder.endTitle = this.settings.dataPoint.endTitle
            }
            if(this.settings.dataPoint.fontSize != this.settingsHolder.fontSize)
            {
                res = true;
                this.settingsHolder.fontSize = this.settings.dataPoint.fontSize
            }

            return res;
        }

        private getFormatSettings():boolean{
            let res:boolean = false;
            if(this.settings.Format.DateFormat != this.settingsHolder.dateFormat) 
            {
                res = true;
                this.settingsHolder.dateFormat = this.settings.Format.DateFormat;
            }
            if(this.settings.Format.Seperator != this.settingsHolder.dateSeparator) 
            {
                res = true;
                this.settingsHolder.dateSeparator = this.settings.Format.Seperator;
            }
            
            return res;
        }

        private getQueryNamesettings(src:DataViewMetadataColumn):boolean {
            let res:boolean = false;

            if(this.settingsHolder.queryName == "") this.settingsHolder.queryName = this.settingsHolder.propertiesBridge.getQueryName();

            if(this.settingsHolder.queryName != src.queryName){
                this.settingsHolder.queryName = src.queryName;
                this.settingsHolder.propertiesBridge.setQueryName(this.settingsHolder.queryName);
                res = true;
            }

            return res;
        }

        private InitView(nodes:DataNode[],type:string){

            
            let boxgenerator = new boxGenerator(this.settingsHolder,type);

            let boxFrom = boxgenerator.getBox(nodes);
            let boxTo  = boxgenerator.getBox(nodes);

            
            
            if(this.selectionAdapter == undefined)
                this.selectionAdapter = new SelectionAdapter(this.selectionManager,nodes,boxFrom,boxTo,type,this.settingsHolder);
            else 
                this.selectionAdapter.update(nodes,boxFrom,boxTo,type);
           

                
            boxFrom.className = "selectBox";
            
            boxTo.className = "selectBox";

            var labelFrom = document.createElement('a');
            labelFrom.className = "lbl";
            labelFrom.text = this.settingsHolder.startTitle;
            labelFrom.style.fontSize = this.settingsHolder.fontSize+"px";

            var labelTo = document.createElement('a');
            labelTo.className = "lbl";
            labelTo.text = this.settingsHolder.endTitle;
            labelTo.style.fontSize = this.settingsHolder.fontSize+"px";


            var divFrom = document.createElement('div') as HTMLDivElement;
            divFrom.style.width = "97%";
            divFrom.appendChild(labelFrom); divFrom.appendChild(boxFrom);

            var divTo = document.createElement('div') as HTMLDivElement;
            divTo.style.width = "97%";
            divTo.appendChild(labelTo); divTo.appendChild(boxTo);


            

            this.target.appendChild(divFrom);
            this.target.appendChild(divTo);

            

        }

        private getDataNodes(category:DataViewCategoryColumn,values:PrimitiveValue[],type:string):DataNode[]{
           let nodes:DataNode[] = [];


            let idx:number = 0;
            for(let v of values){

                let title = "";
                let value:Object;

                if(type == "num"){ //in case of <Number>
                    title = v.toString();
                    value = v.toString();
                }
                else { //in case of <Date>
                    let date = v as Date;
                    title = this.formatDateTitle(date);//date.toDateString();
                    value = new MyDate(date.getDate(),(date.getMonth()+1),date.getFullYear());
                }

                nodes.push(
                    {
                        Identity : this.host.createSelectionIdBuilder().withCategory(category,idx++).createSelectionId(),
                        Title : title,
                        Value : value
                    }
                );
            }

            return nodes;
        }

        private formatDateTitle(date:Date):string{
            switch(this.settings.Format.DateFormat){
                case "M-Y":
                return date.toLocaleString("en-us",{month:"numeric"}) + this.settings.Format.Seperator + date.getFullYear();
                case "MN-Y":
                return date.toLocaleString("en-us",{month:"long"})+ this.settings.Format.Seperator + date.getFullYear();
                case "D-M-Y":
                return  date.getDate() + this.settings.Format.Seperator + date.toLocaleString("en-us",{month:"numeric"}) +this.settings.Format.Seperator + date.getFullYear();
                case "D-MN-Y":
                return  date.getDate() + this.settings.Format.Seperator + date.toLocaleString("en-us",{month:"long"}) +this.settings.Format.Seperator + date.getFullYear();
                case "Y":
                return date.getFullYear().toString();
                default : return "$Error$"; // in case of error
            }
        }

        private static parseSettings(dataView: DataView): VisualSettings {
            return VisualSettings.parse(dataView) as VisualSettings;
        }

        /** 
         * This function gets called for each of the objects defined in the capabilities files and allows you to select which of the 
         * objects and properties you want to expose to the users in the property pane.
         * 
         */
        public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
            return VisualSettings.enumerateObjectInstances(this.settings || VisualSettings.getDefault(), options);
             
        }

      
        
    }


}