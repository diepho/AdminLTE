// IE likes to cache too much :P
$.ajaxSetup({cache: false});

// Get PHP info
var token = $("#token").html();
var listType = $("#list-type").html();
var fullName = listType === "white" ? "Whitelist" : "Blacklist";

function sub(index, entry, arg) {
    var domain = $("#"+index);
    var locallistType = listType;
    domain.hide("highlight");
    if(arg === "wild")
    {
        locallistType = "wild";
    }
    $.ajax({
        url: "scripts/pi-hole/php/sub.php",
        method: "post",
        data: {"domain":entry, "list":locallistType, "token":token},
        success: function(response) {
            if(response.length !== 0){
                return;
            }
            domain.remove();
        },
        error: function(jqXHR, exception) {
            alert("Failed to remove the domain!");
            domain.show({queue:true});
        }
    });
}

function refresh(fade) {
    var listw;
    var list = $("#list");
    if(listType === "black")
    {
        listw = $("#list-wildcard");
    }
    if(fade) {
        list.fadeOut(100);
        if(listw)
        {
            listw.fadeOut(100);
        }
    }
    $.ajax({
        url: "scripts/pi-hole/php/get.php",
        method: "get",
        data: {"list":listType},
        success: function(response) {
            list.html("");
            if(listw)
            {
                listw.html("");
            }
            var data = JSON.parse(response);

            if(data.length === 0) {
                $("h3").hide();
                if(listw)
                {
                    listw.html("<div class=\"alert alert-info\" role=\"alert\">Your " + fullName + " is empty!</div>");
                }
                else
                {
                    list.html("<div class=\"alert alert-info\" role=\"alert\">Your " + fullName + " is empty!</div>");
                }
            }
            else {
                $("h3").show();
                data.forEach(function (entry, index) {
                    if(entry.substr(0,1) === "*")
                    {
                        // Wildcard entry
                        // remove leading *
                        entry = entry.substr(1, entry.length - 1);
                        listw.append(
                        "<li id=\"" + index + "\" class=\"list-group-item clearfix\">" + entry +
                        "<button class=\"btn btn-danger btn-xs pull-right\" type=\"button\">" +
                        "<span class=\"glyphicon glyphicon-trash\"></span></button></li>");
                        // Handle button
                        $("#list-wildcard #"+index+"").on("click", "button", function() {
                            sub(index, entry, "wild");
                        });
                    }
                    else
                    {
                        // Normal entry
                        list.append(
                        "<li id=\"" + index + "\" class=\"list-group-item clearfix\">" + entry +
                        "<button class=\"btn btn-danger btn-xs pull-right\" type=\"button\">" +
                        "<span class=\"glyphicon glyphicon-trash\"></span></button></li>");
                        // Handle button
                        $("#list #"+index+"").on("click", "button", function() {
                            sub(index, entry, "exact");
                        });
                    }

                });
            }
            list.fadeIn(100);
            if(listw)
            {
                listw.fadeIn(100);
            }
        },
        error: function(jqXHR, exception) {
            $("#alFailure").show();
        }
    });
}

window.onload = refresh(false);

function add(arg) {
    var locallistType = listType;
    var domain = $("#domain");
    if(domain.val().length === 0){
        return;
    }
    if(arg === "wild")
    {
        locallistType = "wild";
    }

    var alInfo = $("#alInfo");
    var alSuccess = $("#alSuccess");
    var alFailure = $("#alFailure");
    var err = $("#err");
    alInfo.show();
    alSuccess.hide();
    alFailure.hide();
    $.ajax({
        url: "scripts/pi-hole/php/add.php",
        method: "post",
        data: {"domain":domain.val(), "list":locallistType, "token":token},
        success: function(response) {
          if (response.indexOf("not a valid argument") >= 0 ||
              response.indexOf("is not a valid domain") >= 0) {
            alFailure.show();
            err.html(response);
            alFailure.delay(4000).fadeOut(2000, function() {
                alFailure.hide();
            });
            alInfo.delay(4000).fadeOut(2000, function() {
                alInfo.hide();
            });
          } else {
            alSuccess.show();
            alSuccess.delay(1000).fadeOut(2000, function() {
                alSuccess.hide();
            });
            alInfo.delay(1000).fadeOut(2000, function() {
                alInfo.hide();
            });
            domain.val("");
            refresh(true);
          }
        },
        error: function(jqXHR, exception) {
            alFailure.show();
            err.html("");
            alFailure.delay(1000).fadeOut(2000, function() {
                alFailure.hide();
            });
            alInfo.delay(1000).fadeOut(2000, function() {
                alInfo.hide();
            });
        }
    });
}



// Handle enter button for adding domains
$(document).keypress(function(e) {
    if(e.which === 13 && $("#domain").is(":focus")) {
        // Enter was pressed, and the input has focus
        add("exact");
    }
});

// Handle buttons
$("#btnAdd").on("click", function() {
    add("exact");
});

$("#btnAddWildcard").on("click", function() {
    add("wild");
});

$("#btnRefresh").on("click", function() {
    refresh(true);
});

// Handle hiding of alerts
$(function(){
    $("[data-hide]").on("click", function(){
        $(this).closest("." + $(this).attr("data-hide")).hide();
    });
});
