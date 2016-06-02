    /**create by daijm
     * Attaches event to a dom element.
     * @param {Element} el
     * @param type event name
     * @param fn callback This refers to the passed element
     */
    function addEvent(el, type, fn){
        if (el.addEventListener) {
            el.addEventListener(type, fn, false);
        } else if (el.attachEvent) {
            el.attachEvent('on' + type, function(){
                fn.call(el);
	        });
	    } else {
            throw new Error('not supported or DOM not loaded');
        }
    }

    /* *
        *将调整大小调整到窗口，限制
        *事件数。只有当遇到火灾
        * 100系列事件后的延迟。
        *
        *一些浏览器火灾事件多次调整
        * http://www.quirksmode.org/dom/events/resize.html
        *
        * @param FN回调这是指通过元
        */
    function addResizeEvent(fn){
        var timeout;

	    addEvent(window, 'resize', function(){
            if (timeout){
                clearTimeout(timeout);
            }
            timeout = setTimeout(fn, 100);
        });
    }

    // Needs more testing, will be rewriten for next version
    // getOffset function copied from jQuery lib (http://jquery.com/)
    if (document.documentElement.getBoundingClientRect){
        // Get Offset using getBoundingClientRect
        // http://ejohn.org/blog/getboundingclientrect-is-awesome/
        var getOffset = function(el){
            var box = el.getBoundingClientRect();
            var doc = el.ownerDocument;
            var body = doc.body;
            var docElem = doc.documentElement; // for ie
            var clientTop = docElem.clientTop || body.clientTop || 0;
            var clientLeft = docElem.clientLeft || body.clientLeft || 0;

            // In Internet Explorer 7 getBoundingClientRect property is treated as physical,
            // while others are logical. Make all logical, like in IE8.
            var zoom = 1;
            if (body.getBoundingClientRect) {
                var bound = body.getBoundingClientRect();
                zoom = (bound.right - bound.left) / body.clientWidth;
            }

            if (zoom > 1) {
                clientTop = 0;
                clientLeft = 0;
            }

            var top = box.top / zoom + (window.pageYOffset || docElem && docElem.scrollTop / zoom || body.scrollTop / zoom) - clientTop, left = box.left / zoom + (window.pageXOffset || docElem && docElem.scrollLeft / zoom || body.scrollLeft / zoom) - clientLeft;

            return {
                top: top,
                left: left
            };
        };
    } else {
        // Get offset adding all offsets
        var getOffset = function(el){
            var top = 0, left = 0;
            do {
                top += el.offsetTop || 0;
                left += el.offsetLeft || 0;
                el = el.offsetParent;
            } while (el);

            return {
                left: left,
                top: top
            };
        };
    }

    /**
     * Returns left, top, right and bottom properties describing the border-box,
     * in pixels, with the top-left relative to the body
     * @param {Element} el
     * @return {Object} Contains left, top, right,bottom
     */
    function getBox(el){
        var left, right, top, bottom;
        var offset = getOffset(el);
        left = offset.left;
        top = offset.top;

        right = left + el.offsetWidth;
        bottom = top + el.offsetHeight;

        return {
            left: left,
            right: right,
            top: top,
            bottom: bottom
        };
    }

    /**
     * Helper that takes object literal
     * and add all properties to element.style
     * @param {Element} el
     * @param {Object} styles
     */
    function addStyles(el, styles){
        for (var name in styles) {
            if (styles.hasOwnProperty(name)) {
                el.style[name] = styles[name];
            }
        }
    }

    /**
     * Function places an absolutely positioned
     * element on top of the specified element
     * copying position and dimentions.
     * @param {Element} from
     * @param {Element} to
     */
    function copyLayout(from, to){
	    var box = getBox(from);

        addStyles(to, {
	        position: 'absolute',
	        left : box.left + 'px',
	        top : box.top + 'px',
	        width : from.offsetWidth + 'px',
	        height : from.offsetHeight + 'px'
	    });
    }

    /**
    * Creates and returns element from html chunk
    * Uses innerHTML to create an element
    */
    var toElement = (function(){
        var div = document.createElement('div');
        return function(html){
            div.innerHTML = html;
            var el = div.firstChild;
            return div.removeChild(el);
        };
    })();

    /**
*函数产生的唯一的ID
* @return独特的ID
     */
    var getUID = (function(){
        var id = 0;
        return function(){
            return 'ValumsAjaxUpload' + id++;
        };
    })();

   /**
    *从路径获取文件名
    * @param { }文件路径字符串的文件
    *返回文件名
    */
    function fileFromPath(file){
        return file.replace(/.*(\/|\\)/, "");
    }

    /* *
    *获得文件扩展名
    * @param { }文件名的字符串
    * @返回文件扩展
    */
    function getExt(file){
        return (-1 !== file.indexOf('.')) ? file.replace(/.*[.]/, '') : '';
    }

    function hasClass(el, name){
        var re = new RegExp('\\b' + name + '\\b');
        return re.test(el.className);
    }
    function addClass(el, name){
        if ( ! hasClass(el, name)){
            el.className += ' ' + name;
        }
    }
    function removeClass(el, name){
        var re = new RegExp('\\b' + name + '\\b');
        el.className = el.className.replace(re, '');
    }

    function removeNode(el){
        el.parentNode.removeChild(el);
    }

   /**
    *简单的造型和上传
    * @构造函数
    * @param按钮元素你想转换
    *上传按钮。测试维度上500x500px
    * @param {对象}选项默认下面看。
    */
    var AjaxUpload = function(button, options){
        this._settings = {
            // 服务器端上传脚本的位置
            action: 'upload.php',
            // 上传文件的名称
            name: 'userfile',
            // 选择和上传多个文件一次ff3.6 +，Chrome 4 +
            multiple: false,
            // 发送附加数据
            data: {},
            //提交文件，只要它的选择
            autoSubmit: true,
            // 你希望从服务器返回的数据类型。
            //的HTML和XML的自动检测。
            //唯一有用的当你使用JSON数据作为响应。
            //设置为“json”那样的话。
            responseType: false,
            // 类用于按钮时，鼠标悬停
            hoverClass: 'hover',
            // 类应用于按钮时，重点是
            focusClass: 'focus',
            // 当在类applied to按钮是残疾人
            disabledClass: 'disabled',
            //当用户选择一个文件，有用的autosubmit禁用
            //你可以返回假以取消上传
            onChange: function(file, extension){
            },
            //在文件上传之前，回火
            //你可以返回假以取消上传
            onSubmit: function(file, extension){
            },
            // 当文件上传完成时触发
            //警告！不要使用“假”字符串作为响应！
            onComplete: function(file, response){
            }
        };

        //用户的默认选项以及合并 

        for (var i in options) { 
            if (options.hasOwnProperty(i)){
                this._settings[i] = options[i];
            }
        }

        // 按钮不需要一个DOM元素
        if (button.jquery){
            // jQuery object was passed
            button = button[0];
        } else if (typeof button == "string") {
            if (/^#.*/.test(button)){
                //如果jQuery用户通过# elementid不要打破它
                button = button.slice(1);
            }

            button = document.getElementById(button);
        }

        if ( ! button || button.nodeType !== 1){
            throw new Error("Please make sure that you're passing a valid element");
        }

        if ( button.nodeName.toUpperCase() == 'A'){
            // disable link
            addEvent(button, 'click', function(e){
                if (e && e.preventDefault){
                    e.preventDefault();
                } else if (window.event){
                    window.event.returnValue = false;
                }
            });
        }

        // DOM element
        this._button = button;
        // DOM element
        this._input = null;
        //如果禁用按钮，就不会做任何事情
        this._disabled = false;

        // 如果按钮被禁用，刷新前，如果将继续
        //在浏览器中禁用，让我们来解决它
        this.enable();

        this._rerouteClicks();
    };

    // 分配方法 to our class
    AjaxUpload.prototype = {
        setData: function(data){
            this._settings.data = data;
        },
        disable: function(){
            addClass(this._button, this._settings.disabledClass);
            this._disabled = true;

            var nodeName = this._button.nodeName.toUpperCase();
            if (nodeName == 'INPUT' || nodeName == 'BUTTON'){
                this._button.setAttribute('disabled', 'disabled');
            }

            // hide input
            if (this._input){
                if (this._input.parentNode) {
                    // We use visibility instead of display to fix problem with Safari 4
                    // The problem is that the value of input doesn't change if it
                    // has display none when user selects a file
                    this._input.parentNode.style.visibility = 'hidden';
                }
            }
        },
        enable: function(){
            removeClass(this._button, this._settings.disabledClass);
            this._button.removeAttribute('disabled');
            this._disabled = false;

        },
        /**
         * Creates invisible file input
         * that will hover above the button
         * <div><input type='file' /></div>
         */
        _createInput: function(){
            var self = this;

            var input = document.createElement("input");
            input.setAttribute('type', 'file');
            input.setAttribute('name', this._settings.name);
            if(this._settings.multiple) input.setAttribute('multiple', 'multiple');

            addStyles(input, {
                'position' : 'absolute',
                // in Opera only 'browse' button
                // is clickable and it is located at
                // the right side of the input
                'right' : 0,
                'margin' : 0,
                'padding' : '20px',
                // in Firefox if font-family is set to
                // 'inherit' the input doesn't work
                'fontFamily' : 'sans-serif',
                'cursor' : 'pointer'
            });

            var div = document.createElement("div");
            addStyles(div, {
                'display' : 'block',
                'position' : 'absolute',
                'overflow' : 'hidden',
                'margin' : 0,
                'padding' : 0,
                'opacity' : 0,
                // Make sure browse button is in the right side
                // in Internet Explorer
                'direction' : 'ltr',
                //Max zIndex supported by Opera 9.0-9.2
                'zIndex': 2147483583
            });

            // Make sure that element opacity exists.
            // Otherwise use IE filter
            if ( div.style.opacity !== "0") {
                if (typeof(div.filters) == 'undefined'){
                    throw new Error('Opacity not supported by the browser');
                }
                div.style.filter = "alpha(opacity=0)";
            }

            addEvent(input, 'change', function(){

                if ( ! input || input.value === ''){
                    return;
                }
                //从输入获得文件名，要求
                //一些浏览器有路径代替它
                var file = fileFromPath(input.value);//获取文件名

                if (false === self._settings.onChange.call(self, file, getExt(file))){
                    self._clearInput();
                    return;
                }

                // Submit form when value is changed
                if (self._settings.autoSubmit) {
                    self.submit();
                }
            });

            addEvent(input, 'mouseover', function(){
                addClass(self._button, self._settings.hoverClass);
            });

            addEvent(input, 'mouseout', function(){
                removeClass(self._button, self._settings.hoverClass);
                removeClass(self._button, self._settings.focusClass);

                if (input.parentNode) {
                    // We use visibility instead of display to fix problem with Safari 4
                    // The problem is that the value of input doesn't change if it
                    // has display none when user selects a file
                    input.parentNode.style.visibility = 'hidden';
                }
            });

            addEvent(input, 'focus', function(){
                addClass(self._button, self._settings.focusClass);
            });

            addEvent(input, 'blur', function(){
                removeClass(self._button, self._settings.focusClass);
            });

	        div.appendChild(input);
            document.body.appendChild(div);

            this._input = input;
        },
        _clearInput : function(){
            if (!this._input){
                return;
            }

            // this._input.value = ''; Doesn't work in IE6
            removeNode(this._input.parentNode);
            this._input = null;
            this._createInput();

            removeClass(this._button, this._settings.hoverClass);
            removeClass(this._button, this._settings.focusClass);
        },
        /**
         * Function makes sure that when user clicks upload button,
         * the this._input is clicked instead
         */
        _rerouteClicks: function(){
            var self = this;

            // IE will later display 'access denied' error
            // if you use using self._input.click()
            // other browsers just ignore click()

            addEvent(self._button, 'mouseover', function(){
                if (self._disabled){
                    return;
                }

                if ( ! self._input){
	                self._createInput();
                }

                var div = self._input.parentNode;
                copyLayout(self._button, div);
                div.style.visibility = 'visible';

            });


            // commented because we now hide input on mouseleave
            /**
             * When the window is resized the elements
             * can be misaligned if button position depends
             * on window size
             */
            //addResizeEvent(function(){
            //    if (self._input){
            //        copyLayout(self._button, self._input.parentNode);
            //    }
            //});

        },
        /**
         * Creates iframe with unique name
         * @return {Element} iframe
         */
        _createIframe: function(){
            // We can't use getTime, because it sometimes return
            // same value in safari :(
            var id = getUID();

            // We can't use following code as the name attribute
            // won't be properly registered in IE6, and new window
            // on form submit will open
            // var iframe = document.createElement('iframe');
            // iframe.setAttribute('name', id);

            var iframe = toElement('<iframe src="javascript:false;" name="' + id + '" />');
            // src="javascript:false; was added
            // because it possibly removes ie6 prompt
            // "This page contains both secure and nonsecure items"
            // Anyway, it doesn't do any harm.
            iframe.setAttribute('id', id);

            iframe.style.display = 'none';
            document.body.appendChild(iframe);

            return iframe;
        },
        /**
         * Creates form, that will be submitted to iframe
         * @param {Element} iframe Where to submit
         * @return {Element} form
         */
        _createForm: function(iframe){
            var settings = this._settings;

            //我们不能在IE6中使用以下代码
            //无功表=文件。createElement（‘形’）；
            //形式。setAttribute（表现'，'后'）；
            //形式。setAttribute（'enctype”、“multipart/form-data”）；
            //因为在这种情况下，文件不会被要求
            var form = toElement('<form method="post" enctype="multipart/form-data"></form>');
            form.setAttribute('action', settings.action);
            form.setAttribute('target', iframe.name);
            form.style.display = 'none';
            document.body.appendChild(form);

            // Create hidden input element for each data key
            for (var prop in settings.data) {
                if (settings.data.hasOwnProperty(prop)){
                    var el = document.createElement("input");
                    el.setAttribute('type', 'hidden');
                    el.setAttribute('name', prop);
                    el.setAttribute('value', settings.data[prop]);
                    form.appendChild(el);
                }
            }
            return form;
        },
       /* *
        *和火灾时准备获取iframe oncomplete事件响应
        * @param iframe
        * @param文件的文件名中使用完全回调
        */
        _getResponse : function(iframe, file){
            // getting response
            var toDeleteFlag = false, self = this, settings = this._settings;

            addEvent(iframe, 'load', function(){

                if (// For Safari
                    iframe.src == "javascript:'%3Chtml%3E%3C/html%3E';" ||
                    // For FF, IE
                    iframe.src == "javascript:'<html></html>';"){
                        // First time around, do not delete.
                        // We reload to blank page, so that reloading main page
                        // does not re-submit the post.

                        if (toDeleteFlag) {
                            // Fix busy state in FF3
                            setTimeout(function(){
                                removeNode(iframe);
                            }, 0);
                        }

                        return;
                }

                var doc = iframe.contentDocument ? iframe.contentDocument : window.frames[iframe.id].document;

                // fixing Opera 9.26,10.00
                if (doc.readyState && doc.readyState != 'complete') {
                   // Opera fires load event multiple times
                   // Even when the DOM is not ready yet
                   // this fix should not affect other browsers
                   return;
                }

                // fixing Opera 9.64
                if (doc.body && doc.body.innerHTML == "false") {
                    // In Opera 9.64 event was fired second time
                    // when body.innerHTML changed from false
                    // to server response approx. after 1 sec
                    return;
                }

                var response;

                if (doc.XMLDocument) {
                    // response is a xml document Internet Explorer property
                    response = doc.XMLDocument;
                } else if (doc.body){
                    // response is html document or plain text
                    response = doc.body.innerHTML;

                    if (settings.responseType && settings.responseType.toLowerCase() == 'json') {
                        // If the document was sent as 'application/javascript' or
                        // 'text/javascript', then the browser wraps the text in a <pre>
                        // tag and performs html encoding on the contents.  In this case,
                        // we need to pull the original text content from the text node's
                        // nodeValue property to retrieve the unmangled content.
                        // Note that IE6 only understands text/html
                        if (doc.body.firstChild && doc.body.firstChild.nodeName.toUpperCase() == 'PRE') {
                            doc.normalize();
                            response = doc.body.firstChild.firstChild.nodeValue;
                        }

                        if (response) {
                            response = eval("(" + response + ")");
                        } else {
                            response = {};
                        }
                    }
                } else {
                    // response is a xml document
                    response = doc;
                }

                settings.onComplete.call(self, file, response);

                // Reload blank page, so that reloading main page
                // does not re-submit the post. Also, remember to
                // delete the frame
                toDeleteFlag = true;

                // Fix IE mixed content issue
                iframe.src = "javascript:'<html></html>';";
            });
        },
        /**
         * 在 this._input 上传文件
         */
        submit: function(){
            var self = this, settings = this._settings;

            if ( ! this._input || this._input.value === ''){
                return;
            }

            var file = fileFromPath(this._input.value);
           // console.log(file);
            // 用户返回false 取消上传
            if (false === settings.onSubmit.call(this, file, getExt(file),this._input.files)){
                this._clearInput();
                return;
            }

            // 发送请求
            var iframe = this._createIframe();
            var form = this._createForm(iframe);

           //assuming以下结构
           //div > <input type=“file”
            removeNode(this._input.parentNode);
            removeClass(self._button, self._settings.hoverClass);
            removeClass(self._button, self._settings.focusClass);

            form.appendChild(this._input);

            form.submit();

            // request set, clean up
            removeNode(form); form = null;
            removeNode(this._input); this._input = null;

            //从iframe和fire oncomplete事件时准备响应
            this._getResponse(iframe, file);

            //准备好下一个请求
            this._createInput();
        }
    };

module.exports = AjaxUpload;





function placeholder(obj)
{
      if (navigator.userAgent.indexOf("WebKit") == -1)
      {
         obj.onfocus = function()
        {
            if($(obj).attr("placeholder") == $(obj).val())
            {
                obj.value = '';
            }
        };

        obj.onblur = function()
        {
            if(obj.value == '')
            {
                obj.value = $(obj).attr("placeholder");
            }
        }
      }

}
