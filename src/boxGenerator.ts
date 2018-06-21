module powerbi.extensibility.visual {
    "use strict";

    
    export class boxGenerator{
        private settings:settingsHolder;
        private type:string;
        
        constructor(settings:settingsHolder,type:string){
            this.settings = settings;
            this.type = type;
        }

        public getBox(nodes:DataNode[]):HTMLSelectElement{
            let Element = document.createElement('select') as HTMLSelectElement;
            let listOfNodes = new Array<string>(); //Tmp Array : Hold Inserted Titles

            let idx:number = -1;
            for(let node of nodes){
                idx++;
                //Skip Duplicate Titles
                if(this.type == "date" && listOfNodes.indexOf(node.Title) != -1) continue; else listOfNodes.push(node.Title);

                var option = document.createElement('option') as HTMLOptionElement;
                option.text = node.Title;
                option.value = idx.toString();
                option.style.color = this.settings.boxTextColor;
                option.style.fontSize = this.settings.fontSize+"px";
                Element.appendChild(option);
            }

            //Clean Tmp Array
            while(listOfNodes.length) listOfNodes.pop();

            Element.style.background = this.settings.boxBackground;
            Element.style.color = this.settings.boxTextColor;
            Element.style.fontSize = this.settings.fontSize+"px";

            return Element;
        }

        
    }

}