<?php  ?>
<!Doctype html>
<html>

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <link rel="stylesheet" href="css/bootstrap.css">
    <title>Music Player</title>
    <link rel="stylesheet" href="css/style.css">
</head>

<body>
    <div class="modal fade bs-example-modal-sm" id="showtext" tabindex="-1" role="dialog" aria-labelledby="mySmallModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-sm">
            <div class="modal-content" style="color: #333">
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal">
                        <span aria-hidden="true">&times;</span>
                        <span class="sr-only">Close</span>
                    </button>
                    <h4 class="modal-title"></h4>
                </div>
                <div class="modal-body">
                    <p class="textdiv"></p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-default" data-dismiss="modal">关闭</button>
                    <button type="button" class="btn btn-primary" id="ensurebtn">确定</button>
                </div>
            </div>
        </div>
    </div>

    <div class="container">
        <hr>
        <div class="row">
            <div class="col-md-8 leftside">
                <div class="row">
                    <div class="col-xs-8 col-md-10">
                        <input id="addr" type="text" class="form-control" value="http://yinyueyun.baidu.com/?download=39246697&pst=naga&fr=" placeholder="百度音乐链接地址">
                    </div>
                    <div class="col-xs-4 col-md-2">
                        <button id="addandplay" class="btn btn-default btn-block" data-loading-text="加载...">播放</button>
                    </div>

                    <div id='playarea' style="display:none">
                        <audio id="audio2222"></audio>
                    </div>
                </div>
                <hr>
                <div class="row" id="alllist">
                    <ul id="alllistul">
                        <!--<li>-->
                        <!--<hr>-->
                        <!--<div class="row">-->
                        <!--<div class="col-xs-8 text-nowrap" title="HEBE-你就不要想起我HEBE-你就不要想起我HEBE-你就不要想起我">-->
                        <!--HEBE-你就不要想起我HEBE-你就不要想起我HEBE-你就不要想起我 HEBE-你就不要想起我HEBE-你就不要想起我HEBE-你就不要想起我-->
                        <!--</div>-->
                        <!--<div class="col-xs-1">-->
                        <!--</div>-->
                        <!--<div class="col-xs-3">-->
                        <!--3:44-->
                        <!--</div>-->
                        <!--</div>-->
                        <!--</li>-->
                        <!--<li>-->
                        <!--<hr>-->
                        <!--<div class="row">-->
                        <!--<div class="col-xs-8">-->
                        <!--HEBE-你就不要想起我-->
                        <!--</div>-->
                        <!--<div class="col-xs-1">-->
                        <!--</div>-->
                        <!--<div class="col-xs-3">-->
                        <!--3:44-->
                        <!--</div>-->
                        <!--</div>-->
                        <!--</li>-->
                    </ul>
                </div>
                <!--<hr>-->
                <div id="player">
                    <div class="row">
                        <div class="progressbar">
                            <div class="col-xs-9 col-md-10">
                                <div class="slider img-rounded" id="progressbar">
                                    <div class="loaded"></div>
                                    <div class="pace" id='currentprogress'></div>
                                </div>
                            </div>
                            <div class="col-xs-3 col-md-2">
                                <div class="timer" id='info'>0:00</div>
                            </div>
                        </div>
                    </div>

                    <div class="row">
                        <div class="col-xs-7 col-md-4">
                            <h5 id='title'>SHANG</h5>
                            <h5 id="artist">SHANG</h5>
                        </div>
                        <div class="col-xs-5 col-md-3">
                            <div class="control">
                                <img id="previewsong" src="./images/rewind.png" class="img-responsive pull-left" alt="">

                                <div class="pull-left">&nbsp;&nbsp;</div>
                                <img id="playpaush" src="./images/pause.png" class="img-responsive pull-left" alt="">

                                <div class="pull-left">&nbsp;&nbsp;</div>
                                <img id="nextsong" src="./images/fastforward.png" class="img-responsive pull-left" alt="">
                            </div>
                        </div>
                        <div class="col-md-5 hidden-xs volume">
                            <div class="row">
                                <div class="col-lg-2 col-xs-2">
                                    <img id="mute" src="./images/volume.png" alt="">
                                </div>
                                <div class="col-lg-8 col-xs-8">
                                    <div class="slider img-rounded" id="volumebar">
                                        <div class="pace" id="currentvolumebar"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
            <div class="col-md-1"></div>
            <div class="col-md-3" id="lyric">
                <div class="cover">
                    <img id='coverimg' src='images/shang.png' class="img-rounded center-block">
                </div>
                <hr>
                <div style="text-align:center" id="lrcdiv">
                    <!--<p lang="1">1</p>-->
                    <!--<p lang="2">2</p>-->
                    <!--<p lang="3">3</p>-->
                    <!--<p lang="4" class="current">4</p>-->
                    <!--<p lang="5">5</p>-->
                    <!--<p lang="6">6</p>-->
                    <!--<p lang="7">7</p>-->
                    <!--<p lang="8">8</p>-->
                    <!--<p lang="9">9</p>-->
                    <!--<p lang="10">10</p>-->
                </div>
            </div>
        </div>
    </div>
    <script src="js/jquery-1.11.1.min.js"></script>
    <script src="js/bootstrap.min.js"></script>
    <script src="js/audio.js"></script>
    <script src="js/getbdminfo.js"></script>
    <script src="js/ajax.js"></script>
    <script src="js/shang_lrc.js"></script>
</body>

</html>
