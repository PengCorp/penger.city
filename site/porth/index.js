requirejs.config({
    baseUrl: '/js',
    paths: {
        porth: '../porth'
    }
});

requirejs(['preact', 'preact-hooks', 'htm-preact', 'porth/porth'], function (Preact, PreactHooks, HTMPreact, Porth) {
    const { Fragment } = Preact;
    const { html } = HTMPreact;

    const engine = new Porth.PorthEngine();

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

    const PorthApp = () => {
        return html`
            <${Fragment}>
                <${Input} value="Hello, World!" onChange=${(value) => {
                    console.log(value);
                }} />
                <h1>Hello, World!</h1>
            <//>
        `;
    };

    Preact.render(
        Preact.createElement(PorthApp),
        document.getElementById('app')
    );
});
