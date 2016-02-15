;

(function($){
//PLUGIN
//========================================================
var $elements;//使得在$.fn.my_bgStretch自身的属性中也可以访问到相应的jQuery对象

$.fn.my_bgStretch = function(images, options){
    //设置$elements的值
    if (arguments.length === 0) {
        $elements = this;
        return this.my_bgStretch;
    }

    //正式开始
    var default_options = {
            centeredX : true,
            centeredY : true,
            switchType : '',
            duration : 5000
        },
        $elems = this,
        settings,
        temp_styleSheets = document.styleSheets,
        styleSheet = temp_styleSheets[temp_styleSheets.length - 1],
        bgRuleText;

    //把图片包装成数组
    images = Array.isArray(images) ? images : [images];
    //预加载图片
    $.each(images, function(index, val){
        document.createElement('img').src = val;
    });
    //整合options
    settings = $.extend({}, default_options, options);
    settings.bgPosX = settings.centeredX ? 'center' : '0%';
    settings.bgPosY = settings.centeredY ? 'center' : '0%';
    //在最后一个样式表中的最后位置插入.bs-bganistyles类（由于background-size和background-position要用来做动画，不能在元素的行内设置，要单独用添加一个类）
    bgRuleText = '.bs-bganistyles {'
       +     'background-size : cover;'
       +     'background-position : ' + settings.bgPosX + ' ' + settings.bgPosY + ';'
       + '}';
    styleSheet.insertRule(bgRuleText, styleSheet.rules.length);
    
    //对每个元素进行设置
    $elems.each(function(elemIndex){
        var $elem = $(this),
            //====//在AddAnimationRules()和SwitchAnimation()中经常会用到的参数
            temp_bgClip,
            bgWidth,
            bgHeight,
            bgPos,
            //====//
            addRules = new AddAnimationRules(),
            switchAni = new SwitchAnimation($elem),
            topImgCount,
            bottomImgCount,
            temp_interval;

        //设置背景
        $elem.css({
            'background-color' : 'lightcoral',
            'background-image' : 'url(' + images[0] + ')',
            'background-origin' : $elem.css('background-clip'),
            'background-repeat' : 'no-repeat'
        });
        $elem.addClass('bs-bganistyles');
        //获取背景的相关参数（一定要在设置背景之后）
        temp_bgClip = $elem.css('background-clip').trim();
        bgWidth = temp_bgClip === 'border-box' ? $elem.outerWidth() : temp_bgClip === 'padding-box' ? $elem.innerWidth() : temp_bgClip === 'content-box' ? $elem.width() : 'cannot get width';//数值
        bgHeight = temp_bgClip === 'border-box' ? $elem.outerHeight() : temp_bgClip === 'padding-box' ? $elem.innerHeight() : temp_bgClip === 'content-box' ? $elem.height() : 'cannot get height';//数值
        bgPos = $elem.css('background-position').trim().split(' ');//数组
        //插入动画要用的CSSRules(由于每个元素的背景宽高不同，所以使用的动画要分别设置)
        addRules[settings.switchType](elemIndex, styleSheet, bgWidth, bgHeight, bgPos);
        //如果只有一张图片则不进行背景轮播
        if (images.length === 1) { return; }
        //背景轮播
        $elem.data('bs-images', images);//存
        topImgCount = 1,
        bottomImgCount = 0;
        $elem.data('bs-topImgCount', topImgCount);//存
        $elem.data('bs-bottomImgCount', bottomImgCount);//存
        //开启定时器
        temp_interval = setInterval(switchImg, settings.duration);
        $elem.data('bs-interval', temp_interval);//存
        $elem.data('bs-duration', settings.duration);//存
        //定时器中要传的函数
        function switchImg() {
            topImgCount = $elem.data('bs-topImgCount');//取
            bottomImgCount = $elem.data('bs-bottomImgCount');//取
            topImgCount = topImgCount > images.length -1 ? 0 : topImgCount;
            bottomImgCount = bottomImgCount > images.length -1 ? 0 : bottomImgCount;
            //设置两张背景图，并且延迟切换图片
            setTimeout(function(){
                $elem.css({
                    'background-image' : 'url(' + images[topImgCount] + '), url(' + images[bottomImgCount] + ')'
                });
                //图片计数器累加（一定要在延迟之后累加）
                topImgCount++;
                bottomImgCount++;
                $elem.data('bs-topImgCount', topImgCount);//存
                $elem.data('bs-bottomImgCount', bottomImgCount);//存
            }, switchAni[settings.switchType + 'Delay']);
            //轮播动画
            switchAni[settings.switchType](elemIndex ,images[topImgCount], images[bottomImgCount], bgWidth, bgHeight);
        }
        $elem.data('bs-switchImg', switchImg);//存
    });
};

//控制图片的暂停、开始、上一张、下一张等
//=======================================================
//暂停
$.fn.my_bgStretch.pause = function(){
    $elements.each(function(){
        var $element = $(this),
            interval = $element.data('bs-interval');//取

        //清除定时器
        clearInterval(interval);
        //移除动画
        $element.removeClass(function(index, className){
            var classArr = className.trim().split(' ');
            for (var i = 0; i < classArr.length; i++) {
                if (classArr[i].indexOf('bs-ani-') >= 0) {
                    return classArr[i];
                }
            }
        });
    });
};

//重新开始
$.fn.my_bgStretch.resume = function(){
    $elements.each(function(){
        var $element = $(this),
            switchImg = $element.data('bs-switchImg'),//取
            duration = $element.data('bs-duration'),//取
            temp_interval;

        //开启定时器
        temp_interval = setInterval(switchImg, duration);
        $element.data('bs-interval', temp_interval);//存
    });
};

//跳转到
$.fn.my_bgStretch.show = function(imgIndex){
    $elements.each(function(){
        var $element = $(this),
            interval = $element.data('bs-interval'),//取
            images = $element.data('bs-images'),//取
            switchImg = $element.data('bs-switchImg'),//取
            duration = $element.data('bs-duration'),//取
            topImgCount = imgIndex < 0 ? imgIndex + 3 : imgIndex,
            bottomImgCount = imgIndex - 1 < 0 ? imgIndex + 2 : imgIndex - 1,
            temp_interval;

        //清除定时器
        clearInterval(interval);
        //移除动画
        $element.removeClass(function(index, className){
            var classArr = className.trim().split(' ');
            for (var i = 0; i < classArr.length; i++) {
                if (classArr[i].indexOf('bs-ani-') >= 0) {
                    return classArr[i];
                }
            }
        });
        //设置背景
        topImgCount = topImgCount > images.length -1 ? 0 : topImgCount;
        bottomImgCount = bottomImgCount > images.length -1 ? 0 : bottomImgCount;
        $element.css({
            'background-image' : 'url(' + images[topImgCount] + '), url(' + images[bottomImgCount] + ')'
        });
        topImgCount++;
        bottomImgCount++;
        $element.data('bs-topImgCount', topImgCount);//存
        $element.data('bs-bottomImgCount', bottomImgCount);//存
        //开启定时器
        temp_interval = setInterval(switchImg, duration);
        $element.data('bs-interval', temp_interval);//存
    });
};

//上一张
$.fn.my_bgStretch.prev = function(){
    $elements.each(function(){
        var $element = $(this);
            topImgCount = $element.data('bs-topImgCount'),//取
            imgIndex = topImgCount - 2;

        $element.my_bgStretch().show(imgIndex);
    });};

//下一张
$.fn.my_bgStretch.next = function(){
    $elements.each(function(){
        var $element = $(this);
            topImgCount = $element.data('bs-topImgCount'),//取
            imgIndex = topImgCount;

        $element.my_bgStretch().show(imgIndex);
    });
};


//CLASS
//==========================================================
//插入动画要用的CSSRules
var AddAnimationRules = function(){};

AddAnimationRules.prototype = {
    //switchType为空字符串时
    '' : function(elemIndex, styleSheet, bgWidth, bgHeight, bgPos){},

    slide : function(elemIndex, styleSheet, bgWidth, bgHeight, bgPos){
        var keyframesRuleText,
            styleRuleText;

        //从左滑入
        keyframesRuleText = '@keyframes slideLeft-' + elemIndex + ' {'
            +     '0% {'
            +         'background-position: ' + -bgWidth + 'px ' + bgPos[1] + ',' + bgPos[0] + ' ' + bgPos[1] + ';' 
            +     '}'
            +     '100% {'
            +         'background-position: ' +  bgPos[0] + ' ' + bgPos[1] + ';'
            +     '}'
            + '}';
        styleSheet.insertRule(keyframesRuleText, styleSheet.rules.length);
        styleRuleText = '.bs-ani-slideLeft-' + elemIndex + ' {'
            +     'animation : slideLeft-' + elemIndex + ' ease .5s;'
            + '}';
        styleSheet.insertRule(styleRuleText, styleSheet.rules.length);
        //从上滑入
        keyframesRuleText = '@keyframes slideTop-' + elemIndex + ' {'
            +     '0% {'
            +         'background-position: ' + bgPos[0] + ' ' + -bgHeight + 'px,' + bgPos[0] + ' ' + bgPos[1] + ';'
            +     '}'
            +     '100% {'
            +         'background-position: ' +  bgPos[0] + ' ' + bgPos[1] + ';'
            +     '}'
            + '}';
        styleSheet.insertRule(keyframesRuleText, styleSheet.rules.length);
        styleRuleText = '.bs-ani-slideTop-' + elemIndex + ' {'
            +     'animation : slideTop-' + elemIndex + ' ease .5s;'
            + '}';
        styleSheet.insertRule(styleRuleText, styleSheet.rules.length);
    },

    bounce : function(elemIndex, styleSheet, bgWidth, bgHeight, bgPos){
        var keyframesRuleText,
            styleRuleText;

        keyframesRuleText = '@keyframes bounce-' + elemIndex + ' {'
            +     '0%, 100%, 20%, 53%, 80% {'
            +         'background-position: ' + bgPos[0] + ' ' + 'calc(' + bgPos[1] + ' + ' + 0 * bgHeight + 'px);'
            +     '}'
            +     '40%, 43% {'
            +         'background-position: ' + bgPos[0] + ' ' + 'calc(' + bgPos[1] + ' + ' + -.3 * bgHeight + 'px);'
            +     '}'
            +     '70% {'
            +         'background-position: ' + bgPos[0] + ' ' + 'calc(' + bgPos[1] + ' + ' + -.15 * bgHeight + 'px);'
            +     '}'
            +     '90% {'
            +         'background-position: ' + bgPos[0] + ' ' + 'calc(' + bgPos[1] + ' + ' + -.04 * bgHeight + 'px);'
            +     '}'
            + '}';
        styleSheet.insertRule(keyframesRuleText, styleSheet.rules.length);
        styleRuleText = '.bs-ani-bounce-' + elemIndex + ' {'
            +     'animation : bounce-' + elemIndex + ' ease 1s;'
            + '}';
        styleSheet.insertRule(styleRuleText, styleSheet.rules.length);
    },

    shake : function(elemIndex, styleSheet, bgWidth, bgHeight, bgPos){
        var keyframesRuleText,
            styleRuleText;

        keyframesRuleText = '@keyframes shake-' + elemIndex + ' {'
            + '0%, 100% {'
            +     'background-position: ' + 'calc(' + bgPos[0] + ' + ' + 0 * bgWidth + 'px) ' +  bgPos[1] + ';'
            + '}'
            + '10%, 30%, 50%, 70%, 90% {'
            +     'background-position: ' + 'calc(' + bgPos[0] + ' + ' + -.1 * bgWidth + 'px) ' +  bgPos[1] + ';'
            + '}'
            + '20%, 40%, 60%, 80% {'
            +     'background-position: ' + 'calc(' + bgPos[0] + ' + ' + .1 * bgWidth + 'px) ' +  bgPos[1] + ';'
            + '}';
        styleSheet.insertRule(keyframesRuleText, styleSheet.rules.length);
        styleRuleText = '.bs-ani-shake-' + elemIndex + ' {'
            +     'animation : shake-' + elemIndex + ' ease 1s;'
            + '}'
        styleSheet.insertRule(styleRuleText, styleSheet.rules.length);
    }
};

//过渡动画
var SwitchAnimation = function($elem){
    this.$elem = $elem;
    this.Delay = 0;
    this.slideDelay = 0;
    this.bounceDelay = 530;
    this.shakeDelay = 750;
};

SwitchAnimation.prototype = {
    //switchType为空字符串时
    '' : function(elemIndex ,topImg, bottomImg, bgWidth, bgHeight){},

    slide : function(elemIndex ,topImg, bottomImg, bgWidth, bgHeight){
        var temp_img = new Image(),
            imgRatio,
            bgRatio;

        //topImg的宽/高比
        temp_img.src = topImg;
        imgRatio = temp_img.width / temp_img.height;
        //background-clip区域的宽/高比
        bgRatio = bgWidth / bgHeight;
        //比较imgRatio和bgRatio确定使用左边滑入动画还是上面滑入动画
        //从左滑入
        if (imgRatio <= bgRatio) {
            this.$elem.addClass('bs-ani-slideLeft-' + elemIndex);
            this.$elem.one('animationend', function(){
                $(this).removeClass('bs-ani-slideLeft-' + elemIndex);
            });
        //从上滑入
        }else if (imgRatio > bgRatio) {
            this.$elem.addClass('bs-ani-slideTop-' + elemIndex);
            this.$elem.one('animationend', function(){
                $(this).removeClass('bs-ani-slideTop-' + elemIndex);
            });
        }
    },

    bounce : function(elemIndex ,topImg, bottomImg, bgWidth, bgHeight){
        this.$elem.addClass('bs-ani-bounce-' + elemIndex);
        this.$elem.one('animationend', function(){
            $(this).removeClass('bs-ani-bounce-' + elemIndex);
        });
    },

    shake : function(elemIndex ,topImg, bottomImg, bgWidth, bgHeight){
        this.$elem.addClass('bs-ani-shake-' + elemIndex);
        this.$elem.one('animationend', function(){
            $(this).removeClass('bs-ani-shake-' + elemIndex);
        });
    }
};








})(jQuery);













