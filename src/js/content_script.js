var startBasket = 1;
var skinValue = 1;
var ctpWinner = 0;
var playersInSkinGame = [];

var Player = function(scores) {
    this.scores = scores;
};

var Game = function(scores) {
    this.players = getPlayers();
};

Array.prototype.min = function() {
    return Math.min.apply(null, this);
};

Array.prototype.repeat= function(what, L){
    while(L) this[--L]= what;
    return this;
}

Game.prototype.getSkinWinnings = function() {
    var orderedScores = getOrderedScoresList(this.players);
    var winnings = [].repeat(0, this.players.length);
    var prize = 0;

    // do the loop as many scores there are
    orderedScores[0].forEach(function(a, index){
        prize += skinValue;
        // build basket scores
        var basketScores = [];
        orderedScores.forEach(function(score, scoreIndex){
            basketScores.push(score[index]);
        });
        var minimum = Math.min.apply(null, basketScores);
        // now count if there is only one minimum
        if(basketScores.filter(function(basketScore) { return basketScore == minimum}).length == 1) {
            orderedScores.forEach(function(score, scoreIndex){
                if(score[index] == minimum) {
                    winnings[scoreIndex] += prize * winnings.length;
                }
            });
            prize = 0;
        }
        winnings.forEach(function(winning, index){
            winnings[index] -= skinValue;
        });
    });
    // if last holes were tied, then give them to ctp winner
    var sumOfWinnings = getTotal(winnings);
    if(sumOfWinnings != 0) {
        winnings[ctpWinner] += Math.abs(sumOfWinnings);
    }
    return winnings;
}

function getTotal(list) {
    return list.reduce(function(previousValue, currentValue, index, array) {
        return previousValue + currentValue;
    });
}

function getOrderedScoresList(players) {
    var orderedScores = [];
        players.forEach(function(player, index){
        var scores = player.scores;
        orderedScores.push(orderScoresByStartBasket(scores));
    });
    return orderedScores;
}

function orderScoresByStartBasket(scores) {
    return scores.slice(startBasket - 1, scores.length).concat(scores.slice(0,startBasket - 1));
}

function getPlayers() {
    var scores = getScores();
    var players = [];
    scores.forEach(function(score, index){
        players.push(new Player(score));
    });
    return players;
}
function getScores() {
    var scores = [];
    var rows = getPlayerRows();
    rows.each(function(index, value){
        var scoreRow = [];
        $(value).find('td:not(:first, :nth-child(2), :nth-child(3), :nth-child(4), :last, :nth-last-child(2), :nth-last-child(3))').each(function(index, value){
            scoreRow.push($(value).text());
        });
        scores.push(scoreRow);
    });
    return scores;
}
function getPlayerRows() {
    return $("h2:contains('Results')").next().find('tbody tr:not(:first-child)').filter(function(index) {
        return playersInSkinGame[index] == null ||  playersInSkinGame[index];
    });
}

function getHeaderRow() {
    return $("h2:contains('Results')").next().find('thead tr');
}

function getTitleRow() {
    return $("h2:contains('Results')").next().find('tbody tr:first');
}

function getResultsHeading() {
    return $("h2:contains('Results')");
}

function drawRadiobuttons() {
    var playerRows = getPlayerRows();
    playerRows.each(function(index, value){
        playersInSkinGame.push(true);
        var checked = ctpWinner == index ? "checked" : "";
        $(this).prepend("<td class='center'><input type='radio'" + checked + " name='ctp' value='" + index + "'/></td>");
    });
    var headerRows = getHeaderRow();
    headerRows.each(function(index, value){
        $(this).prepend("<th class='center'>Won final CTP</th>");
    });
    var titleRows = getTitleRow();
    titleRows.each(function(index, value){
        $(this).prepend("<td></td>");
    });

    $('input:radio').change(function(){
        var index = this.value;
        ctpWinner = index;
        drawWins(true);
    });
}


function drawCheckboxes() {
     var playerRows = getPlayerRows();
     playerRows.each(function(index, value){
         playersInSkinGame.push(true);
         $(this).prepend("<td class='center'><input type='checkbox' checked name='skins_" + index + "'/></td>");
     });
     var headerRows = getHeaderRow();
     headerRows.each(function(index, value){
         $(this).prepend("<th class='center'>Participates in skingame</th>");
     });
     var titleRows = getTitleRow();
     titleRows.each(function(index, value){
         $(this).prepend("<td class='center'></td>"); //Starting basket <input type='number' name='quantity' min='1' max='5' value='1'>
     });

     $('input:checkbox').change(function(){
         var name = this.name;
         var index = parseInt(name.substring(name.indexOf("_") + 1));
         if($(this).is(':checked')){
             playersInSkinGame[index] = true;
         } else {
             playersInSkinGame[index] = false;
         }
         drawWins(true);
     });
 }

function drawWins(isRedraw) {
    var playerRows = getPlayerRows();
    var headerRows = getHeaderRow();

    var game = new Game();
    var winnings = game.getSkinWinnings();

    if(!isRedraw) {
        playerRows.each(function(index, value){
            $(this).append("<td class='center winnings'>" + winnings[index] + "€</td>");
        });
        headerRows.each(function(index, value){
            $(this).append("<th class='center'>Won/Loss</th>");
        });
        var titleRows = getTitleRow();
        titleRows.each(function(index, value){
             $(this).append("<td class='center'></td>");
        });
    } else {
        // do redraw
        var skip = 0;
        $('.winnings').each(function(index, value){
            if(playersInSkinGame[index]) {
                $(value).text(winnings[index - skip] + "€");
            } else {
                $(value).text("");
                skip++;
            }
        });
    }
}

function drawInputFields() {
    var resultsHeading = getResultsHeading();
    $("<div>Skingame starting basket <input type='number' id='startBasket' min='1' max='27' value='1'>" +
    " Skingame € per basket <input type='number' id='skinValue' step='0.25' value='1'></div>").insertBefore(resultsHeading);

    $('#startBasket').change(function(){
        var basket = this.value;
        startBasket = basket;
        drawWins(true);
    });
    $('#skinValue').change(function(){
        var value = this.value;
        skinValue = parseFloat(value);
        drawWins(true);
    });
}

function isValidPage() {
    return $(".prev-next-tabs-wrap h1 a").length < 3 &&
           $("#filter").text().indexOf("Choose competition") == -1 &&
            $("#filter").text().indexOf("Choose class") == -1;
}

function draw() {
    if(isValidPage()) {
        drawInputFields();
        drawRadiobuttons();
        drawCheckboxes();
        drawWins();
    }
}

$(document).ready(draw);