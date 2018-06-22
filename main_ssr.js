import React from 'react'
import { renderToString } from 'react-dom/server'
import StoryCard from './src/js/Container.jsx'

global.window = {}

function renderWithMode(mode) {
    switch (mode) {
        case 'col16':
            return "x.renderSixteenCol()"
        case 'col7':
            return "x.renderSevenCol()"
        case 'col4':
            return "x.renderFourCol()"
        case 'col3':
            return "x.renderThreeCol()"
        case 'col2':
            return "x.renderTwoCol()"
        default:
            return "x.renderSevenCol()"
    }
}

function getScriptString(mode, dataJSON, selector, site_configs) {
    return `<script>
            var x = new ProtoGraph.Card.toStory(),
                params = {
                    "selector": document.querySelector('${selector}'),
                    "isFromSSR": true,
                    "initialState": ${JSON.stringify(dataJSON)},
                    "site_configs": ${JSON.stringify(site_configs)}
                };
            x.init(params);
            ${renderWithMode(mode)}
        </script>
    `
}

function render(mode, initialState) {
    let content = renderToString(
        <StoryCard
            dataJSON={initialState.dataJSON}
            mode={mode}
            renderingSSR={true}
        />
    );

    return { content, initialState };
}

module.exports = {
    render: render,
    getScriptString: getScriptString
}