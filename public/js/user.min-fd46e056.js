function getbdmInfo(t,e,n){var i=t.match("\\d+")[0],o="http://music.baidu.com/data/music/fmlink?songIds="+i+"&type=mp3&rate=";if("string"==typeof e)getoInfo(o+e,i,e,n);else{e.length||(e=["128","192","320","flac"]);for(var r=0;r<e.length;r++)getoInfo(o+e[r],i,e[r],n)}}function getoInfo(t,e,n,i){jsonpGet(t,function(t){var o=t.data.songList[0],r={id:e,rate:n,mp3:o.showLink.replace("yinyueshiting","musicdata"),cover:o.songPicBig,title:o.songName,time:o.time,artist:o.artistName,lrc:"http://play.baidu.com"+o.lrcLink};i&&i(r)})}function ajaxGet(t,e,n){var i;i=window.XMLHttpRequest?new XMLHttpRequest:new ActiveXObject("Microsoft.XMLHTTP"),t+=t.match(/\?/)?"&":"?time="+(new Date).getTime(),setTimeout(function(){i.abort(),n&&n("timeout")},2e4),i.open("GET",t,!0),i.send(),i.onreadystatechange=function(){4===i.readyState&&(200===i.status?e&&e(i.responseText):n&&n(i.status))}}function ajaxPost(t,e,n,i){var o;o=window.XMLHttpRequest?new XMLHttpRequest:new ActiveXObject("Microsoft.XMLHTTP"),t+=t.match(/\?/)?"&":"?time="+(new Date).getTime(),setTimeout(function(){o.abort(),i&&i("timeout")},2e4),o.open("POST",t,!0),o.setRequestHeader("Content-type","application/x-www-form-urlencoded"),o.send(e),o.onreadystatechange=function(){4===o.readyState&&(200===o.status?n&&n(o.responseText):i&&i(o.status))}}function jsonpGet(t,e,n){var i="callback_"+(new Date).getTime()+"_"+Math.random().toString(36).substr(2),o=document.createElement("script");if(o.type="text/javascript",/\?/.test(t)){var r=t.match(/(.*?)\?(.*)/);o.src=r[1]+"?callback="+i+"&"+r[2]}else o.src=t+"?callback="+i;o.timer=setTimeout(function(){n&&n()},1e4),o.onerror=function(){clearTimeout(o.timer),n&&n()},document.body.appendChild(o),window[i]=function(t){clearTimeout(o.timer),window[i]=null,document.body.removeChild(o),e&&e(t)}}function shangLrcLoad(t,e){var n={};n.currentNu=1,n.nextUpdateTime=-1,n.lrc=[],n.audioObj="string"==typeof t?document.getElementById(t):t,n.lrcObj="string"==typeof e?document.getElementById(e):e,n.lrchtmlarr=[],n.divContent=document.createElement("div"),n.repaireTimeNu=0;var i=null;return n.addLrc=function(t,e){n.lrc.push({time:t,lrcstr:e})},n.parseLrc=function(t){for(var e=t.split("\n"),i=0;i<e.length;i++)for(var o=e[i].split("]"),r=0;r<o.length-1;r++){var a=o[r].match(/(\d+)\:(\d+)((\.|\:)(\d+))?/);a&&!/^\s*$/.test(o[o.length-1])&&n.addLrc(60*(+a[1]||0)+(+a[2]||0)+(+a[4]||0)/100,o[o.length-1])}},n.checkUpdate=function(){n.audioObj.currentTime>=n.nextUpdateTime-n.repaireTimeNu&&(n.scrollLrc(),n.checkUpdate())},n.clearClass=function(){for(var t=0;t<n.lrchtmlarr.length;t++)n.lrchtmlarr[t].className=""},n.scrollLrc=function(){if(n.currentNu++,"undefined"!=typeof n.lrc[n.currentNu]){clearInterval(i),n.nextUpdateTime=n.lrc[n.currentNu].time,n.lrchtmlarr[n.currentNu-2].className="",n.lrchtmlarr[n.currentNu-1].className="current";var t=n.lrchtmlarr[n.currentNu-1].moveHeight-300;t=t>0?parseInt(t):0;var e=n.divContent,o=e.scrollTop;i=setInterval(function(){var n=-8,r=(t-o)/-n;r=r>0?Math.ceil(r):Math.floor(r);var a=o+r;e.scrollTop=a,t===a&&clearInterval(i),o=a},30)}},n.init=function(){if(n.addLrc(0,""),n.addLrc(0,""),n.addLrc(999999,""),n.lrc.sort(function(t,e){return t.time-e.time}),n.audioObj.addEventListener("seeked",function(){n.currentNu=1,n.nextUpdateTime=-1}),n.audioObj.addEventListener("timeupdate",function(){n.checkUpdate()}),!window.is_shang_lrc_css){var t=document.createElement("style");t.type="text/css",t.innerHTML="#shang_lrc_div{margin:0;padding:0;overflow-y:scroll;overflow-x:hidden;height:100%}#shang_lrc_div::-webkit-scrollbar{width:5px;height:5px;border-radius:4px}#shang_lrc_div::-webkit-scrollbar-button{display:none}#shang_lrc_div::-webkit-scrollbar-track{background:#333}#shang_lrc_div::-webkit-scrollbar-thumb{background:#191919;border-radius:4px}#shang_lrc_div::-webkit-scrollbar-corner{display:none}.current{color:blueviolet;font-weight:bold}",document.getElementsByTagName("head")[0].appendChild(t),window.is_shang_lrc_css=!0}n.divContent.id="shang_lrc_div",n.lrcObj.innerHTML="",n.lrcObj.appendChild(n.divContent);var e=document.createElement("div");n.divContent.appendChild(e);for(var i=0;i<n.lrc.length;i++){var o=document.createElement("p");n.lrchtmlarr.push(o),o.innerHTML=n.lrc[i].lrcstr,e.appendChild(o),o.moveHeight=o.offsetTop}},n}$(document).ready(function(){function t(t){m&&(clearTimeout(j.timer),P[E].repaireTimeNu=0===t?0:(P[E].repaireTimeNu||0)+t,z.repaireTimeNu=P[E].repaireTimeNu,j.html("["+z.repaireTimeNu/10+"]"),j.timer=setTimeout(function(){j.html(""),B.playlistinfo=P,localStorage.shang_music=JSON.stringify(B)},2e3))}function e(t,e){if(F&&m){var n=t.clientX-k.offset().left,i=n/K;0>i?i=0:i>1&&(i=1),N.width(100*i+"%"),e&&(m.currentTime=Math.floor(i*m.duration),z.clearClass())}}function n(t){if(Q){var e=t.clientX-y.offset().left,n=e/V;0>n?n=0:n>1&&(n=1),T.width(100*n+"%"),X=n,m&&(m.volume=n,m.muted&&(m.muted=!1,w.attr("src","./images/volume.png")))}}function i(t){if(t){for(var e=-1,n=0;n<P.length;n++)if(P[n]&&t===P[n].rate128.id){e=n;break}if(-1!==e){G.show();var i=A.html();A.html("已经在列表中,点击确定跳转播放"),I.modal("show"),O.html("返回"),O.get(0).dataset.dismiss="",O.one("click",function(){A.html(i),O.html("关闭"),setTimeout(function(){O.get(0).dataset.dismiss="modal"},200)}),G.one("click",function(){I.modal("hide"),E=e,r(E)})}else{var a={};P.push(a),getbdmInfo(t,["128"],function(t){if(a["rate"+t.rate]=t,"128"===t.rate){if(E=P.length-1,/pan.baidu/.test(t.mp3)){P.length=P.length-1;var e=A.html();A.html("此音乐为百度网盘音乐, 点击确定打开此音乐网盘地址, 点击返回重新选取"),G.show(),O.html("返回"),G.html('<a href="'+t.mp3+'" target = "_blank" style="color: white">跳转</a>'),G.one("click",function(){return I.modal("hide"),!0}),O.get(0).dataset.dismiss="",O.one("click",function(){A.html(e),O.html("关闭"),G.hide(),setTimeout(function(){O.get(0).dataset.dismiss="modal"},200)})}else r(E,!0),I.modal("hide");u()}})}}else o(p.val())}function o(t){if(!t)return A.html("请输入 歌曲名/歌手/百度音乐ID链接"),G.hide(),I.modal("show"),void setTimeout(function(){I.modal("hide")},3e3);var e="http://azure.xinshangshangxin.com/getbyurl";ajaxGet(e+"?method=get&url="+encodeURIComponent("http://sug.music.baidu.com/info/suggestion?format=json&word="+t+"&version=2&from=0"),function(t){for(var e=JSON.parse(t).data,n=$('<div id="searchsongdiv">'),i=$("<ul>"),o=0;o<e.song.length;o++){var r=e.song[o],a=$('<li data-songid="'+r.songid+'">');a.html('<hr><div class="row"> <div class="col-md-8 col-xs-7 text-nowrap" title="'+(r.songname||"SHANG")+'">'+(r.songname||"SHANG")+'</div><div class="col-md-4 col-xs-5 text-nowrap" title="'+(r.artistname||"SHANG")+'">'+(r.artistname||"SHANG")+"</div></div>"),i.append(a)}n.append(i),A.html(""),A.append(n),G.hide(),I.modal("show")})}function r(t,e,n){if(console.log(t),!P[t])return void l(n||1);var i=P[t].rate128;return/pan.baidu/.test(i.mp3)?(A.html("此音乐为百度网盘音乐, 删除并播放下一首?"),G.show(),I.modal("show"),void G.one("click",function(){1!==P.length&&l(1),H.find("li").each(function(){$(this).find("img").first().trigger("click")})})):(m&&document.body.removeChild(m),m=document.createElement("audio"),m.innerHTML="<source src="+i.mp3+">",document.body.appendChild(m),m.volume=X,m.play(),E=t,$(m).on("timeupdate",function(){s()}),$(m).on("ended",function(){l(1)}),z=shangLrcLoad(m,"lrcdiv"),jsonpGet("http://cors.coding.io?method=get&url="+i.lrc,function(t){z.parseLrc(t.data),z.repaireTimeNu=i.repaireTimeNu||0,z.init()}),void a(i,t,e))}function a(t,e,n){L.html(t.title||"SHANG"),_.html(t.artist||"SHANG"),x.attr("src",t.cover||"http://i1.tietuku.com/f3f9084123926501.jpg"),n&&c(t,e);for(var i=0;i<U.length;i++)U[i].removeClass("playing");H.find("li").each(function(t){$(this).data("nu")==e&&U[t].addClass("playing")})}function c(t,e){var n=t.time||0,i=Math.floor(n/60),o=Math.round(n%60)<10?"0"+Math.round(n%60):Math.round(n%60),r=$("<li>");r.html('<hr><div class="row"> <div class="col-md-8 col-xs-7 text-nowrap" title="'+(t.title||"SHANG")+'">'+(t.title||"SHANG")+" - "+(t.artist||"SHANG")+'</div><div class="col-md-2 col-xs-3 text-right">'+(i+":"+o)+'</div><div class="col-md-1 col-xs-1"><img class="visible-xs" src="images/delete.png" alt="删除"/></div></div>'),r.data("nu",e),H.append(r),U.push(r)}function l(t){console.log(E),-1!==E&&(E=(E+P.length+t)%P.length,r(E,!1,t))}function s(){if(m){var t=m.currentTime,e=Math.floor(t/60),n=Math.round(t%60)<10?"0"+Math.round(t%60):Math.round(t%60);C.html(e+":"+n),F||N.width(m.currentTime/m.duration*100+"%")}}function d(){m&&(document.body.removeChild(m),m=null,E=-1),H.html(""),$("#lrcdiv").html(""),L.html("SHANG"),_.html("SHANG"),x.attr("src","http://i1.tietuku.com/f3f9084123926501.jpg"),N.width(0),C.html("")}function u(){for(var t=[],e=!1,n=0;n<P.length;n++)P[n]&&(t.push(P[n]),e=!0);return B.playlistinfo=t,localStorage.shang_music=JSON.stringify(B),e}var m=null,h=$("#addandplay"),f=$(".mayplay"),p=$("#addr"),g=$("#playpaush"),v=$("#previewsong"),b=$("#nextsong"),w=$("#mute"),y=$("#volumebar"),T=$("#currentvolumebar"),k=$("#progressbar"),N=$("#currentprogress"),x=$("#coverimg"),L=$("#title"),_=$("#artist"),C=$("#info"),H=$("#alllistul"),M=$("#lrctimereduce"),S=$("#lrctimeadd"),j=$("#lrctimecurrent"),G=$("#ensurebtn"),I=$("#showtext"),O=$("#notsurebtn"),A=$(".textdiv"),E=-1,X=1,P=[],U=[],R=!0,q=null,D=localStorage.shang_music,B={};if(D&&(B=JSON.parse(D))){P=B.playlistinfo||[];for(var J=0;J<P.length;J++)P[J]&&c(P[J].rate128,J)}var z,F=!1,K=k.width(),Q=!1,V=y.width();H.on("click","li",function(t){var e=$(this).data("nu");r(e,!1),t.stopPropagation()}),H.on("click","li img",function(t){var e=$(this).parents("li.maydelete"),n=e.data("nu");P[n]=void 0,U.splice(n,1),e.remove();var i=u();i?l(1):d(),t.stopPropagation()}),H.on("mouseover","li",function(){$(this).addClass("maydelete"),$(this).find("img").removeClass("visible-xs"),$(this).find("img").css("display","block")}),H.on("mouseout","li",function(){$(this).removeClass("maydelete"),$(this).find("img").addClass("visible-xs"),$(this).find("img").css("display","none")}),A.on("click","li",function(t){var e=""+$(this).data("songid");i(e),t.stopPropagation()}),$(document).on("keydown",function(t){13===t.keyCode&&f.trigger("click")}),$(document).on("mousedown",function(){(F||Q)&&(document.body.style.cursor="pointer")}),$(document).on("mouseup",function(t){e(t,!0),n(t),F=!1,Q=!1,document.body.style.cursor="default"}),$(document).on("mousemove",function(t){return e(t),n(t),"addr"===t.target.id}),k.on("mousedown",function(){F=!0}),y.on("mousedown",function(){Q=!0}),p.on("focus",function(){p.select()}),M.on("click",function(){t(-1)}),S.on("click",function(){t(1)}),j.on("click",function(){t(0)}),I.on("hidden.bs.modal",function(){f.first().button("reset"),G.show(),G.unbind(),O.html("关闭"),O.unbind(),clearTimeout(q)}),f.each(function(t){!function(t,e){$(e).on("click",function(){f.first().button("loading"),q=setTimeout(function(){h.button("reset")},5e3);var e=p.val().match("\\d+"),n="";e?1===t?(n=e[0],i(n)):(O.html("否"),A.html("检测到ID,直接播放?"),I.modal("show"),G.one("click",function(){n=e[0],i(n)}),O.one("click",function(){O.html("关闭"),i("")})):i("")})}(t,this)}),h.on("click",function(){alert(),h.button("loading"),q=setTimeout(function(){h.button("reset")},1e4);var t=p.val();if(!t)return A.html("请输入 搜索内容!"),G.hide(),void I.modal("show");var e=t.match("\\d+"),n="";e&&(n=e[0]);for(var i=-1,o=0;o<P.length;o++)if(n===P[o].rate128.id){i=o;break}if(-1!==i)return A.html("已经在列表中,点击确定跳转播放"),I.modal("show"),void G.one("click",function(){I.modal("hide"),E=i,r(E)});var a={};P.push(a),getbdmInfo(n,[],function(t){a["rate"+t.rate]=t,"128"===t.rate&&(h.button("reset"),E=P.length-1,r(E,!0),u())})}),v.on("click",function(){l(-1)}),b.on("click",function(){l(1)}),w.on("click",function(){m&&(m.muted?(m.muted=!1,w.attr("src","./images/volume.png")):(m.muted=!0,w.attr("src","./images/mute.png")))}),g.on("click",function(){m&&(R?(m.pause(),g.attr("src","./images/play.png"),R=!1):(m.play(),g.attr("src","./images/pause.png"),R=!0))})});