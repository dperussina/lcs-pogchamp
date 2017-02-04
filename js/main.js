var async = require('async');
var u = require('u');
var xhr = require('./http');

function main(){
    var _windows = 0;
    var _channels = getQueryVariable('channels');
    var _chat = getQueryVariable('chat');
    var _layout = getQueryVariable('layout');
    u.log('[!_windows]', !_windows);
    if(!_channels){

        $("#selection-modal").modal('show');
        $("#customize-btn").hide();
    }else{
        _channels = _channels.split(',');
        _windows = _channels.length;
        u.log('[_windows]', _windows, '[_channels]',_channels);
        initStreamView(_windows, _channels, _chat, _layout);
    }
    getStreamStatus();
    defaultControls();
}
function getStreamStatus(){
    var html = "";
    xhr.get('/top10.json', function(err, reply){
        u.log('[/top10.json]', err, reply);
        if(err){

            return;
        }
        html+='<br><div class="card-deck ">';
        reply.streams.forEach(function(e, i, a){
            var name = e.channel.name;
            var game = e.channel.game;
            var status = e.channel.status;
            var preview = e.preview;
            html+='<div class="card" style="max-width: 320px;'+(i== 0 ? 'margin-left:15px': '')+'"> ' +
                '<img class="card-img-top" src="'+preview+'" alt="Card image cap">' +
                '<div class="card-block">' +
                '<h4 class="card-title"> '+name +'</h4>'+
                '<div class="form-check "> ' +
                '<label class="form-check-label"> ' +
                '<input class="form-check-input" type="checkbox" id="'+name+'-check" value="'+name+'"> ' +


                '<p  class="card-text">Playing: '+game+' <span class="badge badge-success" id="'+name+'-status">ONLINE</span></p>'+

                '<p id="'+name+'-title" class="card-text">'+status+'</p>' +

                //<p class="card-text"><small class="text-muted">Last updated 3 mins ago</small></p>
                '</label> ' +
                '</div>' +

                '</div>' +
                '<div class="card-footer">' +
                '<small class="text-muted">'+e.viewers+' watching</small>' +
                '</div>' +
                '</div>';
        });
        html+="</div>"
        $("#top-ten-collapse").html(html);
    });
    var streams = [
        'eleaguetv'
        , 'esl_go'
        , 'esl_halo'
        , 'esl_hearthstone'
        , 'playhearthstone'
        , 'nalcs1'
        , 'nalcs2'
        , 'eulcs1'
        , 'eulcs2'
        , 'lck1'
        , 'lck2'
        , 'lpl1'
        , 'riotgamesbrazil'
        , 'esl_lol'
        , 'esl_overwatch'
        , 'esl_sc2'
        , 'dotastarladder_en'
        , 'esl_dota2'
        , 'blizzheroes'
        , 'beyondthesummit'
    ];
    streams.forEach(function(e, i, a){
        xhr.get('/'+e+'.json', function(err, reply){
            u.log('[getStreamStatus] xhr.get', err, reply);
            if(err){
                u.log('[getStreamStatus] xhr.get', err, reply);
                return;
            }

            if(reply.stream == null){
                $("#"+e+"-status").addClass('badge-danger').text('OFFLINE');
            }else{
                $("#"+e+"-status").addClass('badge-success').text('ONLINE');
                $("#"+e+"-title").html(' - ' + reply.stream.channel.status+"<p>Playing: "+reply.stream.channel.game+'<span class="text-muted"> '+reply.stream.viewers+' watching</span></p>')

            }
        });
    });
    /*
     <div class="form-check form-check-inline ">
     <label class="form-check-label">

     <input class="form-check-input" type="checkbox" id="ESL_SC2-check" value="ESL_SC2">
     <span class="badge" id="esl_sc2-status"></span>
     ESL_SC2
     <small id="esl_sc2-title"></small>
     </label>
     </div>
     */

}
function defaultControls() {
    var _windows = 0;
    var _channels = getQueryVariable('channels');
    if(_channels ==false){
        _channels = [];
    }else{
        _channels = _channels.split(',');
    }

    var _chat = getQueryVariable('chat');
    var _layout = getQueryVariable('layout');
    _windows = _channels.length;
    $("#customize-btn").click(function(e){
        e.preventDefault();
        $("#customize-modal").modal('show');
        var html = "";
        if(_windows > 0){
            _channels.forEach(function(e, i, a){
                html+='<tr>';
                html+='<td>';
                html+=e;
                html+='</td>';
                html+='<td>';
                html+=i+1;
                html+='</td>';
                html+='<td>';
                html+='Medium';
                html+='</td>';
                html+='</tr>';
            });
            $("#arrange-streams-fill").html(html);
        }else{
            return;
        }
    });
    $("#create-btn").click(function(e){
        e.preventDefault();
        var  channels = [];
        $('input:checkbox').each(function () {
            var sThisVal = (this.checked ? $(this).val() : "");

            if(sThisVal!= ""){
                channels.push(sThisVal);
            }
        });
        var customStreams = $("#custom-stream-input").val();
        customStreams = customStreams.split(',')
        customStreams.forEach(function(e, i, a){
            e = e.replace(" ", "");
            if(e != ""){
                channels.push(e);
            }

        });
        var chat = $("#chat-enabled").prop('checked');
        var layout = $("#layout-stacked").prop('checked');
        u.log('[channels]',
            channels,
            '[chat]',
            chat
        );
        var len = channels.length;
        window.location = "index.html?channels="+channels.toString()+"&chat="+chat+"&layout="+(layout === true ? 'stacked': 'rows');
    });
}

function initStreamView(windows, channels, chat, layout){
    if(layout == 'stacked'){
        var rows = windows;
    }else{
        var rows = Math.ceil(windows / 2);
    }

    var height = window.screen.availHeight;
    var width = window.screen.availWidth
    var bodyHeight = $('body').height();
    var navHeight = $("nav").height() +4;
    var app=$("#app-main");
    var html = "";

    //u.log('[initStreamView]Properties windows, channels, rows', windows, channels, rows);
    //u.log('[initStreamView]Screen height, width, bodyHeight', height, width, bodyHeight);
    function generateStreamCode(cb) {
        u.log('[initStreamView].generateStreamCode(cb)', height, width, bodyHeight);
        var len = windows - 1;
        html+="<div class='row'>"
        channels.forEach(function(e, i, a){

            if(layout == 'stacked'){
                if(chat == true ||chat == 'true'){

                        html+='<div id="'+e+'-player" style="width:85%; height:100%;" class="resizableplayer"></div>';
                        html+='<iframe frameborder="0" scrolling="no" id="'+e+'_chat_embed" src="http://www.twitch.tv/'+e.toLowerCase()+'/chat" width="15%"  height="100%" class="chat"> </iframe>';
                        html+="</div>";

                        if(i != len){
                            html+="<div class='row'>";
                        }

                }else{

                        html+='<div id="'+e+'-player" style="width:100%; height:100%;" class="resizableplayer"></div>';
                        html+="</div>";
                        if(i != len){
                            html+="<div class='row'>";
                        }
                }
            }else{
                if(chat == true ||chat == 'true'){
                    if(i % 2){
                        html+='<div id="'+e+'-player" style="width:35%; height:100%;" class="resizableplayer"></div>';
                        html+='<iframe frameborder="0" scrolling="no" id="'+e+'_chat_embed" src="http://www.twitch.tv/'+e.toLowerCase()+'/chat" width="15%"  height="100%" class="chat"> </iframe>';
                        html+="</div>";

                        if(i != len){
                            html+="<div class='row'>"
                        }
                    }else{
                        if(i == len){
                            html+='<div id="'+e+'-player" style="width:85%; height:100%; " class="resizableplayer"></div>';
                            html+='<iframe frameborder="0" scrolling="no" id="'+e+'_chat_embed" src="http://www.twitch.tv/'+e.toLowerCase()+'/chat" width="15%" height="100%" class="chat"> </iframe>';
                            html+="</div>";
                        }else{
                            html+='<div id="'+e+'-player" style="width:35%; height:100%; " class="resizableplayer"></div>';
                            html+='<iframe frameborder="0" scrolling="no" id="'+e+'_chat_embed" src="http://www.twitch.tv/'+e.toLowerCase()+'/chat" width="15%"  height="100%" class="chat"> </iframe>';


                        }
                    }
                }else{
                    if(i % 2){
                        html+='<div id="'+e+'-player" style="width:50%; height:100%;" class="resizableplayer"></div>';
                        html+="</div>";
                        if(i != len){
                            html+="<div class='row'>";
                        }
                    }else{
                        if(i == len){
                            html+='<div id="'+e+'-player" style="width:100%;  height:100%;" class="resizableplayer"></div>';
                            html+="</div>";
                        }else{
                            html+='<div id="'+e+'-player" style="width:50%;  height:100%;" class="resizableplayer"></div>';

                        }
                    }
                }
            }



            if(i == len){
                app.html(html);
                cb(false,null);
            }
        });
    }
    function initializeStreams(cb){
        var len = windows - 1;
        channels.forEach(function(e, i, a){
            var options = {};
            if(!i%2 && i == len){
                options = {
                    //width: '100%',
                    //height: '100%',
                    channel: e,
                    //video: "{VIDEO_ID}"
                };

            }else{
                options = {
                    //width: '100%',
                    //height: '50%',
                    channel: e,
                    //video: "{VIDEO_ID}"
                };
            }

            var player = new Twitch.Player(e+'-player', options);

            if(i == 0){
                player.setVolume(0.5);
            }else{
                player.setVolume(0.0);
            }
            //player.addEventListener(Twitch.Player.PAUSE, () => { console.log('Player is paused!'); });
            if(i == len){
                cb(false,null);
            }

        });


    }

    async.series([generateStreamCode, initializeStreams], function (err, res) {
        u.log('[series.done]', bodyHeight, bodyHeight/rows,  height / rows);
        bodyHeight = bodyHeight/rows;
        var heightLiteral = navHeight / rows;
        var finalHeight = bodyHeight - heightLiteral;
        u.log('[finalHeight]', finalHeight);
        if(layout == 'stacked'){
            $(".row").css('height', finalHeight+'px');
        }else{
            $(".row").css('height', finalHeight+'px');
        }

        $('iframe').css('height', '100%');
        if(chat == true  || chat == 'true'){
            $('iframe').each(function(){
               var self = $(this);
               if(self.hasClass('chat')){
                   self.css('width','15%');
               }else{
                   self.css('width','100%');
               }
            });
        }else{
            $('iframe').css('width', '100%');
        }



        $( window ).resize(function() {
            var height = window.screen.availHeight;
            var width = window.screen.availWidth
            var bodyHeight = $(window).height();
            var navHeight = $("nav").height();
            bodyHeight = bodyHeight/rows;
            var heightLiteral = navHeight / rows;
            var finalHeight = bodyHeight - heightLiteral;
            u.log('[window.resize]', finalHeight);
            if(layout == 'stacked'){
                $(".row").css('height', (finalHeight/2)+'px');
            }else{
                $(".row").css('height', finalHeight+'px');
            }
            if(chat == true  || chat == 'true'){
                $('iframe').each(function(){
                    var self = $(this);
                    if(self.hasClass('chat')){
                        self.css('width','15%');
                    }else{
                        self.css('width','100%');
                    }
                });
            }else{
                $('iframe').css('width', '100%');
            }

        });
    });

}

$(function () {
   main();
});