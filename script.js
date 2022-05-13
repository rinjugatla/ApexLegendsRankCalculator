window.addEventListener('load', loadFunction);

function loadFunction() {
    loadPrevData();
    registEvent();
    calcRankPoint();
    updateShareButton();
    updateChart();
}

// 前回実行時の値をロード
function loadPrevData() {
    const prevUserData = loadUserData();
    if (!prevUserData) { return; }

    $('#rank').val(prevUserData.rank);
    $('#division').val(prevUserData.division);
    $('#order').val(prevUserData.order);
    $('#my-kill-count').val(prevUserData.myKillCount);
    $('#party-kill-count').val(prevUserData.partyKillCount);
}

// 現在の値を保存
function saveCurrentUserData() {
    const userData = getUserData();
    saveUserData(userData);
}

// イベントを追加
function registEvent() {
    let targets = '#rank, #division, #order, #my-kill-count, #party-kill-count';
    $(document).on('input', targets, function () {
        calcRankPoint();
        saveCurrentUserData();
        updateShareButton();
        updateChart();
    });
    $(document).on('focus', targets, function () { $(this).select() });
    $(document).on('change', '#result-ditail-toggle', function () {
        const isShow = !$(this).prop('checked');
        $('.result-ditail').prop('hidden', isShow);
    });
}

// ランクポイントを計算
function calcRankPoint() {
    let userData = getUserData();
    let rankPoint = getRankPoint(userData);
    printResult(rankPoint);
}

// ユーザ入力値を取得
function getUserData() {
    let userData = {
        rank: $('#rank').val(),
        division: Number($('#division').val()),
        order: Number($('#order').val()),
        myKillCount: Number($('#my-kill-count').val()),
        partyKillCount: Number($('#party-kill-count').val()),

        text: {
            rank: $('#rank option:selected').text(),
            division: $('#division option:selected').text()
        }
    }
    return userData;
}

// ランクポイントを取得
function getRankPoint(userData) {
    let enterCost = getEnterCost(userData.rank, userData.division);
    let orderPoint = getOrderPoint(userData.order);
    let myKillPoint = getKillPoint(userData.order, userData.myKillCount, true);
    let partyKillPoint = getKillPoint(userData.order, userData.partyKillCount, false);
    let totalPoint = enterCost + orderPoint + myKillPoint + partyKillPoint;

    return {
        enterCost: enterCost,
        orderPoint: orderPoint,
        myKillPoint: myKillPoint,
        partyKillPoint: partyKillPoint,
        totalPoint: totalPoint
    }
}

// orders: list
// baseUserDataの順位(order)のみ切り替えてランクポイントを計算
// return {order: killPoint, ...}
function getRankPointByOrders(orders, baseUserData) {
    let userData = Object.create(baseUserData);
    let rankPointsByOrders = {};
    orders.forEach(order => {
        userData.order = order;
        rankPointsByOrders[order] = getRankPoint(userData);
    });

    return rankPointsByOrders;
}

// 入場料を取得
function getEnterCost(rank, division) {
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

// 順位ポイントを取得
// order: 順位
function getOrderPoint(order) {
    let orderPoints = [
        // 1位から20位まで
        0, 125, 95, 70, 55, 45, 30, 20, 20, 10, 10, 5, 5, 5, 0, 0, 0, 0, 0, 0, 0,
    ]

    let orderPoint = orderPoints[order];
    return orderPoint;
}

// キルポイントを取得
// order: 順位 
// killCount: キル数
// isMy: 自分 or パーティ
function getKillPoint(order, killCount, isMy) {
    let orderKillPoints = [
        // 1位から20位まで
        0, 25, 23, 20, 18, 16, 14, 12, 12, 10, 10, 5, 5, 5, 1, 1, 1, 1, 1, 1, 1
    ]
    let orderMmodifies = {
        'my': [1, 1, 1, 0.8, 0.8, 0.5, 0.2],
        'party': [0.4, 0.1, 0.1, 0.08],
    }
    let orderPoint = orderKillPoints[order];
    let mode = isMy ? 'my' : 'party';
    let modifies = orderMmodifies[mode];

    let killPoint = 0
    for (let i = 0; i < killCount; i++) {
        const modify = i < modifies.length ? modifies[i] : modifies.slice(-1)[0];
        killPoint += orderPoint * modify;
    }

    return Math.round(killPoint);
}

// ランクポイントを出力
function printResult(rankPoint) {
    $('#enter-cost').text(rankPoint.enterCost);
    $('#order-point').text(rankPoint.orderPoint);
    $('#my-kill-point').text(rankPoint.myKillPoint);
    $('#party-kill-point').text(rankPoint.partyKillPoint);
    $('#total-point').text(rankPoint.totalPoint);

    if (rankPoint.totalPoint >= 0) {
        $('#total-point').removeClass('minus');
        $('#total-point').addClass('plus');
    } else {
        $('#total-point').addClass('minus');
        $('#total-point').removeClass('plus');
    }
}

// 計算結果を取得
function getResultData() {
    const resultData = {
        enterCost: Number($('#enter-cost').text()),
        oerderPoint: Number($('#order-point').text()),
        myKillPoint: Number($('#my-kill-point').text()),
        partyKillPoint: Number($('#party-kill-point').text()),
        totalPoint: Number($('#total-point').text())
    }
    return resultData;
}

// 共有ボタンの要素を更新
function updateShareButton() {
    const userData = getUserData();
    const resultData = getResultData();

    const rank = `${userData.text.rank}${userData.text.division}`;
    const score = `${userData.myKillCount}(${userData.partyKillCount})キル ${userData.order}位`;
    const point = `${resultData.totalPoint}ポイント`;
    // const url = 'https://rinjugatla.github.io/ApexLegendsRankCalculator/';
    const tags = `#Apex #Apexランク`;

    const text = `${rank}\n${score}\n${point}\n${tags}`;
    $('#share-button').attr('data-text', text);
}

let chartByOrder = null;
function updateChart() {
    const orders = getRange(1, 20).reverse();
    const baseUserData = getUserData();
    const rankPoints = getRankPointByOrders(orders, baseUserData);
    let chartData = [];
    orders.forEach(order => {
        chartData.push({ x: order, y: rankPoints[order].totalPoint });
    });
    
    if (chartByOrder) { chartByOrder.destroy(); }

    const ctx = $('#chart')[0].getContext('2d');
    chartByOrder = new Chart(ctx, {
        type: 'line',
        data: {
            labels: orders,
            datasets: [{
                label: '合計獲得ポイント',
                data: chartData,
                backgroundColor: ['rgba(54, 162, 235, 0.2)'],
                borderColor: ['rgba(54, 162, 235, 1)'],
                borderWidth: 1
            }]
        },
        options: {
            plugins: {
                title: {
                    display: true,
                    text: '順位による合計獲得ポイントの変化'
                }
            },
            scales: {
                x: {
                    title: {
                        display: true,
                        text: '順位'
                    }
                },
                y: {
                    title: {
                        display: true,
                        text: 'ポイント'
                    }
                }
            }
        }
    });
}

// start -> endの配列を作成
// https://qiita.com/RyutaKojima/items/168632d4980e65a285f3
function getRange(start, end) {
    const range = [...Array((end - start) + 1)].map((_, i) => start + i);
    return range;
}