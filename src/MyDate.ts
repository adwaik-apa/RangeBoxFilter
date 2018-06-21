module powerbi.extensibility.visual {
    "use strict";

    export class MyDate{
        private day:number;
        private month:number;
        private year:number;

        constructor(day:number,month:number,year:number){
            this.day = day;
            this.month = month;
            this.year = year;
        }

    static parseDate(value:string,fromat:string):MyDate{
        var vals:string[];

        switch(fromat){
            case "M-D-YYYY":
                vals = value.split("-"); // --> M/D/Y
                return new MyDate(parseInt(vals[1]),parseInt(vals[0]),parseInt(vals[2]));
            case "D-M-YYYY":
                vals = value.split("-"); // --> M/D/Y
                return new MyDate(parseInt(vals[0]),parseInt(vals[1]),parseInt(vals[2]));
                default://null
                return new MyDate(0,0,0);
        }
    }
    public getFullDate():string{
        return this.day+"-"+this.month+"-"+this.year;
    }
    public compare(date:MyDate,format?:string):number{ // 0:equal //1:after //-1:before
        let containsMonth:boolean = format== undefined ||  format.indexOf("M") != -1;
        let containsDay:boolean = format== undefined ||  format.indexOf("D") != -1;

        if(date.year != this.year){
            return date.year > this.year ? -1:1;
        }
        else if(containsMonth && date.month != this.month){
            return date.month > this.month ? -1:1;
        }
        else if(containsDay && date.day != this.day){
            return date.day > this.day ? -1:1;
        }
        else return 0;
    }

  }

}