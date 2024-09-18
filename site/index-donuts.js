const minSpin = 180;
const maxSpin = 360;
const donutCutoff = 256;

function getNumberBetween(min, max) {
    return (Math.random() * (max - min) + min).toFixed(2);
}

function makeNewDonut() {
    const donut = {
        spin: `${getNumberBetween(minSpin, maxSpin)}deg`,
        x: 32,
        y: 32,
        sx: getNumberBetween(16, 64),
        sy: -getNumberBetween(32, 128),
    };
    const element = $('<img>', {
        src: '/pengers/donut.png',
        class: 'donut'
    }).css({
        left: donut.x,
        top: donut.y,
    });

    $('#donuts').append(element);
    donut.$ref = element;
    return donut;
}

$(document).ready(function () {
    let donuts = [
        makeNewDonut(),
    ];

    let donutsToAppend = [];

    let prevTime = 0;
    const animateDonuts = (timeMs) => {
        const time = timeMs / 1000;

        if (prevTime === 0) {
            prevTime = time;
            window.requestAnimationFrame(animateDonuts);
            return;
        }

        const dt = time - prevTime;

        let newDonuts = donuts;

        for (donut of donuts) {
            donut.$ref.css({
                left: donut.x,
                top: donut.y,
                transform: `rotate(calc(${time} * ${donut.spin}))`
            });

            donut.x += donut.sx * dt;
            donut.y += donut.sy * dt;

            if (donut.y > donutCutoff) {
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
        if (getNumberBetween(1, 100) > 85) {
            donutsToAppend.push(makeNewDonut());
        }
    }, 50);
});
