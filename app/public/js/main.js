!function(a){a.fn.search=function(b){"function"==typeof c&&(b={selected:b});var c=a.extend({field:"name",empty:"No contents founds",autoClear:!0},b);return this.each(function(){var b=a(this),d=a(b.data("list")||c.list),e=b.data("field")||c.field,f=d.find("ul"),g=function(e){d.removeClass("open");var f=a(this).data("content");c.selected&&c.selected(f),b.trigger("search",f),c.autoClear&&h()},h=function(){b.val(""),f.find(".search-item").off("click"),f.empty(),d.removeClass("open")},i=function(h){if(h)if(d.addClass("open"),h.length){for(var i,j=[],k=b.val(),l=0;l<h.length;l++){var m=h[l];i=a("<li><button class='btn btn-link search-item'></button></li>"),i.find("button").html(m[e].replace(new RegExp("("+k+")","i"),"<strong>$1</strong>")).data("content",m),j.push(i)}f.html(j),f.find(".search-item").click(g)}else f.html("<li class='empty'>"+c.empty+"</li>")};b.keydown(function(a){13==a.keyCode&&a.preventDefault()}).keyup(function(d){var e=f.find(".active");38==d.keyCode?(e.length&&e.removeClass("active").prev().addClass("active"),d.preventDefault()):40==d.keyCode?(e.length?e.removeClass("active").next().addClass("active"):f.find("li:first").addClass("active"),d.preventDefault()):13==d.keyCode?e.length?(e.find(".search-item").click(),d.preventDefault()):c.enterPress&&this.value&&(c.enterPress.call(this),d.preventDefault(),h()):this.value?a.post(b.data("search")||c.service,{search:this.value},i):h()}).focus(function(a){f.find("li").length&&d.addClass("open")}).blur(function(b){a(b.relatedTarget).hasClass("search-item")||d.removeClass("open")})})}}(jQuery),$("[data-uri]").each(function(){var a=$(this),b=$(a.data("uri"));a.keyup(function(){b.val(this.value.toLowerCase().replace(/ /g,"-").replace(/[^a-z0-9\-]/g,""))})}),$(".auto-submit").click(function(){$(this).closest("form").submit()}),$("textarea.autogrow").autoGrow(),$(".base64").each(function(){function a(){d.val(""),f.val(""),g.attr("src",""),b.addClass("empty")}var b=$(this),c=b.find(".select"),d=b.find(".input"),e=b.find(".reset"),f=b.find(".output"),g=b.find(".preview"),h=parseInt(b.data("limit")),i=parseInt(b.data("width")),j=parseInt(b.data("height"));d.change(function(b){var d=b.target.files;if(d&&d.length){var e=d[0];if(e.size>h)return a(),void c.popover("show");var i=new FileReader;i.onload=function(a){var b=a.target.result,c=(b.length,btoa(b));f.val(c),g.attr("src","data:image/png;base64,"+c)},i.readAsBinaryString(e)}}),g.on("load",function(){i!=this.naturalWidth||j!=this.naturalHeight?(a(),c.popover("show")):b.removeClass("empty")}),e.click(function(){a()}),c.click(function(){c.popover("hide"),d.click()}),b.hasClass("empty")&&a()}),$('[data-toggle="confirm"]').click(function(a){var b=$(this).data("message")||"Are you sure?";confirm(b)||a.preventDefault()}),$("select.content-select").change(function(){this.value&&$(this).closest("form").submit()}),$("a.external").attr("target","_blank"),$('[data-toggle="popover"]').popover(),$(".statusChange-menu a").click(function(a){$(this).find('input[type="radio"]').prop("checked",!0).closest("form").submit(),a.preventDefault()}),function(){$("#games"),$("#gameTemplate").html();$("#allGameSearch").on("search",function(a,b){location.href="/games/game/"+b.slug})}(),function(){var a=$("#games"),b=$("#gameTemplate").html();$("#gameSearch").on("search",function(c,d){a.append(b.trim().replace("%id%",d._id).replace("%title%",d.title))})}(),function(){var a=$("#groups"),b=$("#groupTemplate").html(),c=["Read","Write","Admin"];$("#groupSearch").on("search",function(d,e){var f=parseInt($("input[name='selectPermission']:checked").val());a.append(b.trim().replace("%id%",e._id).replace("%name%",e.name).replace("%permission%",f).replace("%label%",c[f]))})}(),$(".search-results").on("click","button",function(a){$(this).closest(".search-result").remove()}),function(){var a=$("#users"),b=$("#userTemplate").html();$("#userSearch").on("search",function(c,d){a.append(b.trim().replace("%id%",d._id).replace("%name%",d.name))})}(),$("[data-search]").search(),$(".select-all").on("click",function(){$(this).select()}),Modernizr.touch||$('[data-toggle="tooltip"]').tooltip({container:"body"}),$(".form-group[data-unique]").each(function(){var a=$(this),b=a.data("unique"),c=a.data("ignore"),d=a.data("params")||{};a.find('input[type="text"]').on("change keyup",function(){var e=$(this);if(a.removeClass("has-feedback has-error has-success"),e.val()&&e.val()!=c){var f=$.extend({},d);f[e.prop("name")]=this.value,$.post(b,f,function(b){e.val()&&a.addClass("has-feedback").addClass(b?"has-error":"has-success")})}})});