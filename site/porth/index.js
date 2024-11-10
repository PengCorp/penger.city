requirejs.config({
    baseUrl: '/js',
    paths: {
        porth: './'
    }
});

requirejs(['preact', 'preact-hooks', 'htm-preact'], function (preact, preactHooks, htmPreact) {
    const { Fragment } = preact;
    const { html } = htmPreact;

    const Input = ({ value, onChange }) => {
        return html`
            <textarea
                id="input"
                type="text"
                cols="80"
                rows="25"
                value=${value}
                onChange=${(e) => {
                    onChange(e.target.value);
                }}
            />
        `;
    }

    const Porth = () => {
        return html`
            <${Fragment}>
                <${Input} value="Hello, World!" onChange=${(value) => {
                    console.log(value);
                }} />
                <h1>Hello, World!</h1>
            <//>
        `;
    };

    preact.render(
        preact.createElement(Porth),
        document.getElementById('app')
    );
});
