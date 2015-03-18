function ajaxGet(t,e,n){var i;i=window.XMLHttpRequest?new XMLHttpRequest:new ActiveXObject("Microsoft.XMLHTTP"),t+=t.match(/\?/)?"&":"?time="+(new Date).getTime(),setTimeout(function(){i.abort(),n&&n("timeout")},2e4),i.open("GET",t,!0),i.send(),i.onreadystatechange=function(){4===i.readyState&&(200===i.status?e&&e(i.responseText):n&&n(i.status))}}function ajaxPost(t,e,n,i){var o;o=window.XMLHttpRequest?new XMLHttpRequest:new ActiveXObject("Microsoft.XMLHTTP"),t+=t.match(/\?/)?"&":"?time="+(new Date).getTime(),setTimeout(function(){o.abort(),i&&i("timeout")},2e4),o.open("POST",t,!0),o.setRequestHeader("Content-type","application/x-www-form-urlencoded"),o.send(e),o.onreadystatechange=function(){4===o.readyState&&(200===o.status?n&&n(o.responseText):i&&i(o.status))}}function jsonpGet(t,e,n){var i="callback_"+(new Date).getTime()+"_"+Math.random().toString(36).substr(2),o=document.createElement("script");if(o.type="text/javascript",/\?/.test(t)){var a=t.match(/(.*?)\?(.*)/);o.src=a[1]+"?callback="+i+"&"+a[2]}else o.src=t+"?callback="+i;o.timer=setTimeout(function(){n&&n()},1e4),o.onerror=function(){clearTimeout(o.timer),n&&n()},document.body.appendChild(o),window[i]=function(t){clearTimeout(o.timer),window[i]=null,document.body.removeChild(o),e&&e(t)}}function getbdmInfo(t,e,n){var i=t.match("\\d+")[0],o="http://music.baidu.com/data/music/fmlink?songIds="+i+"&type=mp3&rate=";if("string"==typeof e)getoInfo(o+e,i,e,n);else{e.length||(e=["128","192","320","flac"]);for(var a=0;a<e.length;a++)getoInfo(o+e[a],i,e[a],n)}}function getoInfo(t,e,n,i){jsonpGet(t,function(t){var o=t.data.songList[0],a={id:e,rate:n,downloadhref:"http://yinyueyun.baidu.com/data/cloud/downloadsongfile?songIds="+e+"&rate="+("flac"===n?835:n)+"&format="+n,mp3:o.songLink.replace("yinyueshiting","musicdata").replace(/&src=.*/,""),showLink:o.showLink,cover:o.songPicBig,title:o.songName,time:o.time,artist:o.artistName,lrc:"http://play.baidu.com"+o.lrcLink};i&&i(a)})}function shangLrcLoad(t,e){var n={};n.currentNu=1,n.nextUpdateTime=-1,n.lrc=[],n.audioObj="string"==typeof t?document.getElementById(t):t,n.lrcObj="string"==typeof e?document.getElementById(e):e,n.lrchtmlarr=[],n.divContent=document.createElement("div"),n.repaireTimeNu=0;var i=null;return n.addLrc=function(t,e){n.lrc.push({time:t,lrcstr:e})},n.parseLrc=function(t){for(var e=t.split("\n"),i=0;i<e.length;i++)for(var o=e[i].split("]"),a=0;a<o.length-1;a++){var r=o[a].match(/(\d+)\:(\d+)((\.|\:)(\d+))?/);r&&!/^\s*$/.test(o[o.length-1])&&n.addLrc(60*(+r[1]||0)+(+r[2]||0)+(+r[4]||0)/100,o[o.length-1])}},n.checkUpdate=function(){n.audioObj.currentTime>=n.nextUpdateTime-n.repaireTimeNu&&(n.scrollLrc(),n.checkUpdate())},n.clearClass=function(){for(var t=0;t<n.lrchtmlarr.length;t++)n.lrchtmlarr[t].className=""},n.scrollLrc=function(){if(n.currentNu++,"undefined"!=typeof n.lrc[n.currentNu]){clearInterval(i),n.nextUpdateTime=n.lrc[n.currentNu].time,n.lrchtmlarr[n.currentNu-2].className="",n.lrchtmlarr[n.currentNu-1].className="current";var t=n.lrchtmlarr[n.currentNu-1].moveHeight-300;t=t>0?parseInt(t):0;var e=n.divContent,o=e.scrollTop;i=setInterval(function(){var n=-8,a=(t-o)/-n;a=a>0?Math.ceil(a):Math.floor(a);var r=o+a;e.scrollTop=r,t===r&&clearInterval(i),o=r},30)}},n.init=function(){if(n.addLrc(0,""),n.addLrc(0,""),n.addLrc(999999,""),n.lrc.sort(function(t,e){return t.time-e.time}),n.audioObj.addEventListener("seeked",function(){n.currentNu=1,n.nextUpdateTime=-1}),n.audioObj.addEventListener("timeupdate",function(){n.checkUpdate()}),!window.is_shang_lrc_css){var t=document.createElement("style");t.type="text/css",t.innerHTML="#shang_lrc_div{margin:0;padding:0;overflow-y:scroll;overflow-x:hidden;height:100%}#shang_lrc_div::-webkit-scrollbar{width:5px;height:5px;border-radius:4px}#shang_lrc_div::-webkit-scrollbar-button{display:none}#shang_lrc_div::-webkit-scrollbar-track{background:#333}#shang_lrc_div::-webkit-scrollbar-thumb{background:#191919;border-radius:4px}#shang_lrc_div::-webkit-scrollbar-corner{display:none}.current{color:blueviolet;font-weight:bold}",document.getElementsByTagName("head")[0].appendChild(t),window.is_shang_lrc_css=!0}n.divContent.id="shang_lrc_div",n.lrcObj.innerHTML="",n.lrcObj.appendChild(n.divContent);var e=document.createElement("div");n.divContent.appendChild(e);for(var i=0;i<n.lrc.length;i++){var o=document.createElement("p");n.lrchtmlarr.push(o),o.innerHTML=n.lrc[i].lrcstr,e.appendChild(o),o.moveHeight=o.offsetTop}},n}$(document).ready(function(){function t(){F.html('如果下载的码率不存在,默认下载为128码率[如果文件大小为3~4M就是128码率]<br><a data-rate="128" href = "javascript:void(0);">128</a><br><a data-rate="192" href = "javascript:void(0);">192</a><br><a data-rate="320" href = "javascript:void(0);">320</a><br><a data-rate="flac" href = "javascript:void(0);">flac</a>'),J.modal("show"),B.hide()}function e(t,e){var n=document.createElement("a");n.href=t,n.target="_blank",n.download=e?e:"download";var i=document.createEvent("MouseEvents");i.initMouseEvent("click",!0,!1,window,0,0,0,0,0,!1,!1,!1,!1,0,null),n.dispatchEvent(i)}function n(){w=G.width(),b=j.width();var t=$(window).height()-K.height()-Q.height()-50;V.height(t>0?t:100),W.height(t-50>0?t-50:100)}function i(){n();var t=localStorage.shang_music;if(t&&(ce=JSON.parse(t))){ee=ce.playlistinfo||[];for(var e=0;e<ee.length;e++)ee[e]&&m(ee[e].rate128,e)}}function o(t){T&&(clearTimeout(q.timer),ee[Z].rate128.repaireTimeNu=0===t?0:(ee[Z].rate128.repaireTimeNu||0)+t,v.repaireTimeNu=ee[Z].rate128.repaireTimeNu,q.html("["+v.repaireTimeNu/10+"]"),p(),q.timer=setTimeout(function(){q.html("")},2e3))}function a(t,e){if(ae&&T){var n=t.clientX-G.offset().left,i=n/w;0>i?i=0:i>1&&(i=1);var o=c();i>o&&(i=o),I.width(i*w),E.width(o*w),e&&(T.currentTime=Math.floor(i*T.duration),v.clearClass())}}function r(t){if(re){var e=t.clientX-j.offset().left,n=e/b;0>n?n=0:n>1&&(n=1),S.width(100*n+"%"),te=n,T&&(T.volume=n,T.muted&&(T.muted=!1,H.attr("src","./images/volume.png")))}}function c(){if(!T)return 0;var t=T.buffered;if(t.length){var e=t.end(t.length-1),n=e/T.duration;return n}}function l(t){if(t){for(var e=-1,n=0;n<ee.length;n++)if(ee[n]&&t===ee[n].rate128.id){e=n;break}if(-1!==e){B.show();var i=F.html();F.html("已经在列表中,点击确定跳转播放"),J.modal("show"),z.html("返回"),z.get(0).dataset.dismiss="",z.one("click",function(){F.html(i),z.html("关闭"),setTimeout(function(){z.get(0).dataset.dismiss="modal"},200)}),B.one("click",function(){J.modal("hide"),Z=e,d(Z)})}else{var o={};ee.push(o),getbdmInfo(t,["128"],function(t){if(o["rate"+t.rate]=t,"128"===t.rate){if(Z=ee.length-1,/pan.baidu/.test(t.showLink)){ee.length=ee.length-1;var e=F.html();F.html("此音乐为网网盘音乐, 点击确定打开此音乐网盘地址, 点击返回重新选取"),B.show(),z.html("返回"),B.html('<a href="'+t.showLink+'" target = "_blank" style="color: white">跳转</a>'),B.one("click",function(){return J.modal("hide"),!0}),z.get(0).dataset.dismiss="",z.one("click",function(){F.html(e),z.html("关闭"),B.hide(),setTimeout(function(){z.get(0).dataset.dismiss="modal"},200)})}else d(Z,!0),J.modal("hide");p()}})}}else s(x.val())}function s(t){if(!t)return F.html("请输入 歌曲名/歌手/百度音乐ID链接"),B.hide(),J.modal("show"),void(oe=setTimeout(function(){J.modal("hide")},3e3));var e="http://121.40.81.63:1337/";ajaxGet(e+"?method=get&url="+encodeURIComponent("http://sug.music.baidu.com/info/suggestion?format=json&word="+t+"&version=2&from=0"),function(t){var e=JSON.parse(t).data,n=$('<div id="searchsongdiv">');if(e.song.length){for(var i=$("<ul>"),o=0;o<e.song.length;o++){var a=e.song[o],r=$('<li data-songid="'+a.songid+'">');r.html('<hr><div class="row"> <div class="col-md-7 col-xs-5 text-nowrap" title="'+(a.songname||"SHANG")+'">'+(a.songname||"SHANG")+'</div><div class="col-md-4 col-xs-5 text-nowrap" title="'+(a.artistname||"SHANG")+'">'+(a.artistname||"SHANG")+'</div><div class="col-md-1 col-xs-2"><img class="liimg pull-left" src="images/download.png"/></div></div>'),i.append(r)}n.append(i)}else n.html("未找到....");F.html(""),F.append(n),B.hide(),J.modal("show")})}function d(t,e,n){var i=!1;if(!ee[t])return void h(n||1);var o=ee[t].rate128;return/pan.baidu/.test(o.showLink)?(F.html("此音乐为百度网盘音乐, 删除并播放下一首?"),B.show(),J.modal("show"),void B.one("click",function(){1!==ee.length&&h(1),U.find("li").each(function(){$(this).find("img").first().trigger("click")})})):(T&&(i=T.muted,document.body.removeChild(T)),T=document.createElement("audio"),T.innerHTML="<source src="+o.mp3+">",document.body.appendChild(T),T.volume=te,T.play(),Z=t,ie||(M.attr("src","./images/pause.png"),ie=!0),i&&(T.muted=i,H.attr("src","./images/mute.png")),$(T).on("timeupdate",function(){f()}),$(T).on("ended",function(){h(1)}),v=shangLrcLoad(T,"lrcdiv"),jsonpGet("http://cors.coding.io?method=get&url="+o.lrc,function(t){v.parseLrc(t.data),v.repaireTimeNu=o.repaireTimeNu||0,v.init()}),void u(o,t,e))}function u(t,e,n){O.html(t.title||"SHANG"),X.html(t.artist||"SHANG"),A.attr("src",t.cover||"http://i1.tietuku.com/f3f9084123926501.jpg"),n&&m(t,e),U.find("li").each(function(t){$(this).data("nu")===e?ne[t].addClass("playing"):ne[t].removeClass("playing")})}function m(t,e){var n=t.time||0,i=Math.floor(n/60),o=Math.round(n%60)<10?"0"+Math.round(n%60):Math.round(n%60),a=$("<li>");a.html('<hr><div class="row"> <div class="col-md-7 col-xs-6 text-nowrap" title="'+(t.title||"SHANG")+" - "+(t.artist||"SHANG")+'">'+(t.title||"SHANG")+" - "+(t.artist||"SHANG")+'</div><div class="col-md-2 col-xs-3 text-right">'+(i+":"+o)+'</div><div class="col-md-2 col-xs-3"><img id="imgdel" class="liimg pull-left" src="images/delete.png"/><img class="liimg pull-left" src="images/download.png"/></div></div>'),a.data("nu",e),U.append(a),ne.push(a)}function h(t){-1!==Z&&(Z=(Z+ee.length+t)%ee.length,d(Z,!1,t))}function f(){if(T){var t=T.currentTime,e=Math.floor(t/60),n=Math.round(t%60)<10?"0"+Math.round(t%60):Math.round(t%60);P.html(e+":"+n),ae||(I.width(T.currentTime/T.duration*w),E.width(c()*w))}}function g(){T&&(document.body.removeChild(T),T=null,Z=-1),U.html(""),$("#lrcdiv").html(""),O.html("SHANG"),X.html("SHANG"),A.attr("src","http://i1.tietuku.com/f3f9084123926501.jpg"),I.width(0),E.width(0),P.html("")}function p(){for(var t=[],e=!1,n=0;n<ee.length;n++)ee[n]&&(t.push(ee[n]),e=!0);return ce.playlistinfo=t,localStorage.shang_music=JSON.stringify(ce),e}var v,w,b,k,y,T=null,N=$("#addandplay"),L=$(".mayplay"),x=$("#addr"),M=$("#playpaush"),_=$("#previewsong"),C=$("#nextsong"),H=$("#mute"),j=$("#volumebar"),S=$("#currentvolumebar"),G=$("#progressbar"),I=$("#currentprogress"),E=$("#loadedprogress"),A=$("#coverimg"),O=$("#title"),X=$("#artist"),P=$("#info"),U=$("#alllistul"),D=$("#lrctimereduce"),R=$("#lrctimeadd"),q=$("#lrctimecurrent"),B=$("#ensurebtn"),J=$("#showtext"),z=$("#notsurebtn"),F=$(".textdiv"),K=$("#searcharea"),Q=$("#player"),V=$("#alllist"),W=$("#lrcdiv"),Y=$("#download"),Z=-1,te=1,ee=[],ne=[],ie=!0,oe=null,ae=!1,re=!1,ce={};i(),$(window).on("resize",function(){n()}),$(window).on("beforeunload",function(){return(new Date).getTime()-(y||0)>1e3?"提示: ":void 0}),U.on("click","li",function(t){var e=$(this).data("nu");d(e,!1),t.stopPropagation()}),U.on("click","li img",function(e){var n=$(this).parents("li.maydelete"),i=n.data("nu");if("imgdel"===e.target.id){ee[i]=void 0,ne.splice(i,1),n.remove();var o=p();i===Z&&(o?h(1):g())}else i>=0&&(k=ee[i].rate128.id,t());e.stopPropagation()}),U.on("mouseover","li",function(){$(this).addClass("maydelete"),$(this).find("img").removeClass("visible-xs"),$(this).find("img").css("display","block")}),U.on("mouseout","li",function(){$(this).removeClass("maydelete"),$(this).find("img").addClass("visible-xs"),$(this).find("img").css("display","none")}),F.on("click","li",function(t){var e=""+$(this).data("songid");l(e),t.stopPropagation()}),F.on("click","a",function(){getbdmInfo(k,[this.getAttribute("data-rate")],function(t){if(y=(new Date).getTime(),/pan.baidu/.test(t.showLink))prompt("网盘音乐,请复制链接下载~~",t.mp3);else{e(t.mp3);var n=F.html();z.html("返回"),z.get(0).dataset.dismiss="",z.one("click",function(){F.html(n),setTimeout(function(){z.get(0).dataset.dismiss="modal"},200),z.html("关闭")}),F.html('备用链接; 复制下面链接至迅雷/旋风等下载;如果下载的不是音频文件;说明没有此码率<br><input type="text" id="backdownload" selected="selected" value="'+t.downloadhref+'"></input>')}})}),F.on("click","li img",function(e){k=$(this).parents("li").data("songid")+"",t(),e.stopPropagation()}),$(document).on("keydown",function(t){13===t.keyCode&&L.first().trigger("click")}),$(document).on("mousedown",function(){(ae||re)&&(document.body.style.cursor="pointer")}),$(document).on("mouseup",function(t){a(t,!0),r(t),ae=!1,re=!1,document.body.style.cursor="default"}),$(document).on("mousemove",function(t){return a(t),r(t),"addr"===t.target.id||"backdownload"===t.target.id}),G.on("mousedown",function(){ae=!0}),j.on("mousedown",function(){re=!0}),x.on("focus",function(){x.select()}),D.on("click",function(){o(-1)}),R.on("click",function(){o(1)}),q.on("click",function(){o(0)}),Y.on("click",function(){Z>=0&&(k=ee[Z].rate128.id,t())}),J.on("hidden.bs.modal",function(){L.first().button("reset"),B.show(),B.unbind(),z.html("关闭"),z.unbind(),clearTimeout(oe),z.get(0).dataset.dismiss="modal"}),L.each(function(t){!function(t,e){$(e).on("click",function(){L.first().button("loading"),oe=setTimeout(function(){N.button("reset")},5e3);var e=x.val().match("\\d{7,}"),n="";e?1===t?(n=e[0],l(n)):(z.html("否"),z.get(0).dataset.dismiss="",F.html("检测到ID,直接播放?"),J.modal("show"),B.one("click",function(){n=e[0],l(n)}),z.one("click",function(){z.html("关闭"),l(""),setTimeout(function(){z.get(0).dataset.dismiss="modal"},200)})):l("")})}(t,this)}),N.on("click",function(){N.button("loading"),oe=setTimeout(function(){N.button("reset")},1e4);var t=x.val();if(!t)return F.html("请输入 搜索内容!"),B.hide(),void J.modal("show");var e=t.match("\\d+"),n="";e&&(n=e[0]);for(var i=-1,o=0;o<ee.length;o++)if(n===ee[o].rate128.id){i=o;break}if(-1!==i)return F.html("已经在列表中,点击确定跳转播放"),J.modal("show"),void B.one("click",function(){J.modal("hide"),Z=i,d(Z)});var a={};ee.push(a),getbdmInfo(n,[],function(t){a["rate"+t.rate]=t,"128"===t.rate&&(N.button("reset"),Z=ee.length-1,d(Z,!0),p())})}),_.on("click",function(){h(-1)}),C.on("click",function(){h(1)}),H.on("click",function(){T&&(T.muted?(T.muted=!1,H.attr("src","./images/volume.png")):(T.muted=!0,H.attr("src","./images/mute.png")))}),M.on("click",function(){T&&(ie?(T.pause(),M.attr("src","./images/play.png"),ie=!1):(T.play(),M.attr("src","./images/pause.png"),ie=!0))})});