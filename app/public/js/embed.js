!function(a){function b(a){var b={},c=a.split("&");for(var d in c){var e=c[d].split("=");b[decodeURIComponent(e[0])]=decodeURIComponent(e[1])}return b}var c=include("springroll.Container"),d=include("springroll.Features"),e=(include("springroll.SavedData"),function(){c.call(this,"#appContainer",{helpButton:"#helpButton",captionsButton:"#captionsButton",soundButton:"#soundButton",voButton:"#voButton",sfxButton:"#sfxButton",musicButton:"#musicButton",pauseButton:"#pauseButton, #resumeButton"}),this.frame=$("#frame"),this.on({open:l.bind(this),opened:m.bind(this),pause:k.bind(this),helpEnabled:j.bind(this),closed:n.bind(this),features:i.bind(this),unsupported:function(a){alert(a||"Browser not supported.")},remoteFailed:function(){alert("Invalid API request")},remoteError:function(a){alert(a)}}),this.appTitle=$("#appTitle"),this.captionsToggle=$("#captionsToggle"),this.soundToggle=$("#soundToggle"),this.dropdowns=null,this.toggles=null,this.refreshUI(),$("#captionsStyles select").change(h.bind(this));var a=this.getCaptionsStyles();$("select[name='color']").val(a.color),$("select[name='background']").val(a.background),$("select[name='align']").val(a.align),$("select[name='font']").val(a.font),$("select[name='size']").val(a.size),$("select[name='edge']").val(a.edge),g=document.title,$(document).on("selectstart",!1);var d=location.pathname.replace("/embed/","/api/release/");if(location.search){var e=b(location.search.substr(1)),f=[];e.token&&f.push("token="+e.token),e.debug&&f.push("debug=true"),e.controls&&this.frame.addClass("show-controls"),e.title&&this.frame.addClass("show-title"),f.length&&(d+="?"+f.join("&"))}this.openRemote(d)}),f=extend(e,c),g="";f.refreshUI=function(){$("form").submit(function(a){return!1}),d.touch||($('[data-toggle="tooltip"]').tooltip(),this.helpEnabled=!1),this.dropdowns=$(".drop-down");var a=this;this.toggles=$("button[data-toggle-div]").each(function(){var b=$(this),c=b.data("toggle-div"),d=$(c);b.on("click hover",function(b){var c=d.hasClass("on");a.dropdowns.removeClass("on"),c||d.addClass("on")})})};var h=function(a){var b=a.currentTarget;this.setCaptionsStyles(b.name,b.value)},i=function(a){this.captionsToggle.hide(),this.soundToggle.hide(),a.captions&&this.captionsToggle.show(),a.sound&&this.soundToggle.show()},j=function(a){if(!d.touch){var b=this.helpButton;a?b.tooltip():b.tooltip("destroy")}},k=function(a){this.frame.removeClass("paused"),a&&this.frame.addClass("paused")},l=function(){this.dropdowns.removeClass("on"),this.toggles.addClass("disabled"),this.frame.addClass("loading"),this.appTitle.text(this.release.game.title),document.title=this.release.game.title+" | "+g},m=function(){this.frame.removeClass("loading"),this.toggles.removeClass("disabled"),this.paused=!1},n=function(){this.dropdowns.removeClass("on"),this.toggles.addClass("disabled"),document.title=g};namespace("pbskids").Embed=e,window.app=new e}();