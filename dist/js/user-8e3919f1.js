function ajaxGet(t,e,n){var i;i=window.XMLHttpRequest?new XMLHttpRequest:new ActiveXObject("Microsoft.XMLHTTP"),t+=t.match(/\?/)?"&":"?time="+(new Date).getTime(),setTimeout(function(){i.abort(),n&&n("timeout")},2e4),i.open("GET",t,!0),i.send(),i.onreadystatechange=function(){4===i.readyState&&(200===i.status?e&&e(i.responseText):n&&n(i.status))}}function ajaxPost(t,e,n,i){var o;o=window.XMLHttpRequest?new XMLHttpRequest:new ActiveXObject("Microsoft.XMLHTTP"),t+=t.match(/\?/)?"&":"?time="+(new Date).getTime(),setTimeout(function(){o.abort(),i&&i("timeout")},2e4),o.open("POST",t,!0),o.setRequestHeader("Content-type","application/x-www-form-urlencoded"),o.send(e),o.onreadystatechange=function(){4===o.readyState&&(200===o.status?n&&n(o.responseText):i&&i(o.status))}}function jsonpGet(t,e,n){var i="callback_"+(new Date).getTime()+"_"+Math.random().toString(36).substr(2),o=document.createElement("script");if(o.type="text/javascript",/\?/.test(t)){var r=t.match(/(.*?)\?(.*)/);o.src=r[1]+"?callback="+i+"&"+r[2]}else o.src=t+"?callback="+i;o.timer=setTimeout(function(){n&&n()},1e4),o.onerror=function(){clearTimeout(o.timer),n&&n()},document.body.appendChild(o),window[i]=function(t){clearTimeout(o.timer),window[i]=null,document.body.removeChild(o),e&&e(t)}}function getbdmInfo(t,e,n){var i=t.match("\\d+")[0],o="http://music.baidu.com/data/music/fmlink?songIds="+i+"&type=mp3&rate=";if("string"==typeof e)getoInfo(o+e,i,e,n);else{e.length||(e=["128","192","320","flac"]);for(var r=0;r<e.length;r++)getoInfo(o+e[r],i,e[r],n)}}function getoInfo(t,e,n,i){jsonpGet(t,function(t){var o=t.data.songList[0],r={id:e,rate:n,mp3:o.songLink.replace("yinyueshiting","musicdata").replace(/&src=.*/,""),showLink:o.showLink,cover:o.songPicBig,title:o.songName,time:o.time,artist:o.artistName,lrc:"http://play.baidu.com"+o.lrcLink};i&&i(r)})}function shangLrcLoad(t,e){var n={};n.currentNu=1,n.nextUpdateTime=-1,n.lrc=[],n.audioObj="string"==typeof t?document.getElementById(t):t,n.lrcObj="string"==typeof e?document.getElementById(e):e,n.lrchtmlarr=[],n.divContent=document.createElement("div"),n.repaireTimeNu=0;var i=null;return n.addLrc=function(t,e){n.lrc.push({time:t,lrcstr:e})},n.parseLrc=function(t){for(var e=t.split("\n"),i=0;i<e.length;i++)for(var o=e[i].split("]"),r=0;r<o.length-1;r++){var a=o[r].match(/(\d+)\:(\d+)((\.|\:)(\d+))?/);a&&!/^\s*$/.test(o[o.length-1])&&n.addLrc(60*(+a[1]||0)+(+a[2]||0)+(+a[4]||0)/100,o[o.length-1])}},n.checkUpdate=function(){n.audioObj.currentTime>=n.nextUpdateTime-n.repaireTimeNu&&(n.scrollLrc(),n.checkUpdate())},n.clearClass=function(){for(var t=0;t<n.lrchtmlarr.length;t++)n.lrchtmlarr[t].className=""},n.scrollLrc=function(){if(n.currentNu++,"undefined"!=typeof n.lrc[n.currentNu]){clearInterval(i),n.nextUpdateTime=n.lrc[n.currentNu].time,n.lrchtmlarr[n.currentNu-2].className="",n.lrchtmlarr[n.currentNu-1].className="current";var t=n.lrchtmlarr[n.currentNu-1].moveHeight-300;t=t>0?parseInt(t):0;var e=n.divContent,o=e.scrollTop;i=setInterval(function(){var n=-8,r=(t-o)/-n;r=r>0?Math.ceil(r):Math.floor(r);var a=o+r;e.scrollTop=a,t===a&&clearInterval(i),o=a},30)}},n.init=function(){if(n.addLrc(0,""),n.addLrc(0,""),n.addLrc(999999,""),n.lrc.sort(function(t,e){return t.time-e.time}),n.audioObj.addEventListener("seeked",function(){n.currentNu=1,n.nextUpdateTime=-1}),n.audioObj.addEventListener("timeupdate",function(){n.checkUpdate()}),!window.is_shang_lrc_css){var t=document.createElement("style");t.type="text/css",t.innerHTML="#shang_lrc_div{margin:0;padding:0;overflow-y:scroll;overflow-x:hidden;height:100%}#shang_lrc_div::-webkit-scrollbar{width:5px;height:5px;border-radius:4px}#shang_lrc_div::-webkit-scrollbar-button{display:none}#shang_lrc_div::-webkit-scrollbar-track{background:#333}#shang_lrc_div::-webkit-scrollbar-thumb{background:#191919;border-radius:4px}#shang_lrc_div::-webkit-scrollbar-corner{display:none}.current{color:blueviolet;font-weight:bold}",document.getElementsByTagName("head")[0].appendChild(t),window.is_shang_lrc_css=!0}n.divContent.id="shang_lrc_div",n.lrcObj.innerHTML="",n.lrcObj.appendChild(n.divContent);var e=document.createElement("div");n.divContent.appendChild(e);for(var i=0;i<n.lrc.length;i++){var o=document.createElement("p");n.lrchtmlarr.push(o),o.innerHTML=n.lrc[i].lrcstr,e.appendChild(o),o.moveHeight=o.offsetTop}},n}$(document).ready(function(){function t(){p=H.width(),v=C.width();var t=$(window).height()-B.height()-J.height()-50;z.height(t>0?t:100),F.height(t-20>0?t-20:100)}function e(){t();var e=localStorage.shang_music;if(e&&(ne=JSON.parse(e))){V=ne.playlistinfo||[];for(var n=0;n<V.length;n++)V[n]&&d(V[n].rate128,n)}}function n(t){w&&(clearTimeout(P.timer),V[K].rate128.repaireTimeNu=0===t?0:(V[K].rate128.repaireTimeNu||0)+t,g.repaireTimeNu=V[K].rate128.repaireTimeNu,P.html("["+g.repaireTimeNu/10+"]"),f(),P.timer=setTimeout(function(){P.html("")},2e3))}function i(t,e){if(te&&w){var n=t.clientX-H.offset().left,i=n/p;0>i?i=0:i>1&&(i=1);var o=r();i>o&&(i=o),M.width(i*p),S.width(o*p),e&&(w.currentTime=Math.floor(i*w.duration),g.clearClass())}}function o(t){if(ee){var e=t.clientX-C.offset().left,n=e/v;0>n?n=0:n>1&&(n=1),_.width(100*n+"%"),Q=n,w&&(w.volume=n,w.muted&&(w.muted=!1,x.attr("src","./images/volume.png")))}}function r(){if(!w)return 0;var t=w.buffered;if(t.length){var e=t.end(t.length-1),n=e/w.duration;return n}}function a(t){if(t){for(var e=-1,n=0;n<V.length;n++)if(V[n]&&t===V[n].rate128.id){e=n;break}if(-1!==e){U.show();var i=D.html();D.html("已经在列表中,点击确定跳转播放"),R.modal("show"),q.html("返回"),q.get(0).dataset.dismiss="",q.one("click",function(){D.html(i),q.html("关闭"),setTimeout(function(){q.get(0).dataset.dismiss="modal"},200)}),U.one("click",function(){R.modal("hide"),K=e,l(K)})}else{var o={};V.push(o),getbdmInfo(t,["128"],function(t){if(o["rate"+t.rate]=t,"128"===t.rate){if(K=V.length-1,/pan.baidu/.test(t.showLink)){V.length=V.length-1;var e=D.html();D.html("此音乐为网网盘音乐, 点击确定打开此音乐网盘地址, 点击返回重新选取"),U.show(),q.html("返回"),U.html('<a href="'+t.showLink+'" target = "_blank" style="color: white">跳转</a>'),U.one("click",function(){return R.modal("hide"),!0}),q.get(0).dataset.dismiss="",q.one("click",function(){D.html(e),q.html("关闭"),U.hide(),setTimeout(function(){q.get(0).dataset.dismiss="modal"},200)})}else l(K,!0),R.modal("hide");f()}})}}else c(y.val())}function c(t){if(!t)return D.html("请输入 歌曲名/歌手/百度音乐ID链接"),U.hide(),R.modal("show"),void setTimeout(function(){R.modal("hide")},3e3);var e="http://121.40.81.63:1337/";ajaxGet(e+"?method=get&url="+encodeURIComponent("http://sug.music.baidu.com/info/suggestion?format=json&word="+t+"&version=2&from=0"),function(t){var e=JSON.parse(t).data,n=$('<div id="searchsongdiv">');if(e.song.length){for(var i=$("<ul>"),o=0;o<e.song.length;o++){var r=e.song[o],a=$('<li data-songid="'+r.songid+'">');a.html('<hr><div class="row"> <div class="col-md-8 col-xs-7 text-nowrap" title="'+(r.songname||"SHANG")+'">'+(r.songname||"SHANG")+'</div><div class="col-md-4 col-xs-5 text-nowrap" title="'+(r.artistname||"SHANG")+'">'+(r.artistname||"SHANG")+"</div></div>"),i.append(a)}n.append(i)}else n.html("未找到....");D.html(""),D.append(n),U.hide(),R.modal("show")})}function l(t,e,n){var i=!1;if(!V[t])return void u(n||1);var o=V[t].rate128;return/pan.baidu/.test(o.showLink)?(D.html("此音乐为百度网盘音乐, 删除并播放下一首?"),U.show(),R.modal("show"),void U.one("click",function(){1!==V.length&&u(1),O.find("li").each(function(){$(this).find("img").first().trigger("click")})})):(w&&(i=w.muted,document.body.removeChild(w)),w=document.createElement("audio"),w.innerHTML="<source src="+o.mp3+">",document.body.appendChild(w),w.volume=Q,w.play(),K=t,Y||(T.attr("src","./images/pause.png"),Y=!0),i&&(w.muted=i,x.attr("src","./images/mute.png")),$(w).on("timeupdate",function(){m()}),$(w).on("ended",function(){u(1)}),g=shangLrcLoad(w,"lrcdiv"),jsonpGet("http://cors.coding.io?method=get&url="+o.lrc,function(t){g.parseLrc(t.data),g.repaireTimeNu=o.repaireTimeNu||0,g.init()}),void s(o,t,e))}function s(t,e,n){G.html(t.title||"SHANG"),I.html(t.artist||"SHANG"),j.attr("src",t.cover||"http://i1.tietuku.com/f3f9084123926501.jpg"),n&&d(t,e),O.find("li").each(function(t){$(this).data("nu")===e?W[t].addClass("playing"):W[t].removeClass("playing")})}function d(t,e){var n=t.time||0,i=Math.floor(n/60),o=Math.round(n%60)<10?"0"+Math.round(n%60):Math.round(n%60),r=$("<li>");r.html('<hr><div class="row"> <div class="col-md-8 col-xs-7 text-nowrap" title="'+(t.title||"SHANG")+'">'+(t.title||"SHANG")+" - "+(t.artist||"SHANG")+'</div><div class="col-md-2 col-xs-3 text-right">'+(i+":"+o)+'</div><div class="col-md-1 col-xs-1"><img class="visible-xs" src="images/delete.png" alt="删除"/></div></div>'),r.data("nu",e),O.append(r),W.push(r)}function u(t){-1!==K&&(K=(K+V.length+t)%V.length,l(K,!1,t))}function m(){if(w){var t=w.currentTime,e=Math.floor(t/60),n=Math.round(t%60)<10?"0"+Math.round(t%60):Math.round(t%60);A.html(e+":"+n),te||(M.width(w.currentTime/w.duration*p),S.width(r()*p))}}function h(){w&&(document.body.removeChild(w),w=null,K=-1),O.html(""),$("#lrcdiv").html(""),G.html("SHANG"),I.html("SHANG"),j.attr("src","http://i1.tietuku.com/f3f9084123926501.jpg"),M.width(0),S.width(0),A.html("")}function f(){for(var t=[],e=!1,n=0;n<V.length;n++)V[n]&&(t.push(V[n]),e=!0);return ne.playlistinfo=t,localStorage.shang_music=JSON.stringify(ne),e}var g,p,v,w=null,b=$("#addandplay"),k=$(".mayplay"),y=$("#addr"),T=$("#playpaush"),N=$("#previewsong"),L=$("#nextsong"),x=$("#mute"),C=$("#volumebar"),_=$("#currentvolumebar"),H=$("#progressbar"),M=$("#currentprogress"),S=$("#loadedprogress"),j=$("#coverimg"),G=$("#title"),I=$("#artist"),A=$("#info"),O=$("#alllistul"),E=$("#lrctimereduce"),X=$("#lrctimeadd"),P=$("#lrctimecurrent"),U=$("#ensurebtn"),R=$("#showtext"),q=$("#notsurebtn"),D=$(".textdiv"),B=$("#searcharea"),J=$("#player"),z=$("#alllist"),F=$("#lrcdiv"),K=-1,Q=1,V=[],W=[],Y=!0,Z=null,te=!1,ee=!1,ne={};e(),$(window).on("resize",function(){t()}),$(window).on("beforeunload",function(){return"提示: "}),O.on("click","li",function(t){var e=$(this).data("nu");l(e,!1),t.stopPropagation()}),O.on("click","li img",function(t){var e=$(this).parents("li.maydelete"),n=e.data("nu");V[n]=void 0,W.splice(n,1),e.remove();var i=f();n===K&&(i?u(1):h()),t.stopPropagation()}),O.on("mouseover","li",function(){$(this).addClass("maydelete"),$(this).find("img").removeClass("visible-xs"),$(this).find("img").css("display","block")}),O.on("mouseout","li",function(){$(this).removeClass("maydelete"),$(this).find("img").addClass("visible-xs"),$(this).find("img").css("display","none")}),D.on("click","li",function(t){var e=""+$(this).data("songid");a(e),t.stopPropagation()}),$(document).on("keydown",function(t){13===t.keyCode&&k.first().trigger("click")}),$(document).on("mousedown",function(){(te||ee)&&(document.body.style.cursor="pointer")}),$(document).on("mouseup",function(t){i(t,!0),o(t),te=!1,ee=!1,document.body.style.cursor="default"}),$(document).on("mousemove",function(t){return i(t),o(t),"addr"===t.target.id}),H.on("mousedown",function(){te=!0}),C.on("mousedown",function(){ee=!0}),y.on("focus",function(){y.select()}),E.on("click",function(){n(-1)}),X.on("click",function(){n(1)}),P.on("click",function(){n(0)}),R.on("hidden.bs.modal",function(){k.first().button("reset"),U.show(),U.unbind(),q.html("关闭"),q.unbind(),clearTimeout(Z)}),k.each(function(t){!function(t,e){$(e).on("click",function(){k.first().button("loading"),Z=setTimeout(function(){b.button("reset")},5e3);var e=y.val().match("\\d+"),n="";e?1===t?(n=e[0],a(n)):(q.html("否"),q.get(0).dataset.dismiss="",D.html("检测到ID,直接播放?"),R.modal("show"),U.one("click",function(){n=e[0],a(n)}),q.one("click",function(){q.html("关闭"),a(""),setTimeout(function(){q.get(0).dataset.dismiss="modal"},200)})):a("")})}(t,this)}),b.on("click",function(){b.button("loading"),Z=setTimeout(function(){b.button("reset")},1e4);var t=y.val();if(!t)return D.html("请输入 搜索内容!"),U.hide(),void R.modal("show");var e=t.match("\\d+"),n="";e&&(n=e[0]);for(var i=-1,o=0;o<V.length;o++)if(n===V[o].rate128.id){i=o;break}if(-1!==i)return D.html("已经在列表中,点击确定跳转播放"),R.modal("show"),void U.one("click",function(){R.modal("hide"),K=i,l(K)});var r={};V.push(r),getbdmInfo(n,[],function(t){r["rate"+t.rate]=t,"128"===t.rate&&(b.button("reset"),K=V.length-1,l(K,!0),f())})}),N.on("click",function(){u(-1)}),L.on("click",function(){u(1)}),x.on("click",function(){w&&(w.muted?(w.muted=!1,x.attr("src","./images/volume.png")):(w.muted=!0,x.attr("src","./images/mute.png")))}),T.on("click",function(){w&&(Y?(w.pause(),T.attr("src","./images/play.png"),Y=!1):(w.play(),T.attr("src","./images/pause.png"),Y=!0))})});