# Usage
`$(selector).my_bgStretch(images, options);`。`images`是一个数组，传入图像的url。`options`默认值：
```javascript
{
  centeredX : true,
  centeredY : true,
  switchType : '',//可选'slide'或'bounce'或'shake'
  duration : 5000
}
```
控制轮播图片的暂停、开始、上一张、下一张：
```javascript
$(selector).my_bgStretch().pause();
$(selector).my_bgStretch().resume();
$(selector).my_bgStretch().prev();
$(selector).my_bgStretch().next();
$(selector).my_bgStretch().show(index);//index为图片索引，从0开始
```
