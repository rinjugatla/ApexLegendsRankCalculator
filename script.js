window.addEventListener('load', loadFunction);

function loadFunction(){
    registEvent();
    calcRankPoint();
}

function registEvent(){
    $(document).on('change', '#rank', function(){calcRankPoint()});
    $(document).on('change', '#division', function(){calcRankPoint()});
    $(document).on('input', '#order', function(){calcRankPoint()});
    $(document).on('input', '#my-kill-count', function(){calcRankPoint()});
    $(document).on('input', '#party-kill-count', function(){calcRankPoint()});
}

function calcRankPoint(){
    let userData = {
        rank: $('#rank').val(),
        division: Number($('#division').val()),
        order: Number($('#order').val()),
        myKillCount: Number($('#my-kill-count').val()),
        partyKillCount: Number($('#party-kill-count').val())
    }


    let enterCost =getEnterCost(userData.rank, userData.division);
    let orderPoint = getOrderPoint(userData.order);
    let myKillPoint = getKillPoint(userData.order, userData.myKillCount, true);
    let partyKillPoint = getKillPoint(userData.order, userData.partyKillCount, false);
    printResult(enterCost, orderPoint, myKillPoint, partyKillPoint);
}

// 入場料
function getEnterCost(rank, division){
    const costs = {
        'rookie': [0, 0, 0, 0],
        'bronze': [24, 21, 18, 15],
        'silver': [36, 33, 30, 27],
        'gold': [48, 45, 42, 39],
        'platina': [60, 51, 54, 51],
        'diamond': [72, 69, 66, 63],
        'master': [75, 75, 75, 75],
        'predator': [75, 75, 75, 75],
    }

    let cost = costs[rank][division] * -1;
    return cost;
}

// 順位ポイント
// order: 順位
function getOrderPoint(order){
    let orderPoints = [
        // 1位から20位まで
        0, 125, 95, 70, 55, 45, 30, 20, 20, 10, 10, 5, 5, 5, 0, 0, 0, 0, 0, 0, 0,
    ]

    let orderPoint = orderPoints[order];
    return orderPoint;
}

// キルポイント
// order: 順位 
// killCount: キル数
// isMy: 自分 or パーティ
function getKillPoint(order, killCount, isMy){
    let orderKillPoints = [
        // 1位から20位まで
        0, 25, 23, 20, 18, 16, 14, 12, 12, 10, 10, 5, 5, 5, 1, 1, 1, 1, 1, 1, 1
    ]
    let orderMmodifies = {
        'my': [1, 1, 1, 0.8, 0.8, 0.5, 0.2],
        'party': [0.4, 0.1, 0.1, 0.08],
    }
    let orderPoint = orderKillPoints[order];
    let mode = isMy ? 'my': 'party';
    let modifies = orderMmodifies[mode];

    let killPoint = 0
    for (let i = 0; i < killCount; i++) {
        const modify = i < modifies.length ? modifies[i] : modifies.slice(-1)[0];
        killPoint += orderPoint * modify;
    }

    return Math.ceil(killPoint);
}

function printResult(enterCost, orderPoint, myKillPoint, partyKillPoint){
    $('#enter-cost').text(enterCost);
    $('#order-point').text(orderPoint);
    $('#my-kill-point').text(myKillPoint);
    $('#party-kill-point').text(partyKillPoint);
    let totalPoint = enterCost + orderPoint + myKillPoint + partyKillPoint;
    $('#total-point').text(totalPoint);
}