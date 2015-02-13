/**
 * AJAX 的 GET
 * @param url 地址
 * @param funScuss 成功执行的函数[参数 data]
 * @param funFail  失败执行的函数[参数 status]
 */
function ajaxGet(url, funScuss, funFail) {
    // 1, 创建 XMLHttpRequest
    var xhr;
    if (window.XMLHttpRequest) { //IE7+, Firefox, Chrome, Opera, Safari
        xhr = new XMLHttpRequest();
    }
    else { //IE6, IE5
        xhr = new ActiveXObject('Microsoft.XMLHTTP');
    }

    url += url.match(/\?/) ? '&' : '?' + 'time=' + new Date().getTime(); // 防止缓存

    setTimeout(function() {
        xhr.abort();
        funFail && funFail('timeout');
    }, 20 * 1000);

    //2 连接服务器
    xhr.open('GET', url, true); // true 默认异步

    // 3, 发送请求
    xhr.send();

    // 4, 接收服务器的返回
    xhr.onreadystatechange = function() {
        // 完成返回
        if (xhr.readyState === 4) {
            // 成功接收数据
            if (xhr.status === 200) {
                funScuss && funScuss(xhr.responseText);
            }
            else {
                funFail && funFail(xhr.status);
            }
        }
    };
}

/**
 *
 * @param url
 * @param data
 * @param funScuss
 * @param funFail
 */
function ajaxPost(url, data, funScuss, funFail) {
    // 1, 创建 XMLHttpRequest
    var xhr;
    if (window.XMLHttpRequest) { //IE7+, Firefox, Chrome, Opera, Safari
        xhr = new XMLHttpRequest();
    }
    else { //IE6, IE5
        xhr = new ActiveXObject('Microsoft.XMLHTTP');
    }

    url += url.match(/\?/) ? '&' : '?' + 'time=' + new Date().getTime(); // 防止缓存

    // 设置超时取消
    setTimeout(function() {
        xhr.abort();
        funFail && funFail('timeout');
    }, 20 * 1000);

    //2 连接服务器
    xhr.open('POST', url, true);
    xhr.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    // 3, 发送请求
    xhr.send(data);

    // 4, 接收服务器的返回
    xhr.onreadystatechange = function() {
        // 完成返回
        if (xhr.readyState === 4) {
            // 成功接收数据
            if (xhr.status === 200) {
                funScuss && funScuss(xhr.responseText);
            }
            else {
                funFail && funFail(xhr.status);
            }
        }
    };
}

/**
 * jsonpGet
 * @param url
 * @param [funSuccess]
 * @param [funFail]
 */
function jsonpGet(url, funSuccess, funFail) {
    var tempcallback = 'callback_' + new Date().getTime() + '_' + Math.random().toString(36).substr(2);
    var oScript = document.createElement('script');
    oScript.type = 'text/javascript';

    if (/\?/.test(url)) {
        var matchstr = url.match(/(.*?)\?(.*)/);
        oScript.src = matchstr[1] + '?callback=' + tempcallback + '&' + matchstr[2];
    }
    else {
        oScript.src = url + '?callback=' + tempcallback;
    }

    oScript.timer = setTimeout(function() {
        funFail && funFail();
    }, 10000);

    oScript.onerror = function() {
        clearTimeout(oScript.timer);
        funFail && funFail();
    };

    document.body.appendChild(oScript);

    window[tempcallback] = function(json) {
        clearTimeout(oScript.timer);
        window[tempcallback] = null;
        document.body.removeChild(oScript);
        funSuccess && funSuccess(json);
    };
}
