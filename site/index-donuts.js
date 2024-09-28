const minSpin = 180;
const maxSpin = 360;

function getNumberBetween(min, max) {
    return (Math.random() * (max - min) + min).toFixed(2);
}

function getNumberBetweenInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
}


function makeNewDonut() {
    const donut = {
        spin: `${getNumberBetween(minSpin, maxSpin)}deg`,
        x: 32,
        y: 32,
        sx: $(".jetger")[0].getBoundingClientRect().left,
        sy: $(".jetger")[0].getBoundingClientRect().top,
    };

    const foods = [
        '/pengers/donut.png',
        '/pengers/burger.png',
        '/pengers/icecream.png',
        '/pengers/kurason.png'
    ];

    const element = $('<img>', {
        src: foods[getNumberBetweenInt(0, foods.length - 1)],
        class: 'donut'
    }).css({
        left: donut.x,
        top: donut.y,
    });

    $('#donuts').append(element);
    donut.$ref = element;
    return donut;
}

function rectangleVsRectangle(rec1, rec2) {
    var collision = false;

    if ((rec1.x < (rec2.x + rec2.width) && (rec1.x + rec1.width) > rec2.x) &&
        (rec1.y < (rec2.y + rec2.height) && (rec1.y + rec1.height) > rec2.y)) collision = true;

    return collision;
}

$(document).ready(function () {
    let isHidden = document.hidden;
    document.addEventListener("visibilitychange", () => {
        isHidden = document.hidden;
    });

    let donuts = [
        makeNewDonut(),
    ];

    let donutsToAppend = [];

    let jetger_spin_timer = 0;

    let donut_odds = 95;

    let donut_frenzy_timer = 0;

    let prevTime = 0;
    const animateDonuts = (timeMs) => {
        const time = timeMs / 1000;

        if (prevTime === 0) {
            prevTime = time;
            window.requestAnimationFrame(animateDonuts);
            return;
        }

        const dt = time - prevTime;

        donut_frenzy_timer += dt;

        let newDonuts = donuts;

        const jetger = $(".jetger")[0];
        const jetger_hitbox = jetger.getBoundingClientRect();

        for (donut of donuts) {
            donut.$ref.css({
                left: donut.x,
                top: donut.y,
                transform: `rotate(calc(${time} * ${donut.spin}))`
            });

            donut.x += donut.sx * dt;
            donut.y += donut.sy * dt;

            const donut_rectangle = {
                x: donut.x, y: donut.y, width: 32, height: 32
            };

            jetger_spin_timer += dt;

            if (jetger_spin_timer > 2) {
                jetger.style = 'animation: Jetger 70s infinite';
            }

            if (rectangleVsRectangle(jetger_hitbox, donut_rectangle)) {
                jetger_spin_timer = 0;
                jetger.style = 'animation: Jetger 70s infinite, Spinny 1s infinite linear';
            }

            if (donut.y > Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0) ||
                donut.x > Math.max(document.documentElement.clientWidth || 0, window.innerHeight || 0))
            {
                donut.$ref.remove();
                newDonuts = newDonuts.filter((d) => d !== donut);
            }

            donut.sy += 128 * dt;
        }

        donuts = newDonuts;
        donuts.push(...donutsToAppend);
        donutsToAppend = [];

        prevTime = time;
        window.requestAnimationFrame(animateDonuts);
    };

    window.requestAnimationFrame(animateDonuts);

    setInterval(() => {
        if (donutsToAppend.length >= 5) {
            return;
        }

        const chance = getNumberBetween(1, 100);

        if (donut_frenzy_timer > 5) {
            donut_odds = 95;
            $(".cookgerangry")[0].style = 'display: none;';
        }

        if (chance > 99.9) {
            donut_frenzy_timer = 0;
            donut_odds = 30;
            $(".cookgerangry")[0].style = 'display: block;';
        } else if (chance > donut_odds) {
            donutsToAppend.push(makeNewDonut());
        }
    }, 50);
});
