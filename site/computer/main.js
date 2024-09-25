(function()
{
    function create(name)
    {
        let content;
        let template = document.querySelector("template[name=\"" + name + "\"]");
        
        if (template)
        {
            content = template.content.cloneNode(true /* deep clone */);

            if (template.hasAttribute("rooted"))
            {
                content = content.firstElementChild;
            }

            let boundTags = content.querySelectorAll("[id]");
            for (let tag of boundTags)
            {
                content[tag.id] = tag;
                tag.removeAttribute("id");
            }
        }
        else
        {
            content = document.createElement(name);
        }
        
        return content;
    }

    async function onKey(event)
    {
        let modifier = event.altKey || event.ctrlKey;
        let input = prompt.input;

        console.log(event.code);

        if (event.code == "Backspace")
        {
            input.innerText = input.innerText.substring(0, input.innerText.length - 1);
        }
        else if (event.code == "Enter" || event.code == "NumpadEnter")
        {
            if (prompt !== null)
            {
                prompt.removeChild(prompt.cursor);
            }

            let response = addResponse();
            await submit(
                input.innerText,
                function(text)
                {
                    response.innerText += text + "\n";
                    scroll();
                }
            );
            addPrompt();
        }
        else if (event.code == "Tab")
        {
            let completion = tab(input.innerText);
            input.innerText += completion;

            event.preventDefault();
        }
        else if (event.key.length == 1 && !modifier)
        {
            input.innerText += event.key;
            
            event.preventDefault();
        }

        scroll();
    }

    function scroll()
    {
        let offset = screenContents.clientHeight - (document.getElementById("screen").clientHeight - 40);

        if (offset > 0)
        {
            screenContents.style.top = "-" + offset + "px";
        }
    }

    function addResponse()
    {
        let response = create("p")        
        screenContents.appendChild(response);
        return response;
    }

    function addPrompt()
    {
        prompt = create("prompt")
        screenContents.appendChild(prompt);
    }

    let prompt = null;

    {
        let response = addResponse();
        response.innerText = startup();
    }
    addPrompt();

    addEventListener("keydown", onKey);

    startupNoise.volume = 0.7;
    startupNoise.play();
})();