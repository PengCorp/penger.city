function onClick()
{
    dx = -6;
    dy = -6;
    message.innerText = "0";
}

function onMove(event)
{
    penger.style.top = (event.clientY - field.offsetTop - paddleHeight / 2) + "px";
}

function tick()
{
    x += dx;
    y += dy;

    if (y < 0)
    {
        y = 0;
        dy *= -1;
    }

    if (y > field.clientHeight - ballWidth)
    {
        y = field.clientHeight - ballWidth;
        dy *= -1;
    }

    if (x < -ballWidth || x > field.clientWidth)
    {
        dx = 0;
        dy = 0;
        x = field.clientWidth / 2 - ballWidth / 2;
        y = field.clientHeight / 2 - ballWidth / 2;
        message.innerText = "YOU SCORED " + score;
        score = 0;
        canBeCaught = true;
    }

    if (x < penger.offsetLeft + paddleWidth - ballWidth && dx < 0)
    {
        canBeCaught = false;
    }

    if (x < penger.offsetLeft + paddleWidth && dx < 0 && canBeCaught)
    {
        if (y > penger.offsetTop - ballWidth && y < penger.offsetTop + paddleHeight)
        {
            dx *= -1;
            score += 1;
            message.innerText = score;
        }
    }

    if (x > ponger.offsetLeft && dx > 0)
    {
        if (y > ponger.offsetTop - ballWidth && y < ponger.offsetTop + paddleHeight)
        {
            dx *= -1;            
            dx *= multiplier;
            dy *= multiplier;
        }
    }

    if (ball.offsetLeft > field.clientWidth / 2 && dx > 0)
    {
        let pongerY = ponger.offsetTop;

        if (ball.offsetTop + ballWidth / 2 > pongerY + paddleHeight / 2)
        {
            pongerY += 2 * Math.abs(dy);
        }

        if (ball.offsetTop + ballWidth / 2 < pongerY + paddleHeight / 2)
        {
            pongerY -= 2 * Math.abs(dy);
        }

        ponger.style.top = pongerY + "px";
    }

    ball.style.left = x + "px";
    ball.style.top = y + "px";
}

let x = ball.offsetLeft, y = ball.offsetTop;
let canBeCaught = true;
let dx = 0;
let dy = 0;

let score = 0;

let ballWidth = ball.clientWidth;
let paddleHeight = penger.clientHeight;
let paddleWidth = penger.clientWidth;

const multiplier = Math.pow(2, 1/8);

setInterval(tick, 1000 / 60);
document.addEventListener("mousemove", onMove);