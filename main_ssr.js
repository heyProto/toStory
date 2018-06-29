import React from 'react'
import { renderToString } from 'react-dom/server'
import Card from './src/js/card.jsx'

global.window = {};

// function getScriptString(mode, dataJSON, selector, site_configs) {
//     return `<script>
//             var x = new ProtoGraph.Card.toStory(),
//                 params = {
//                     "selector": document.querySelector('${selector}'),
//                     "isFromSSR": true,
//                     "initialState": ${JSON.stringify(dataJSON)},
//                     "site_configs": ${JSON.stringify(site_configs)}
//                 };
//             x.init(params);
//             x.render();
//         </script>
//     `
// }

function render(initialState) {
    let content = renderToString(
        <Card
            dataJSON={initialState.dataJSON}
            renderingSSR={true}
        />
    );

    return { content, initialState };
}

module.exports = {
    render: render,
    // getScriptString: getScriptString,
    instance: 'toStory'
}