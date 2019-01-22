/**
 * 命名规则
 * s 全局变量
 * _s 私有变量
 * Ss 构造函数
 * SS 事件、常量
 * oSs createjs DisplayObject 对象
 * 顶级变量按照功能命名
 * 子级变量由繁到简d(data) e(event) len(length) el(element)
 */
var xx = xx || {};
xx.events=('ontouchstart' in window) ? { start: 'touchstart', move: 'touchmove', end: 'touchend'} : { start: 'mousedown', move: 'mousemove', end: 'mouseup' };
xx.bgMp3 = function () {
    //背景音乐
    var btn = $('#js_musicBtn'),
    	oMedia = $('#media')[0];
    btn.on(xx.events.start, function (e) {
        if (oMedia.paused) {
            oMedia.play();
        } else {
            oMedia.pause();
        }
        e.preventDefault();
    });
    oMedia.load();
    oMedia.play();
    if (oMedia.paused) {
        $('#wrapper').one(xx.events.start, function (e) {
            oMedia.play();
            e.preventDefault();
        });
    };
    $(oMedia).on('play', function () {
        btn.addClass('musicPlay');
    });
    $(oMedia).on('pause', function () {
        btn.removeClass('musicPlay');
    });
}
;(function ($) {
    var defaults = {
        classIn: 'moveIn',
        classOut: 'moveOut',
        onClass:'page-on',
        complete: function () { }
        // CALLBACKS
    };
    $.fn.moveIn = function (options) {
        var options = $.extend({},defaults, options);
        this.addClass(options.classIn).show();
        this.one('webkitAnimationEnd', function () {
            $(this).removeClass(options.classIn).addClass(options.onClass);
            options.complete();
        });
        return this;
    }
    $.fn.moveOut = function (options) {
        var options = $.extend({},defaults, options);
        this.addClass(options.classOut).show();
        this.one('webkitAnimationEnd', function () {
            $(this).removeClass(options.classOut+' '+options.onClass).hide();
            options.complete();
        });
        return this;
    }
})(jQuery);
//提示弹层
xx.hint=function(text){
    var box=$('#js_hint');
    box.html(text).moveIn();
    if(box[0].timer) {
        clearTimeout(box[0].timer);
    }
    box[0].timer=setTimeout(function(){
        box.moveOut();
    },2000);
}
//延迟加载dom图片
xx.delayImg = function () {
    var aImg = $('img[_src0]');
    var _length = aImg.length;
    for (var i = 0; i < _length; i++) {
        aImg[i].src = aImg.eq(i).attr('_src0');
    }
}
//工具类
xx.tool={
    getQueryString:function(name){
        var reg = new RegExp("(^|&)"+ name +"=([^&]*)(&|$)");
        var r = window.location.search.substr(1).match(reg);
        if (r!=null) return decodeURIComponent(r[2]); return null;
    },
    boolean:function(){
    	//随机布尔值
    	return (Math.pow(-1 , Math.ceil( Math.random()*1000))==1);
    }
};
//cavnas 命名空间
var g={
    guid:null,//游戏唯一ID
};
;(function(){
    var d={
        radius:null//圆形包围页面的半径
    };
    //###舞台相关
    var canvas=$('#xCanvas')[0];
    var stage;
    var view={};
    function size(){
        //计算画布尺寸
        view.w=640;
        view.h=1040;
        view.vh=view.w/$(window).width()*$(window).height();
        if(view.vh>view.h) view.vh=view.h;
        d.radius=Math.sqrt(Math.pow(view.w,2)+Math.pow(view.h,2))/2;
        //边界
        view.topY=(view.h-view.vh)/2;
        view.bottomY=view.vh+view.topY;
    }
    function tick(e){
        stage.update(e);
    }
    //###资源
    var res,
        LoadIng=function(progress){};//会被load页面重写
    function Load(complete){
        var basePath="";
        var manifest=[
            {id:'loading',src:'img/loading.png'}
        ];
        //加载DOM文件
        var DOMImg = $('img[_src]');
        for (var i = 0; i < DOMImg.length; i++) {
            manifest.push(DOMImg.eq(i).attr('_src'));       
        }
        res = new createjs.LoadQueue(false,basePath,'anonymous');
        res.on("complete", handleComplete, this);
        res.on("progress", handleProgress, this);
        res.setMaxConnections(10);
        function handleComplete(){
            var DOMImg = $('img[_src]');
            for (var i = 0; i < DOMImg.length; i++) {
                DOMImg[i].src=basePath+DOMImg.eq(i).attr('_src');
            }
            //xx.mp3=xx.bgMp3();
            setTimeout(function(){
                complete();
            },700);
        }
        function handleProgress(e){
            var progress=e.progress;
            if(progress>1) progress=1;
            LoadIng(progress);
        }
        res.loadManifest(manifest);
    }

    //公共元素
    var E={};
    //创建
    var create={
        cimg:function(id){
            //基点居中图片
            var img=res.getResult(id);
            var o=new createjs.Bitmap(img);
            o.set({regX:img.width/2,regY:img.height/2});
            return o;
        },
        hitArea:function(o,scale){
            //设置感应区域
            var scale=scale||1;
            var bounds=o.getBounds();
            var hitArea=new createjs.Shape();
            hitArea.graphics.f('#f00').dr(0,0,bounds.width,bounds.height);
            var cx=bounds.width/2,cy=bounds.height/2;
            hitArea.set({scaleX:scale,scaleY:scale,regX:cx,regY:cy,x:cx+bounds.x,y:cy+bounds.y});
            o.hitArea=hitArea;
        },
        btn:function(id,scale){
            //按钮
            var scale=scale||1;
            var o=this.cimg(id);
            this.hitArea(o,scale);
            return o;
        },
        domProp:function(o){
            //bitmap元素与dom属性的映射
            //o与屏幕中心点的距离
            //单位rem
            var w=o.image.width*o.scaleX,
                h=o.image.height*o.scaleY;
            var d={
                x:(o.x-view.w/2-w/2)/100,
                y:(o.y-view.h/2-h/2)/100,
                w:w/100,
                h:h/100
            }
            return d;
        },
        domHitArea:function(o){
            //创建dom热点
            var d=create.domProp(o);
            var $o=$('<span></span>');
            $o.css({
                width:d.w+'rem',
                height:d.h+'rem',
                position:'absolute',
                zIndex:'2500',
                left:'50%',
                top:'50%',
                margin:d.y+'rem 0 0 '+d.x+'rem',
            });
            $('body').append($o);
            return $o;
        }
    }

    //动画
    var Tween={
        zoomIn:function(o,complete){
            o.set({scaleX:1.4,scaleY:1.4,alpha:0});
            createjs.Tween.get(o)
                .to({alpha:1,scaleX:1,scaleY:1}, 500,createjs.Ease.backOut)
                .call(function(){
                    if(complete) complete();
                });
        },
        zoomOut:function(o,complete){
            createjs.Tween.get(o,{override:true})
                .to({alpha:0,scaleX:1.4,scaleY:1.4}, 500,createjs.Ease.quartOut)
                .call(function(){
                    if(complete) complete(this);
                    if(this.parent) this.parent.removeChild(this);
                });
        },
        btnIn:function(o,delay){
            o.set({scaleX:0.5,scaleY:0.5,alpha:0});
            createjs.Tween.get(o)
                .wait(delay)
                .to({scaleX:1,scaleY:1,alpha:1}, 1500,createjs.Ease.elasticOut);
        },
        click:function(o){
            var ix=o.x,iy=o.y;
            o.set({x:ix+20,y:iy+20});
            createjs.Tween.get(o,{loop:true})
                .to({x:ix,y:iy}, 500)
                .to({x:ix+20,y:iy+20}, 500);
        }
    };

    //模块功能
    var fn={
    };

    //公用模块
	var module={
	};
    //###页面
    //页面结构 布局(添加到场景)-动画-功能-out
    var page={
        zIndex:10,//canvas和dom层相互切换
        lastPage:null,//上一个显示的页面
		nowPage:null,//当前显示的页面
        page:function(pid,ptype){
            //创建页面容器
            var page;
            if(ptype=="dom"){
                page=$('#'+pid);
                page.ptype="dom";
            }else{
                page=new createjs.Container();
                stage.addChild(page);
            }
            page.pid=pid;
            this.lastPage=this.nowPage;
            this.nowPage=page;
            return page;
        },
        to:function(pid,option,complete){
            var _option={
                effect:0,
                duration:500
            }
            if(option){
                Object.assign(_option,option);
            };
            //进入pid页面
            if(this.nowPage&&this.nowPage.pid==pid) return;//禁止重复跳转页面
            if(page.lastPage&&page.lastPage.ptype!="dom"){
                createjs.Tween.removeAllTweens();//清除所有Tween
            };
            this[pid]();
            if(page.lastPage){
                //上个页面退出
                if(page.lastPage.out) page.lastPage.out();
            }
            if(page.nowPage.ptype=="dom"){
                page.zIndex++;
                page.nowPage.css('zIndex',page.zIndex).show();
                var domLimit=true;
                page.nowPage.one("webkitAnimationEnd", function () {
                    if(!domLimit) return;
                    domLimit=false;
                    $(this).addClass("page-on");
                    if(page.nowPage.in) page.nowPage.in();
                    if(page.lastPage){
                        if(page.lastPage.ptype=="dom"){
                            page.lastPage.removeClass("page-on").hide();
                        }else{
                            createjs.Tween.removeAllTweens();
                            page.lastPage.tickChildren=false;
                            stage.removeChild(page.lastPage);
                            $('#stage').hide();
                        }
                    }
                    if(complete) complete();
                });

            }else{
                if(page.lastPage&&page.lastPage.ptype=="dom"){
                    page.zIndex++;
                    $('#stage').css('zIndex',page.zIndex).show();
                }
                if(_option.effect==0){
                    //圆形遮罩切换
                    var mask=new createjs.Shape();
                    mask.graphics.dc(0,0,d.radius);
                    mask.set({x:view.w/2,y:view.h/2,scaleX:0,scaleY:0});
                    page.nowPage.mask=mask;
                    createjs.Tween.get(mask)
                        .to({scaleX:1,scaleY:1}, _option.duration,createjs.Ease.quadOut)
                        .call(function(){
                            //页面切换完成
                            changeOk();
                        });
                }else if(_option.effect==1){
                    //渐隐切换
                    page.nowPage.alpha=0;
                    createjs.Tween.get(page.nowPage)
                        .to({alpha:1}, _option.duration,createjs.Ease.quadOut)
                        .call(function(){
                            //页面切换完成
                            changeOk();
                        });
                }
                

                function changeOk(){
                    page.nowPage.mask=null;
                    if(page.nowPage.in) page.nowPage.in();
                    if(page.lastPage){
                        if(page.lastPage.ptype=="dom"){
                            page.lastPage.removeClass("page-on").hide();
                        }else{
                            //清除页面tick 防止Sprite＆MovieClip框架持续运行
                            page.lastPage.tickChildren=false;
                            stage.removeChild(page.lastPage);
                        };
                    };
                    if(complete) complete();
                }
            }
        },
        out:function(complete){
            //退出页面
            if(page.nowPage){
                //当前页面退出
                if(page.nowPage.out) page.nowPage.out();
            }
            if(page.nowPage.ptype=="dom"){
                page.nowPage.moveOut({
                    complete:function(){
                        page.nowPage.removeClass("page-on").hide();
                        reset();
                        if(complete) complete();
                    }
                });
            }else{
                var mask=new createjs.Shape();
                mask.graphics.dc(0,0,d.radius);
                ease=createjs.Ease.quadOut;
                mask.set({x:view.w/2,y:view.h/2,scaleX:0,scaleY:0});
                page.nowPage.mask=mask;
                createjs.Tween.get(mask)
                    .to({scaleX:1,scaleY:1}, 500,createjs.Ease.quadOut)
                    .call(function(){
                        //页面切换完成
                        page.nowPage.mask=null;
                        page.nowPage.tickChildren=false;
                        createjs.Tween.removeAllTweens();
                        stage.removeChild(page.nowPage);
                        reset();
                        if(complete) complete();
                    });
            }
            function reset(){
                page.nowPage=page.lastPage=null;
                page.zIndex=10;
            }
        },
        load:function(){
            // ----页面完整结构参考----
            var _page=this.page('load');
            
            //###布局

            //背景
            var oBg=new createjs.Shape();
            oBg.graphics.f('#000').dr(0,0,view.w,view.h);
            //进度文字
            var oText=new createjs.Text("0%","24px Microsoft YaHei", "rgba(255,255,255,0.8)");
            oText.set({
                textAlign:"center",
                textBaseline:"middle",
                x:view.w/2,
                y:view.h/2
            });
            //添加到场景
            _page.addChild(oBg,oText);
            
            //###动画
            //……
            
            //###功能

            LoadIng=function(progress){
                oText.text=Math.round(progress* 100)+'%';
            }
            
            //###in(页面进入完成)
            _page.in=function(){
                
            }

            //###out(页面离开)
            _page.out=function(){

            }
        },
        index:function(){
            var _page=this.page('index');
            
            //###布局
            var oBg=new createjs.Shape();
            oBg.graphics.f('#f00').dr(0,0,view.w,view.h);
            var oTitle=new createjs.Text('canvas page1',"90px Microsoft YaHei", "#000");
            oTitle.set({
                textAlign:'center',
                textBaseline:'midde',
                x:view.w/2,
                y:view.h/2
            });
            //添加到场景
            _page.addChild(oBg,oTitle);
            
            //###动画
            //……
            
            //###功能
            _page.on('click',function(){
                page.to('p2',{effect:1,duration:700});
            },null,false);

            //###out
            _page.out=function(){
                createjs.Tween.get(oTitle)
                    .to({scaleX:2,scaleY:2,alpha:0},500);
            }
        },
        p2:function(){
            var _page=this.page('p2');
            
            //###布局
            var oBg=new createjs.Shape();
            oBg.graphics.f('#ff0').dr(0,0,view.w,view.h);
            var oTitle=new createjs.Text('canvas page2',"90px Microsoft YaHei", "#000");
            oTitle.set({
                textAlign:'center',
                textBaseline:'midde',
                x:view.w/2,
                y:view.h/2
            });
            //添加到场景
            _page.addChild(oBg,oTitle);
            
            //###动画
            //……
            
            //###功能
            _page.on('click',function(){
                page.to('pDom1');
            },null,false);

            //###out
            _page.out=function(){
                
            }
            
        },
        rule:function(){
            //###规则弹层
            page.nowPage.mouseChildren=false;
            
            //###布局
            var oRule=create.cimg('rule');
            oRule.set({x:320.5,y:513});
            //添加到场景
            stage.addChild(oRule);
            
            //###动画
            Tween.zoomIn(oRule);
            
            //###功能
            oRule.on('click',function(){
                Tween.zoomOut(oRule,function(){
                    stage.removeChild(oRule);
                    page.nowPage.mouseChildren=true;
                });
            });
        },
        pDom1:function(){
            var _page=this.page('pDom1','dom');
        },
        pDom2:function(){
            var _page=this.page('pDom2','dom');
        }
    };
    function init(complete){
        //数据初始化

        //ajax请求完成执行
        complete();

    }
    function main(){
        size();
        canvas.width=view.w;
        canvas.height=view.h;
        stage=new createjs.Stage(canvas);
        createjs.Touch.enable(stage);
        //createjs.Ticker.setFPS(20);
        createjs.Ticker.timingMode = createjs.Ticker.RAF;
        createjs.Ticker.addEventListener("tick",tick);
        page.to('load');
        init(function(){
            Load(function(){
                $('#js_musicBtn').show();
                page.to('index');
                xx.delayImg();//延迟加载图片
            });
        });
        //####事件
        //页面跳转
        $('#pDom1').on(xx.events.start,function(e){
            page.to('pDom2');
            e.preventDefault();
        });
        $('#pDom2').on(xx.events.start,function(e){
            page.to('index');
            e.preventDefault();
        });
    }
    //接口
    g.main=main;
})();
xx.main=function(){
    g.main();
}