// ship采用工厂模式生成
//命令通过工厂模式生成
//commander、BUS、DC使用单例模式
//飞船工厂
function createShip(id,battery,node,speed,charge) {
    var obj=new Object();
    obj.id=id;
    obj.battery=battery;
    obj.state=0;//表示停止状态
    obj.node=node;
    obj.condtion=undefined;
    obj.speed=new Number(speed);
    obj.charge=new Number(charge);
    obj.node.innerHTML="<div class='id'>"+obj.id+"</div> <div class='battery' title='100'>100</div>";
    document.getElementById("canves").appendChild(obj.node);
    //动力系统
    obj.flight=function () {
        if(obj.battery>=10){
            obj.state=1;//表示飞行状态
            obj.node.style.webkitAnimationPlayState="running";
            obj.node.style.top="230px";
            obj.node.style.left="930px";
            obj.node.style.animation="action linear infinite";
            obj.node.style.animationDuration=10/obj.speed+"s";
        }

    };
    obj.stopFlight=function () {
        obj.state=0;
        obj.node.style.webkitAnimationPlayState="paused";
    };
    //自爆系统
    obj.destruction=function () {
        obj.state=-1//表示即将销毁
        obj.adapter();
        clearInterval(adapter);
        obj.node.parentNode.removeChild(obj.node);
    };
    //能源系统
    obj.batterySystem=function () {
        if(obj.state==false){
            obj.chargeBattery();
        }
        if(obj.battery-obj.speed<=0){
            obj.stopFlight();
        }else if(obj.state==true){
            obj.useBattery();
            obj.chargeBattery();
        }
        obj.node.lastChild.title=obj.battery;
        obj.node.lastChild.innerHTML=obj.battery;
    };
    obj.useBattery=function () {
        obj.battery-=obj.speed;
    };
    obj.chargeBattery=function() {
        if(100>obj.battery+obj.charge){
            obj.battery+=obj.charge;
        }else if(100>=obj.battery+obj.charge){
            obj.battery=100;
        }
    };
    //Adapter
    obj.adapter=function () {
        var id=parseInt(obj.id,10).toString(2);
        while(id.length<4){
            id=0+id;
        }
        var flightState;
        switch (obj.state){
            case 0:
                flightState=2;
                break;
            case 1:
                flightState=1;
                break;
            case -1:
                flightState=12;
                break;
        }
        flightState=parseInt(flightState,10).toString(2);
        while(flightState.length<4){
            flightState=0+flightState;
        }
        var surplusBattery=parseInt(obj.battery,10).toString(2);
        while(surplusBattery.length<8){
            surplusBattery=0+surplusBattery;
        }

        var shipSpeed=parseInt(obj.speed,10).toString(2);
        while(shipSpeed.length<4){
            shipSpeed=0+shipSpeed;
        }

        var shipCharge=parseInt(obj.charge,10).toString(2);
        while(shipCharge.length<4){
            shipCharge=0+shipCharge;
        }
        var signal=id+flightState+surplusBattery+shipSpeed+shipCharge;
        BUS.setShipInform(signal);
    };
    var adapter=setInterval(obj.adapter,100);

    //信号处理系统
    obj.collectSignal=function () {
        // alert("ship is collecting signal");
        var order=BUS.spreadOrder();
        obj.commond=null;
        // var orderList=new String(order).split(",");
        var id=parseInt(new String(order).substring(0,4),2);
        if(id==obj.id){
            BUS.clearOrder();
            obj.commond=parseInt(new String(order).substring(4),2);
            // alert(obj.commond);
        };
        switch (obj.commond){
            case 1:
                obj.flight();
                break;
            case 2:
                obj.stopFlight();
                break;
            case 3:
                obj.destruction();
                break;
            default:
                break;
        }

    };
    var timer=setInterval(obj.batterySystem,1000);
    setInterval(obj.collectSignal,100);
    return obj;
}
//指挥官,使用单利模式
var commander={
    order: undefined,
    cont: 0,
    sendOrder: function () {
        this.outPutAdapter(this.order);
    },
    launchShip: function (speed,charge) {
        // alert(speed+" "+charge);
        var shipNode=document.createElement("div");
        shipNode.className="ship";
        var newShip=createShip(++this.cont,100,shipNode,speed,charge);
        return newShip;
    },
    outPutAdapter: function (order) {
        var orderList=order.split(",",2);
        var id=orderList[0].toString(2);
        id=parseInt(id,10).toString(2);//十进制转二进制
        while(id.length<4){
            id=0+id;
        }//补足为4位
        var comm;
        switch (orderList[1]){
            case "flight":
                comm=1;
                break;
            case "stop":
                comm=2;
                break;
            case "destruction":
                comm=3;
                break;
        }
        comm=parseInt(comm,10).toString(2);
        while(comm.length<4){
            comm=0+comm;
        }
        BUS.getOrder(id+comm);
    }
};
//介质，使用单例模式
var BUS={
    shipInform: null,
    inform: null,
    getOrder: function (order) {
        var r=Math.random();
        if(r<=0.3){
            arguments.callee(this.getOrder(order));
        }else{
            this.inform=order;
        }
    },
    spreadOrder: function () {
        return this.inform;
    },
    clearOrder: function () {
        this.inform=null;
    },
    setShipInform: function (signal) {
        this.shipInform=signal;
    },
    getShipInform: function () {
        return this.shipInform;
    },
};
function showPanel() {
    if(commander.cont<=3){
        //获取选中的动力系统和能源系统
        var spreedSelect=document.getElementById("speed");
        var sIndex=spreedSelect.selectedIndex;//代表选中项目的索引
        var speed=spreedSelect[sIndex].value;
        // alert(speed);
        var chargeSelect=document.getElementById("charge");
        var cIndex=chargeSelect.selectedIndex;
        var charge=chargeSelect[cIndex].value;
        // alert(charge);
        commander.launchShip(speed,charge);
        var ul=document.getElementsByClassName("list")[0];
        var newLi=document.createElement("li");
        newLi.title=commander.cont;
        newLi.innerHTML="对"+commander.cont+"号飞船下指令 "+"<button type='button' onclick=command('"+commander.cont+",flight')>开始飞行</button>"+
            "<button type='button' onclick=command('"+commander.cont+",stop')>停止飞行</button>"+
            "<button type='button' onclick=command('"+commander.cont+",destruction')>销毁</button>";
        ul.appendChild(newLi);
    }else {
        alert("can't launch");
    }

}

function command(order) {
    commander.order=order;
    var orderList=order.split(",",2);
    if(orderList[1]=="destruction"){
        commander.cont--;
    }
    commander.sendOrder();
}

var DC={
    inform: null,
    inPutAdapter: function () {
        this.inform=BUS.getShipInform();
        var shipId,shipState,shipBattery,shipSpeed,shipCharge;
        shipId=new String(this.inform).slice(0,4);
        shipState=new String(this.inform).slice(4,8);
        shipBattery=new String(this.inform).slice(8,16);
        shipSpeed=new String(this.inform).slice(16,20);
        shipCharge=new String(this.inform).slice(20);
        if(shipId!=new String(null)){
            DC.createLog(shipId,shipState,shipBattery,shipSpeed,shipCharge);
        }
    },
    createLog: function (shipId,shipState,shipBattery,shipSpeed,shipCharge) {
        var id=parseInt(shipId,2).toString(10);
        var state=parseInt(shipState,2).toString(10);
        var battery=parseInt(shipBattery,2).toString(10);
        var speed=parseInt(shipSpeed,2).toString(10);
        var charge=parseInt(shipCharge,2).toString(10);
        switch (state){
            case "1":
                state="飞行";
                break;
            case "2":
                state="暂停";
                break;
            case "12":
                state="即将销毁";
                break;
        }
        switch (speed){
            case "5":
                speed="前进号";
                break;
            case "7":
                speed="奔腾号";
                break;
            case "9":
                speed="超越号";
                break;
        }
        switch (charge){
            case "2":
                charge="劲量型引擎";
                break;
            case "3":
                charge="光能型引擎";
                break;
            case "4":
                charge="永久型引擎";
                break;
        }
        if(document.getElementById(id)){
            document.getElementsByClassName(id)[0].innerHTML=state;
            document.getElementsByClassName(id)[1].innerHTML=battery;
        }else{
            var tr=document.createElement("tr");
            tr.id=id;
            tr.innerHTML="<td>"+id+"</td><td>"+speed+"</td><td>"+charge+"</td><td class='"+id+"'>"+state+"</td><td class='"+id+"'>"+battery+"</td>";
            document.getElementById("log").appendChild(tr);
        }
        if(state=="即将销毁"){
            document.getElementById("log").removeChild(document.getElementById(id));
        }
    }
};
setInterval(DC.inPutAdapter,10);